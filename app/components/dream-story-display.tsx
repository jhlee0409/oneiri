"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Copy, Check, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDreamById,
  useFavoriteToggle,
  useDeleteDream,
  useGenerateDreamImage,
  usePublicToggle,
} from "@/hooks/use-dream-api";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { findEmotion, findMood } from "@/lib/find";
import DreamPage, { type DreamImageState } from "./dream-page";
import DreamSymbolReading from "./dream-symbol-reading";
import DreamPostcardOffer from "./dream-postcard-offer";

interface DreamStoryDisplayProps {
  dreamId: string;
}

const quietAction =
  "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50";

function BackToLibrary() {
  return (
    <Link
      href="/library/dreams"
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      서재
    </Link>
  );
}

export default function DreamStoryDisplay({ dreamId }: DreamStoryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const hasTriggeredImageGeneration = useRef(false);
  const { user } = useAuth();
  const { data: dream, isLoading, error } = useDreamById(dreamId);
  const { toggleFavorite, isLoading: isToggling } = useFavoriteToggle();
  const { togglePublic, isLoading: isTogglingPublic } = usePublicToggle();
  const { mutate: deleteDream, isPending: isDeleting } = useDeleteDream();
  const {
    mutate: generateImage,
    isPending: isGeneratingImage,
    isError: imageGenerationFailed,
  } = useGenerateDreamImage();

  // 이미지가 없고 프롬프트가 있을 때 자동으로 이미지 생성 (한 화면에서 한 번만)
  useEffect(() => {
    if (
      dream?.id &&
      dream.generated_image_prompt &&
      !dream.generated_image_url &&
      !isGeneratingImage &&
      !hasTriggeredImageGeneration.current
    ) {
      // 세션 스토리지에서 이미 생성 시도한 적이 있는지 확인
      const sessionKey = `image-generation-${dream.id}`;
      const lastAttempt = sessionStorage.getItem(sessionKey);
      const now = Date.now();

      // 5분 이내에 시도한 적이 있으면 재시도하지 않음
      if (lastAttempt && now - parseInt(lastAttempt) < 5 * 60 * 1000) {
        hasTriggeredImageGeneration.current = true;
        return;
      }

      hasTriggeredImageGeneration.current = true;
      sessionStorage.setItem(sessionKey, now.toString());

      generateImage(
        { dreamId: dream.id },
        {
          // 끝나면(성공·실패 모두) 기록을 지워 다음 방문에서 다시 시도할 수 있게 한다.
          // 실패해도 이 화면에서는 재시도하지 않는다 — 실패할 때마다 즉시 다시 요청하는 루프를 막는다.
          onSettled: () => sessionStorage.removeItem(sessionKey),
        }
      );
    }
  }, [dream, generateImage, isGeneratingImage]);

  const handleCopyStory = useCallback(async () => {
    if (!dream?.generated_story_content) return;

    try {
      await navigator.clipboard.writeText(dream.generated_story_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("텍스트 복사 실패: ", err);
    }
  }, [dream?.generated_story_content]);

  const handleTogglePublic = useCallback(() => {
    if (!dream?.id) return;
    togglePublic(dream.id, dream.is_public || false);
  }, [dream?.id, dream?.is_public, togglePublic]);

  const handleToggleFavorite = useCallback(() => {
    if (!dream?.id) return;
    toggleFavorite(dream.id, dream.is_favorite || false);
  }, [dream?.id, dream?.is_favorite, toggleFavorite]);

  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      // 삭제가 끝날 때까지 대화상자를 열어 둔다.
      event.preventDefault();
      if (!dream?.id) return;

      deleteDream(dream.id, {
        onSuccess: (response) => {
          if (response.success) {
            router.push("/library/dreams");
          } else {
            setDeleteOpen(false);
          }
        },
        onError: () => setDeleteOpen(false),
      });
    },
    [dream?.id, deleteDream, router]
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[720px] pb-16 sm:px-6 sm:pt-4">
        <div className="px-6 sm:px-0">
          <BackToLibrary />
        </div>
        <div role="status" className="overflow-hidden bg-paper sm:rounded-lg">
          <div className="aspect-video w-full animate-pulse bg-ink/[0.06] motion-reduce:animate-none" />
          <p className="px-6 py-10 text-sm text-ink/70 sm:px-12">
            이야기를 펼치고 있어요…
          </p>
        </div>
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <h2 className="font-serif text-xl text-text-primary">
          이 꿈 이야기를 찾을 수 없어요
        </h2>
        <p className="mt-3 text-text-secondary break-keep">
          이미 지웠거나 주소가 잘못되었을 수 있어요.
        </p>
        <Link
          href="/library/dreams"
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-text-primary underline underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          서재로 돌아가기
        </Link>
      </div>
    );
  }

  const imageState: DreamImageState = dream.generated_image_url
    ? "ready"
    : !dream.generated_image_prompt
    ? "none"
    : imageGenerationFailed
    ? "failed"
    : "drawing";
  const isOwner = !!user && user.id === dream.user_id;
  const isFavorite = !!dream.is_favorite;
  const isPublic = !!dream.is_public;
  const title = dream.generated_story_title || "무제";

  return (
    <div className="mx-auto max-w-[720px] pb-16 sm:px-6 sm:pt-4">
      <nav aria-label="이전 화면" className="px-6 sm:px-0">
        <BackToLibrary />
      </nav>

      <DreamPage
        title={dream.generated_story_title}
        createdAt={dream.created_at}
        content={dream.generated_story_content}
        imageUrl={dream.generated_image_url}
        imageState={imageState}
        details={[
          dream.dream_emotion ? findEmotion(dream.dream_emotion)?.label : null,
          dream.story_preference_mood
            ? findMood(dream.story_preference_mood)?.label
            : null,
        ]}
        sourceLabel="내가 적은 꿈"
        sourceText={dream.dream_input_text}
        keywords={dream.dream_keywords}
      />

      <div className="mx-6 mt-8 flex flex-col gap-2 border-y border-line py-2 sm:mx-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-h-11 flex-wrap items-center gap-x-3">
          <Switch
            id="dream-public"
            checked={isPublic}
            onCheckedChange={handleTogglePublic}
            disabled={isTogglingPublic}
          />
          <Label
            htmlFor="dream-public"
            className="cursor-pointer py-3 text-sm font-normal text-text-primary break-keep"
          >
            다른 사람도 볼 수 있게 공개
          </Label>
          {isPublic && (
            <Link
              href={`/shared/${dream.id}`}
              className="inline-flex min-h-11 items-center text-sm text-text-secondary underline underline-offset-4 transition-colors hover:text-text-primary"
            >
              공개 페이지 보기
            </Link>
          )}
        </div>

        <div className="-mx-3 flex flex-wrap items-center sm:mx-0 sm:-mr-3">
          <button
            type="button"
            onClick={handleCopyStory}
            disabled={!dream.generated_story_content}
            className={quietAction}
          >
            {copied ? (
              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            )}
            <span aria-live="polite">{copied ? "복사했어요" : "이야기 복사"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isToggling}
            aria-pressed={isFavorite}
            className={cn(quietAction, isFavorite && "text-text-primary")}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavorite && "fill-current text-accent-primary"
              )}
              strokeWidth={1.5}
              aria-hidden
            />
            즐겨찾기
          </button>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={isDeleting}
                className={cn(quietAction, "hover:text-danger")}
              >
                삭제
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg border-line bg-bg-secondary">
              <AlertDialogHeader className="text-left">
                <AlertDialogTitle className="font-serif text-xl font-normal text-text-primary">
                  이 꿈을 지울까요?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-text-secondary break-keep">
                  ‘{title}’의 이야기와 장면이 함께 사라지고, 되돌릴 수 없어요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:space-x-0">
                <AlertDialogCancel className="mt-0 min-h-11 border-line bg-transparent text-text-primary hover:bg-line/40 hover:text-text-primary sm:mt-0">
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="min-h-11 border border-danger/40 bg-transparent text-danger hover:bg-danger/10"
                >
                  {isDeleting ? "지우는 중…" : "지우기"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-12 space-y-12 px-6 sm:px-0">
        {isOwner && dream.id && <DreamSymbolReading dreamId={dream.id} />}
        <DreamPostcardOffer dreamId={dreamId} ownerId={dream.user_id} />
      </div>
    </div>
  );
}
