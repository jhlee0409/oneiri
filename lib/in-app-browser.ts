export type InAppBrowser = "instagram" | "facebook" | "kakaotalk" | "line" | "naver" | "other";

/**
 * Google은 앱 내장 브라우저(WebView)에서 OAuth 로그인을 막는다(disallowed_useragent).
 * 이 브라우저에서는 로그인 대신 외부 브라우저로 여는 안내를 보여준다.
 */
export function detectInAppBrowser(userAgent: string): InAppBrowser | null {
  if (/Instagram/i.test(userAgent)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(userAgent)) return "facebook";
  if (/KAKAOTALK/i.test(userAgent)) return "kakaotalk";
  if (/\bLine\//i.test(userAgent)) return "line";
  if (/NAVER\(inapp/i.test(userAgent)) return "naver";
  if (/; wv\)/.test(userAgent) && /Android/i.test(userAgent)) return "other";
  return null;
}

/** 외부 브라우저로 바로 여는 주소. 지원하지 않는 환경이면 null(링크 복사로 안내). */
export function externalBrowserUrl(
  browser: InAppBrowser,
  url: string,
  userAgent: string
): string | null {
  if (browser === "kakaotalk") {
    return `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  }
  if (browser === "line") {
    return `${url}${url.includes("?") ? "&" : "?"}openExternalBrowser=1`;
  }
  if (/Android/i.test(userAgent)) {
    const { host, pathname, search } = new URL(url);
    return `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
  }
  return null;
}
