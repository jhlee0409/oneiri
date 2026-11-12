const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Current time shifted to KST (UTC+9) and its YYYY-MM-DD date string. */
export function getKstNow(): { kstTime: Date; kstDateString: string } {
  const kstTime = new Date(Date.now() + KST_OFFSET_MS);
  return { kstTime, kstDateString: kstTime.toISOString().split("T")[0] };
}

export const DAILY_WEAVING_LIMIT = 2;
