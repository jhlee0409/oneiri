"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDreamById } from "@/hooks/use-dream-api";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { EMOTION_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import { supabase } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { UserAvatar } from "@/components/ui/user-avatar";
import { findEmotion, findMood } from "@/lib/find";
import { getUserProfile, getUserProfiles } from "@/lib/user-profile-cache";

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

  const router = useRouter();
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

        // 🚀 최적화: 작성자 정보 로드 (캐싱 적용)
        if (dream.user_id) {
          const authorProfile = await getUserProfile(dream.user_id);
          setAuthorDisplayName(authorProfile.display_name);
        } else {
          setAuthorDisplayName("익명의 꿈꾸는자");
        }

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
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
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

      toast.success("댓글이 작성되었습니다.");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (!dream?.id) return;

    try {
      const shareUrl = `${window.location.origin}/shared/${dream.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었습니다!");
      trackEvent("share", { method: "copy_link", content_type: "dream" });
    } catch (error) {
      console.error("공유 링크 복사 실패:", error);
      toast.error("링크 복사에 실패했습니다.");
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
      toast.success("댓글이 수정되었습니다.");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      toast.error("댓글 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user || isDeletingComment || !dream?.id) return;

    const dreamId = dream.id; // 스코프 이슈 방지를 위해 미리 저장

    toast("이 댓글을 삭제하시겠습니까?", {
      description: "삭제된 댓글은 복구할 수 없습니다.",
      action: {
        label: "삭제",
        onClick: async () => {
          setIsDeletingComment(commentId);

          try {
            const { error } = await supabase
              .from("dream_comments")
              .delete()
              .eq("id", commentId)
              .eq("user_id", user.id);

            if (error) throw error;

            // 로컬 상태 업데이트
            setComments((prev) =>
              prev.filter((comment) => comment.id !== commentId)
            );
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

            toast.success("댓글이 삭제되었습니다.");
          } catch (error) {
            console.error("댓글 삭제 실패:", error);
            toast.error("댓글 삭제 중 오류가 발생했습니다.");
          } finally {
            setIsDeletingComment(null);
          }
        },
      },
      cancel: {
        label: "취소",
        onClick: () => console.log("댓글 삭제 취소됨"),
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
            요청하신 꿈 이야기가 존재하지 않거나 비공개 상태입니다.
          </p>
          <Link
            href="/shared"
            className="inline-flex items-center oneiri-accent hover:text-accent-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            공유된 꿈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 공개 상태가 아닌 경우
  if (!dream.is_public) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center py-24">
          <h2 className="text-xl font-medium oneiri-text-primary mb-4">
            비공개 꿈 이야기입니다
          </h2>
          <p className="oneiri-text-secondary mb-6">
            이 꿈 이야기는 작성자가 비공개로 설정했습니다.
          </p>
          <Link
            href="/shared"
            className="inline-flex items-center oneiri-accent hover:text-accent-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            공유된 꿈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oneiri-bg-primary">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 뒤로 가기 네비게이션 */}
        <nav className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-8 sm:mb-12 pb-4 sm:pb-6 border-b border-text-secondary/20">
          <Link
            href="/shared"
            className="inline-flex items-center oneiri-text-secondary hover:oneiri-accent transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            공유된 꿈으로 돌아가기
          </Link>
          <Link
            href="/"
            className="inline-flex items-center oneiri-text-secondary hover:oneiri-accent transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            새로운 꿈 조각 기록하기
          </Link>
        </nav>

        {/* 생성된 이미지 */}
        {dream.generated_image_url && (
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
        )}

        {/* 스토리 제목 */}
        <header className="mb-6 sm:mb-8">
          <h1 className="font-['Inter'] text-2xl sm:text-3xl md:text-4xl font-medium oneiri-text-primary leading-tight mb-3 sm:mb-4">
            {dream.generated_story_title || "무제"}
          </h1>

          {/* 꿈 메타데이터 */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm oneiri-text-secondary flex-wrap">
            {authorDisplayName && (
              <span className="flex items-center gap-2">
                <span className="text-lg">✍️</span>
                <span className="oneiri-text-primary font-medium leading line-clamp-1">
                  {authorDisplayName}
                </span>
              </span>
            )}
            {dream.dream_emotion && (
              <span className="flex items-center gap-2">
                <span className="text-lg">
                  {findEmotion(dream.dream_emotion)?.emoji ||
                    dream.dream_emotion}
                </span>
                <span>
                  {findEmotion(dream.dream_emotion)?.label ||
                    dream.dream_emotion}
                </span>
              </span>
            )}
            {dream.story_preference_mood && (
              <span className="px-3 py-1 oneiri-bg-secondary oneiri-text-primary rounded-full text-xs">
                {findMood(dream.story_preference_mood)?.label ||
                  dream.story_preference_mood}
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
              {dream.created_at && formatDate(dream.created_at)}
            </span>
          </div>
        </header>

        {/* 메인 스토리 콘텐츠 */}
        <main className="mb-8 sm:mb-12">
          <div className="prose prose-lg max-w-none">
            {dream.generated_story_content ? (
              dream.generated_story_content
                .split("\n\n")
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className="oneiri-text-primary leading-relaxed mb-4 sm:mb-6 last:mb-0 text-base sm:text-lg"
                  >
                    {paragraph}
                  </p>
                ))
            ) : (
              <p className="oneiri-text-secondary italic text-sm sm:text-base">
                아직 이야기가 생성되지 않았습니다.
              </p>
            )}
          </div>
        </main>

        {/* 원본 꿈 입력 */}
        <section className="oneiri-bg-secondary p-4 sm:p-6 mb-8 sm:mb-12 rounded-lg">
          <h2 className="font-['Inter'] text-base sm:text-lg font-medium oneiri-text-primary mb-3 flex items-center">
            <span className="text-lg sm:text-xl mr-2">💭</span>
            꿈꾸는 자가 속삭여준 꿈의 조각들
          </h2>
          <p className="oneiri-text-primary/80 leading-relaxed italic text-sm sm:text-base">
            "{dream.dream_input_text || "꿈의 내용이 없습니다."}"
          </p>
        </section>

        {/* 소셜 액션 버튼 */}
        <div className="flex items-center gap-3 sm:gap-6 py-4 sm:py-6 border-t border-b border-text-secondary/20 mb-8 sm:mb-12 text-sm sm:text-base">
          <button
            onClick={handleToggleLike}
            disabled={isTogglingLike}
            className={`flex items-center gap-2 transition-colors ${
              user
                ? isLiked
                  ? "text-oneiri-garnet"
                  : "oneiri-text-secondary hover:text-oneiri-garnet"
                : isGuestLiked
                ? "text-gray-600"
                : "oneiri-text-secondary hover:text-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Heart
              className={`w-5 h-5 ${
                user
                  ? isLiked
                    ? "fill-current"
                    : ""
                  : isGuestLiked
                  ? "fill-current"
                  : ""
              }`}
            />
            <span>{likesCount + guestLikesCount} 좋아요</span>
          </button>

          <div className="flex items-center gap-2 oneiri-text-secondary">
            <MessageCircle className="w-5 h-5" />
            <span>{commentsCount} 댓글</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 oneiri-text-secondary hover:oneiri-accent transition-colors ml-auto"
          >
            <Share2 className="w-5 h-5" />
            <span>공유하기</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <section className="mb-8 sm:mb-12">
          <h2 className="font-['Inter'] text-lg sm:text-xl font-medium oneiri-text-primary mb-4 sm:mb-6">
            댓글 {commentsCount}개
          </h2>

          {/* 댓글 작성 폼 - 로그인한 경우만 표시 */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="mb-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="이 꿈에 대한 생각을 공유해보세요..."
                  className="w-full px-4 py-3 oneiri-bg-secondary border border-text-secondary/20 focus:border-accent-primary focus:outline-none resize-none oneiri-text-primary placeholder-text-secondary rounded-lg"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-right text-xs oneiri-text-secondary mt-2">
                  {commentText.length}/500
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="oneiri-accent-bg hover:bg-accent-primary/90 disabled:bg-text-secondary disabled:cursor-not-allowed text-bg-primary font-['Inter'] font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-bg-primary border-t-transparent"></div>
                      작성중...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      댓글 작성
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 oneiri-bg-secondary rounded-lg border border-text-secondary/20">
              <p className="oneiri-text-secondary text-center">
                댓글을 작성하려면{" "}
                <Link
                  href="/login"
                  className="oneiri-accent hover:text-accent-primary/80 underline"
                >
                  로그인
                </Link>
                이 필요합니다.
              </p>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-6">
            {isLoadingComments ? (
              <div className="text-center py-12 oneiri-text-secondary">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-secondary border-t-accent-primary mx-auto mb-4"></div>
                <p>댓글을 불러오는 중...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 oneiri-text-secondary">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>아직 댓글이 없습니다.</p>
                <p className="text-sm mt-2">첫 번째 댓글을 남겨보세요!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-text-secondary/10 pb-6 last:border-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        userId={comment.user_id}
                        displayName={comment.display_name || "익명의 꿈꾸는자"}
                        size="sm"
                        className="w-8 h-8"
                      />
                      <div>
                        <span className="font-medium oneiri-text-primary text-sm">
                          {comment.display_name || "익명의 꿈꾸는자"}
                        </span>
                        <span className="oneiri-text-secondary text-xs ml-2">
                          {formatRelativeTime(comment.created_at)}
                          {comment.updated_at &&
                            comment.updated_at !== comment.created_at && (
                              <span className="text-oneiri-accent ml-1">
                                • 수정됨
                              </span>
                            )}
                        </span>
                      </div>
                    </div>

                    {/* 수정/삭제 버튼 - 본인 댓글만 표시 */}
                    {user && user.id === comment.user_id && (
                      <div className="flex items-center gap-2">
                        {editingCommentId === comment.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={
                                !editingCommentText.trim() || isUpdatingComment
                              }
                              className="p-1 oneiri-text-secondary hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="수정 완료"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isUpdatingComment}
                              className="p-1 oneiri-text-secondary hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="수정 취소"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="p-1 oneiri-text-secondary hover:oneiri-accent transition-colors"
                              title="댓글 수정"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={isDeletingComment === comment.id}
                              className="p-1 oneiri-text-secondary hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="댓글 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 댓글 내용 또는 수정 폼 */}
                  {editingCommentId === comment.id ? (
                    <div className="ml-11">
                      <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="w-full px-3 py-2 oneiri-bg-secondary border border-text-secondary/20 focus:border-accent-primary focus:outline-none resize-none oneiri-text-primary placeholder-text-secondary rounded-lg text-sm"
                        rows={3}
                        maxLength={500}
                        autoFocus
                      />
                      <div className="text-right text-xs oneiri-text-secondary mt-1">
                        {editingCommentText.length}/500
                      </div>
                    </div>
                  ) : (
                    <p className="oneiri-text-primary leading-relaxed ml-11">
                      {comment.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* 스토리 통계 */}
        <footer className="text-center text-sm oneiri-text-secondary border-t border-text-secondary/20 pt-8">
          <p>
            이야기 길이: {dream.generated_story_content?.length || 0}자 • 좋아요{" "}
            {likesCount + guestLikesCount}개 • 댓글 {commentsCount}개 • AI
            마법으로 생성됨
          </p>
        </footer>
      </div>
    </div>
  );
}
