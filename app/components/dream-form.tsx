"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGenerateDreamStory,
  useDailyWeavingStatus,
} from "@/hooks/use-dream-api";
import { BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";
import { EMOTION_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";

export default function DreamForm() {
  const [dreamText, setDreamText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const router = useRouter();

  const { mutateAsync: generateStory, isPending: isSubmitting } =
    useGenerateDreamStory();

  // 🌙 일일 꿈 생성 상태 조회
  const {
    data: weavingStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useDailyWeavingStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dreamText.trim()) return;

    // 제한 확인
    if (weavingStatus?.weaving_status?.has_reached_limit) {
      toast.error("오늘 만든 이야기 개수를 초과했습니다.");
      return; // 제한에 도달한 경우 제출하지 않음
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
      story_preference_genre: selectedGenre || undefined, // 기본값
      story_preference_length: undefined, // 기본값
    };

    const result = await generateStory(dreamRequest);

    // 성공 시에만 페이지 이동
    if (result.success) {
      router.push("/library/dreams");
    }
  };

  // 로딩 상태 처리
  if (isLoadingStatus) {
    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div className="text-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-secondary border-t-accent-primary mx-auto"></div>
          <p className="oneiri-text-secondary">
            얼마나 많은 이야기를 만들었는지 확인하고 있어요
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (statusError) {
    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div className="text-center space-y-4 p-8 bg-oneiri-garnet/10 rounded-lg border border-oneiri-garnet/20">
          <p className="text-oneiri-garnet">
            오늘 만든 이야기 개수를 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-oneiri-garnet hover:bg-oneiri-garnet/90 oneiri-text-primary px-4 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 제한 도달 시 표시할 컴포넌트
  if (weavingStatus?.weaving_status?.has_reached_limit) {
    const oneiriMsg = weavingStatus.oneiri_message;

    return (
      <div className="oneiri-bg-secondary max-w-2xl mx-auto rounded-lg">
        <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8 bg-gradient-to-b from-oneiri-violet/10 to-accent-primary/10 rounded-lg border border-oneiri-violet/20">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-oneiri-violet/20 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-oneiri-violet" />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h2 className="font-['Inter'] text-lg sm:text-2xl font-medium oneiri-text-primary">
              {oneiriMsg?.title || "오늘의 꿈 이야기는 모두 완성되었어요"}
            </h2>
            <p className="oneiri-text-primary/80 leading-relaxed max-w-md mx-auto text-sm sm:text-base">
              {oneiriMsg?.content ||
                "오늘 엮어낼 수 있는 두 편의 꿈 이야기는 이미 당신의 서재에서 빛나고 있답니다."}
            </p>
            {oneiriMsg?.encouragement && (
              <p className="text-oneiri-violet font-medium mt-3 sm:mt-4 text-sm sm:text-base">
                {oneiriMsg.encouragement}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm oneiri-text-secondary">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              새로운 꿈의 조각은 {oneiriMsg?.hours_until_reset || 0}시간 후에
              다시 가져올 수 있어요
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => router.push("/library/dreams")}
              className="w-full oneiri-accent-bg hover:bg-accent-primary/90 text-bg-primary font-['Inter'] font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              내 꿈 서재 둘러보기
            </button>

            {(weavingStatus.todays_dreams?.length || 0) > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 oneiri-bg-primary rounded-lg border border-text-secondary/20">
                <h3 className="font-medium oneiri-text-primary mb-2 sm:mb-3 text-sm sm:text-base">
                  오늘 만든 꿈 이야기들
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {weavingStatus.todays_dreams?.map((dream) => (
                    <div
                      key={dream.id}
                      className="text-xs sm:text-sm oneiri-text-secondary p-2 oneiri-bg-secondary rounded cursor-pointer hover:bg-bg-secondary/80"
                      onClick={() => router.push(`/library/dreams/${dream.id}`)}
                    >
                      ✨ {dream.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 일반 상태일 때의 폼
  const remainingCount = weavingStatus?.weaving_status?.remaining ?? 2; // 기본값 2
  const isFormDisabled =
    isSubmitting ||
    isLoadingStatus ||
    (weavingStatus?.weaving_status?.has_reached_limit ?? false);

  return (
    <div className="space-y-6">
      {/* 🌙 꿈 생성 상태 표시 */}
      {weavingStatus && !weavingStatus.weaving_status?.has_reached_limit && (
        <div className="bg-gradient-to-r from-oneiri-violet/10 to-accent-primary/10 p-3 sm:p-4 rounded-lg border border-oneiri-violet/20">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-['Inter'] font-medium oneiri-text-primary text-sm sm:text-base">
                {weavingStatus.oneiri_message?.title ||
                  "오늘의 꿈 이야기를 기다리고 있어요"}
              </h3>
              <p className="text-xs sm:text-sm oneiri-text-primary/80">
                {weavingStatus.oneiri_message?.content ||
                  "어떤 꿈의 조각들이 당신을 찾아왔나요?"}
              </p>
              {weavingStatus.oneiri_message?.encouragement && (
                <p className="text-xs sm:text-sm text-oneiri-violet italic">
                  {weavingStatus.oneiri_message.encouragement}
                </p>
              )}
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-xl sm:text-2xl font-bold oneiri-accent">
                {remainingCount}
              </div>
              <div className="text-xs oneiri-text-secondary">남은 이야기</div>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="oneiri-bg-secondary space-y-6 sm:space-y-8 p-4 sm:p-6 rounded-lg"
      >
        {/* 꿈 설명 */}
        <div className="space-y-2 sm:space-y-3">
          <label
            htmlFor="dreamText"
            className="block font-['Inter'] text-base sm:text-lg font-medium oneiri-text-primary"
          >
            꿈 이야기의 시작
          </label>
          <textarea
            id="dreamText"
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="어젯밤, 당신의 꿈 이야기는 어떻게 시작되었나요? 스쳐 지나간 장면, 희미한 목소리, 마음속에 남은 감정 등 무엇이든 좋아요."
            className="w-full h-36 sm:h-48 px-3 sm:px-4 py-2 sm:py-3 oneiri-bg-primary border border-text-secondary/30 focus:border-accent-primary focus:outline-none resize-none oneiri-text-primary placeholder:oneiri-text-secondary rounded-lg text-sm sm:text-base"
            required
            disabled={isFormDisabled}
          />
        </div>

        {/* 키워드 */}
        <div className="space-y-2 sm:space-y-3">
          <label
            htmlFor="keywords"
            className="block font-['Inter'] text-base sm:text-lg font-medium oneiri-text-primary"
          >
            이야기의 핵심 상징{" "}
            <span className="oneiri-text-secondary font-normal text-sm sm:text-base">
              (선택)
            </span>
            <div className="inline-block ml-2 relative group">
              <button
                type="button"
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-text-secondary/20 text-text-secondary text-xs flex items-center justify-center hover:bg-text-secondary/30 transition-colors"
              >
                ?
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 sm:px-3 py-1 sm:py-2 bg-bg-primary border border-text-secondary/30 rounded-lg text-xs sm:text-sm oneiri-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 sm:w-64 text-center shadow-lg z-10">
                AI가 이야기를 만들거나 분석할 때, 여기에 입력된 단어를 더
                중요하게 다룹니다.
              </div>
            </div>
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="예: 붉은 문, 거대한 시계 (쉼표로 구분)"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 oneiri-bg-primary border border-text-secondary/30 focus:border-accent-primary focus:outline-none oneiri-text-primary placeholder:oneiri-text-secondary rounded-lg text-sm sm:text-base"
            disabled={isFormDisabled}
          />
        </div>

        {/* 감정 선택 */}
        <div className="space-y-3 sm:space-y-4">
          <label className="block font-['Inter'] text-base sm:text-lg font-medium oneiri-text-primary">
            꿈이 남긴 여운{" "}
            <span className="oneiri-text-secondary font-normal text-sm sm:text-base">
              (선택)
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {EMOTION_OPTIONS.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                onClick={() =>
                  setSelectedEmotion(
                    selectedEmotion === emotion.value ? "" : emotion.value
                  )
                }
                className={`p-2 sm:p-3 text-lg sm:text-2xl transition-colors flex flex-col items-center justify-center rounded-lg ${
                  selectedEmotion === emotion.value
                    ? "oneiri-accent-bg text-bg-primary"
                    : "oneiri-bg-primary hover:bg-bg-primary/80 oneiri-text-primary"
                } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                title={emotion.label}
                disabled={isFormDisabled}
              >
                {emotion.emoji} <span className="text-xs">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🆕 이야기의 장르 선택 */}
        <div className="space-y-3 sm:space-y-4">
          <label className="block font-['Inter'] text-base sm:text-lg font-medium oneiri-text-primary">
            이야기의 장르{" "}
            <span className="oneiri-text-secondary font-normal text-sm sm:text-base">
              (선택)
            </span>
          </label>

          {/* 장르 그룹별 분류 */}
          <div className="space-y-4 sm:space-y-6">
            {/* 일상 및 드라마 계열 */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-medium oneiri-text-primary border-b border-text-secondary/20 pb-1">
                일상 및 드라마 계열
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRE_OPTIONS.slice(0, 3).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "oneiri-accent-bg text-bg-primary"
                        : "oneiri-bg-primary hover:bg-bg-primary/80 oneiri-text-primary"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 판타지 및 초현실 계열 */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-medium oneiri-text-primary border-b border-text-secondary/20 pb-1">
                판타지 및 초현실 계열
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRE_OPTIONS.slice(3, 6).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "bg-oneiri-violet text-oneiri-dark-abyss"
                        : "oneiri-bg-primary hover:bg-bg-primary/80 oneiri-text-primary"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 긴장 및 공포 계열 */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-medium oneiri-text-primary border-b border-text-secondary/20 pb-1">
                긴장 및 공포 계열
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRE_OPTIONS.slice(6, 9).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "bg-oneiri-garnet text-oneiri-starlight"
                        : "oneiri-bg-primary hover:bg-bg-primary/80 oneiri-text-primary"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 기타 장르 */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-medium oneiri-text-primary border-b border-text-secondary/20 pb-1">
                기타 장르
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRE_OPTIONS.slice(9).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "oneiri-accent-bg text-bg-primary"
                        : "oneiri-bg-primary hover:bg-bg-primary/80 oneiri-text-primary"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 무드/분위기 선택 */}
        <div className="space-y-3 sm:space-y-4">
          <label className="block font-['Inter'] text-base sm:text-lg font-medium oneiri-text-primary">
            이야기의 무드{" "}
            <span className="oneiri-text-secondary font-normal text-sm sm:text-base">
              (선택)
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() =>
                  setSelectedVibe(selectedVibe === mood.value ? "" : mood.value)
                }
                className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors text-left ${
                  selectedVibe === mood.value
                    ? "oneiri-accent-bg text-bg-primary"
                    : "oneiri-bg-primary hover:bg-bg-primary/80 oneiri-text-primary"
                } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isFormDisabled}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4 sm:pt-6">
          <button
            type="submit"
            disabled={!dreamText.trim() || isFormDisabled}
            className="w-full oneiri-accent-bg hover:bg-accent-primary/90 disabled:bg-text-secondary disabled:cursor-not-allowed text-bg-primary font-['Inter'] font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-bg-primary border-t-transparent"></div>
                <span className="hidden sm:inline">
                  이야기를 엮어내는 중...
                </span>
                <span className="sm:hidden">생성 중...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">내 꿈 이야기 엮어보기</span>
                <span className="sm:hidden">꿈 이야기 만들기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
