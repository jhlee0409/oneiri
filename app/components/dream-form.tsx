"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useGenerateDreamStory,
  useGenerateGuestDream,
  useDailyWeavingStatus,
} from "@/hooks/use-dream-api";
import { useAuth } from "@/hooks/use-auth";
import type { GuestDreamStory } from "@/lib/api";
import { signInWithGoogle } from "@/lib/google-sign-in";
import { GUEST_DREAM_MAX_LENGTH, savePendingGuestDream } from "@/lib/guest-dream";
import { BookOpen, ChevronDown, Moon } from "lucide-react";
import { toast } from "sonner";
import { EMOTION_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import { offerMorningReminder } from "@/lib/push-reminder";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { InAppBrowserNotice, useInAppBrowser } from "./in-app-browser-notice";

// 페이지 H1 id (app/dreams/new/page.tsx). 본문 입력칸의 보이는 이름으로 쓴다.
// "use client" 모듈의 값은 서버 컴포넌트에서 import할 수 없어 페이지에는 같은 문자열을 둔다.
const DREAM_FORM_HEADING_ID = "dream-form-heading";

interface ChipOption {
  value: string;
  label: string;
}

interface ChipRadioGroupProps {
  legend: string;
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

// 선택형 칩 묶음: 라디오 시맨틱 + 선택된 칩을 다시 누르면 선택 해제.
function ChipRadioGroup({
  legend,
  options,
  value,
  onChange,
  disabled,
}: ChipRadioGroupProps) {
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    chipRefs.current[next]?.focus();
  };

  return (
    <fieldset role="radiogroup" className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium oneiri-text-primary mb-3">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(node) => {
                chipRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={index === tabbableIndex ? 0 : -1}
              onClick={() => onChange(checked ? "" : option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "min-h-11 px-4 py-2 rounded-full border text-sm text-left break-keep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed",
                checked
                  ? "oneiri-accent-bg border-accent-primary text-bg-primary font-medium"
                  : "oneiri-bg-primary border-line oneiri-text-primary hover:border-accent-primary/60"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const labelOf = (options: readonly ChipOption[], value: string) =>
  options.find((option) => option.value === value)?.label;

export default function DreamForm() {
  const hasStartedWriting = useRef(false);
  const guestTitleRef = useRef<HTMLHeadingElement>(null);
  const [dreamText, setDreamText] = useState("");
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [guestStory, setGuestStory] = useState<GuestDreamStory | null>(null);
  const [guestLimitMessage, setGuestLimitMessage] = useState<string | null>(null);
  const [isRedirectingToLogin, setIsRedirectingToLogin] = useState(false);
  const [inAppResumeUrl, setInAppResumeUrl] = useState<string | null>(null);
  const inAppBrowser = useInAppBrowser();
  const router = useRouter();
  const { user, loading: isLoadingAuth } = useAuth();
  const isGuest = !isLoadingAuth && !user;

  const { mutateAsync: generateStory, isPending: isSubmittingStory } =
    useGenerateDreamStory();
  const { mutateAsync: generateGuestStory, isPending: isSubmittingGuest } =
    useGenerateGuestDream();
  const isSubmitting = isSubmittingStory || isSubmittingGuest;

  // 일일 꿈 생성 상태 조회 (로그인한 사용자만)
  const {
    data: weavingStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useDailyWeavingStatus({ enabled: !!user });

  // 게스트 체험 결과가 나오면 제목으로 포커스를 옮겨 화면 읽기 흐름도 함께 이동시킨다.
  useEffect(() => {
    if (guestStory) guestTitleRef.current?.focus();
  }, [guestStory]);

  // 게스트 → Google 로그인. 옮길 체험 이야기가 있으면 리다이렉트 전에 기록해 둔다.
  // Google 로그인이 막히는 앱 내장 브라우저에서는 외부 브라우저로 이어갈 링크를 보여준다.
  const handleGuestLogin = async (guestDreamId?: string) => {
    const next = guestDreamId ? "/library/dreams" : "/dreams/new";
    if (inAppBrowser) {
      const resume = new URL("/login", window.location.origin);
      resume.searchParams.set("next", next);
      if (guestDreamId) resume.searchParams.set("guest", guestDreamId);
      setInAppResumeUrl(resume.toString());
      return;
    }
    if (guestDreamId) savePendingGuestDream(guestDreamId);
    setIsRedirectingToLogin(true);
    await signInWithGoogle(next);
    setIsRedirectingToLogin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);

    if (!dreamText.trim()) {
      setShowEmptyError(true);
      return;
    }

    // 제한 확인
    if (weavingStatus?.weaving_status?.has_reached_limit) {
      setSubmitError("오늘은 두 편을 모두 만들었어요.");
      return;
    }

    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    const dreamRequest = {
      dream_input_text: dreamText,
      dream_keywords: keywordArray.length > 0 ? keywordArray : undefined,
      dream_emotion: selectedEmotion || undefined,
      story_preference_mood: selectedVibe || undefined,
      story_preference_genre: selectedGenre || undefined,
      story_preference_length: undefined,
    };

    // 실패는 훅이 토스트로도 알리지만, 토스트는 금방 사라지므로 폼 안에 오류를 남겨 둔다.
    try {
      if (isGuest) {
        const result = await generateGuestStory(dreamRequest);
        if (result.success && result.data) {
          setGuestStory(result.data);
        } else if (result.errorCode === "guest_limit_reached") {
          setGuestLimitMessage(result.error ?? null);
        } else {
          setSubmitError(result.error || "이야기를 만들지 못했어요. 다시 시도해 주세요.");
        }
        return;
      }

      const result = await generateStory(dreamRequest);

      // 성공하면 방금 엮은 이야기를 바로 보여주고, 아침 꿈 알림을 한 번 제안한다.
      if (result.success && result.data) {
        router.push(`/library/dreams/${result.data.dreamId}`);
        void offerMorningReminder((href) => router.push(href));
      } else {
        setSubmitError(
          result.oneiriMessage?.title ||
            result.error ||
            "이야기를 만들지 못했어요. 다시 시도해 주세요."
        );
      }
    } catch {
      setSubmitError("연결이 끊겨 이야기를 만들지 못했어요. 다시 시도해 주세요.");
    }
  };

  // 로딩 상태 처리
  if (isLoadingAuth || isLoadingStatus) {
    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div className="text-center space-y-4 p-8" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-secondary border-t-accent-primary mx-auto" aria-hidden="true"></div>
          <p className="oneiri-text-secondary">
            {isLoadingAuth
              ? "기록할 준비를 하고 있어요"
              : "오늘 남은 횟수를 확인하고 있어요"}
          </p>
        </div>
      </div>
    );
  }

  // 게스트 체험 결과: 이야기를 보여주고 로그인으로 서재 저장·꿈 그림을 이어준다.
  if (isGuest && guestStory) {
    return (
      <div className="space-y-6">
        <article className="oneiri-bg-secondary p-5 sm:p-8 rounded-lg space-y-4 sm:space-y-6">
          <p className="text-xs sm:text-sm text-text-secondary text-center">
            꿈이 이야기가 되었어요
          </p>
          <h2
            ref={guestTitleRef}
            tabIndex={-1}
            className="font-serif text-xl sm:text-3xl font-medium oneiri-accent text-center break-keep focus:outline-none"
          >
            {guestStory.generated_story_title}
          </h2>
          <div className="space-y-4 oneiri-text-primary leading-relaxed text-sm sm:text-base">
            {guestStory.generated_story_content
              .split(/\n\s*\n/)
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph.trim()}
                </p>
              ))}
          </div>
        </article>

        <div className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-bg-secondary rounded-lg border border-line">
          <p className="oneiri-text-primary/80 text-sm sm:text-base leading-relaxed break-keep">
            로그인하면 이 이야기가 서재에 저장되고, 장면 그림도 함께 그려져요.
          </p>
          {inAppBrowser && inAppResumeUrl ? (
            <InAppBrowserNotice browser={inAppBrowser} resumeUrl={inAppResumeUrl} />
          ) : (
            <button
              onClick={() => handleGuestLogin(guestStory.id)}
              disabled={isRedirectingToLogin}
              aria-busy={isRedirectingToLogin}
              className="w-full min-h-12 oneiri-accent-bg hover:bg-accent-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-bg-primary font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isRedirectingToLogin ? (
                <>
                  <span
                    className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-bg-primary border-t-transparent"
                    aria-hidden="true"
                  />
                  Google로 이동하고 있어요…
                </>
              ) : (
                "Google로 저장하고 그림 받기"
              )}
            </button>
          )}
          <p className="text-xs oneiri-text-secondary">
            체험 이야기는 7일 동안 보관돼요.
          </p>
        </div>
      </div>
    );
  }

  // 게스트 체험 한도 도달
  if (isGuest && guestLimitMessage) {
    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8 bg-bg-secondary rounded-lg border border-line">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-accent-primary/10 rounded-full flex items-center justify-center">
            <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-accent-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h2 className="font-serif text-lg sm:text-2xl font-medium oneiri-text-primary break-keep">
              오늘의 체험 이야기는 모두 만들었어요
            </h2>
            <p className="oneiri-text-primary/80 leading-relaxed max-w-md mx-auto text-sm sm:text-base">
              {guestLimitMessage}
            </p>
          </div>
          {inAppBrowser && inAppResumeUrl ? (
            <InAppBrowserNotice browser={inAppBrowser} resumeUrl={inAppResumeUrl} />
          ) : (
            <button
              onClick={() => handleGuestLogin()}
              disabled={isRedirectingToLogin}
              className="w-full min-h-12 oneiri-accent-bg hover:bg-accent-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-bg-primary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Google로 로그인하고 꿈 기록하기
            </button>
          )}
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (statusError) {
    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div
          role="alert"
          className="text-center space-y-4 p-8 rounded-lg border border-danger/40"
        >
          <p className="oneiri-text-primary break-keep">
            오늘 남은 횟수를 확인하지 못했어요. 연결을 확인하고 다시 시도해
            주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="min-h-11 text-danger border border-danger/40 hover:bg-danger/10 px-4 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 오늘 두 편을 모두 만든 경우
  if (weavingStatus?.weaving_status?.has_reached_limit) {
    const todaysDreams = weavingStatus.todays_dreams ?? [];

    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8 bg-bg-secondary rounded-lg border border-line">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-accent-primary/10 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-accent-primary" aria-hidden="true" />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h2 className="font-serif text-lg sm:text-2xl font-medium oneiri-text-primary break-keep">
              오늘은 두 편을 모두 만들었어요
            </h2>
            <p className="oneiri-text-primary/80 leading-relaxed max-w-md mx-auto text-sm sm:text-base break-keep">
              내일 아침에 다시 기록할 수 있어요.
            </p>
          </div>

          <Link
            href="/library/dreams"
            className="flex items-center justify-center w-full min-h-12 oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
          >
            서재로 가기
          </Link>

          {todaysDreams.length > 0 && (
            <div className="p-3 sm:p-4 oneiri-bg-primary rounded-lg border border-line text-left">
              <h3 className="font-medium oneiri-text-primary mb-2 sm:mb-3 text-sm sm:text-base">
                오늘 만든 이야기
              </h3>
              <ul className="space-y-1 sm:space-y-2">
                {todaysDreams.map((dream) => (
                  <li key={dream.id}>
                    <Link
                      href={`/library/dreams/${dream.id}`}
                      className="flex items-center min-h-11 text-sm oneiri-text-secondary hover:oneiri-text-primary px-3 py-2 oneiri-bg-secondary rounded break-keep"
                    >
                      {dream.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 일반 상태일 때의 폼
  const remainingCount = weavingStatus?.weaving_status?.remaining;
  const isFormDisabled = isSubmitting;
  const isDreamEmpty = !dreamText.trim();
  const showError = showEmptyError && isDreamEmpty;

  const trimmedKeywords = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .join(", ");
  const optionSummary = [
    trimmedKeywords && `상징 · ${trimmedKeywords}`,
    selectedEmotion && `감정 · ${labelOf(EMOTION_OPTIONS, selectedEmotion)}`,
    selectedGenre && `장르 · ${labelOf(GENRE_OPTIONS, selectedGenre)}`,
    selectedVibe && `무드 · ${labelOf(MOOD_OPTIONS, selectedVibe)}`,
  ]
    .filter(Boolean)
    .join(" / ");

  const textareaDescribedBy = [
    showError && "dreamText-error",
    isGuest && "dreamText-count",
  ]
    .filter(Boolean)
    .join(" ");
  const submitDescribedBy = [
    showError && "dreamText-error",
    submitError && "dream-submit-error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="oneiri-bg-secondary space-y-4 p-4 sm:p-6 rounded-lg"
    >
      <div className="space-y-2">
        <textarea
          id="dreamText"
          aria-labelledby={DREAM_FORM_HEADING_ID}
          aria-describedby={textareaDescribedBy || undefined}
          aria-invalid={showError || undefined}
          value={dreamText}
          onChange={(e) => {
            const text = e.target.value;
            setDreamText(text);
            if (text.trim()) setShowEmptyError(false);
            if (!hasStartedWriting.current && text.trim()) {
              hasStartedWriting.current = true;
              trackEvent("dream_input_started", { audience: isGuest ? "guest" : "member" });
            }
          }}
          placeholder="예: 마지막 기차를 놓쳤는데 달이 승강장으로 들어왔어요. 장면 하나만 적어도 돼요."
          className={cn(
            "w-full h-40 sm:h-48 px-3 sm:px-4 py-3 oneiri-bg-primary border focus:border-accent-primary resize-none oneiri-text-primary placeholder:oneiri-text-secondary rounded-lg text-base leading-relaxed",
            showError ? "border-danger" : "border-text-secondary/70"
          )}
          maxLength={isGuest ? GUEST_DREAM_MAX_LENGTH : undefined}
          disabled={isFormDisabled}
        />

        <div className="flex items-start justify-between gap-3 text-xs sm:text-sm">
          <div className="space-y-1">
            {showError && (
              <p id="dreamText-error" role="alert" className="text-danger">
                꿈을 한 줄이라도 적어 주세요.
              </p>
            )}
            {isGuest && (
              <p className="oneiri-text-secondary break-keep">
                로그인 없이 한 편 만들 수 있어요. 마음에 들면 서재에 저장해요.
              </p>
            )}
            {!isGuest &&
              remainingCount !== undefined &&
              remainingCount > 0 &&
              remainingCount <= 1 && (
                <p className="oneiri-text-secondary">
                  오늘 한 편 더 기록할 수 있어요
                </p>
              )}
          </div>
          {isGuest && (
            <p
              id="dreamText-count"
              className="shrink-0 tabular-nums oneiri-text-secondary"
            >
              <span className="sr-only">글자 수 </span>
              {dreamText.length} / {GUEST_DREAM_MAX_LENGTH}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="submit"
          aria-disabled={isFormDisabled || undefined}
          aria-describedby={submitDescribedBy || undefined}
          className="w-full min-h-12 oneiri-accent-bg hover:bg-accent-primary/90 aria-disabled:opacity-70 aria-disabled:cursor-not-allowed text-bg-primary font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-base"
        >
          {isSubmitting ? (
            <>
              <span
                className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-bg-primary border-t-transparent"
                aria-hidden="true"
              />
              이야기를 쓰고 있어요…
            </>
          ) : (
            "이야기로 만들기"
          )}
        </button>
        <p role="status" className="text-xs sm:text-sm text-center oneiri-text-secondary empty:hidden">
          {isSubmitting ? "보통 10초 안팎이에요. 이 화면을 닫지 마세요." : ""}
        </p>
        {submitError && (
          <p
            id="dream-submit-error"
            role="alert"
            className="text-sm text-center text-danger break-keep"
          >
            {submitError}
          </p>
        )}
      </div>

      <details className="group border-t border-line pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 space-y-0.5">
            <span className="block text-sm font-medium oneiri-text-primary">
              분위기 더하기 (선택)
            </span>
            {optionSummary && (
              <span className="block text-xs oneiri-accent break-keep">
                {optionSummary}
              </span>
            )}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 oneiri-text-secondary transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="space-y-6 pt-4 pb-2">
          <div className="space-y-2">
            <label
              htmlFor="keywords"
              className="block text-sm font-medium oneiri-text-primary"
            >
              꼭 넣고 싶은 단어
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              aria-describedby="keywords-help"
              placeholder="예: 붉은 문, 거대한 시계"
              className="w-full min-h-11 px-3 sm:px-4 py-2 oneiri-bg-primary border border-text-secondary/70 focus:border-accent-primary oneiri-text-primary placeholder:oneiri-text-secondary rounded-lg text-base"
              disabled={isFormDisabled}
            />
            <p id="keywords-help" className="text-xs oneiri-text-secondary break-keep">
              적은 단어는 이야기에 꼭 들어가요. 쉼표로 구분해요.
            </p>
          </div>

          <ChipRadioGroup
            legend="꿈이 남긴 감정"
            options={EMOTION_OPTIONS}
            value={selectedEmotion}
            onChange={setSelectedEmotion}
            disabled={isFormDisabled}
          />
          <ChipRadioGroup
            legend="이야기의 장르"
            options={GENRE_OPTIONS}
            value={selectedGenre}
            onChange={setSelectedGenre}
            disabled={isFormDisabled}
          />
          <ChipRadioGroup
            legend="이야기의 무드"
            options={MOOD_OPTIONS}
            value={selectedVibe}
            onChange={setSelectedVibe}
            disabled={isFormDisabled}
          />
        </div>
      </details>
    </form>
  );
}
