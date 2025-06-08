"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Copy, Check, Heart, HeartOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useDreamById,
  useFavoriteToggle,
  useDeleteDream,
  useGenerateDreamImage,
} from "@/hooks/use-dream-api";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
interface DreamStoryDisplayProps {
  storyId: string;
}

export default function DreamStoryDisplay({ storyId }: DreamStoryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const hasTriggeredImageGeneration = useRef(false);

  const { data: dream, isLoading, error } = useDreamById(storyId);
  const { toggleFavorite, isLoading: isToggling } = useFavoriteToggle();
  const { mutate: deleteDream, isPending: isDeleting } = useDeleteDream();
  const { mutate: generateImage, isPending: isGeneratingImage } =
    useGenerateDreamImage();

  // 이미지가 없고 프롬프트가 있을 때 자동으로 이미지 생성 (한 번만)
  // useEffect(() => {
  //   if (
  //     dream?.id &&
  //     dream.generated_image_prompt &&
  //     !dream.generated_image_url &&
  //     !isGeneratingImage &&
  //     !hasTriggeredImageGeneration.current
  //   ) {
  //     hasTriggeredImageGeneration.current = true;
  //     generateImage({
  //       dreamId: dream.id,
  //       imagePrompt: dream.generated_image_prompt,
  //     });
  //   }
  // }, [dream, generateImage, isGeneratingImage]);

  const handleCopyStory = async () => {
    if (!dream?.generated_story_content) return;

    try {
      await navigator.clipboard.writeText(dream.generated_story_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("텍스트 복사 실패: ", err);
    }
  };

  const handleToggleFavorite = () => {
    if (!dream?.id) return;
    toggleFavorite(dream.id, dream.is_favorite || false);
  };

  const handleDelete = () => {
    if (!dream?.id) return;

    const dreamId = dream.id;

    toast("이 꿈 이야기를 삭제하시겠습니까?", {
      description: "삭제된 이야기는 복구할 수 없습니다.",
      action: {
        label: "삭제",
        onClick: () => {
          deleteDream(dreamId, {
            onSuccess: () => {
              router.push("/journal");
            },
          });
        },
      },
      cancel: {
        label: "취소",
        onClick: () => console.log("삭제 취소됨"),
      },
    });
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

  if (error || !dream) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center py-24">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            꿈 이야기를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 꿈 이야기가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center text-black hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            서재로 돌아가기
          </Link>
        </div>
      </div>
    );
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
          <div className="flex items-start justify-between">
            <h1 className="font-['Inter'] text-3xl md:text-4xl font-medium text-gray-900 leading-tight flex-1">
              {dream.generated_story_title || "무제"}
            </h1>
            <button
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title={dream.is_favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {dream.is_favorite ? (
                <Heart className="w-6 h-6 fill-current text-red-500" />
              ) : (
                <HeartOff className="w-6 h-6" />
              )}
            </button>
          </div>
        </header>

        {/* 꿈 메타데이터 */}
        <div className="mb-12 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
            {dream.dream_emotion && (
              <span className="flex items-center gap-2">
                <span className="text-lg">{dream.dream_emotion}</span>
                <span>여운</span>
              </span>
            )}
            {dream.story_preference_mood && (
              <span className="text-gray-900 font-medium">
                {dream.story_preference_mood}
              </span>
            )}
            {dream.dream_keywords && dream.dream_keywords.length > 0 && (
              <div className="flex gap-2">
                {dream.dream_keywords.map((keyword, index) => (
                  <span key={index} className="text-gray-500">
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
            <span className="text-gray-400">
              {dream.created_at &&
                new Date(dream.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>

        {/* 생성된 이미지 */}
        {/* {dream.generated_image_url ? (
          <div className="mb-12">
            <div className="relative group flex justify-center">
              <Zoom>
                <Image
                  src={dream.generated_image_url}
                  alt={dream.generated_story_title || "꿈의 풍경"}
                  className="w-full h-96 object-cover rounded-lg shadow-lg transition-transform"
                  loading="lazy"
                  width={1024}
                  height={1024}
                />
              </Zoom>
            </div>
          </div>
        ) : dream.generated_image_prompt ? (
          <div className="mb-12">
            <div className="h-96 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center text-gray-500 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center p-8">
                <div className="text-4xl mb-4">
                  {isGeneratingImage ? (
                    <div className="animate-spin">🎨</div>
                  ) : (
                    "🎨"
                  )}
                </div>
                <div className="font-medium text-lg mb-2">
                  {isGeneratingImage
                    ? "꿈의 풍경을 그리는 중..."
                    : "이미지를 준비하고 있어요..."}
                </div>
                <div className="text-sm mb-4">
                  AI 아티스트가 당신의 꿈에서 영감을 얻고 있습니다
                </div>
                {isGeneratingImage && (
                  <div className="flex justify-center mb-4">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500 mb-12 rounded-lg">
            <div className="text-center">
              <div className="text-2xl mb-2">📖</div>
              <div className="font-medium">이미지 없는 꿈 이야기</div>
              <div className="text-sm">
                상상 속에서 펼쳐지는 이야기를 즐겨보세요
              </div>
            </div>
          </div>
        )} */}

        {/* 메인 스토리 콘텐츠 */}
        <main className="mb-12">
          <div className="prose prose-lg max-w-none">
            {dream.generated_story_content ? (
              dream.generated_story_content
                .split("\n\n")
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-gray-800 leading-relaxed mb-6 last:mb-0 text-lg"
                  >
                    {paragraph}
                  </p>
                ))
            ) : (
              <p className="text-gray-500 italic">
                아직 이야기가 생성되지 않았습니다.
              </p>
            )}
          </div>
        </main>

        {/* 원본 꿈 입력 */}
        <section className="bg-gray-50 p-6 mb-12 rounded-lg">
          <h2 className="font-['Inter'] text-lg font-medium text-gray-900 mb-3 flex items-center">
            <span className="text-xl mr-2">💭</span>
            당신이 속삭여준 꿈의 조각들
          </h2>
          <p className="text-gray-700 leading-relaxed italic">
            "{dream.dream_input_text || "꿈의 내용이 없습니다."}"
          </p>
        </section>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={handleCopyStory}
            disabled={!dream.generated_story_content}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-['Inter'] font-medium py-3 px-6 transition-colors disabled:cursor-not-allowed flex items-center justify-center"
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

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-white hover:bg-red-50 disabled:bg-gray-100 text-red-600 disabled:text-gray-500 font-['Inter'] font-medium py-3 px-6 border border-red-200 hover:border-red-300 transition-colors disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent mr-2"></div>
                삭제하는 중...
              </span>
            ) : (
              "꿈 이야기 삭제"
            )}
          </button>
        </div>

        {/* 스토리 통계 */}
        <footer className="text-center text-sm text-gray-500 border-t border-gray-100 pt-8">
          <p>
            이야기 길이: {dream.generated_story_content?.length || 0}자 • AI
            마법으로 생성됨
          </p>
        </footer>
      </div>
    </div>
  );
}
