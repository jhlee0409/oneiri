"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Megaphone, ExternalLink } from "lucide-react";
import {
  getLatestRelease,
  shouldShowUpdateBanner,
  dismissUpdateBanner,
} from "@/lib/update-banner";

interface UpdateBannerProps {
  className?: string;
}

export default function UpdateBanner({ className = "" }: UpdateBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<{
    version: string;
    name: string;
    htmlUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      setIsLoading(true);
      const latestRelease = await getLatestRelease();

      if (!latestRelease) {
        setIsLoading(false);
        return;
      }

      const shouldShow = shouldShowUpdateBanner(latestRelease.version);

      if (shouldShow) {
        setReleaseInfo({
          version: latestRelease.version,
          name: latestRelease.name,
          htmlUrl: latestRelease.htmlUrl,
        });
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    // 이벤트 버블링 방지 (모바일에서 배너 링크 클릭 방지)
    e.stopPropagation();

    if (releaseInfo) {
      dismissUpdateBanner(releaseInfo.version);
      setIsVisible(false);
    }
  };

  // 로딩 중이거나 표시할 필요가 없으면 렌더링하지 않음
  if (isLoading || !isVisible || !releaseInfo) {
    return null;
  }

  return (
    <div
      className={`w-full oneiri-accent-bg text-bg-primary relative ${className}`}
    >
      {/* 데스크톱 버전 (md 이상) */}
      <div className="hidden md:block">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-3 flex items-center justify-center">
            {/* 중앙 메시지 */}
            <div className="flex items-center justify-center gap-3">
              <Megaphone className="w-5 h-5 flex-shrink-0" />
              <div className="text-center">
                <span className="font-medium">
                  새로운 업데이트가 출시되었습니다!
                </span>
                <span className="ml-2 font-bold">{releaseInfo.name}</span>
              </div>
              <Link
                href="/notices"
                className="ml-3 inline-flex items-center gap-1 text-bg-primary hover:text-bg-primary/80 transition-colors text-sm font-medium underline"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* 오른쪽 닫기 버튼 - absolute로 고정 */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="업데이트 알림 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 버전 (md 미만) - 전체 배너가 링크 */}
      <Link href="/notices" className="block md:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-3 flex items-center justify-center gap-2">
            {/* 중앙 메시지 */}
            <div className="flex items-center justify-center gap-3">
              <Megaphone className="w-5 h-5 flex-shrink-0" />
              <div className="text-center">
                <span className="font-medium">
                  새로운 업데이트가 출시되었습니다!
                </span>
                <span className="ml-2 font-bold">{releaseInfo.name}</span>
              </div>
            </div>

            {/* 오른쪽 닫기 버튼 */}
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="업데이트 알림 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>

      {/* 하단 구분선 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20"></div>
    </div>
  );
}
