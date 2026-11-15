import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import {
  DEFAULT_REMINDER_HOUR,
  REMINDER_HOUR_MAX,
  REMINDER_HOUR_MIN,
} from "@/lib/morning-reminder";

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "https endpoint required");

const SubscribeBody = z.object({
  subscription: z.object({
    endpoint: httpsUrl,
    keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  }),
  reminder_hour: z
    .number()
    .int()
    .min(REMINDER_HOUR_MIN)
    .max(REMINDER_HOUR_MAX)
    .default(DEFAULT_REMINDER_HOUR),
});

const UnsubscribeBody = z.object({ endpoint: z.string().min(1) });

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "인증이 필요합니다" },
    { status: 401 }
  );
}

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** 이 기기의 구독 상태(알림 시각)를 조회한다. */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const endpoint = new URL(request.url).searchParams.get("endpoint");
  if (!endpoint) return badRequest("endpoint가 필요합니다");

  const { data, error } = await createAdminClient()
    .from("push_subscriptions")
    .select("reminder_hour, enabled")
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("푸시 구독 조회 실패:", error);
    return NextResponse.json(
      { success: false, error: "알림 설정을 불러오지 못했어요" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data
      ? { subscribed: true, reminder_hour: data.reminder_hour, enabled: data.enabled }
      : { subscribed: false, reminder_hour: DEFAULT_REMINDER_HOUR, enabled: false },
  });
}

/** 구독을 저장하거나(endpoint 기준 upsert) 알림 시각을 바꾼다. */
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const parsed = SubscribeBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return badRequest("구독 정보나 알림 시각(5~11시)이 올바르지 않아요");
  }
  const { subscription, reminder_hour } = parsed.data;

  const { error } = await createAdminClient()
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        reminder_hour,
        enabled: true,
      },
      { onConflict: "endpoint" }
    );
  if (error) {
    console.error("푸시 구독 저장 실패:", error);
    return NextResponse.json(
      { success: false, error: "알림 설정을 저장하지 못했어요" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { subscribed: true, reminder_hour, enabled: true },
  });
}

/** 이 기기의 구독을 지운다. */
export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const parsed = UnsubscribeBody.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("endpoint가 필요합니다");

  const { error } = await createAdminClient()
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", parsed.data.endpoint)
    .eq("user_id", user.id);
  if (error) {
    console.error("푸시 구독 삭제 실패:", error);
    return NextResponse.json(
      { success: false, error: "알림을 끄지 못했어요" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
