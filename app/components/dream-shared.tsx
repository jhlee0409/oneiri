"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { toast } from "sonner";
import { getPublicDreams } from "@/lib/api";
import { EMOTION_OPTIONS, GENRE_OPTIONS } from "@/lib/constants";
import { supabase } from "@/utils/supabase/client";
import { findEmotion, findGenre } from "@/lib/find";
import { useAuth } from "@/hooks/use-auth";
import type { DreamRecord } from "@/types/supabase";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";

// getPublicDreams가 덧붙이는 필드
type PublicDream = DreamRecord & {
  user_display_name?: string;
  total_likes_count?: number;
  likes_count?: number;
  is_liked_by_current_user?: boolean;
  is_liked_by_guest?: boolean;
};

const GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4";
// 그리드 칼럼 폭: 컨테이너 max-w-6xl(1152px) − 좌우 패딩 기준
const COVER_SIZES = "(min-width: 1280px) 270px, (min-width: 768px) 30vw, 46vw";
const PAGE_SIZE = 12;

const SELECT_CLASS =
  "min-h-11 w-full rounded-lg border border-line bg-bg-secondary px-3 text-sm text-text-primary";

const getLikesCount = (dream: PublicDream): number =>
  dream.total_likes_count ?? dream.likes_count ?? 0;

function firstStoryLine(dream: DreamRecord): string {
  const source = dream.generated_story_content || dream.dream_input_text || "";
  return (
    source
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? ""
  );
}

interface DreamCoverProps {
  dream: PublicDream;
  isLiked: boolean;
  isPending: boolean;
  onLike: (id: string) => void;
}

function DreamCover({ dream, isLiked, isPending, onLike }: DreamCoverProps) {
  const title = dream.generated_story_title || "무제";
  const likes = getLikesCount(dream);
  const meta = [
    findEmotion(dream.dream_emotion ?? "")?.label,
    findGenre(dream.story_preference_genre ?? "")?.label,
  ].filter(Boolean);

  return (
    <li>
      <Link href={`/shared/${dream.id}`} className="group block rounded-md">
        {dream.generated_image_url ? (
          <>
            <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-line bg-bg-secondary">
              <ImageWithFallback
                src={dream.generated_image_url}
                alt=""
                fill
                sizes={COVER_SIZES}
                className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                containerClassName="absolute inset-0"
                fallbackMessage="그림을 불러오지 못했어요"
              />
            </div>
            <h2 className="mt-3 font-serif text-base leading-snug text-text-primary break-keep line-clamp-2 group-hover:underline group-hover:underline-offset-4 group-hover:decoration-line">
              {title}
            </h2>
          </>
        ) : (
          <div className="aspect-[3/4] overflow-hidden rounded-md border border-line bg-paper px-4 py-5 text-ink sm:px-5 sm:py-6">
            <h2 className="font-serif text-base leading-snug break-keep line-clamp-4 sm:text-lg">
              {title}
            </h2>
            <span aria-hidden="true" className="my-3 block h-px w-8 bg-ink/30" />
            <p className="font-serif text-sm leading-relaxed text-ink/70 break-keep line-clamp-5">
              {firstStoryLine(dream)}
            </p>
          </div>
        )}
        <p className="mt-1.5 text-xs text-text-secondary break-keep line-clamp-1">
          {dream.user_display_name || "익명"}
          {meta.length > 0 && <> · {meta.join(" · ")}</>}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => dream.id && onLike(dream.id)}
        disabled={isPending}
        aria-pressed={isLiked}
        aria-label={`좋아요 ${likes}`}
        className={`-ml-3 mt-0.5 inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-md px-3 text-sm transition-colors disabled:opacity-60 ${
          isLiked
            ? "text-accent-primary"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <Heart
          className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span aria-hidden="true">{likes}</span>
      </button>
    </li>
  );
}

function FeedSkeleton() {
  return (
    <ul className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="aspect-[3/4] w-full rounded-md" />
          <Skeleton className="mt-3 h-4 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

interface FilterOptions {
  search: string;
  emotion: string;
  genre: string;
}

const EMPTY_FILTERS: FilterOptions = { search: "", emotion: "", genre: "" };

export default function DreamShared() {
  const [dreams, setDreams] = useState<PublicDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(EMPTY_FILTERS);

  const { user } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data: { ip: string } = await response.json();
      return data.ip;
    } catch {
      return "0.0.0.0";
    }
  };

  const loadDreams = useCallback(
    async (pageNum: number) => {
      if (pageNum === 1) setLoading(true);
      else {
        loadingMoreRef.current = true;
        setLoadingMore(true);
      }
      setLoadError(false);
      try {
        const user_id = user?.id;
        const guest_ip = user_id ? undefined : await getClientIP();
        const result = await getPublicDreams({
          page: pageNum,
          limit: PAGE_SIZE,
          ...filters,
          user_id,
          guest_ip,
        });
        if (!result.success || !result.data) throw new Error(result.error);
        const newDreams = result.data.dreams as PublicDream[];
        setDreams((prev) =>
          pageNum === 1 ? newDreams : [...prev, ...newDreams]
        );
        setPage(pageNum);
        setHasMore(pageNum < result.data.pagination.pages);
      } catch (error) {
        console.error("꿈 목록 로드 실패:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [filters, user?.id]
  );

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMore) return;
    loadDreams(page + 1);
  }, [hasMore, loadDreams, page]);

  // 필터·로그인 상태가 바뀌면 처음부터 다시 로드 (초기 로드 포함)
  useEffect(() => {
    loadDreams(1);
  }, [loadDreams]);

  // 스크롤이 끝에 닿으면 자동으로 다음 페이지 로드 (키보드는 "더 보기" 버튼)
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loadError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loadError]);

  const handleLike = async (dreamId: string) => {
    if (isTogglingLike === dreamId) return;
    setIsTogglingLike(dreamId);
    try {
      const dream = dreams.find((d) => d.id === dreamId);
      let isCurrentlyLiked: boolean;
      if (user) {
        isCurrentlyLiked = Boolean(dream?.is_liked_by_current_user);
        const { error } = isCurrentlyLiked
          ? await supabase
              .from("dream_likes")
              .delete()
              .eq("dream_id", dreamId)
              .eq("user_id", user.id)
          : await supabase
              .from("dream_likes")
              .insert({ dream_id: dreamId, user_id: user.id });
        if (error) throw error;
      } else {
        const clientIP = await getClientIP();
        isCurrentlyLiked = Boolean(dream?.is_liked_by_guest);
        const { error } = isCurrentlyLiked
          ? await supabase
              .from("guest_likes")
              .delete()
              .eq("dream_id", dreamId)
              .eq("ip_address", clientIP)
          : await supabase.from("guest_likes").insert({
              dream_id: dreamId,
              ip_address: clientIP,
              user_agent: navigator.userAgent,
            });
        if (error) throw error;
      }
      // 로컬 상태만 갱신 (API 재호출 없이)
      const likedKey = user ? "is_liked_by_current_user" : "is_liked_by_guest";
      setDreams((prev) =>
        prev.map((d) =>
          d.id === dreamId
            ? {
                ...d,
                [likedKey]: !isCurrentlyLiked,
                total_likes_count: Math.max(
                  0,
                  getLikesCount(d) + (isCurrentlyLiked ? -1 : 1)
                ),
              }
            : d
        )
      );
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      toast.error("좋아요를 반영하지 못했어요. 잠시 후 다시 눌러 주세요.");
    } finally {
      setIsTogglingLike(null);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const isFiltered = Boolean(filters.search || filters.emotion || filters.genre);

  let content: React.ReactNode;
  if (loading) {
    content = (
      <>
        <p className="sr-only" role="status">
          꿈 이야기를 불러오고 있어요
        </p>
        <FeedSkeleton />
      </>
    );
  } else if (loadError && dreams.length === 0) {
    content = (
      <div className="py-16 text-center sm:py-24" role="alert">
        <h2 className="font-serif text-xl text-text-primary sm:text-2xl">
          꿈 이야기를 불러오지 못했어요
        </h2>
        <p className="mx-auto mb-8 mt-3 max-w-md text-sm text-text-secondary break-keep sm:text-base">
          연결 상태를 확인하고 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => loadDreams(1)}
          className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-text-primary transition-colors hover:bg-bg-secondary"
        >
          다시 불러오기
        </button>
      </div>
    );
  } else if (dreams.length === 0) {
    content = isFiltered ? (
      <div className="py-16 text-center sm:py-24">
        <h2 className="font-serif text-xl text-text-primary sm:text-2xl">
          조건에 맞는 꿈이 없어요
        </h2>
        <p className="mx-auto mb-8 mt-3 max-w-md text-sm text-text-secondary break-keep sm:text-base">
          검색어를 바꾸거나 필터를 풀어 보세요.
        </p>
        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-text-primary transition-colors hover:bg-bg-secondary"
        >
          조건 초기화
        </button>
      </div>
    ) : (
      <div className="py-16 text-center sm:py-24">
        <h2 className="font-serif text-xl text-text-primary sm:text-2xl">
          아직 공개된 꿈이 없어요
        </h2>
        <p className="mx-auto mb-8 mt-3 max-w-md text-sm text-text-secondary break-keep sm:text-base">
          내 꿈을 기록하고 공개하면 이곳에 처음으로 놓여요.
        </p>
        <Link
          href="/dreams/new"
          className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-text-primary transition-colors hover:bg-bg-secondary"
        >
          꿈 기록하기
        </Link>
      </div>
    );
  } else {
    content = (
      <>
        <ul className={GRID_CLASS}>
          {dreams.map((dream) => (
            <DreamCover
              key={dream.id}
              dream={dream}
              onLike={handleLike}
              isPending={isTogglingLike === dream.id}
              isLiked={Boolean(
                user ? dream.is_liked_by_current_user : dream.is_liked_by_guest
              )}
            />
          ))}
        </ul>
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="mt-12 flex flex-col items-center gap-3"
          >
            {loadError && (
              <p className="text-sm text-text-secondary" role="alert">
                다음 꿈들을 불러오지 못했어요.
              </p>
            )}
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-sm text-text-primary transition-colors hover:bg-bg-secondary disabled:opacity-60"
            >
              {loadingMore ? "불러오는 중이에요" : "더 보기"}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <h1 className="font-serif text-3xl text-text-primary sm:text-4xl">
            둘러보기
          </h1>
          <p className="mt-2 text-sm text-text-secondary break-keep sm:text-base">
            다른 사람들이 공개한 꿈 이야기예요.
          </p>
        </header>

        <div
          role="search"
          className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 md:grid-cols-[minmax(0,1fr)_10rem_10rem]"
        >
          <div className="relative col-span-2 md:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="꿈 검색"
              placeholder="제목이나 내용으로 찾기"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="min-h-11 w-full rounded-lg border border-line bg-bg-secondary pl-10 pr-4 text-base text-text-primary placeholder:text-text-secondary"
            />
          </div>
          <select
            aria-label="감정"
            value={filters.emotion}
            onChange={(e) => handleFilterChange("emotion", e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">모든 감정</option>
            {EMOTION_OPTIONS.map((emotion) => (
              <option key={emotion.value} value={emotion.value}>
                {emotion.label}
              </option>
            ))}
          </select>
          <select
            aria-label="장르"
            value={filters.genre}
            onChange={(e) => handleFilterChange("genre", e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">모든 장르</option>
            {GENRE_OPTIONS.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.label}
              </option>
            ))}
          </select>
        </div>

        {content}
      </div>
    </div>
  );
}
