/** 게스트 체험 이야기를 로그인 후 서재로 옮길 수 있는 기간 */
export const GUEST_DREAM_CLAIM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** 게스트 체험에서 받는 꿈 내용 최대 길이 */
export const GUEST_DREAM_MAX_LENGTH = 1000;

const PENDING_GUEST_DREAM_KEY = "oneiri:pending-guest-dream";

interface PendingGuestDream {
  guestDreamId: string;
  savedAt: number;
}

/** 로그인 리다이렉트 전에 옮길 게스트 꿈을 기록한다. */
export function savePendingGuestDream(guestDreamId: string) {
  const value: PendingGuestDream = { guestDreamId, savedAt: Date.now() };
  localStorage.setItem(PENDING_GUEST_DREAM_KEY, JSON.stringify(value));
}

/** 옮길 게스트 꿈 id. 없거나 형식이 깨졌거나 기간이 지났으면 키를 지우고 null. */
export function loadPendingGuestDreamId(): string | null {
  const raw = localStorage.getItem(PENDING_GUEST_DREAM_KEY);
  if (!raw) return null;

  let parsed: Partial<PendingGuestDream> | null = null;
  try {
    parsed = JSON.parse(raw) as Partial<PendingGuestDream>;
  } catch {
    // 아래에서 키를 지운다.
  }
  if (
    typeof parsed?.guestDreamId === "string" &&
    typeof parsed.savedAt === "number" &&
    Date.now() - parsed.savedAt <= GUEST_DREAM_CLAIM_TTL_MS
  ) {
    return parsed.guestDreamId;
  }
  clearPendingGuestDream();
  return null;
}

export function clearPendingGuestDream() {
  localStorage.removeItem(PENDING_GUEST_DREAM_KEY);
}
