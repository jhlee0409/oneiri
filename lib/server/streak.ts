const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const STREAK_WINDOW_DAYS = 28;

export interface StreakDay {
  /** KST YYYY-MM-DD */
  date: string;
  count: number;
}

export interface DreamStreak {
  /** 오늘 또는 어제로 끝나는 연속 기록 일수. 그 이전에 끊겼으면 0. */
  currentStreak: number;
  longestStreak: number;
  totalDreamDays: number;
  /** 오늘 꿈을 기록했는지 */
  recordedToday: boolean;
  /** 오래된 날 → 오늘 순서의 최근 28일 */
  recentDays: StreakDay[];
}

/** 시각을 KST 날짜(YYYY-MM-DD)로 바꾼다. */
export function toKstDateString(time: Date | string): string {
  const ms = typeof time === "string" ? Date.parse(time) : time.getTime();
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** 꿈 기록 시각 목록으로 KST 기준 연속 기록을 계산한다. */
export function computeDreamStreak(
  createdAts: readonly string[],
  now: Date = new Date()
): DreamStreak {
  const countsByDate = new Map<string, number>();
  for (const createdAt of createdAts) {
    if (Number.isNaN(Date.parse(createdAt))) continue;
    const date = toKstDateString(createdAt);
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
  }

  const today = toKstDateString(now);
  const yesterday = shiftDate(today, -1);

  let currentStreak = 0;
  const streakEnd = countsByDate.has(today)
    ? today
    : countsByDate.has(yesterday)
      ? yesterday
      : null;
  if (streakEnd) {
    for (let date = streakEnd; countsByDate.has(date); date = shiftDate(date, -1)) {
      currentStreak += 1;
    }
  }

  // YYYY-MM-DD는 사전순 = 시간순
  const sortedDates = [...countsByDate.keys()].sort();
  let longestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const date of sortedDates) {
    run = previous !== null && shiftDate(previous, 1) === date ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = date;
  }

  const recentDays: StreakDay[] = [];
  for (let offset = STREAK_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = shiftDate(today, -offset);
    recentDays.push({ date, count: countsByDate.get(date) ?? 0 });
  }

  return {
    currentStreak,
    longestStreak,
    totalDreamDays: countsByDate.size,
    recordedToday: countsByDate.has(today),
    recentDays,
  };
}
