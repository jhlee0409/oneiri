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
  usePublicToggle,
} from "@/hooks/use-dream-api";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { EMOTION_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import ViewPublicPageButton from "./view-public-page-button";
import { findEmotion, findMood } from "@/lib/find";
interface DreamStoryDisplayProps {
  dreamId: string;
}

export default function DreamSharedDisplay({
  dreamId,
}: DreamStoryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const hasTriggeredImageGeneration = useRef(false);
  const { data: dream, isLoading, error } = useDreamById(dreamId);
  const { toggleFavorite, isLoading: isToggling } = useFavoriteToggle();
  const { togglePublic, isLoading: isTogglingPublic } = usePublicToggle();
  const { mutate: deleteDream, isPending: isDeleting } = useDeleteDream();
  const { mutate: generateImage, isPending: isGeneratingImage } =
    useGenerateDreamImage();

  // 이미지가 없고 프롬프트가 있을 때 자동으로 이미지 생성 (한 번만)
  useEffect(() => {
    if (
      dream?.id &&
      dream.generated_image_prompt &&
      !dream.generated_image_url &&
      !isGeneratingImage &&
      !hasTriggeredImageGeneration.current
    ) {
      hasTriggeredImageGeneration.current = true;
      generateImage({
        dreamId: dream.id,
        imagePrompt: dream.generated_image_prompt,
      });
    }
  }, [dream, generateImage, isGeneratingImage]);

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

  const handleTogglePublic = async () => {
    if (!dream?.id) return;
    togglePublic(dream.id, dream.is_public || false);
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
              router.push("/library/dreams");
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-secondary border-t-accent-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center py-24">
          <h2 className="text-xl font-medium oneiri-text-primary mb-4">
            꿈 이야기를 찾을 수 없습니다
          </h2>
          <p className="oneiri-text-secondary mb-6">
            요청하신 꿈 이야기가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/library/dreams"
            className="inline-flex items-center oneiri-accent hover:text-accent-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            서재로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oneiri-bg-primary">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 뒤로 가기 네비게이션 */}
        <nav className="flex gap-6 mb-12 pb-6 border-b border-text-secondary/20">
          <Link
            href="/library/dreams"
            className="inline-flex items-center oneiri-text-secondary hover:oneiri-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            서재로 돌아가기
          </Link>
          <Link
            href="/"
            className="inline-flex items-center oneiri-text-secondary hover:oneiri-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            새로운 꿈 조각 기록하기
          </Link>
        </nav>

        {/* 스토리 제목 */}
        <header className="mb-12">
          <div className="flex items-start justify-between">
            <h1 className="font-['Inter'] text-3xl md:text-4xl font-medium oneiri-text-primary leading-tight flex-1">
              {dream.generated_story_title || "무제"}
            </h1>
            <button
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className="ml-4 p-2 oneiri-text-secondary hover:text-oneiri-garnet transition-colors disabled:opacity-50"
              title={dream.is_favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {dream.is_favorite ? (
                <Heart className="w-6 h-6 fill-current text-oneiri-garnet" />
              ) : (
                <HeartOff className="w-6 h-6" />
              )}
            </button>
          </div>
        </header>

        {/* 꿈 메타데이터 */}
        <div className="mb-12 pb-6 border-b border-text-secondary/20">
          <div className="flex items-center gap-6 text-sm oneiri-text-secondary flex-wrap">
            {dream.dream_emotion && (
              <span className="flex items-center gap-2">
                <span className="text-lg">
                  {findEmotion(dream.dream_emotion)?.emoji}
                </span>
                <span>{findEmotion(dream.dream_emotion)?.label}</span>
              </span>
            )}
            {dream.story_preference_mood && (
              <span className="oneiri-text-primary font-medium">
                {findMood(dream.story_preference_mood)?.label}
              </span>
            )}
            {dream.dream_keywords && dream.dream_keywords.length > 0 && (
              <div className="flex gap-2">
                {dream.dream_keywords.map((keyword, index) => (
                  <span key={index} className="oneiri-text-secondary">
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
            <span className="oneiri-text-secondary/70">
              {dream.created_at &&
                new Date(dream.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
        {/* 공개여부 설정 */}
        <section className="oneiri-bg-secondary p-6 mb-12 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Inter'] text-lg font-medium oneiri-text-primary mb-1">
                공개 설정
              </h2>
              <p className="text-sm oneiri-text-secondary">
                {dream.is_public
                  ? "다른 사용자들이 이 꿈 이야기를 볼 수 있습니다"
                  : "나만 볼 수 있는 비공개 꿈 이야기입니다"}
              </p>
              {dream.id && dream.is_public && (
                <div className="flex items-center gap-4 mt-3">
                  <ViewPublicPageButton
                    dreamId={dream.id}
                    isPublic={dream.is_public || false}
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={isTogglingPublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                dream.is_public
                  ? "oneiri-accent-bg"
                  : "bg-gray-300 dark:bg-text-secondary/70 border border-gray-400 dark:border-text-secondary/50"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dream.is_public ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>
        {/* 생성된 이미지 */}
        {dream.generated_image_url ? (
          <div className="mb-12">
            <div className="relative group flex justify-center">
              <Zoom>
                <ImageWithFallback
                  src={dream.generated_image_url}
                  alt={dream.generated_story_title || "꿈의 풍경"}
                  className="w-full h-96 object-cover rounded-lg shadow-lg transition-transform"
                  width={1024}
                  height={1024}
                  fallbackMessage="꿈의 풍경"
                />
              </Zoom>
            </div>
          </div>
        ) : dream.generated_image_prompt ? (
          <div className="mb-12">
            <div className="h-96 bg-gradient-to-br from-oneiri-violet/10 to-accent-primary/10 flex items-center justify-center oneiri-text-secondary rounded-lg border-2 border-dashed border-text-secondary/30">
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
                      <div className="w-2 h-2 bg-oneiri-violet rounded-full"></div>
                      <div className="w-2 h-2 bg-oneiri-violet rounded-full"></div>
                      <div className="w-2 h-2 bg-oneiri-violet rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 oneiri-bg-secondary flex items-center justify-center oneiri-text-secondary mb-12 rounded-lg">
            <div className="text-center">
              <div className="text-2xl mb-2">📖</div>
              <div className="font-medium">이미지 없는 꿈 이야기</div>
              <div className="text-sm">
                상상 속에서 펼쳐지는 이야기를 즐겨보세요
              </div>
            </div>
          </div>
        )}

        {/* 메인 스토리 콘텐츠 */}
        <main className="mb-12">
          <div className="prose prose-lg max-w-none">
            {dream.generated_story_content ? (
              dream.generated_story_content
                .split("\n\n")
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className="oneiri-text-primary leading-relaxed mb-6 last:mb-0 text-lg"
                  >
                    {paragraph}
                  </p>
                ))
            ) : (
              <p className="oneiri-text-secondary italic">
                아직 이야기가 생성되지 않았습니다.
              </p>
            )}
          </div>
        </main>

        {/* 원본 꿈 입력 */}
        <section className="oneiri-bg-secondary p-6 mb-12 rounded-lg">
          <h2 className="font-['Inter'] text-lg font-medium oneiri-text-primary mb-3 flex items-center">
            <span className="text-xl mr-2">💭</span>
            당신이 속삭여준 꿈의 조각들
          </h2>
          <p className="oneiri-text-primary/80 leading-relaxed italic">
            "{dream.dream_input_text || "꿈의 내용이 없습니다."}"
          </p>
        </section>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={handleCopyStory}
            disabled={!dream.generated_story_content}
            className="w-full sm:w-auto oneiri-accent-bg hover:bg-accent-primary/90 disabled:bg-text-secondary text-bg-primary font-['Inter'] font-medium py-3 px-6 transition-colors disabled:cursor-not-allowed flex items-center justify-center rounded-lg"
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
            className="w-full sm:w-auto oneiri-bg-secondary hover:bg-oneiri-garnet/10 disabled:oneiri-bg-primary text-oneiri-garnet disabled:oneiri-text-secondary font-['Inter'] font-medium py-3 px-6 border border-oneiri-garnet/20 hover:border-oneiri-garnet/40 transition-colors disabled:cursor-not-allowed rounded-lg"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-oneiri-garnet border-t-transparent mr-2"></div>
                삭제하는 중...
              </span>
            ) : (
              "꿈 이야기 삭제"
            )}
          </button>
        </div>

        {/* 스토리 통계 */}
        <footer className="text-center text-sm oneiri-text-secondary border-t border-text-secondary/20 pt-8">
          <p>
            이야기 길이: {dream.generated_story_content?.length || 0}자 • AI
            마법으로 생성됨
          </p>
        </footer>
      </div>
    </div>
  );
}
