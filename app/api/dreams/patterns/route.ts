import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { getKstNow } from "@/lib/server/kst";
import {
  DreamPatternError,
  generateDreamPatternReport,
  PATTERN_DAILY_LIMIT,
  PATTERN_MAX_DREAMS,
  PATTERN_MIN_DREAMS,
  type DreamPatternReport,
  type PatternDreamInput,
} from "@/lib/server/dream-patterns";

export const maxDuration = 60;

interface PatternReportRow {
  id: string;
  dream_ids: string[];
  dream_count: number;
  report: DreamPatternReport;
  created_at: string;
}

type PatternDreamRow = PatternDreamInput & { id: string };

function fail(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error, ...extra }, { status });
}

function toResponseData(row: PatternReportRow, latestDreamIds: readonly string[]) {
  const reportedIds = new Set(row.dream_ids);
  return {
    id: row.id,
    dreamCount: row.dream_count,
    createdAt: row.created_at,
    report: row.report,
    // 리포트에 없던 꿈이 최근 목록에 있으면 새로 만들 수 있다.
    hasNewDreams: latestDreamIds.some((id) => !reportedIds.has(id)),
  };
}

async function fetchLatestReport(
  supabase: SupabaseClient,
  userId: string
): Promise<PatternReportRow | null> {
  const { data, error } = await supabase
    .from("dream_pattern_reports")
    .select("id, dream_ids, dream_count, report, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as PatternReportRow | null;
}

async function fetchLatestDreams(
  supabase: SupabaseClient,
  userId: string
): Promise<{ dreams: PatternDreamRow[]; total: number }> {
  const { data, error, count } = await supabase
    .from("dreams")
    .select(
      "id, generated_story_title, dream_input_text, dream_emotion, dream_keywords, generated_story_content, created_at",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(PATTERN_MAX_DREAMS);
  if (error) throw error;
  const dreams = (data ?? []) as PatternDreamRow[];
  return { dreams, total: count ?? dreams.length };
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return fail("로그인이 필요합니다.", 401);

    const supabase = createAdminClient();
    const [report, { dreams }] = await Promise.all([
      fetchLatestReport(supabase, user.id),
      fetchLatestDreams(supabase, user.id),
    ]);
    if (!report) return fail("아직 패턴 리포트가 없어요.", 404);

    return NextResponse.json({
      success: true,
      data: toResponseData(report, dreams.map((dream) => dream.id)),
    });
  } catch (error) {
    console.error("꿈 패턴 리포트 조회 오류:", error);
    return fail("패턴 리포트를 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return fail("로그인이 필요합니다.", 401);

    const supabase = createAdminClient();
    const [latestReport, { dreams, total }] = await Promise.all([
      fetchLatestReport(supabase, user.id),
      fetchLatestDreams(supabase, user.id),
    ]);

    if (total < PATTERN_MIN_DREAMS) {
      return fail(
        `꿈을 ${PATTERN_MIN_DREAMS}개 이상 기록하면 패턴 리포트를 만들 수 있어요.`,
        400,
        { errorCode: "not_enough_dreams", dreamCount: total, required: PATTERN_MIN_DREAMS }
      );
    }

    const dreamIds = dreams.map((dream) => dream.id);
    if (latestReport) {
      const cached = toResponseData(latestReport, dreamIds);
      if (!cached.hasNewDreams) {
        return NextResponse.json({ success: true, data: { ...cached, cached: true } });
      }
    }

    const { kstDateString } = getKstNow();
    const { count: todayCount, error: countError } = await supabase
      .from("dream_pattern_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${kstDateString}T00:00:00+09:00`);
    if (countError) throw countError;
    if ((todayCount ?? 0) >= PATTERN_DAILY_LIMIT) {
      return fail(
        `패턴 리포트는 하루에 ${PATTERN_DAILY_LIMIT}번까지 만들 수 있어요. 내일 다시 만나요.`,
        429,
        { errorCode: "daily_pattern_limit_reached" }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("Gemini API 키 누락");
      return fail("AI 서비스 설정이 완료되지 않았습니다.", 500);
    }

    let report: DreamPatternReport;
    try {
      report = await generateDreamPatternReport(dreams, geminiApiKey);
    } catch (aiError) {
      if (!(aiError instanceof DreamPatternError)) throw aiError;
      console.error("꿈 패턴 리포트 생성 오류:", aiError.message);
      return fail("AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해주세요.", 503);
    }

    const { data: inserted, error: insertError } = await supabase
      .from("dream_pattern_reports")
      .insert({
        user_id: user.id,
        dream_ids: dreamIds,
        dream_count: dreamIds.length,
        report,
      })
      .select("id, dream_ids, dream_count, report, created_at")
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: { ...toResponseData(inserted as PatternReportRow, dreamIds), cached: false },
    });
  } catch (error) {
    console.error("꿈 패턴 리포트 생성 오류:", error);
    return fail("패턴 리포트를 만드는 중 오류가 발생했습니다.", 500);
  }
}
