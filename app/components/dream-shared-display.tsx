"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Link2,
  Send,
  Edit2,
  Trash2,
  X,
  Check,
  ImageDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { loginPath } from "@/lib/login-redirect";
import { toast } from "sonner";
import { useDreamById } from "@/hooks/use-dream-api";
import { supabase } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { findEmotion, findMood } from "@/lib/find";
import { getUserProfile, getUserProfiles } from "@/lib/user-profile-cache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DreamPage from "./dream-page";

const commentEditButtonId = (commentId: string) => `comment-edit-${commentId}`;

/** 수정 칸이 닫힌 뒤 그 댓글의 "수정" 버튼으로 포커스를 돌려 놓는다. */
function focusCommentEditButton(commentId: string) {
  requestAnimationFrame(() =>
    document.getElementById(commentEditButtonId(commentId))?.focus()
  );
}

const quietAction =
  "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50";

const iconAction =
  "inline-flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50";

function BackToExplore() {
  return (
    <Link
      href="/dreams"
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      둘러보기
    </Link>
  );
}

interface SharedDreamDisplayProps {
  dreamId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  display_name?: string;
}

// 간단한 auth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 사용자 확인
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export default function SharedDreamDisplay({
  dreamId,
}: SharedDreamDisplayProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [guestLikesCount, setGuestLikesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isGuestLiked, setIsGuestLiked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(
    null
  );
  const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(
    null
  );
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isCreatingStoryImage, setIsCreatingStoryImage] = useState(false);
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<
    string | null
  >(null);
  const commentsHeadingRef = useRef<HTMLHeadingElement>(null);
  const deletedCommentRef = useRef(false);
  // 트리거 없이 여는 대화상자라 닫을 때 돌아갈 버튼을 직접 기억한다.
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { user } = useAuth();

  const { data: dream, isLoading, error } = useDreamById(dreamId);

  // 클라이언트 IP 가져오기 (간단한 구현)
  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("IP 가져오기 실패:", error);
      return "0.0.0.0"; // 기본값
    }
  };

  // 댓글 수를 직접 업데이트하는 헬퍼 함수
  const updateCommentsCountFallback = async (dreamId: string) => {
    try {
      const { count: currentCommentsCount } = await supabase
        .from("dream_comments")
        .select("*", { count: "exact", head: true })
        .eq("dream_id", dreamId);

      await supabase
        .from("dreams")
        .update({ comments_count: Math.max(0, currentCommentsCount || 0) })
        .eq("id", dreamId);
    } catch (error) {
      console.error("댓글 수 직접 업데이트 실패:", error);
    }
  };

  // 작성자 이름은 소셜 데이터(IP 조회 포함)를 기다리지 않고 바로 불러온다.
  useEffect(() => {
    if (!dream?.id) return;
    if (!dream.user_id) {
      setAuthorDisplayName("익명의 꿈꾸는자");
      return;
    }

    let cancelled = false;
    getUserProfile(dream.user_id)
      .then((profile) => {
        if (!cancelled) setAuthorDisplayName(profile.display_name);
      })
      .catch((error) => console.error("작성자 정보 로드 실패:", error));
    return () => {
      cancelled = true;
    };
  }, [dream?.id, dream?.user_id]);

  // 좋아요 상태와 댓글 로드
  useEffect(() => {
    if (!dream?.id) return;

    const loadSocialData = async () => {
      try {
        // 로그인한 사용자인 경우 좋아요 상태 확인
        if (user) {
          const { data: likeData } = await supabase
            .from("dream_likes")
            .select("id")
            .eq("dream_id", dream.id)
            .eq("user_id", user.id)
            .maybeSingle();

          setIsLiked(!!likeData);
        } else {
          // 게스트인 경우 IP 기반 좋아요 상태 확인
          const clientIP = await getClientIP();
          const { data: guestLikeData } = await supabase
            .from("guest_likes")
            .select("id")
            .eq("dream_id", dream.id)
            .eq("ip_address", clientIP)
            .maybeSingle();

          setIsGuestLiked(!!guestLikeData);
        }

        // 일반 사용자 좋아요 수 로드
        const { count: userLikesCountData } = await supabase
          .from("dream_likes")
          .select("*", { count: "exact", head: true })
          .eq("dream_id", dream.id);

        // 게스트 좋아요 수 로드
        const { count: guestLikesCountData } = await supabase
          .from("guest_likes")
          .select("*", { count: "exact", head: true })
          .eq("dream_id", dream.id);

        // 댓글 수 로드
        const { count: commentsCountData } = await supabase
          .from("dream_comments")
          .select("*", { count: "exact", head: true })
          .eq("dream_id", dream.id);

        setLikesCount(userLikesCountData || 0);
        setGuestLikesCount(guestLikesCountData || 0);
        setCommentsCount(commentsCountData || 0);

        // 댓글 로드 시작
        setIsLoadingComments(true);

        // 댓글 로드 (기본 정보만) - 최신순으로 정렬
        const { data: commentsData, error: commentsError } = await supabase
          .from("dream_comments_with_author")
          .select("id, content, created_at, updated_at, user_id, is_anonymous")
          .eq("dream_id", dream.id)
          .order("created_at", { ascending: false });

        if (commentsError) {
          console.error("댓글 로드 실패:", commentsError);
          setIsLoadingComments(false);
        } else if (commentsData) {
          // 🚀 최적화: 고유한 user_id들만 추출해서 display_name 한 번에 가져오기 (캐시 사용)
          const uniqueCommentUserIds = [
            ...new Set(
              commentsData
                .filter((comment) => !comment.is_anonymous && comment.user_id)
                .map((comment) => comment.user_id)
            ),
          ];

          // 캐시를 사용해서 모든 프로필 정보 한 번에 가져오기
          const userDisplayNames = await getUserProfiles(uniqueCommentUserIds);

          // 🚀 최적화: 집계된 데이터로 댓글 배열 구성 (개별 요청 없음)
          const commentsWithDisplayNames = commentsData.map((comment) => {
            if (comment.is_anonymous || !comment.user_id) {
              return {
                ...comment,
                display_name: "익명의 몽상가",
              };
            }
            return {
              ...comment,
              display_name:
                userDisplayNames[comment.user_id]?.display_name || "꿈꾸는자",
            };
          });

          setComments(commentsWithDisplayNames);
          setIsLoadingComments(false);
        } else {
          setIsLoadingComments(false);
        }
      } catch (error) {
        console.error("소셜 데이터 로드 실패:", error);
        setIsLoadingComments(false);
      }
    };

    loadSocialData();
  }, [dream?.id, user]);

  const handleToggleLike = async () => {
    if (!dream?.id || isTogglingLike) return;

    setIsTogglingLike(true);

    try {
      if (user) {
        // 로그인한 사용자 좋아요 처리
        if (isLiked) {
          // 좋아요 취소
          const { error } = await supabase
            .from("dream_likes")
            .delete()
            .eq("dream_id", dream.id)
            .eq("user_id", user.id);

          if (error) throw error;

          setIsLiked(false);
          setLikesCount((prev) => Math.max(0, prev - 1));
        } else {
          // 좋아요 추가
          const { error } = await supabase.from("dream_likes").insert({
            dream_id: dream.id,
            user_id: user.id,
          });

          if (error) throw error;

          setIsLiked(true);
          setLikesCount((prev) => prev + 1);
        }
      } else {
        // 게스트 좋아요 처리
        const clientIP = await getClientIP();
        const userAgent = navigator.userAgent;

        if (isGuestLiked) {
          // 게스트 좋아요 취소
          const { error } = await supabase
            .from("guest_likes")
            .delete()
            .eq("dream_id", dream.id)
            .eq("ip_address", clientIP);

          if (error) throw error;

          setIsGuestLiked(false);
          setGuestLikesCount((prev) => Math.max(0, prev - 1));
        } else {
          // 게스트 좋아요 추가
          const { error } = await supabase.from("guest_likes").insert({
            dream_id: dream.id,
            ip_address: clientIP,
            user_agent: userAgent,
          });

          if (error) throw error;

          setIsGuestLiked(true);
          setGuestLikesCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      toast.error("좋아요를 반영하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !dream?.id || !user || isSubmittingComment)
      return;

    const dreamId = dream.id; // 스코프 이슈 방지를 위해 미리 저장
    setIsSubmittingComment(true);

    try {
      // 댓글만 저장 (author_nickname_snapshot 제거)
      const { data, error } = await supabase
        .from("dream_comments")
        .insert({
          dream_id: dreamId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select("id, content, created_at, updated_at, user_id")
        .single();

      if (error) throw error;

      // 현재 사용자의 display_name 가져오기
      const response = await fetch(
        `/api/user-profile?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let displayName = "꿈꾸는자";
      if (response.ok) {
        const responseData = await response.json();
        displayName = responseData.display_name || "꿈꾸는자";
      }

      // 작성된 댓글에 현재 display_name 추가
      const newComment = {
        ...data,
        display_name: displayName,
        is_anonymous: false,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");

      // dreams 테이블의 comments_count도 증가
      try {
        await supabase.rpc("increment_comments_count", {
          dream_id: dreamId,
        });
      } catch (rpcError) {
        // RPC가 없다면 직접 업데이트
        console.log("RPC 함수가 없어서 직접 업데이트:", rpcError);
        await updateCommentsCountFallback(dreamId);
      }

      toast.success("댓글을 남겼어요.");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error("댓글을 남기지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (!dream?.id) return;

    try {
      const shareUrl = `${window.location.origin}/shared/${dream.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크를 복사했어요.");
      trackEvent("share", { method: "copy_link", content_type: "dream" });
    } catch (error) {
      console.error("공유 링크 복사 실패:", error);
      toast.error("링크를 복사하지 못했어요.");
    }
  };

  // 인스타그램 스토리용 이미지: 파일 공유가 되면 Web Share, 아니면 다운로드
  const handleShareStoryImage = async () => {
    if (!dream?.id || isCreatingStoryImage) return;

    setIsCreatingStoryImage(true);
    try {
      const response = await fetch(`/api/share-card/${dream.id}`);
      if (!response.ok) {
        throw new Error(`share card request failed: ${response.status}`);
      }
      const blob = await response.blob();
      const fileName = `oneiri-${dream.id}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // 터치 기기(모바일)에서만 공유 시트를 띄운다. 데스크톱은 바로 다운로드한다.
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
      let shared = false;
      if (isTouchDevice && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: dream.generated_story_title || "Oneiri",
          });
          shared = true;
        } catch (shareError) {
          if (
            shareError instanceof DOMException &&
            shareError.name === "AbortError"
          ) {
            return;
          }
          // 이미지 생성 대기 중 사용자 제스처가 만료되면(NotAllowedError) 다운로드로 대체한다.
          console.warn("Web Share 실패, 다운로드로 대체:", shareError);
        }
      }

      if (!shared) {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        toast.success("스토리 이미지를 저장했어요.");
      }

      trackEvent("share", { method: "story_image", content_type: "dream" });
    } catch (error) {
      console.error("스토리 이미지 공유 실패:", error);
      toast.error("스토리 이미지를 만들지 못했어요.");
    } finally {
      setIsCreatingStoryImage(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}일 전`;

    return formatDate(dateString);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    if (editingCommentId) focusCommentEditButton(editingCommentId);
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim() || !user || isUpdatingComment) return;

    setIsUpdatingComment(true);

    try {
      const { error } = await supabase
        .from("dream_comments")
        .update({
          content: editingCommentText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      // 로컬 상태 업데이트
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content: editingCommentText.trim(),
                updated_at: new Date().toISOString(),
              }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");
      focusCommentEditButton(commentId);
      toast.success("댓글을 고쳤어요.");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      toast.error("댓글을 고치지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // 지우기 확인은 사라지는 토스트가 아니라 대화상자에서 받는다.
  const handleDeleteComment = async (event: React.MouseEvent) => {
    event.preventDefault();
    const commentId = pendingDeleteCommentId;
    if (!commentId || !user || isDeletingComment || !dream?.id) return;

    const dreamId = dream.id; // 스코프 이슈 방지를 위해 미리 저장
    setIsDeletingComment(commentId);

    try {
      const { error } = await supabase
        .from("dream_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      // 로컬 상태 업데이트
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));

      // dreams 테이블의 comments_count도 감소
      try {
        await supabase.rpc("decrement_comments_count", {
          dream_id: dreamId,
        });
      } catch (rpcError) {
        // RPC가 없다면 직접 업데이트
        console.log("RPC 함수가 없어서 직접 업데이트:", rpcError);
        await updateCommentsCountFallback(dreamId);
      }

      deletedCommentRef.current = true;
      toast.success("댓글을 지웠어요.");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      toast.error("댓글을 지우지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsDeletingComment(null);
      setPendingDeleteCommentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[720px] pb-16 sm:px-6 sm:pt-4">
        <div className="px-6 sm:px-0">
          <BackToExplore />
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

  if (error || !dream || !dream.is_public) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <h1 className="font-serif text-xl text-text-primary">
          {dream && !dream.is_public
            ? "비공개로 바뀐 꿈 이야기예요"
            : "이 꿈 이야기를 찾을 수 없어요"}
        </h1>
        <p className="mt-3 text-text-secondary break-keep">
          {dream && !dream.is_public
            ? "꿈을 꾼 사람이 혼자 간직하기로 했어요."
            : "지워졌거나 비공개로 바뀌었을 수 있어요."}
        </p>
        <Link
          href="/dreams"
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-text-primary underline underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          둘러보기로 돌아가기
        </Link>
      </div>
    );
  }

  const isLikedByViewer = user ? isLiked : isGuestLiked;
  const totalLikes = likesCount + guestLikesCount;

  return (
    <div className="mx-auto max-w-[720px] pb-16 sm:px-6 sm:pt-4">
      <nav aria-label="이전 화면" className="px-6 sm:px-0">
        <BackToExplore />
      </nav>

      <DreamPage
        title={dream.generated_story_title}
        createdAt={dream.created_at}
        content={dream.generated_story_content}
        imageUrl={dream.generated_image_url}
        imageState={dream.generated_image_url ? "ready" : "none"}
        details={[
          dream.dream_emotion
            ? findEmotion(dream.dream_emotion)?.label || dream.dream_emotion
            : null,
          dream.story_preference_mood
            ? findMood(dream.story_preference_mood)?.label ||
              dream.story_preference_mood
            : null,
        ]}
        byline={
          <div className="mt-4 flex min-h-8 items-center gap-2 text-sm text-ink/80">
            <UserAvatar
              userId={dream.user_id ?? undefined}
              displayName={authorDisplayName ?? undefined}
              size="md"
            />
            <span className="line-clamp-1">{authorDisplayName}</span>
          </div>
        }
        sourceLabel="꿈꾼 이가 적은 꿈"
        sourceText={dream.dream_input_text}
        keywords={dream.dream_keywords}
      />

      <div className="mx-6 mt-8 flex flex-wrap items-center border-y border-line py-1 sm:mx-0">
        <button
          type="button"
          onClick={handleToggleLike}
          aria-busy={isTogglingLike}
          aria-pressed={isLikedByViewer}
          className={cn(
            quietAction,
            "-ml-3",
            isLikedByViewer && "text-text-primary"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isLikedByViewer && "fill-current text-accent-primary"
            )}
            strokeWidth={1.5}
            aria-hidden
          />
          좋아요 <span className="tabular-nums">{totalLikes}</span>
        </button>

        <a href="#comments" className={quietAction}>
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          댓글 <span className="tabular-nums">{commentsCount}</span>
        </a>

        <button
          type="button"
          onClick={handleShare}
          className={cn(quietAction, "sm:ml-auto")}
        >
          <Link2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          링크 복사
        </button>

        <button
          type="button"
          onClick={handleShareStoryImage}
          disabled={isCreatingStoryImage}
          className={cn(quietAction, "sm:-mr-3")}
        >
          {isCreatingStoryImage ? (
            <Loader2
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              strokeWidth={1.5}
              aria-hidden
            />
          ) : (
            <ImageDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          )}
          스토리 이미지로 공유
        </button>
      </div>

      {user?.id !== dream.user_id && (
        <aside className="mx-6 mt-12 border-b border-line pb-12 text-center sm:mx-0">
          <p className="font-serif text-xl text-text-primary">
            어젯밤 꾼 꿈이 있나요?
          </p>
          <p className="mt-2 text-sm text-text-secondary break-keep">
            기억나는 장면 한 줄이면 이런 이야기가 돼요. 로그인 없이 바로 만들어
            볼 수 있어요.
          </p>
          <Link
            href="/dreams/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent-primary px-5 font-medium text-bg-primary transition-colors hover:bg-accent-primary/90"
          >
            내 꿈도 이야기로 만들기
          </Link>
        </aside>
      )}

      <section
        id="comments"
        aria-labelledby="comments-heading"
        className="mx-6 mt-12 scroll-mt-20 sm:mx-0"
      >
        <h2
          id="comments-heading"
          ref={commentsHeadingRef}
          tabIndex={-1}
          className="text-base font-medium text-text-primary focus:outline-none"
        >
          댓글{" "}
          <span className="tabular-nums text-text-secondary">
            {commentsCount}
          </span>
        </h2>

        {user ? (
          <form onSubmit={handleSubmitComment} className="mt-4">
            <label htmlFor="comment-input" className="sr-only">
              댓글
            </label>
            <textarea
              id="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="이 꿈을 읽고 떠오른 것을 남겨 보세요"
              className="w-full resize-none rounded-md border border-text-secondary/70 bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-text-primary placeholder:text-text-secondary"
              rows={3}
              maxLength={500}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs tabular-nums text-text-secondary">
                {commentText.length}/500
              </span>
              <button
                type="submit"
                aria-disabled={!commentText.trim() || isSubmittingComment || undefined}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm text-text-primary transition-colors hover:bg-line/40 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {isSubmittingComment ? "남기는 중…" : "남기기"}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-text-secondary break-keep">
            <Link
              href={loginPath(`/shared/${dream.id}`)}
              className="text-text-primary underline underline-offset-4"
            >
              로그인
            </Link>
            하면 감상을 남길 수 있어요.
          </p>
        )}

        {isLoadingComments ? (
          <p role="status" className="mt-6 text-sm text-text-secondary">
            댓글을 불러오고 있어요…
          </p>
        ) : comments.length === 0 ? (
          <p className="mt-6 text-sm text-text-secondary break-keep">
            아직 댓글이 없어요. 처음으로 감상을 남겨 보세요.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {comments.map((comment) => {
              const name = comment.display_name || "익명의 꿈꾸는자";
              const isMine = !!user && user.id === comment.user_id;
              const isEditing = editingCommentId === comment.id;

              return (
                <li key={comment.id} className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        userId={comment.user_id}
                        displayName={name}
                        size="md"
                        className="shrink-0"
                      />
                      <p className="min-w-0 text-sm">
                        <span className="font-medium text-text-primary">
                          {name}
                        </span>
                        <span className="ml-2 text-xs text-text-secondary">
                          <time dateTime={comment.created_at}>
                            {formatRelativeTime(comment.created_at)}
                          </time>
                          {comment.updated_at &&
                            comment.updated_at !== comment.created_at &&
                            " · 수정됨"}
                        </span>
                      </p>
                    </div>

                    {isMine && (
                      <div className="-my-2 -mr-3 flex shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={
                                !editingCommentText.trim() || isUpdatingComment
                              }
                              className={iconAction}
                              aria-label="수정 저장"
                            >
                              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isUpdatingComment}
                              className={iconAction}
                              aria-label="수정 취소"
                            >
                              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              id={commentEditButtonId(comment.id)}
                              onClick={() => handleEditComment(comment)}
                              className={iconAction}
                              aria-label="댓글 수정"
                            >
                              <Edit2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                deleteTriggerRef.current = event.currentTarget;
                                setPendingDeleteCommentId(comment.id);
                              }}
                              disabled={isDeletingComment === comment.id}
                              className={cn(iconAction, "hover:text-danger")}
                              aria-label="댓글 삭제"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 pl-11">
                      <textarea
                        aria-label="댓글 수정"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="w-full resize-none rounded-md border border-text-secondary/70 bg-transparent px-3 py-2 text-[15px] leading-relaxed text-text-primary"
                        rows={3}
                        maxLength={500}
                        autoFocus
                      />
                      <div className="mt-1 text-right text-xs tabular-nums text-text-secondary">
                        {editingCommentText.length}/500
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 pl-11 text-[15px] leading-relaxed text-text-primary whitespace-pre-line break-keep">
                      {comment.content}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AlertDialog
        open={pendingDeleteCommentId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingComment) setPendingDeleteCommentId(null);
        }}
      >
        <AlertDialogContent
          className="w-[calc(100%-2rem)] max-w-md rounded-lg border-line bg-bg-secondary"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // 지운 댓글의 버튼은 사라졌으므로 댓글 제목으로, 아니면 누른 삭제 버튼으로 돌아간다.
            if (deletedCommentRef.current) {
              deletedCommentRef.current = false;
              commentsHeadingRef.current?.focus();
            } else {
              deleteTriggerRef.current?.focus();
            }
          }}
        >
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="font-serif text-xl font-normal text-text-primary">
              이 댓글을 지울까요?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary break-keep">
              지운 댓글은 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <AlertDialogCancel className="mt-0 min-h-11 border-line bg-transparent text-text-primary hover:bg-line/40 hover:text-text-primary sm:mt-0">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={isDeletingComment !== null}
              className="min-h-11 border border-danger/40 bg-transparent text-danger hover:bg-danger/10"
            >
              {isDeletingComment ? "지우는 중…" : "지우기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
