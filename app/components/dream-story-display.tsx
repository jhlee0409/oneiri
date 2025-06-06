"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StoryData {
  id: string;
  title: string;
  dreamText: string;
  keywords: string[];
  emotion: string;
  vibe: string;
  createdAt: string;
}

interface DreamStoryDisplayProps {
  storyId: string;
}

export default function DreamStoryDisplay({ storyId }: DreamStoryDisplayProps) {
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStory = () => {
      const savedDreams = localStorage.getItem("userDreams");
      if (savedDreams) {
        const dreams = JSON.parse(savedDreams);
        const story = dreams.find((dream: any) => dream.id === storyId);
        if (story) {
          setStoryData(story);
        } else {
          router.push("/journal");
        }
      } else {
        router.push("/journal");
      }
      setIsLoading(false);
    };

    loadStory();
  }, [storyId, router]);

  const handleCopyStory = async () => {
    try {
      // await navigator.clipboard.writeText(storyData.story)
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("텍스트 복사 실패: ", err);
    }
  };

  const handleSaveToJournal = async () => {
    setSaving(true);
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    alert("이야기가 서재에 보관되었습니다!");
  };

  const handleTryAnotherVersion = async () => {
    setRegenerating(true);
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRegenerating(false);
    alert("꿈의 다른 해석을 찾고 있습니다...");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!storyData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 뒤로 가기 네비게이션 */}
        <nav className="flex gap-6 mb-12 pb-6 border-b border-gray-100">
          <Link
            href="/journal"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            서재로 돌아가기
          </Link>
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            새로운 꿈 조각 기록하기
          </Link>
        </nav>

        {/* 스토리 제목 */}
        <header className="mb-12">
          <h1 className="font-['Inter'] text-3xl md:text-4xl font-medium text-gray-900 leading-tight">
            {storyData.title}
          </h1>
        </header>

        {/* 꿈 메타데이터 */}
        <div className="mb-12 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            {storyData.emotion && (
              <span className="flex items-center gap-2">
                <span className="text-lg">{storyData.emotion}</span>
                <span>여운</span>
              </span>
            )}
            {storyData.vibe && (
              <span className="text-gray-900 font-medium">
                {storyData.vibe}
              </span>
            )}
            {storyData.keywords.length > 0 && (
              <div className="flex gap-2">
                {storyData.keywords.map((keyword, index) => (
                  <span key={index} className="text-gray-500">
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 생성된 이미지 플레이스홀더 */}
        <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500 mb-12">
          <div className="text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-medium">꿈의 풍경을 그리는 중...</div>
            <div className="text-sm">(AI 아티스트가 영감을 얻고 있습니다)</div>
          </div>
        </div>

        {/* 메인 스토리 콘텐츠 */}
        <main className="mb-12">
          <div className="prose prose-lg max-w-none">
            {/* {storyData.story.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-gray-800 leading-relaxed mb-6 last:mb-0 text-lg">
                {paragraph}
              </p>
            ))} */}
          </div>
        </main>

        {/* 원본 꿈 입력 */}
        <section className="bg-gray-50 p-6 mb-12">
          <h2 className="font-['Inter'] text-lg font-medium text-gray-900 mb-3 flex items-center">
            <span className="text-xl mr-2">💭</span>
            당신이 속삭여준 꿈의 조각들
          </h2>
          {/* <p className="text-gray-700 leading-relaxed italic">"{storyData.originalDream}"</p> */}
        </section>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={handleSaveToJournal}
            disabled={saving}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-['Inter'] font-medium py-3 px-6 transition-colors disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                보관하는 중...
              </span>
            ) : (
              "내 서재에 보관하기"
            )}
          </button>

          <button
            onClick={handleTryAnotherVersion}
            disabled={regenerating}
            className="w-full sm:w-auto bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 disabled:text-gray-500 font-['Inter'] font-medium py-3 px-6 border border-gray-200 transition-colors disabled:cursor-not-allowed"
          >
            {regenerating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                다른 해석을 찾는 중...
              </span>
            ) : (
              "꿈의 다른 해석 보기"
            )}
          </button>

          <button
            onClick={handleCopyStory}
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 font-['Inter'] font-medium py-3 px-6 border border-gray-200 transition-colors flex items-center justify-center"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                담아갔어요!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                이야기 담아가기
              </>
            )}
          </button>
        </div>

        {/* 스토리 통계 */}
        <footer className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
          {/* <p>이야기 길이: {storyData.story.length}자 • AI 마법으로 생성됨</p> */}
        </footer>
      </div>
    </div>
  );
}
