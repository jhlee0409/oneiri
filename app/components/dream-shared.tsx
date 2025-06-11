"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { getPublicDreams } from "@/lib/api";
import type { DreamRecord } from "@/types/supabase";
import { EMOTION_OPTIONS, GENRE_OPTIONS } from "@/lib/constants";
import { supabase } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { findEmotion, findGenre } from "@/lib/find";

// 좋아요 수 통합 처리를 위한 헬퍼 함수
const getLikesCount = (dream: any): number => {
  return dream.total_likes_count ?? dream.likes_count ?? 0;
};

const updateLikesCount = (dream: any, delta: number) => {
  const currentCount = getLikesCount(dream);
  const newCount = Math.max(0, currentCount + delta);
  return {
    ...dream,
    total_likes_count: newCount,
    likes_count: newCount,
  };
};

interface DreamCardProps {
  dream: any; // DreamRecord with extended properties
  onLike: (id: string) => void;
  isLiked: boolean;
}

function DreamCard({ dream, onLike, isLiked }: DreamCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push(`/dreams/${dream.id}`);
  };

  return (
    <div
      className="group cursor-pointer oneiri-bg-secondary border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
        {dream.generated_image_url ? (
          <img
            src={dream.generated_image_url}
            alt={dream.generated_story_title || "꿈 이미지"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center oneiri-text-secondary">
            <div className="text-center">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-sm">꿈의 이미지</div>
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-['Inter'] text-lg font-medium oneiri-text-primary mb-2 line-clamp-1 group-hover:oneiri-accent transition-colors">
          {dream.generated_story_title || "제목 없는 꿈"}
        </h3>
        <p className="oneiri-text-secondary text-sm mb-4 line-clamp-2">
          {dream.generated_story_content?.substring(0, 150) ||
            dream.dream_input_text?.substring(0, 150) ||
            "꿈의 내용..."}
          {((dream.generated_story_content &&
            dream.generated_story_content.length > 150) ||
            (dream.dream_input_text && dream.dream_input_text.length > 150)) &&
            "..."}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs oneiri-accent-bg oneiri-text-primary px-2 py-1 rounded-full">
              {findGenre(dream.story_preference_genre)?.label || "없음"}
            </span>
            <span className="text-xs oneiri-accent-bg oneiri-text-primary px-2 py-1 rounded-full">
              {findEmotion(dream.dream_emotion)?.label || "없음"}
            </span>
            <span className="text-xs oneiri-text-secondary">
              {dream.user_display_name || "익명"}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(dream.id!);
            }}
            type="button"
            className={`flex items-center gap-1 text-sm transition-colors ${
              isLiked
                ? "oneiri-accent"
                : "oneiri-text-secondary hover:oneiri-accent"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{getLikesCount(dream)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterOptions {
  search: string;
  emotion: string;
  genre: string;
}

// 간단한 auth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 사용자 확인
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export default function DreamShared() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedDreams, setLikedDreams] = useState<Set<string>>(new Set());
  const [guestLikedDreams, setGuestLikedDreams] = useState<Set<string>>(
    new Set()
  );
  const [isTogglingLike, setIsTogglingLike] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    emotion: "",
    genre: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 클라이언트 IP 가져오기 (간단한 구현)
  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("IP 가져오기 실패:", error);
      return "0.0.0.0"; // 기본값
    }
  };

  const loadDreams = useCallback(
    async (pageNum: number, isNewSearch = false) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await getPublicDreams({
          page: pageNum,
          limit: 12,
          ...filters,
        });

        if (result.success && result.data) {
          const newDreams = result.data.dreams;

          if (isNewSearch || pageNum === 1) {
            setDreams(newDreams);
          } else {
            setDreams((prev) => [...prev, ...newDreams]);
          }

          setHasMore(pageNum < result.data.pagination.pages);
        }
      } catch (error) {
        console.error("꿈 목록 로드 실패:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  // Intersection Observer 설정
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadDreams(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadDreams]);

  // 필터 변경시 데이터 다시 로드
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadDreams(1, true);
  }, [filters]);

  // 초기 로드
  useEffect(() => {
    loadDreams(1);
  }, []);

  // 사용자의 좋아요 상태 로드
  useEffect(() => {
    const loadUserLikes = async () => {
      if (!dreams.length) return;

      try {
        if (user) {
          // 로그인한 사용자의 좋아요 상태
          const { data: userLikes } = await supabase
            .from("dream_likes")
            .select("dream_id")
            .eq("user_id", user.id)
            .in(
              "dream_id",
              dreams.map((dream) => dream.id)
            );

          if (userLikes) {
            setLikedDreams(new Set(userLikes.map((like) => like.dream_id)));
          }
        } else {
          // 게스트 사용자의 좋아요 상태
          const clientIP = await getClientIP();
          const { data: guestLikes } = await supabase
            .from("guest_likes")
            .select("dream_id")
            .eq("ip_address", clientIP)
            .in(
              "dream_id",
              dreams.map((dream) => dream.id)
            );

          if (guestLikes) {
            setGuestLikedDreams(
              new Set(guestLikes.map((like) => like.dream_id))
            );
          }
        }
      } catch (error) {
        console.error("좋아요 상태 로드 실패:", error);
      }
    };

    loadUserLikes();
  }, [dreams, user]);

  const handleLike = async (dreamId: string) => {
    if (isTogglingLike === dreamId) return;

    setIsTogglingLike(dreamId);

    try {
      if (user) {
        // 로그인한 사용자 좋아요 처리
        const isCurrentlyLiked = likedDreams.has(dreamId);

        if (isCurrentlyLiked) {
          // 좋아요 취소
          const { error } = await supabase
            .from("dream_likes")
            .delete()
            .eq("dream_id", dreamId)
            .eq("user_id", user.id);

          if (error) throw error;

          setLikedDreams((prev) => {
            const newLiked = new Set(prev);
            newLiked.delete(dreamId);
            return newLiked;
          });

          // 로컬 상태에서 좋아요 수 감소
          setDreams((prev) =>
            prev.map((dream) =>
              dream.id === dreamId ? updateLikesCount(dream, -1) : dream
            )
          );
        } else {
          // 좋아요 추가
          const { error } = await supabase.from("dream_likes").insert({
            dream_id: dreamId,
            user_id: user.id,
          });

          if (error) throw error;

          setLikedDreams((prev) => new Set(prev).add(dreamId));

          // 로컬 상태에서 좋아요 수 증가
          setDreams((prev) =>
            prev.map((dream) =>
              dream.id === dreamId ? updateLikesCount(dream, 1) : dream
            )
          );
        }
      } else {
        // 게스트 좋아요 처리
        const clientIP = await getClientIP();
        const userAgent = navigator.userAgent;
        const isCurrentlyLiked = guestLikedDreams.has(dreamId);

        if (isCurrentlyLiked) {
          // 게스트 좋아요 취소
          const { error } = await supabase
            .from("guest_likes")
            .delete()
            .eq("dream_id", dreamId)
            .eq("ip_address", clientIP);

          if (error) throw error;

          setGuestLikedDreams((prev) => {
            const newLiked = new Set(prev);
            newLiked.delete(dreamId);
            return newLiked;
          });

          // 로컬 상태에서 좋아요 수 감소
          setDreams((prev) =>
            prev.map((dream) =>
              dream.id === dreamId ? updateLikesCount(dream, -1) : dream
            )
          );
        } else {
          // 게스트 좋아요 추가
          const { error } = await supabase.from("guest_likes").insert({
            dream_id: dreamId,
            ip_address: clientIP,
            user_agent: userAgent,
          });

          if (error) throw error;

          setGuestLikedDreams((prev) => new Set(prev).add(dreamId));

          // 로컬 상태에서 좋아요 수 증가
          setDreams((prev) =>
            prev.map((dream) =>
              dream.id === dreamId ? updateLikesCount(dream, 1) : dream
            )
          );
        }
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsTogglingLike(null);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen oneiri-bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* 헤더 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold oneiri-text-primary mb-3 sm:mb-4">
            꿈꾸는 이들의 공간
          </h1>
          <p className="oneiri-text-secondary text-base sm:text-lg">
            다른 사람들이 공유한 꿈 이야기를 탐험하고 영감을 얻어보세요
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
            {/* 검색 */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 oneiri-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="꿈을 검색해보세요..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2 oneiri-bg-secondary border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary oneiri-text-primary text-sm sm:text-base"
              />
            </div>

            {/* 필터 토글 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 oneiri-bg-secondary border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors oneiri-text-primary text-sm sm:text-base"
            >
              <Filter className="w-4 h-4" />
              필터
            </button>
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 oneiri-bg-secondary border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium oneiri-text-primary mb-2">
                    감정
                  </label>
                  <select
                    value={filters.emotion}
                    onChange={(e) =>
                      handleFilterChange("emotion", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary oneiri-bg-primary oneiri-text-primary text-sm"
                  >
                    <option value="">모든 감정</option>
                    {EMOTION_OPTIONS.map((emotion) => (
                      <option key={emotion.value} value={emotion.value}>
                        {emotion.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium oneiri-text-primary mb-2">
                    장르
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) =>
                      handleFilterChange("genre", e.target.value)
                    }
                    className="w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary oneiri-bg-primary oneiri-text-primary text-sm"
                  >
                    <option value="">모든 장르</option>
                    {GENRE_OPTIONS.map((genre) => (
                      <option key={genre.value} value={genre.value}>
                        {genre.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 꿈 그리드 */}
        {loading ? (
          <div className="max-w-4xl mx-auto px-6 py-12 oneiri-bg-primary min-h-screen">
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-secondary border-t-accent-primary"></div>
            </div>
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🌙</div>
            <h3 className="text-lg sm:text-xl font-medium oneiri-text-primary mb-2">
              아직 공유된 꿈이 없습니다
            </h3>
            <p className="oneiri-text-secondary text-sm sm:text-base">
              첫 번째 꿈을 공유해보세요!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  onLike={handleLike}
                  isLiked={
                    user
                      ? likedDreams.has(dream.id!)
                      : guestLikedDreams.has(dream.id!)
                  }
                />
              ))}
            </div>

            {/* 무한스크롤 트리거 */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex justify-center items-center py-8"
              >
                {loadingMore && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
