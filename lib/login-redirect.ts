/** 로그인 후 돌아갈 경로. 같은 사이트의 절대 경로만 허용하고, 아니면 null. */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return null;
  }
  if (raw === "/login" || raw.startsWith("/login?") || raw.startsWith("/auth/")) return null;
  return raw;
}

/** 로그인 화면 주소. 로그인 후 `next`로 돌아온다. */
export function loginPath(next?: string): string {
  const safe = safeNextPath(next);
  return safe ? `/login?next=${encodeURIComponent(safe)}` : "/login";
}
