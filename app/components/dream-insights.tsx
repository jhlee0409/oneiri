"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Flame,
  Lock,
  Moon,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  useDreamPatternReport,
  useDreamStreak,
  useGenerateDreamPatternReport,
} from "@/hooks/use-dream-api";
import { trackEvent } from "@/lib/analytics";
import type { DreamPatternReportResult, StreakDay } from "@/lib/api";
import { formatKoreanDate } from "@/lib/utils";

const PATTERN_MIN_DREAMS = 3;
const STREAK_VIEWED_KEY = "oneiri:streak_viewed";

function streakDotClass(day: StreakDay, isToday: boolean): string {
  if (day.count >= 2) return "bg-accent-primary";
  if (day.count === 1) return "bg-accent-primary/60";
  if (isToday) return "border border-accent-primary";
  return "bg-text-secondary/25";
}

function StreakCard() {
  const { data: streak, isLoading } = useDreamStreak();

  useEffect(() => {
    if (!streak) return;
    if (sessionStorage.getItem(STREAK_VIEWED_KEY)) return;
    sessionStorage.setItem(STREAK_VIEWED_KEY, "1");
    trackEvent("streak_viewed", {
      current_streak: streak.currentStreak,
      recorded_today: streak.recordedToday,
    });
  }, [streak]);

  if (isLoading) {
    return <div className="oneiri-bg-secondary rounded-lg h-36 animate-pulse" />;
  }
  if (!streak) return null;

  const { currentStreak, longestStreak, totalDreamDays, recordedToday, recentDays } =
    streak;
  const todayDate = recentDays[recentDays.length - 1]?.date;

  const headline =
    currentStreak > 0 ? `${currentStreak}일째 기록 중` : "오늘의 꿈을 기다리고 있어요";
  const subline =
    currentStreak === 0
      ? totalDreamDays > 0
        ? "흐릿한 조각 하나여도 괜찮아요. 오늘 아침부터 다시 이어가 볼까요?"
        : "눈뜨자마자 떠오른 장면 하나로 첫 기록을 시작해보세요."
      : recordedToday
        ? "오늘의 꿈도 서재에 담겼어요. 내일 아침에 또 만나요."
        : `오늘 꿈을 기록하면 ${currentStreak + 1}일째가 돼요.`;

  return (
    <section
      aria-label="꿈 연속 기록"
      className="oneiri-bg-secondary rounded-lg p-4 sm:p-5 border border-line"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-accent-primary/10 ${
            currentStreak > 0 ? "oneiri-accent" : "text-text-secondary"
          }`}
        >
          {currentStreak > 0 ? <Flame className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-medium oneiri-text-primary">
            {headline}
          </h2>
          <p className="text-xs sm:text-sm oneiri-text-secondary mt-0.5">{subline}</p>
        </div>
        {!recordedToday && (
          <Link
            href="/dreams/new"
            className="flex-shrink-0 inline-flex items-center oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary text-xs sm:text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            기록하기
          </Link>
        )}
      </div>

      <div
        className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 sm:gap-2"
        role="img"
        aria-label={`최근 28일 중 ${recentDays.filter((day) => day.count > 0).length}일 기록`}
      >
        {recentDays.map((day) => (
          <span
            key={day.date}
            title={`${day.date} · ${day.count > 0 ? `꿈 ${day.count}개` : "기록 없음"}`}
            className={`block aspect-square rounded-full ${streakDotClass(
              day,
              day.date === todayDate
            )}`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs oneiri-text-secondary">
        <span>최근 28일</span>
        <span>
          최장 {longestStreak}일 · 총 {totalDreamDays}일 기록
        </span>
      </div>
    </section>
  );
}

function PatternReportBody({ result }: { result: DreamPatternReportResult }) {
  const { report } = result;
  return (
    <div className="mt-4 space-y-5 text-sm sm:text-base">
      {report.recurringSymbols.length > 0 && (
        <div>
          <h3 className="text-xs font-medium oneiri-text-secondary mb-2">반복되는 상징</h3>
          <ul className="space-y-3">
            {report.recurringSymbols.map((item) => (
              <li key={item.symbol}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-medium">
                  {item.symbol} · {item.count}번
                </span>
                <p className="mt-1 oneiri-text-primary/80 leading-relaxed">{item.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-xs font-medium oneiri-text-secondary mb-1">감정의 흐름</h3>
        <p className="oneiri-text-primary/80 leading-relaxed">{report.emotionTrend}</p>
      </div>

      <div>
        <h3 className="text-xs font-medium oneiri-text-secondary mb-2">이어지는 주제</h3>
        <ul className="space-y-2">
          {report.themes.map((theme) => (
            <li key={theme.title}>
              <p className="font-medium oneiri-text-primary">{theme.title}</p>
              <p className="oneiri-text-primary/80 leading-relaxed">{theme.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {report.timeInsight && (
        <div>
          <h3 className="text-xs font-medium oneiri-text-secondary mb-1">시간의 결</h3>
          <p className="oneiri-text-primary/80 leading-relaxed">{report.timeInsight}</p>
        </div>
      )}

      <blockquote className="border-l-2 border-accent-primary pl-3 oneiri-text-primary italic leading-relaxed">
        {report.reflectionQuestion}
      </blockquote>

      <p className="text-[11px] oneiri-text-secondary">
        기록된 꿈만으로 엮은 가능성일 뿐, 진단이 아니에요.
      </p>
    </div>
  );
}

function PatternReportCard({ dreamCount }: { dreamCount: number }) {
  const { data: result, isLoading, isError } = useDreamPatternReport();
  const generate = useGenerateDreamPatternReport();
  const [expanded, setExpanded] = useState(false);

  const onGenerate = () => {
    generate.mutate(undefined, {
      onSuccess: (response) => {
        if (response.success) setExpanded(true);
      },
    });
  };

  if (isLoading) {
    return <div className="oneiri-bg-secondary rounded-lg h-36 animate-pulse" />;
  }

  const locked = !result && dreamCount < PATTERN_MIN_DREAMS;
  const generating = generate.isPending;

  return (
    <section
      aria-label="꿈 패턴 리포트"
      className="oneiri-bg-secondary rounded-lg p-4 sm:p-5 border border-line"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center">
          {locked ? <Lock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-medium oneiri-text-primary">
            꿈 패턴 리포트
          </h2>
          <p className="text-xs sm:text-sm oneiri-text-secondary mt-0.5">
            {result
              ? `${result.dreamCount}개의 꿈으로 엮었어요 · ${formatKoreanDate(result.createdAt)}`
              : locked
                ? `꿈을 ${PATTERN_MIN_DREAMS}개 기록하면 반복되는 상징과 감정의 흐름을 모아 보여드려요.`
                : "여러 밤의 꿈을 함께 읽고, 되풀이되는 상징과 주제를 찾아드려요."}
          </p>
        </div>
      </div>

      {isError && !result && (
        <p className="mt-3 text-xs oneiri-text-secondary">
          리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}

      {locked && (
        <div className="mt-4">
          <div className="flex justify-between text-xs oneiri-text-secondary mb-1.5">
            <span>꿈 기록</span>
            <span>
              {dreamCount}/{PATTERN_MIN_DREAMS}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full bg-line overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={PATTERN_MIN_DREAMS}
            aria-valuenow={dreamCount}
          >
            <div
              className="h-full bg-accent-primary rounded-full transition-all"
              style={{ width: `${(Math.min(dreamCount, PATTERN_MIN_DREAMS) / PATTERN_MIN_DREAMS) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs oneiri-text-secondary">
            {PATTERN_MIN_DREAMS - dreamCount}개만 더 기록하면 열려요.
          </p>
        </div>
      )}

      {!locked && !result && (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="mt-4 w-full inline-flex items-center justify-center oneiri-accent-bg hover:bg-accent-primary/90 disabled:opacity-60 text-bg-primary text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <Sparkles className={`w-4 h-4 mr-2 ${generating ? "animate-pulse" : ""}`} />
          {generating ? "꿈들을 엮는 중이에요…" : "패턴 리포트 만들기"}
        </button>
      )}

      {result && (
        <>
          <p className="mt-4 font-serif text-base sm:text-lg oneiri-text-primary leading-relaxed">
            “{result.report.oneLineSummary}”
          </p>

          {expanded && <PatternReportBody result={result} />}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="inline-flex items-center text-xs sm:text-sm oneiri-text-secondary hover:oneiri-text-primary transition-colors"
            >
              {expanded ? "접기" : "리포트 펼치기"}
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
            {result.hasNewDreams && (
              <button
                type="button"
                onClick={onGenerate}
                disabled={generating}
                className="ml-auto inline-flex items-center border border-accent-primary oneiri-accent hover:bg-accent-primary/10 disabled:opacity-60 text-xs sm:text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${generating ? "animate-spin" : ""}`} />
                {generating ? "다시 엮는 중…" : "새 꿈까지 담아 다시 만들기"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/** 서재 상단: 연속 기록과 여러 꿈의 패턴 리포트 */
export default function DreamInsights({ dreamCount }: { dreamCount: number }) {
  return (
    <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 md:grid-cols-2 md:items-start">
      <StreakCard />
      <PatternReportCard dreamCount={dreamCount} />
    </div>
  );
}
