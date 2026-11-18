"use client";

import { useState, useSyncExternalStore } from "react";
import { detectInAppBrowser, externalBrowserUrl, type InAppBrowser } from "@/lib/in-app-browser";

const subscribe = () => () => {};

/** 앱 내장 브라우저면 그 종류, 아니면 null. 서버 렌더에서는 null. */
export function useInAppBrowser(): InAppBrowser | null {
  return useSyncExternalStore(
    subscribe,
    () => detectInAppBrowser(navigator.userAgent),
    () => null
  );
}

const MENU_HINT: Record<InAppBrowser, string> = {
  instagram: "오른쪽 위 ⋯ 메뉴에서 「외부 브라우저에서 열기」를 눌러 주세요.",
  facebook: "오른쪽 위 ⋯ 메뉴에서 「외부 브라우저에서 열기」를 눌러 주세요.",
  kakaotalk: "오른쪽 아래 ⋯ 메뉴에서 「다른 브라우저로 열기」를 눌러 주세요.",
  line: "오른쪽 위 메뉴에서 「기본 브라우저로 열기」를 눌러 주세요.",
  naver: "아래 메뉴에서 「다른 브라우저로 열기」를 눌러 주세요.",
  other: "링크를 복사해 Safari나 Chrome에서 열어 주세요.",
};

/**
 * Google 로그인이 막히는 앱 내장 브라우저에서 보여주는 안내.
 * `resumeUrl`을 외부 브라우저에서 열면 지금 하던 일(체험 이야기 저장 등)을 이어서 한다.
 */
export function InAppBrowserNotice({
  browser,
  resumeUrl,
}: {
  browser: InAppBrowser;
  resumeUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const directUrl = externalBrowserUrl(browser, resumeUrl, navigator.userAgent);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      role="status"
      className="space-y-3 rounded-lg border border-line p-4 text-left text-sm oneiri-text-primary"
    >
      <p className="font-medium">이 앱 안에서는 Google 로그인이 열리지 않아요.</p>
      <p className="break-keep oneiri-text-secondary">
        Safari나 Chrome에서 열면 이어서 저장할 수 있어요. {MENU_HINT[browser]}
      </p>
      <div className="flex flex-wrap gap-2">
        {directUrl && (
          <a
            href={directUrl}
            className="inline-flex min-h-11 items-center rounded-lg oneiri-accent-bg px-4 font-medium text-bg-primary"
          >
            브라우저에서 열기
          </a>
        )}
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 items-center rounded-lg border border-text-secondary/40 px-4 font-medium oneiri-text-primary"
        >
          {copied ? "링크를 복사했어요" : "링크 복사"}
        </button>
      </div>
    </div>
  );
}
