"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGenerateDreamStory } from "@/hooks/use-dream-api";

const emotions = [
  { emoji: "😊", label: "행복" },
  { emoji: "😢", label: "슬픔" },
  { emoji: "😠", label: "화남" },
  { emoji: "😮", label: "놀람" },
  { emoji: "🤔", label: "생각" },
  { emoji: "😴", label: "평화" },
  { emoji: "😰", label: "불안" },
  { emoji: "🥰", label: "사랑" },
];

const vibeOptions = [
  "신비로운",
  "모험적인",
  "따뜻한",
  "약간 긴장감 있는",
  "놀라운",
  "로맨틱한",
  "신비한",
  "희망적인",
];

export default function DreamForm() {
  const [dreamText, setDreamText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const router = useRouter();

  const { mutateAsync: generateStory, isPending: isSubmitting } =
    useGenerateDreamStory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dreamText.trim()) return;

    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    const dreamRequest = {
      dream_input_text: dreamText,
      dream_keywords: keywordArray.length > 0 ? keywordArray : undefined,
      dream_emotion: selectedEmotion || undefined,
      story_preference_mood: selectedVibe || undefined,
      story_preference_genre: "fantasy", // 기본값
      story_preference_length: "medium", // 기본값
    };

    await generateStory(dreamRequest);

    router.push("/journal");
  };

  return (
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      {/* 감정 선택 */}
      <div className="space-y-4">
        <label className="block font-['Inter'] text-lg font-medium text-gray-900">
          꿈이 남긴 여운{" "}
          <span className="text-gray-500 font-normal">(선택사항)</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {emotions.map((emotion) => (
            <button
              key={emotion.emoji}
              type="button"
              onClick={() =>
                setSelectedEmotion(
                  selectedEmotion === emotion.emoji ? "" : emotion.emoji
                )
              }
              className={`p-3 text-2xl transition-colors ${
                selectedEmotion === emotion.emoji
                  ? "bg-black text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
              title={emotion.label}
              disabled={isSubmitting}
            >
              {emotion.emoji}
            </button>
          ))}
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
          disabled={isSubmitting}
        >
          <option value="">이야기의 색채를 선택하세요...</option>
          {vibeOptions.map((vibe) => (
            <option key={vibe} value={vibe}>
              {vibe}
            </option>
          ))}
        </select>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={!dreamText.trim() || isSubmitting}
          className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-['Inter'] font-medium py-4 px-6 transition-colors disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              AI가 꿈의 조각들을 엮고 있어요...
            </span>
          ) : (
            "내 꿈 이야기 엮어보기"
          )}
        </button>
      </div>

      {/* 글자 수 */}
      <div className="text-center text-sm text-gray-500">
        {dreamText.length}자
      </div>
    </form>
  );
}
