"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGenerateDreamStory,
  useDailyWeavingStatus,
} from "@/hooks/use-dream-api";
import { AlertTriangle, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";

const genreOptions = [
  // 일상 및 드라마 계열
  { value: "slice-of-life", label: "일상" },
  { value: "drama", label: "드라마" },
  { value: "coming-of-age", label: "성장" },

  // 판타지 및 초현실 계열
  { value: "fantasy", label: "판타지" },
  { value: "fairy-tale", label: "동화" },
  { value: "sci-fi", label: "SF (공상과학)" },

  // 긴장 및 공포 계열
  { value: "mystery", label: "미스터리" },
  { value: "thriller", label: "스릴러" },
  { value: "horror", label: "호러 (공포)" },

  // 기타 장르
  { value: "adventure", label: "모험" },
  { value: "romance", label: "로맨스" },
  { value: "comedy", label: "코미디" },
];

const moodOptions = [
  // 긍정적이고 밝은 분위기
  { value: "warm and heartwarming", label: "따뜻하고 마음이 편안해지는" },
  { value: "cheerful and lively", label: "발랄하고 경쾌한" }, // 사용자가 원했던 키워드
  { value: "hopeful and bright", label: "희망차고 밝은" },
  { value: "pleasant and comical", label: "유쾌하고 코믹한" },
  { value: "fluffy and heart-fluttering", label: "몽글몽글하고 설레는" },

  // 신비롭고 몽환적인 분위기
  { value: "mysterious and dreamlike", label: "신비롭고 몽환적인" },
  { value: "grand and epic", label: "장엄하고 서사적인" },
  { value: "calm and introspective", label: "차분하고 성찰적인" },

  // 부정적이고 어두운 분위기
  { value: "dark and gloomy", label: "어둡고 음산한" }, // 사용자가 원했던 키워드
  { value: "tense and suspenseful", label: "긴장감 넘치고 서스펜스 있는" },
  { value: "urgent and desperate", label: "긴박하고 절박한" },
  { value: "tragic and sorrowful", label: "비극적이고 애상적인" },
  { value: "bizarre and unsettling", label: "기괴하고 불쾌한" },
];

const emotionOptions = [
  // 긍정적 감정
  { emoji: "😊", value: "happy and fulfilled", label: "행복하고 충만한" },
  {
    emoji: "🥰",
    value: "heart-fluttering and excited",
    label: "설레고 두근거리는",
  },
  { emoji: "😌", value: "peaceful and stable", label: "평화롭고 안정적인" },
  { emoji: "🥳", value: "joyful and liberated", label: "기쁘고 해방되는" },

  // 부정적 감정
  {
    emoji: "😢",
    value: "sad and with a sense of loss",
    label: "슬프고 상실감 있는",
  },
  { emoji: "😨", value: "fearful and terrified", label: "두렵고 공포스러운" }, // 불안을 넘어선 공포
  { emoji: "😠", value: "angry and unfair", label: "분노와 억울함" },
  { emoji: "😥", value: "anxious and restless", label: "불안하고 초조한" }, // 기존 불안을 구체화

  // 복합적/기타 감정
  {
    emoji: "😮",
    value: "awestruck and overwhelmed",
    label: "경이롭고 압도되는",
  }, // 놀람을 긍정적으로
  {
    emoji: "🤯",
    value: "confused and bewildered",
    label: "혼란스럽고 어리둥절한",
  },
  { emoji: "🤔", value: "curious and questioning", label: "호기심과 의문" }, // 생각을 구체화
  { emoji: "😐", value: "empty and numb", label: "공허하고 무감각한" },
];

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
      router.push("/journal");
    }
  };

  // 로딩 상태 처리
  if (isLoadingStatus) {
    return (
      <div className="bg-white max-w-2xl mx-auto">
        <div className="text-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">
            얼마나 많은 이야기를 만들었는지 확인하고 있어요
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (statusError) {
    return (
      <div className="bg-white max-w-2xl mx-auto">
        <div className="text-center space-y-4 p-8 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-600">
            오늘 만든 이야기 개수를 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
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
      <div className="bg-white max-w-2xl mx-auto">
        <div className="text-center space-y-6 p-8 bg-gradient-to-b from-purple-50 to-blue-50 rounded-lg border border-purple-100">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>

          <div className="space-y-3">
            <h2 className="font-['Inter'] text-2xl font-medium text-gray-900">
              {oneiriMsg?.title || "오늘의 꿈 이야기는 모두 완성되었어요"}
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-md mx-auto">
              {oneiriMsg?.content ||
                "오늘 엮어낼 수 있는 두 편의 꿈 이야기는 이미 당신의 서재에서 빛나고 있답니다."}
            </p>
            {oneiriMsg?.encouragement && (
              <p className="text-purple-700 font-medium mt-4">
                {oneiriMsg.encouragement}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              새로운 꿈의 조각은 {oneiriMsg?.hours_until_reset || 0}시간 후에
              다시 가져올 수 있어요
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/journal")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-['Inter'] font-medium py-3 px-6 rounded-lg transition-colors"
            >
              내 꿈 서재 둘러보기
            </button>

            {(weavingStatus.todays_dreams?.length || 0) > 0 && (
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-3">
                  오늘 만든 꿈 이야기들
                </h3>
                <div className="space-y-2">
                  {weavingStatus.todays_dreams?.map((dream) => (
                    <div
                      key={dream.id}
                      className="text-sm text-gray-600 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push(`/story/${dream.id}`)}
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h3 className="font-['Inter'] font-medium text-gray-900">
                {weavingStatus.oneiri_message?.title ||
                  "오늘의 꿈 이야기를 기다리고 있어요"}
              </h3>
              <p className="text-sm text-gray-700">
                {weavingStatus.oneiri_message?.content ||
                  "어떤 꿈의 조각들이 당신을 찾아왔나요?"}
              </p>
              {weavingStatus.oneiri_message?.encouragement && (
                <p className="text-sm text-blue-700 italic">
                  {weavingStatus.oneiri_message.encouragement}
                </p>
              )}
            </div>
            <div className="text-right flex flex-col w-full">
              <div className="text-2xl font-bold text-blue-600">
                {remainingCount}
              </div>
              <div className="text-xs text-gray-600">남은 이야기</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white space-y-8">
        {/* 꿈 설명 */}
        <div className="space-y-3">
          <label
            htmlFor="dreamText"
            className="block font-['Inter'] text-lg font-medium text-gray-900"
          >
            어떤 꿈의 조각들을 가져오셨나요?
          </label>
          <textarea
            id="dreamText"
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="안개 낀 숲, 낯선 속삭임, 알 수 없는 그리움처럼… 떠오르는 모든 것을 들려주세요."
            className="w-full h-48 px-4 py-3 border border-gray-200 focus:border-black focus:outline-none resize-none text-gray-900 placeholder-gray-400"
            required
            disabled={isFormDisabled}
          />
        </div>

        {/* 키워드 */}
        <div className="space-y-3">
          <label
            htmlFor="keywords"
            className="block font-['Inter'] text-lg font-medium text-gray-900"
          >
            이야기의 실마리들{" "}
            <span className="text-gray-500 font-normal">
              (선택사항, 쉼표로 구분)
            </span>
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="예: 숲, 비행, 신비로운 낯선 사람"
            className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-gray-900 placeholder-gray-400"
            disabled={isFormDisabled}
          />
        </div>

        {/* 감정 선택 */}
        <div className="space-y-4">
          <label className="block font-['Inter'] text-lg font-medium text-gray-900">
            꿈이 남긴 여운{" "}
            <span className="text-gray-500 font-normal">(선택사항)</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {emotionOptions.map((emotion) => (
              <button
                key={emotion.emoji}
                type="button"
                onClick={() =>
                  setSelectedEmotion(
                    selectedEmotion === emotion.emoji ? "" : emotion.emoji
                  )
                }
                className={`p-3 text-2xl transition-colors flex flex-col items-center justify-center ${
                  selectedEmotion === emotion.emoji
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
        <div className="space-y-4">
          <label className="block font-['Inter'] text-lg font-medium text-gray-900">
            이야기의 장르{" "}
            <span className="text-gray-500 font-normal">(선택사항)</span>
          </label>

          {/* 장르 그룹별 분류 */}
          <div className="space-y-6">
            {/* 일상 및 드라마 계열 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                일상 및 드라마 계열
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {genreOptions.slice(0, 3).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 판타지 및 초현실 계열 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                판타지 및 초현실 계열
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {genreOptions.slice(3, 6).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 긴장 및 공포 계열 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                긴장 및 공포 계열
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {genreOptions.slice(6, 9).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } ${isFormDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isFormDisabled}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 기타 장르 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                기타 장르
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {genreOptions.slice(9).map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre.value ? "" : genre.value
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedGenre === genre.value
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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

        {/* 스토리 분위기 */}
        <div className="space-y-3">
          <label
            htmlFor="vibe"
            className="block font-['Inter'] text-lg font-medium text-gray-900"
          >
            이야기의 색채{" "}
            <span className="text-gray-500 font-normal">(선택사항)</span>
          </label>
          <select
            id="vibe"
            value={selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-gray-900 bg-white"
            disabled={isFormDisabled}
          >
            <option value="">이야기의 색채를 선택하세요...</option>
            {moodOptions.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.label}
              </option>
            ))}
          </select>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={!dreamText.trim() || isFormDisabled}
            className={`w-full font-['Inter'] font-medium py-4 px-6 transition-colors disabled:cursor-not-allowed ${
              remainingCount === 1
                ? "bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white"
                : "bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                당신의 꿈 조각으로 이야기를 엮고 있어요...
              </span>
            ) : isLoadingStatus ? (
              "오늘 만든 이야기 개수 확인 중..."
            ) : remainingCount === 1 ? (
              "오늘 마지막 꿈 이야기 엮어보기 ✨"
            ) : (
              "오늘의 꿈 조각 건네주기 ✨"
            )}
          </button>
        </div>

        {/* 글자 수 */}
        <div className="text-center text-sm text-gray-500">
          {dreamText.length}자
        </div>
      </form>
    </div>
  );
}
