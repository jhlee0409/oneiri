"use client";

import { toast } from "sonner";
import { deletePushSubscription, savePushSubscription } from "@/lib/api";
import { REMINDER_SETTINGS_ANCHOR } from "@/lib/morning-reminder";

/** 브라우저의 아침 꿈 알림 지원 상태 */
export type PushSupport =
  | "supported"
  /** iOS Safari: 홈 화면에 추가한 앱에서만 Web Push를 쓸 수 있다. */
  | "ios-needs-install"
  | "unsupported";

export type EnableReminderResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "denied" | "error"; message?: string };

const SERVICE_WORKER_URL = "/sw.js";
const PROMPT_SEEN_KEY = "oneiri:reminder-prompt-seen";

function isIos(): boolean {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS는 데스크톱 Safari로 보고한다.
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  ) {
    return "supported";
  }
  if (isIos() && !window.matchMedia("(display-mode: standalone)").matches) {
    return "ios-needs-install";
  }
  return "unsupported";
}

function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** 이미 등록된 서비스 워커의 푸시 구독. 서비스 워커를 새로 등록하지 않는다. */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (getPushSupport() !== "supported") return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  return registration ? registration.pushManager.getSubscription() : null;
}

/** 알림 권한을 받고 서비스 워커를 등록해 구독을 서버에 저장한다. 시각 변경에도 쓴다. */
export async function enableMorningReminder(
  reminderHour: number
): Promise<EnableReminderResult> {
  if (getPushSupport() !== "supported") return { ok: false, reason: "unsupported" };

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return { ok: false, reason: "error", message: "알림 설정이 준비되지 않았어요" };
  }

  try {
    await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/" });
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }));

    const result = await savePushSubscription(subscription.toJSON(), reminderHour);
    if (!result.success) return { ok: false, reason: "error", message: result.error };
    return { ok: true };
  } catch (error) {
    console.error("아침 꿈 알림 구독 실패:", error);
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : undefined,
    };
  }
}

/** 서버의 구독을 지우고 브라우저 구독을 해지한다. */
export async function disableMorningReminder(): Promise<{ ok: boolean; message?: string }> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return { ok: true };

  const result = await deletePushSubscription(subscription.endpoint);
  if (!result.success) return { ok: false, message: result.error };
  await subscription.unsubscribe();
  return { ok: true };
}

/**
 * 로그인 사용자가 꿈을 처음 엮은 뒤, 아침 꿈 알림을 한 번만 제안한다.
 * 이미 켰거나, 권한을 거부했거나, 지원하지 않는 브라우저면 보여주지 않는다.
 */
export async function offerMorningReminder(
  openSettings: (href: string) => void
): Promise<void> {
  try {
    if (localStorage.getItem(PROMPT_SEEN_KEY)) return;
    const support = getPushSupport();
    if (support === "unsupported") return;
    if (support === "supported") {
      if (Notification.permission === "denied") return;
      if (await getCurrentPushSubscription()) return;
    }
    localStorage.setItem(PROMPT_SEEN_KEY, "1");
  } catch {
    return;
  }

  toast("내일 아침, 꿈이 흐려지기 전에 알려드릴까요?", {
    description: "원하는 시각에 아침 꿈 알림을 받아 꿈 조각을 놓치지 마세요.",
    duration: 15000,
    closeButton: true,
    action: {
      label: "알림 켜기",
      onClick: () => openSettings(`/settings#${REMINDER_SETTINGS_ANCHOR}`),
    },
  });
}
