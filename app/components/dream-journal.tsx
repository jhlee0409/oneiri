"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Heart, PenLine, Search } from "lucide-react";
import { useUserAnalysisReports, useUserDreams } from "@/hooks/use-dream-api";
import type { AnalysisReport, DreamRecord } from "@/types/supabase";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKoreanDate } from "@/lib/utils";
import { toKstDateString } from "@/lib/server/streak";
import DreamInsights from "./dream-insights";

type LibraryTab = "dreams" | "analysis";

const TABS: { value: LibraryTab; label: string }[] = [
  { value: "dreams", label: "꿈" },
  { value: "analysis", label: "상징 리포트" },
];

const GRID_CLASS = "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4";
// 그리드 칼럼 폭: 컨테이너 max-w-6xl(1152px) − 좌우 패딩 기준
const COVER_SIZES = "(min-width: 1280px) 270px, (min-width: 768px) 30vw, 46vw";

function firstStoryLine(entry: DreamRecord): string {
  const source = entry.generated_story_content || entry.dream_input_text || "";
  return source
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0) ?? "";
}

function DreamCover({ entry }: { entry: DreamRecord }) {
  const title = entry.generated_story_title || "무제";

  return (
    <li>
      <Link
        href={`/library/dreams/${entry.id}`}
        className="group block rounded-md"
      >
        {entry.generated_image_url ? (
          <>
            <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-line bg-bg-secondary">
              <ImageWithFallback
                src={entry.generated_image_url}
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
              {firstStoryLine(entry)}
            </p>
          </div>
        )}
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
          <span>{formatKoreanDate(entry.created_at)}</span>
          {entry.is_public && (
            <>
              <span aria-hidden="true">·</span>
              <span>공개</span>
            </>
          )}
          {entry.is_favorite && (
            <Heart
              className="ml-auto h-3.5 w-3.5 shrink-0 fill-current text-text-primary"
              strokeWidth={1.5}
              aria-label="즐겨찾기"
              role="img"
            />
          )}
        </p>
      </Link>
    </li>
  );
}

function AnalysisReportRow({ report }: { report: AnalysisReport }) {
  return (
    <li>
      <Link
        href={`/analysis/${report.id}`}
        className="group block min-h-11 rounded-md py-4 transition-colors hover:bg-bg-secondary/60 sm:px-3"
      >
        <p className="text-xs text-text-secondary">
          {formatKoreanDate(report.created_at)}
        </p>
        <p className="mt-1 font-serif text-base leading-relaxed text-text-primary break-keep line-clamp-2">
          {report.input_text || "상징 리포트"}
        </p>
      </Link>
    </li>
  );
}

function EmptyLibrary() {
  return (
    <div className="py-16 text-center sm:py-24">
      <h2 className="font-serif text-xl text-text-primary sm:text-2xl">
        아직 기록한 꿈이 없어요
      </h2>
      <p className="mx-auto mb-8 mt-3 max-w-md text-sm text-text-secondary break-keep sm:text-base">
        오늘 아침 떠오른 장면 하나로 시작해 보세요.
      </p>
      <Link
        href="/dreams/new"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent-primary px-5 font-medium text-bg-primary transition-[filter] hover:brightness-110 md:border md:border-line md:bg-transparent md:text-text-primary md:hover:bg-bg-secondary md:hover:brightness-100"
      >
        <PenLine className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        꿈 기록하기
      </Link>
    </div>
  );
}

function EmptyAnalysis() {
  return (
    <div className="py-16 text-center sm:py-24">
      <h2 className="font-serif text-xl text-text-primary sm:text-2xl">
        아직 읽어 둔 상징이 없어요
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary break-keep sm:text-base">
        꿈 상세에서 「이 꿈의 상징 읽기」를 눌러 보세요.
      </p>
    </div>
  );
}

function NoResults({ message, onClear }: { message: string; onClear: () => void }) {
  return (
    <div className="py-16 text-center sm:py-24">
      <p className="text-base text-text-primary break-keep">{message}</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-sm text-text-primary transition-colors hover:bg-bg-secondary"
      >
        필터 해제
      </button>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-12" aria-busy="true">
      <span className="sr-only">서재를 불러오는 중이에요</span>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-20" />
      <ul className={`mt-12 ${GRID_CLASS}`}>
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <Skeleton className="mt-3 h-4 w-3/4" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DreamJournal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<LibraryTab>("dreams");

  const {
    data: dreamsData,
    isLoading: dreamsLoading,
    error: dreamsError,
    refetch: refetchDreams,
  } = useUserDreams({ limit: 50 });
  const {
    data: analysisData,
    isLoading: analysisLoading,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useUserAnalysisReports();

  // /api/dreams는 data에 꿈 배열을 직접 담아 돌려준다
  const dreamEntries: DreamRecord[] = Array.isArray(dreamsData) ? dreamsData : [];
  const analysisReports: AnalysisReport[] = Array.isArray(analysisData)
    ? analysisData
    : [];

  const query = searchQuery.trim().toLowerCase();

  const filteredDreams = dreamEntries.filter((dream) => {
    const matchesSearch =
      query === "" ||
      dream.generated_story_title?.toLowerCase().includes(query) ||
      dream.dream_input_text?.toLowerCase().includes(query) ||
      dream.dream_keywords?.some((keyword: string) =>
        keyword.toLowerCase().includes(query)
      );
    return matchesSearch && (!showFavoritesOnly || dream.is_favorite);
  });

  const filteredAnalysis = analysisReports.filter(
    (report) => query === "" || report.input_text?.toLowerCase().includes(query)
  );

  const thisMonth = toKstDateString(new Date()).slice(0, 7);
  const monthDreamCount = dreamEntries.filter(
    (dream) => dream.created_at && toKstDateString(dream.created_at).startsWith(thisMonth)
  ).length;

  const clearFilters = () => {
    setSearchQuery("");
    setShowFavoritesOnly(false);
  };

  const counts: Record<LibraryTab, number> = {
    dreams: dreamEntries.length,
    analysis: analysisReports.length,
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next: LibraryTab = activeTab === "dreams" ? "analysis" : "dreams";
    setActiveTab(next);
    document.getElementById(`library-tab-${next}`)?.focus();
  };

  if (dreamsLoading || analysisLoading) {
    return <LibrarySkeleton />;
  }

  if (dreamsError || analysisError) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-12">
        <div className="py-24 text-center">
          <h1 className="font-serif text-xl text-text-primary">
            서재를 불러오지 못했어요
          </h1>
          <p className="mb-6 mt-3 text-text-secondary">잠시 후 다시 시도해 주세요.</p>
          <button
            type="button"
            onClick={() => {
              refetchDreams();
              refetchAnalysis();
            }}
            className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-text-primary transition-colors hover:bg-bg-secondary"
          >
            다시 불러오기
          </button>
        </div>
      </div>
    );
  }

  const hasDreams = dreamEntries.length > 0;
  const showSearch =
    (activeTab === "dreams" && hasDreams) ||
    (activeTab === "analysis" && analysisReports.length > 0);
  const visibleCount =
    activeTab === "dreams" ? filteredDreams.length : filteredAnalysis.length;

  const renderDreams = () => {
    if (!hasDreams) return <EmptyLibrary />;
    if (filteredDreams.length === 0) {
      return (
        <NoResults
          message={
            query
              ? `'${searchQuery.trim()}'가 들어간 꿈이 없어요`
              : "즐겨찾기한 꿈이 아직 없어요"
          }
          onClear={clearFilters}
        />
      );
    }
    return (
      <ul className={GRID_CLASS}>
        {filteredDreams.map((dream) => (
          <DreamCover key={dream.id} entry={dream} />
        ))}
      </ul>
    );
  };

  const renderAnalysis = () => {
    if (analysisReports.length === 0) return <EmptyAnalysis />;
    if (filteredAnalysis.length === 0) {
      return (
        <NoResults
          message={`'${searchQuery.trim()}'가 들어간 리포트가 없어요`}
          onClear={clearFilters}
        />
      );
    }
    return (
      <ul className="divide-y divide-line border-y border-line">
        {filteredAnalysis.map((report) => (
          <AnalysisReportRow key={report.id} report={report} />
        ))}
      </ul>
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-text-primary sm:text-4xl">
            나의 꿈 서재
          </h1>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            꿈 {dreamEntries.length}편
          </p>
        </div>
        {hasDreams && (
          <Link
            href="/dreams/new"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent-primary px-5 font-medium text-bg-primary transition-[filter] hover:brightness-110 md:hidden"
          >
            <PenLine className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            오늘 꿈 기록하기
          </Link>
        )}
      </header>

      {hasDreams && (
        <DreamInsights dreamCount={dreamEntries.length} monthDreamCount={monthDreamCount} />
      )}

      <div
        role="tablist"
        aria-label="서재 보기"
        className="mb-6 flex gap-6 border-b border-line"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              id={`library-tab-${tab.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`library-panel-${tab.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.value)}
              onKeyDown={onTabKeyDown}
              className={`-mb-px min-h-11 border-b-2 px-1 text-sm transition-colors sm:text-base ${
                selected
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label} {counts[tab.value]}
            </button>
          );
        })}
      </div>

      {showSearch && (
        <div className="mb-8 flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label={activeTab === "dreams" ? "꿈 검색" : "상징 리포트 검색"}
              placeholder={activeTab === "dreams" ? "제목, 내용, 키워드" : "리포트 내용"}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-text-secondary/70 bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-text-primary"
            />
          </div>
          {activeTab === "dreams" && (
            <button
              type="button"
              aria-pressed={showFavoritesOnly}
              onClick={() => setShowFavoritesOnly((value) => !value)}
              className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
                showFavoritesOnly
                  ? "border-text-primary text-text-primary"
                  : "border-line text-text-secondary hover:text-text-primary"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              즐겨찾기
            </button>
          )}
          <span className="sr-only" aria-live="polite">
            {visibleCount}개 표시 중
          </span>
        </div>
      )}

      <div
        role="tabpanel"
        id={`library-panel-${activeTab}`}
        aria-labelledby={`library-tab-${activeTab}`}
      >
        {activeTab === "dreams" ? renderDreams() : renderAnalysis()}
      </div>
    </div>
  );
}
