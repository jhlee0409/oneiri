import { sendGAEvent } from "@next/third-parties/google";

/** GA4 전환 이벤트. GA4 관리 화면에서 주요 이벤트로 지정해 퍼널을 측정한다. */
export type AnalyticsEvent =
  | "sign_up"
  | "login"
  | "dream_created"
  | "image_generated"
  | "share"
  | "guest_dream_created"
  | "guest_dream_claimed";

export function trackEvent(
  name: AnalyticsEvent,
  params?: Record<string, string | number | boolean>
) {
  sendGAEvent("event", name, params ?? {});
}

/** OAuth 콜백이 리다이렉트 URL에 붙이는 인증 이벤트 파라미터 이름 */
export const AUTH_EVENT_PARAM = "auth_event";
