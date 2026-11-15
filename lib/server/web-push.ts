import { sendNotification, WebPushError } from "web-push";

export interface StoredPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export type PushSendResult =
  | { status: "sent" }
  /** 푸시 서비스가 구독이 사라졌다고 응답(404/410) — 구독을 지워야 한다. */
  | { status: "gone"; statusCode: number }
  | { status: "failed"; statusCode?: number; message: string };

function getVapidDetails() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("VAPID keys are not configured");
  }
  return { subject, publicKey, privateKey };
}

/** 구독 하나에 알림을 보낸다. 예외를 던지지 않고 결과로 돌려준다. */
export async function sendPush(
  subscription: StoredPushSubscription,
  payload: PushPayload,
  ttlSeconds: number
): Promise<PushSendResult> {
  try {
    await sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { vapidDetails: getVapidDetails(), TTL: ttlSeconds, urgency: "normal" }
    );
    return { status: "sent" };
  } catch (error) {
    if (error instanceof WebPushError) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        return { status: "gone", statusCode: error.statusCode };
      }
      return {
        status: "failed",
        statusCode: error.statusCode,
        message: (error.body || error.message).slice(0, 200),
      };
    }
    return {
      status: "failed",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
