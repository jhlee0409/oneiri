"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Flame, Lock, Moon, RefreshCw, Sparkles } from "lucide-react";
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

const ROW_CLASS = "flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5";
const ICON_CLASS = "h-4 w-4 shrink-0";

function streakDotClass(day: StreakDay, isToday: boolean): string {
  if (day.count >= 2) return "bg-text-primary";
  if (day.count === 1) return "bg-text-primary/55";
  if (isToday) return "border border-text-secondary";
  return "bg-line";
}

function RowSkeleton() {
  return <div className="my-2.5 h-6 w-2/3 animate-pulse rounded bg-muted" />;
}

function StreakRow({ monthDreamCount }: { monthDreamCount: number }) {
  const { data: streak, isLoading } = useDreamStreak();
  const [showDays, setShowDays] = useState(false);

  useEffect(() => {
    if (!streak) return;
    if (sessionStorage.getItem(STREAK_VIEWED_KEY)) return;
    sessionStorage.setItem(STREAK_VIEWED_KEY, "1");
    trackEvent("streak_viewed", {
      current_streak: streak.currentStreak,
      recorded_today: streak.recordedToday,
    });
  }, [streak]);

  if (isLoading) return <RowSkeleton />;
  if (!streak) return null;

  const { currentStreak, longestStreak, totalDreamDays, recordedToday, recentDays } =
    streak;
  const todayDate = recentDays[recentDays.length - 1]?.date;
  const recordedDays = recentDays.filter((day) => day.count > 0).length;

  // 목록 API는 최근 꿈 일부만 돌려주므로, 28일 기록과 비교해 더 큰 쪽을 쓴다
  const thisMonth = todayDate?.slice(0, 7);
  const monthFromStreak = recentDays
    .filter((day) => thisMonth && day.date.startsWith(thisMonth))
    .reduce((sum, day) => sum + day.count, 0);
  const monthCount = Math.max(monthDreamCount, monthFromStreak);

  const message =
    currentStreak > 0
      ? `${currentStreak}일째 기록 중 · 이번 달 ${monthCount}편`
      : totalDreamDays > 0
        ? `오늘 아침부터 다시 이어가 볼까요 · 이번 달 ${monthCount}편`
        : "눈뜨자마자 떠오른 장면 하나로 시작해 보세요";

  return (
    <div>
      <div className={ROW_CLASS}>
        <p className="flex min-w-0 items-center gap-2 text-sm text-text-primary break-keep">
          {currentStreak > 0 ? (
            <Flame className={`${ICON_CLASS} text-accent-primary`} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Moon className={`${ICON_CLASS} text-text-secondary`} strokeWidth={1.5} aria-hidden="true" />
          )}
          {message}
        </p>
        <div className="ml-auto flex items-center gap-1">
          {!recordedToday && (
            <Link
              href="/dreams/new"
              className="inline-flex min-h-11 items-center px-2 text-sm text-text-primary underline decoration-line underline-offset-4 hover:decoration-text-primary"
            >
              오늘 기록하기
            </Link>
          )}
          <button
            type="button"
            onClick={() => setShowDays((value) => !value)}
            aria-expanded={showDays}
            aria-controls="streak-recent-days"
            className="inline-flex min-h-11 items-center gap-1 px-2 text-xs text-text-secondary hover:text-text-primary"
          >
            최근 28일
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showDays ? "rotate-180" : ""}`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {showDays && (
        <div
          id="streak-recent-days"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 pl-6"
        >
          <div
            className="flex gap-1"
            role="img"
            aria-label={`최근 28일 중 ${recordedDays}일 기록`}
          >
            {recentDays.map((day) => (
              <span
                key={day.date}
                title={`${day.date} · ${day.count > 0 ? `꿈 ${day.count}편` : "기록 없음"}`}
                className={`block h-1.5 w-1.5 rounded-full ${streakDotClass(
                  day,
                  day.date === todayDate
                )}`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            최장 {longestStreak}일 · 총 {totalDreamDays}일 기록
          </span>
        </div>
      )}
    </div>
  );
}

function PatternReportBody({ result }: { result: DreamPatternReportResult }) {
  const { report } = result;
  return (
    <div className="space-y-6 pb-4 pl-6 pt-2 text-sm leading-relaxed sm:text-base">
      {report.recurringSymbols.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs text-text-secondary">반복되는 상징</h3>
          <ul className="space-y-3">
            {report.recurringSymbols.map((item) => (
              <li key={item.symbol}>
                <p className="text-text-primary">
                  <span className="font-serif">{item.symbol}</span>
                  <span className="ml-2 text-xs text-text-secondary">{item.count}번</span>
                </p>
                <p className="mt-0.5 text-text-primary/80 break-keep">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-1 text-xs text-text-secondary">감정의 흐름</h3>
        <p className="text-text-primary/80 break-keep">{report.emotionTrend}</p>
      </section>

      <section>
        <h3 className="mb-2 text-xs text-text-secondary">이어지는 주제</h3>
        <ul className="space-y-3">
          {report.themes.map((theme) => (
            <li key={theme.title}>
              <p className="font-serif text-text-primary">{theme.title}</p>
              <p className="text-text-primary/80 break-keep">{theme.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {report.timeInsight && (
        <section>
          <h3 className="mb-1 text-xs text-text-secondary">시간의 결</h3>
          <p className="text-text-primary/80 break-keep">{report.timeInsight}</p>
        </section>
      )}

      <blockquote className="border-l border-line pl-4 font-serif text-text-primary break-keep">
        {report.reflectionQuestion}
      </blockquote>

      <p className="text-xs text-text-secondary">
        기록된 꿈만으로 엮은 가능성일 뿐, 진단이 아니에요.
      </p>
    </div>
  );
}

function PatternReportRow({ dreamCount }: { dreamCount: number }) {
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

  if (isLoading) return <RowSkeleton />;

  const locked = !result && dreamCount < PATTERN_MIN_DREAMS;
  const generating = generate.isPending;
  const remaining = PATTERN_MIN_DREAMS - dreamCount;

  if (locked) {
    return (
      <div className={ROW_CLASS}>
        <p className="flex min-w-0 items-center gap-2 text-sm text-text-secondary break-keep">
          <Lock className={ICON_CLASS} strokeWidth={1.5} aria-hidden="true" />
          <span>
            꿈 {dreamCount}/{PATTERN_MIN_DREAMS} · {remaining}편 더 기록하면 패턴 리포트가 열려요
          </span>
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={ROW_CLASS}>
        <p className="flex min-w-0 items-center gap-2 text-sm text-text-secondary break-keep">
          <Sparkles className={ICON_CLASS} strokeWidth={1.5} aria-hidden="true" />
          {isError
            ? "리포트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
            : "여러 밤의 꿈을 함께 읽고 되풀이되는 상징을 찾아드려요"}
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="ml-auto inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm text-text-primary transition-colors hover:bg-bg-secondary disabled:opacity-60"
        >
          {generating ? "꿈들을 엮는 중이에요…" : "패턴 리포트 만들기"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-2 py-3">
        <Sparkles
          className={`${ICON_CLASS} mt-1 text-text-secondary`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-secondary">
            꿈 패턴 리포트 · {result.dreamCount}편으로 엮음 · {formatKoreanDate(result.createdAt)}
          </p>
          <p className="mt-1 font-serif text-base leading-relaxed text-text-primary break-keep sm:text-lg">
            {result.report.oneLineSummary}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls="pattern-report-body"
              className="-ml-2 inline-flex min-h-11 items-center px-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {expanded ? "접기" : "리포트 펼치기"}
              <ChevronDown
                className={`ml-1 h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
            {result.hasNewDreams && (
              <button
                type="button"
                onClick={onGenerate}
                disabled={generating}
                className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {generating ? "다시 엮는 중…" : "새 꿈까지 담아 다시 만들기"}
              </button>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div id="pattern-report-body">
          <PatternReportBody result={result} />
        </div>
      )}
    </div>
  );
}

/** 서재 상단: 연속 기록 한 줄과 여러 꿈의 패턴 리포트 */
export default function DreamInsights({
  dreamCount,
  monthDreamCount,
}: {
  dreamCount: number;
  monthDreamCount: number;
}) {
  return (
    <section
      aria-label="기록 흐름"
      className="mb-8 divide-y divide-line border-y border-line"
    >
      <StreakRow monthDreamCount={monthDreamCount} />
      <PatternReportRow dreamCount={dreamCount} />
    </section>
  );
}
