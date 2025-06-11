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
  FileText,
  MoonStar,
  SearchX,
} from "lucide-react";
import { useUserDreams } from "@/hooks/use-dream-api";
import type { AnalysisReport, DreamRecord } from "@/types/supabase";
import Image from "next/image";
import { EMOTION_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import { useUserAnalysisReports } from "@/hooks/use-dream-api";
import { formatKoreanDate } from "@/lib/utils";

function DreamEntryCard({ entry }: { entry: DreamRecord }) {
  return (
    <Link href={`/library/dreams/${entry.id}`} className="block group">
      <article className="oneiri-bg-secondary border-b border-text-secondary/20 py-4 sm:py-8 transition-colors hover:bg-bg-secondary/80 px-3 sm:px-4 rounded-lg">
        <div className="flex gap-3 sm:gap-6">
          {/* 썸네일/아이콘 영역 */}
          <div className="flex-shrink-0">
            {entry.generated_image_url ? (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shadow-sm">
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-oneiri-violet/20 to-accent-primary/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-oneiri-violet" />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-text-secondary/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 oneiri-text-secondary" />
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 min-w-0">
            {/* 제목과 날짜, 즐겨찾기 */}
            <div className="mb-2 sm:mb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h2 className="font-['Inter'] text-base sm:text-xl font-medium oneiri-text-primary group-hover:oneiri-accent transition-colors line-clamp-1">
                      {entry.generated_story_title || "무제"}
                    </h2>
                    {/* 공개 상태 뱃지 */}
                    <span
                      className={`text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                        entry.is_public
                          ? "bg-oneiri-violet/20 text-oneiri-violet"
                          : "bg-text-secondary/20 oneiri-text-secondary"
                      }`}
                    >
                      {entry.is_public ? "공개됨" : "비공개"}
                    </span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm oneiri-text-secondary">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {formatKoreanDate(entry.created_at)}
                  </div>
                </div>
                {entry.is_favorite && (
                  <Heart className="w-5 h-5 oneiri-accent fill-current flex-shrink-0 mt-1" />
                )}
              </div>
            </div>

            {/* 스토리 미리보기 */}
            <p className="oneiri-text-primary/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-2">
              {entry.generated_story_content
                ? entry.generated_story_content.substring(0, 150) + "..."
                : (entry.dream_input_text || "").substring(0, 150) + "..."}
            </p>

            {/* 메타데이터 */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {entry.dream_emotion && (
                <span
                  className="text-base sm:text-lg whitespace-nowrap"
                  title="꿈의 여운"
                >
                  {
                    EMOTION_OPTIONS.find(
                      (emotion) => emotion.value === entry.dream_emotion
                    )?.emoji
                  }
                </span>
              )}
              {entry.story_preference_mood && (
                <span className="text-xs sm:text-sm text-oneiri-violet whitespace-nowrap">
                  {
                    MOOD_OPTIONS.find(
                      (mood) => mood.value === entry.story_preference_mood
                    )?.label
                  }
                </span>
              )}
              {entry.dream_keywords && entry.dream_keywords.length > 0 && (
                <div className="flex gap-1 sm:gap-2">
                  {entry.dream_keywords.slice(0, 3).map((keyword, index) => (
                    <span
                      key={index}
                      className="text-xs oneiri-text-secondary whitespace-nowrap"
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

function AnalysisReportCard({ report }: { report: AnalysisReport }) {
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
    <Link href={`/analysis/${report.id}`} className="block group">
      <article className="oneiri-bg-secondary border-b border-text-secondary/20 py-4 sm:py-8 transition-colors hover:bg-bg-secondary/80 px-3 sm:px-4 rounded-lg">
        <div className="flex gap-3 sm:gap-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-oneiri-violet/20 to-accent-primary/20 rounded-lg flex items-center justify-center">
              <MoonStar className="w-6 h-6 sm:w-8 sm:h-8 text-oneiri-violet" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-['Inter'] text-base sm:text-xl font-medium oneiri-text-primary group-hover:oneiri-accent transition-colors mb-1 sm:mb-2">
                    꿈 분석 리포트
                  </h2>
                  <div className="flex items-center text-xs sm:text-sm oneiri-text-secondary">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {formatDate(report.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <p className="oneiri-text-primary/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-2">
              {report.input_text && report.input_text.length > 150
                ? report.input_text.substring(0, 150) + "..."
                : report.input_text || "분석 내용을 확인해보세요."}
            </p>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs oneiri-text-secondary whitespace-nowrap flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                AI 분석 완료
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ activeTab }: { activeTab: "dreams" | "analysis" }) {
  if (activeTab === "analysis") {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 oneiri-text-secondary flex justify-center items-center">
          <SearchX className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h2 className="font-['Inter'] text-xl sm:text-2xl font-medium oneiri-text-primary mb-2 sm:mb-3">
          아직 분석된 꿈이 없네요.
        </h2>
        <p className="oneiri-text-secondary mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
          꿈을 분석해서 숨겨진 의미를 찾아보세요.
        </p>
        <Link
          href="/analysis/new"
          className="inline-flex items-center oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary font-medium py-2 sm:py-3 px-4 sm:px-6 transition-colors rounded-lg text-sm sm:text-base"
        >
          <MoonStar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />첫 꿈 분석하기
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-16 sm:py-24">
      <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 oneiri-text-secondary">
        📖
      </div>
      <h2 className="font-['Inter'] text-xl sm:text-2xl font-medium oneiri-text-primary mb-2 sm:mb-3">
        아직 서재가 비어있네요.
      </h2>
      <p className="oneiri-text-secondary mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
        당신의 첫 번째 꿈 이야기로 이 서재의 첫 페이지를 장식해주세요.
      </p>
      <Link
        href="/"
        className="inline-flex items-center oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary font-medium py-2 sm:py-3 px-4 sm:px-6 transition-colors rounded-lg text-sm sm:text-base"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />첫 이야기의 씨앗 심기
      </Link>
    </div>
  );
}

export default function DreamJournal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"dreams" | "analysis">("dreams");

  const {
    data: dreamsData,
    isLoading: dreamsLoading,
    error: dreamsError,
    refetch: refetchDreams,
  } = useUserDreams();
  const {
    data: analysisData,
    isLoading: analysisLoading,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useUserAnalysisReports();

  // Edge Function이 실제로는 data: dreams (배열)을 직접 반환함
  const dreamEntries = Array.isArray(dreamsData) ? dreamsData : [];
  const analysisReports = Array.isArray(analysisData) ? analysisData : [];

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

  // 필터링된 분석 리포트 목록
  const filteredAnalysis = analysisReports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      report.input_text?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const isLoading = dreamsLoading || analysisLoading;
  const error = dreamsError || analysisError;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 oneiri-bg-primary min-h-screen">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-secondary border-t-accent-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 oneiri-bg-primary min-h-screen">
        <div className="text-center py-24">
          <h2 className="text-xl font-medium oneiri-text-primary mb-4">
            서재를 불러올 수 없습니다
          </h2>
          <p className="oneiri-text-secondary mb-6">
            잠시 후 다시 시도해주세요.
          </p>
          <button
            onClick={() => {
              refetchDreams();
              refetchAnalysis();
            }}
            className="oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary px-6 py-3 transition-colors rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 oneiri-bg-primary min-h-screen">
      {/* 헤더 */}
      <header className="mb-10 sm:mb-16">
        <h1 className="font-['Inter'] text-2xl sm:text-4xl md:text-5xl font-medium oneiri-accent mb-3 sm:mb-4">
          나의 꿈 서재
        </h1>
        <p className="oneiri-text-secondary text-base sm:text-lg">
          {activeTab === "dreams"
            ? dreamEntries.length > 0
              ? `${dreamEntries.length}개의 꿈 이야기가 서재에 보관됨`
              : "밤의 기억들이 모이는 공간"
            : analysisReports.length > 0
            ? `${analysisReports.length}개의 분석 리포트가 보관됨`
            : "꿈의 의미를 탐구하는 공간"}
        </p>
      </header>

      {/* 탭 네비게이션 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex gap-1 p-1 oneiri-bg-secondary rounded-lg">
          <button
            onClick={() => setActiveTab("dreams")}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "dreams"
                ? "oneiri-accent-bg text-bg-primary"
                : "oneiri-text-secondary hover:oneiri-text-primary"
            }`}
          >
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">꿈 기록 </span>(
            {dreamEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "analysis"
                ? "oneiri-accent-bg text-bg-primary"
                : "oneiri-text-secondary hover:oneiri-text-primary"
            }`}
          >
            <MoonStar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">분석 리포트 </span>(
            {analysisReports.length})
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      {((activeTab === "dreams" && dreamEntries.length > 0) ||
        (activeTab === "analysis" && analysisReports.length > 0)) && (
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 oneiri-text-secondary w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder={
                activeTab === "dreams"
                  ? "꿈 이야기 검색..."
                  : "분석 내용 검색..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 oneiri-bg-secondary border border-text-secondary/30 focus:border-accent-primary focus:outline-none oneiri-text-primary placeholder:oneiri-text-secondary rounded-lg text-sm sm:text-base"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {activeTab === "dreams" && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                  showFavoritesOnly
                    ? "bg-accent-primary/20 oneiri-accent border border-accent-primary/50"
                    : "oneiri-bg-secondary oneiri-text-secondary border border-text-secondary/30 hover:bg-bg-secondary/80"
                }`}
              >
                <Heart
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    showFavoritesOnly ? "fill-current" : ""
                  }`}
                />
                <span className="hidden sm:inline">즐겨찾기만 보기</span>
                <span className="sm:hidden">즐겨찾기</span>
              </button>
            )}

            <span className="text-xs sm:text-sm oneiri-text-secondary">
              {activeTab === "dreams"
                ? filteredDreams.length
                : filteredAnalysis.length}
              개 표시 중
            </span>
          </div>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {activeTab === "dreams" ? (
        filteredDreams.length > 0 ? (
          <div className="space-y-1">
            {filteredDreams.map((dream) => (
              <DreamEntryCard key={dream.id} entry={dream} />
            ))}
          </div>
        ) : (
          <EmptyState activeTab="dreams" />
        )
      ) : filteredAnalysis.length > 0 ? (
        <div className="space-y-1">
          {filteredAnalysis.map((report) => (
            <AnalysisReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <EmptyState activeTab="analysis" />
      )}
    </div>
  );
}
