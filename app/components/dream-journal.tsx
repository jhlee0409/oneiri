"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ImageIcon,
  Plus,
  BookOpen,
  Heart,
  Search,
} from "lucide-react";
import { useUserDreams } from "@/hooks/use-dream-api";
import type { DreamRecord } from "@/types/supabase";
import Image from "next/image";

function DreamEntryCard({ entry }: { entry: DreamRecord }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link href={`/story/${entry.id}`} className="block group">
      <article className="bg-white border-b border-gray-100 py-8 transition-colors hover:bg-gray-50 px-4 rounded-lg">
        <div className="flex gap-6">
          {/* 썸네일/아이콘 영역 */}
          {/* <div className="flex-shrink-0">
            {entry.generated_image_url ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={entry.generated_image_url}
                  alt={entry.generated_story_title || "꿈의 풍경"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  width={64}
                  height={64}
                />
              </div>
            ) : entry.generated_image_prompt ? (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-purple-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div> */}

          {/* 콘텐츠 영역 */}
          <div className="flex-1 min-w-0">
            {/* 제목과 날짜, 즐겨찾기 */}
            <div className="mb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-['Inter'] text-xl font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {entry.generated_story_title || "무제"}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(entry.created_at)}
                  </div>
                </div>
                {entry.is_favorite && (
                  <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0 mt-1" />
                )}
              </div>
            </div>

            {/* 스토리 미리보기 */}
            <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-2">
              {entry.generated_story_content
                ? entry.generated_story_content.substring(0, 150) + "..."
                : (entry.dream_input_text || "").substring(0, 150) + "..."}
            </p>

            {/* 메타데이터 */}
            <div className="flex items-center gap-3">
              {entry.dream_emotion && (
                <span className="text-lg whitespace-nowrap" title="꿈의 여운">
                  {entry.dream_emotion}
                </span>
              )}
              {entry.story_preference_mood && (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {entry.story_preference_mood}
                </span>
              )}
              {entry.dream_keywords && entry.dream_keywords.length > 0 && (
                <div className="flex gap-2">
                  {entry.dream_keywords.slice(0, 3).map((keyword, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-500 whitespace-nowrap"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-4xl mb-6 text-gray-400">📖</div>
      <h2 className="font-['Inter'] text-2xl font-medium text-gray-900 mb-3">
        아직 서재가 비어있네요.
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        당신의 첫 번째 꿈 이야기로 이 서재의 첫 페이지를 장식해주세요.
      </p>
      <Link
        href="/"
        className="inline-flex items-center bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />첫 이야기의 씨앗 심기
      </Link>
    </div>
  );
}

export default function DreamJournal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: dreamsData, isLoading, error, refetch } = useUserDreams();

  // Edge Function이 실제로는 data: dreams (배열)을 직접 반환함
  const dreamEntries = Array.isArray(dreamsData) ? dreamsData : [];

  // 필터링된 꿈 목록
  const filteredDreams = dreamEntries.filter((dream) => {
    const matchesSearch =
      searchQuery === "" ||
      dream.generated_story_title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      dream.dream_input_text
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      dream.dream_keywords?.some((keyword: string) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFavorites = !showFavoritesOnly || dream.is_favorite;

    return matchesSearch && matchesFavorites;
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center py-24">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            꿈 서재를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">잠시 후 다시 시도해주세요.</p>
          <button
            onClick={() => refetch()}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* 헤더 */}
      <header className="mb-16">
        <h1 className="font-['Inter'] text-4xl md:text-5xl font-medium text-gray-900 mb-4">
          나의 꿈 서재
        </h1>
        <p className="text-gray-600 text-lg">
          {dreamEntries.length > 0
            ? `${dreamEntries.length}개의 꿈 이야기가 서재에 보관됨`
            : "밤의 기억들이 모이는 공간"}
        </p>
      </header>

      {/* 검색 및 필터 */}
      {dreamEntries.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="꿈 이야기 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`}
              />
              즐겨찾기만 보기
            </button>

            <span className="text-sm text-gray-500">
              {filteredDreams.length}개 표시 중
            </span>
          </div>
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center mb-12 pb-6 border-b border-gray-100">
        <Link
          href="/"
          className="text-gray-600 hover:text-black font-medium transition-colors"
        >
          ← 새로운 꿈 조각으로 돌아가기
        </Link>

        {dreamEntries.length > 0 && (
          <div className="text-sm text-gray-500">최신순 정렬</div>
        )}
      </nav>

      {/* 꿈 일기 목록 또는 빈 상태 */}
      {filteredDreams.length > 0 ? (
        <main>
          {filteredDreams.map((entry) => (
            <DreamEntryCard key={entry.id} entry={entry} />
          ))}
        </main>
      ) : dreamEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="text-center py-24">
          <div className="text-4xl mb-6 text-gray-400">🔍</div>
          <h2 className="font-['Inter'] text-2xl font-medium text-gray-900 mb-3">
            검색 결과가 없습니다
          </h2>
          <p className="text-gray-600 mb-8">다른 키워드로 검색해보세요.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setShowFavoritesOnly(false);
            }}
            className="text-black hover:text-gray-700 transition-colors"
          >
            전체 서재 보기
          </button>
        </div>
      )}

      {/* 통계 푸터 */}
      {dreamEntries.length > 0 && (
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            총 {dreamEntries.length}개의 꿈을 기록했습니다 • 계속해서 무의식의
            서재를 채워가세요
          </p>
        </footer>
      )}

      {/* 플로팅 액션 버튼 */}
      <Link
        href="/"
        className="fixed bottom-8 right-8 bg-black hover:bg-gray-800 text-white w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-sm"
        title="새로운 꿈 조각 기록하기"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
