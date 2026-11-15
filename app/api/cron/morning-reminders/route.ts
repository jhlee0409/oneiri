import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getKstNow } from "@/lib/server/kst";
import { sendPush, type PushSendResult } from "@/lib/server/web-push";
import { REMINDER_UTM_SOURCE } from "@/lib/morning-reminder";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDER_TITLE = "어젯밤 꿈, 기억나세요?";
const REMINDER_PROMPTS = [
  "흐려지기 전에, 떠오르는 장면 하나만 적어볼까요?",
  "꿈의 조각 하나면 충분해요. 이야기는 Oneiri가 엮어드릴게요.",
  "어떤 색, 어떤 사람, 어떤 기분이었나요?",
  "잠에서 깬 지금이 꿈을 붙잡기 가장 좋은 때예요.",
  "기억나지 않아도 괜찮아요. 남아 있는 느낌만 들려주세요.",
  "오늘 아침의 꿈은 어떤 이야기가 될까요?",
  "아직 머릿속에 남은 장면이 있다면, 서재에 담아두세요.",
];
const REMINDER_URL = `/dreams/new?utm_source=${REMINDER_UTM_SOURCE}`;
/** 알림 시각이 지나면 의미가 없으니 1시간 안에 전달되지 않으면 버린다. */
const PUSH_TTL_SECONDS = 60 * 60;
const SEND_CONCURRENCY = 25;
const ID_CHUNK_SIZE = 200;

interface DueSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** 운영 환경이 아닐 때만 ?hour= 로 KST 시각을 강제할 수 있다(테스트용). */
function resolveHour(request: Request, kstHour: number): number | null {
  const override = new URL(request.url).searchParams.get("hour");
  if (override === null || process.env.NODE_ENV === "production") return kstHour;
  const hour = Number(override);
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kstTime, kstDateString } = getKstNow();
  const hour = resolveHour(request, kstTime.getUTCHours());
  if (hour === null) {
    return NextResponse.json({ error: "hour must be 0-23" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: dueRows, error: dueError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .eq("enabled", true)
      .eq("reminder_hour", hour)
      .or(`last_sent_on.is.null,last_sent_on.neq.${kstDateString}`);
    if (dueError) throw new Error(`구독 조회 실패: ${dueError.message}`);
    const due: DueSubscription[] = dueRows ?? [];

    // 오늘(KST) 이미 꿈을 기록한 사용자는 깨우지 않는다.
    const userIds = [...new Set(due.map((s) => s.user_id))];
    const usersWithDreamToday = new Set<string>();
    for (const ids of chunk(userIds, ID_CHUNK_SIZE)) {
      const { data, error } = await supabase
        .from("dreams")
        .select("user_id")
        .in("user_id", ids)
        .gte("created_at", `${kstDateString}T00:00:00+09:00`);
      if (error) throw new Error(`오늘 꿈 조회 실패: ${error.message}`);
      for (const row of data ?? []) usersWithDreamToday.add(row.user_id);
    }

    const targets = due.filter((s) => !usersWithDreamToday.has(s.user_id));
    const dayIndex = Math.floor(kstTime.getTime() / (24 * 60 * 60 * 1000));
    const payload = {
      title: REMINDER_TITLE,
      body: REMINDER_PROMPTS[dayIndex % REMINDER_PROMPTS.length],
      url: REMINDER_URL,
    };

    const sentIds: string[] = [];
    const goneIds: string[] = [];
    const failures: { id: string; statusCode?: number; message: string }[] = [];
    for (const batch of chunk(targets, SEND_CONCURRENCY)) {
      const results: PushSendResult[] = await Promise.all(
        batch.map((s) => sendPush(s, payload, PUSH_TTL_SECONDS))
      );
      results.forEach((result, i) => {
        const id = batch[i].id;
        if (result.status === "sent") sentIds.push(id);
        else if (result.status === "gone") goneIds.push(id);
        else failures.push({ id, statusCode: result.statusCode, message: result.message });
      });
    }

    for (const ids of chunk(sentIds, ID_CHUNK_SIZE)) {
      const { error } = await supabase
        .from("push_subscriptions")
        .update({ last_sent_on: kstDateString })
        .in("id", ids);
      if (error) console.error("last_sent_on 갱신 실패:", error);
    }
    for (const ids of chunk(goneIds, ID_CHUNK_SIZE)) {
      const { error } = await supabase.from("push_subscriptions").delete().in("id", ids);
      if (error) console.error("만료 구독 삭제 실패:", error);
    }
    if (failures.length > 0) {
      console.error("아침 꿈 알림 전송 실패:", failures);
    }

    return NextResponse.json({
      success: true,
      kstDate: kstDateString,
      hour,
      due: due.length,
      skippedDreamToday: due.length - targets.length,
      sent: sentIds.length,
      removed: goneIds.length,
      failed: failures.length,
      failures: failures.map(({ statusCode, message }) => ({ statusCode, message })),
    });
  } catch (error) {
    console.error("아침 꿈 알림 처리 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
