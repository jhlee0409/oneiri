"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

// 글쓰기·읽기·설정처럼 화면 하단을 써야 하는 곳에서는 숨긴다.
const HIDDEN_PATHS = ["/dreams/new", "/analysis/new", "/settings", "/login"];

/** 우하단 고객 지원 바로가기. 팝업 없이 Discord 문의 채널을 새 창으로 연다. */
export function SupportFloatingButton() {
  const pathname = usePathname();

  if (
    HIDDEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/library/dreams/")
  ) {
    return null;
  }

  return (
    <a
      href={APP_CONFIG.DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="고객 지원: Discord에서 문의하기 (새 창)"
      title="Discord에서 문의하기"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary text-bg-primary shadow-lg transition-[filter] duration-200 hover:brightness-110"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
