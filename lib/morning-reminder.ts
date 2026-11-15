/** 아침 꿈 알림: 클라이언트·서버가 함께 쓰는 상수 */

/** 선택 가능한 알림 시각(KST, 시) — DB check 제약과 같다. */
export const REMINDER_HOUR_MIN = 5;
export const REMINDER_HOUR_MAX = 11;
export const DEFAULT_REMINDER_HOUR = 8;

export const REMINDER_HOURS: number[] = Array.from(
  { length: REMINDER_HOUR_MAX - REMINDER_HOUR_MIN + 1 },
  (_, i) => REMINDER_HOUR_MIN + i
);

/** 알림을 눌러 들어온 방문을 구분하는 utm_source 값 */
export const REMINDER_UTM_SOURCE = "push";

/** 설정 화면의 아침 꿈 알림 섹션 앵커 */
export const REMINDER_SETTINGS_ANCHOR = "morning-reminder";
