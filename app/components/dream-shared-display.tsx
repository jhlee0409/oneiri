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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDreamById } from "@/hooks/use-dream-api";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { EMOTION_OPTIONS, MOOD_OPTIONS } from "@/lib/constants";
import { supabase } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

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

        // 좋아요 수 로드 - dreams 테이블에서 직접 가져오기
        const { data: dreamData } = await supabase
          .from("dreams")
          .select("likes_count, comments_count")
          .eq("id", dream.id)
          .single();

        if (dreamData) {
          setLikesCount(dreamData.likes_count || 0);
          setCommentsCount(dreamData.comments_count || 0);
        }

        // 게스트 좋아요 수 로드
        const { count: guestLikesCountData } = await supabase
          .from("guest_likes")
          .select("*", { count: "exact", head: true })
          .eq("dream_id", dream.id);

        setGuestLikesCount(guestLikesCountData || 0);

        // 작성자 정보 로드 - Edge Function 사용 (게스트도 접근 가능)
        try {
          const response = await fetch(
            `https://tfcwgjimdnzitgjvuwoe.supabase.co/functions/v1/get-user-display-name?user_id=${dream.user_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setAuthorDisplayName(data.display_name || "익명의 꿈꾸는자");
          } else {
            console.error("작성자 정보 로드 실패:", response.status);
            setAuthorDisplayName("익명의 꿈꾸는자");
          }
        } catch (error) {
          console.error("작성자 정보 로드 실패:", error);
          setAuthorDisplayName("익명의 꿈꾸는자");
        }

        // 댓글 로드 (display_name이 이미 저장되어 있음)
        const { data: commentsData, error: commentsError } = await supabase
          .from("dream_comments")
          .select("id, content, created_at, updated_at, user_id, display_name")
          .eq("dream_id", dream.id)
          .order("created_at", { ascending: true });

        if (commentsError) {
          console.error("댓글 로드 실패:", commentsError);
        } else if (commentsData) {
          setComments(commentsData);
        }
      } catch (error) {
        console.error("소셜 데이터 로드 실패:", error);
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

    setIsSubmittingComment(true);

    try {
      // Edge Function을 사용해 사용자의 display_name 가져오기
      const response = await fetch(
        `https://tfcwgjimdnzitgjvuwoe.supabase.co/functions/v1/get-user-display-name?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let displayName = "꿈꾸는자";
      if (response.ok) {
        const data = await response.json();
        displayName = data.display_name || "꿈꾸는자";
      } else {
        console.error("사용자 정보 로드 실패:", response.status);
      }

      // 댓글과 display_name 함께 저장
      const { data, error } = await supabase
        .from("dream_comments")
        .insert({
          dream_id: dream.id,
          user_id: user.id,
          content: commentText.trim(),
          display_name: displayName,
        })
        .select("id, content, created_at, updated_at, user_id, display_name")
        .single();

      if (error) throw error;

      setComments((prev) => [...prev, data]);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
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
    if (!user || isDeletingComment) return;

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
        <nav className="flex gap-6 mb-12 pb-6 border-b border-text-secondary/20">
          <Link
            href="/shared"
            className="inline-flex items-center oneiri-text-secondary hover:oneiri-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            공유된 꿈으로 돌아가기
          </Link>
          <Link
            href="/"
            className="inline-flex items-center oneiri-text-secondary hover:oneiri-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            새로운 꿈 조각 기록하기
          </Link>
        </nav>

        {/* 생성된 이미지 */}
        {dream.generated_image_url && (
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
        )}

        {/* 스토리 제목 */}
        <header className="mb-8">
          <h1 className="font-['Inter'] text-3xl md:text-4xl font-medium oneiri-text-primary leading-tight mb-4">
            {dream.generated_story_title || "무제"}
          </h1>

          {/* 꿈 메타데이터 */}
          <div className="flex items-center gap-6 text-sm oneiri-text-secondary flex-wrap">
            {authorDisplayName && (
              <span className="flex items-center gap-2">
                <span className="text-lg">✍️</span>
                <span className="oneiri-text-primary font-medium">
                  {authorDisplayName}
                </span>
              </span>
            )}
            {dream.dream_emotion && (
              <span className="flex items-center gap-2">
                <span className="text-lg">
                  {EMOTION_OPTIONS.find(
                    (emotion) => emotion.emoji === dream.dream_emotion
                  )?.emoji || dream.dream_emotion}
                </span>
                <span>
                  {
                    EMOTION_OPTIONS.find(
                      (emotion) => emotion.emoji === dream.dream_emotion
                    )?.label
                  }
                </span>
              </span>
            )}
            {dream.story_preference_mood && (
              <span className="px-3 py-1 oneiri-bg-secondary oneiri-text-primary rounded-full text-xs">
                {MOOD_OPTIONS.find(
                  (mood) => mood.value === dream.story_preference_mood
                )?.label || dream.story_preference_mood}
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
            꿈꾸는 자가 속삭여준 꿈의 조각들
          </h2>
          <p className="oneiri-text-primary/80 leading-relaxed italic">
            "{dream.dream_input_text || "꿈의 내용이 없습니다."}"
          </p>
        </section>

        {/* 소셜 액션 버튼 */}
        <div className="flex items-center gap-6 py-6 border-t border-b border-text-secondary/20 mb-12">
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
            <span>
              {likesCount + guestLikesCount} 좋아요
              {!user && (isGuestLiked ? " ♡" : "")}
              {user && (isLiked ? " ♥" : "")}
            </span>
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
        <section className="mb-12">
          <h2 className="font-['Inter'] text-xl font-medium oneiri-text-primary mb-6">
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
                  href="/auth/signin"
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
            {comments.length === 0 ? (
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
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 oneiri-bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-sm oneiri-text-primary font-medium">
                          {comment.display_name?.charAt(0) || "🌙"}
                        </span>
                      </div>
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
                    <div className="ml-10">
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
                    <p className="oneiri-text-primary leading-relaxed ml-10">
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
