import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateDreamStory,
  getUserDreams,
  getDreamById,
  updateDream,
  deleteDream,
  getUserAnalytics,
  getTags,
  getPopularTags,
  getDailyWeavingStatus,
  DailyWeavingStatus,
} from "@/lib/api";
import {
  DreamRequest,
  DreamRecord,
  DreamsListResponse,
  APIResponse,
} from "@/types/supabase";

/**
 * 🌙 일일 꿈 생성 상태 조회 Hook
 */
export function useDailyWeavingStatus() {
  return useQuery<
    APIResponse<DailyWeavingStatus>,
    Error,
    DailyWeavingStatus | null
  >({
    queryKey: ["daily-weaving-status"],
    queryFn: getDailyWeavingStatus,
    select: (response) => {
      if (!response.success || !response.data) {
        console.warn("Daily weaving status API failed:", response.error);
        // Fallback 데이터 제공 (KST 기준 다음 자정까지의 정확한 시간 계산)
        const now = new Date();
        const kstOffset = 9 * 60; // UTC+9 (분 단위)
        const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);

        const tomorrow = new Date(kstTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // KST 기준 다음 자정으로 설정

        const msUntilReset = tomorrow.getTime() - kstTime.getTime();
        const hoursUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60));

        return {
          weaving_status: {
            current_count: 0,
            daily_limit: 2,
            remaining: 2,
            has_reached_limit: false,
            next_reset: tomorrow.toISOString(),
            hours_until_reset: hoursUntilReset,
          },
          oneiri_message: {
            title: "오늘의 꿈 이야기를 기다리고 있어요",
            content: "어떤 꿈의 조각들이 당신을 찾아왔나요?",
            encouragement:
              "가장 사소한 조각이 가장 특별한 이야기가 되기도 해요. ✨",
          },
          todays_dreams: [],
          total_dreams: 0,
          next_action: "create_dream" as const,
        };
      }
      return response.data;
    },
    staleTime: (query) => {
      // KST 기준 자정 근처(23:30-00:30)에는 짧은 캐싱, 평소에는 긴 캐싱
      const now = new Date();
      const kstOffset = 9 * 60; // UTC+9 (분 단위)
      const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);
      const currentHour = kstTime.getHours();
      const currentMinute = kstTime.getMinutes();

      // KST 23:30~00:30 구간에는 1분 캐싱
      if (
        (currentHour === 23 && currentMinute >= 30) ||
        (currentHour === 0 && currentMinute <= 30)
      ) {
        return 1 * 60 * 1000; // 1분
      }

      // 평상시에는 10분 캐싱
      return 10 * 60 * 1000;
    },
    refetchOnWindowFocus: false, // 포커스 시 재요청 비활성화
    retry: 3, // 3번 재시도
    retryDelay: 1000, // 1초 간격
  });
}

/**
 * 꿈 스토리 생성 Hook (제한 로직 포함)
 */
export function useGenerateDreamStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateDreamStory,
    onSuccess: (response) => {
      if (response.success) {
        // 성공적인 꿈 생성 완료
        const remainingCount = response.data?.weaving_status?.remaining || 0;

        if (remainingCount > 0) {
          toast.success(
            `✨ 새로운 꿈 이야기가 당신의 서재에 담겼습니다! 오늘 ${remainingCount}편을 더 엮어낼 수 있어요.`
          );
        } else {
          toast.success(
            "✨ 오늘의 마지막 꿈 이야기가 완성되었어요! 내일 밤, 다시 별빛과 함께 찾아뵐게요. 🌙"
          );
        }

        // 관련 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["user-dreams"] });
        queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
        queryClient.invalidateQueries({ queryKey: ["daily-weaving-status"] });
      } else if (response.errorCode === "daily_weaving_limit_reached") {
        // 일일 제한 도달 시 감성의 메시지 표시
        const oneiriMsg = response.oneiriMessage;
        if (oneiriMsg) {
          toast.error(oneiriMsg.title, {
            description: oneiriMsg.content,
            duration: 6000,
            action: {
              label: "내 꿈 서재 둘러보기",
              onClick: () => {
                window.location.href = "/library/dreams";
              },
            },
          });
        } else {
          toast.error(
            "오늘의 꿈 이야기는 모두 서재에 담겼습니다. 내일 밤 다시 만나요! 🌙"
          );
        }
      } else {
        toast.error(response.error || "스토리 생성에 실패했습니다.");
      }
    },
    onError: (error) => {
      console.error("Dream generation error:", error);
      toast.error("네트워크 오류가 발생했습니다.");
    },
  });
}

/**
 * 사용자 꿈 목록 조회 Hook
 * @returns DreamsListResponse | null
 */
export function useUserDreams(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    emotion?: string;
    genre?: string;
    favorite?: boolean;
    sort?: string;
    order?: "asc" | "desc";
  } = {}
) {
  return useQuery<
    APIResponse<DreamsListResponse>,
    Error,
    DreamsListResponse | null
  >({
    queryKey: ["user-dreams", options],
    queryFn: () => getUserDreams(options),
    select: (response) =>
      response.success && response.data ? response.data : null,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 특정 꿈 상세 정보 조회 Hook
 */
export function useDreamById(dreamId: string | null) {
  return useQuery({
    queryKey: ["dream", dreamId],
    queryFn: () => (dreamId ? getDreamById(dreamId) : null),
    enabled: !!dreamId,
    select: (response) => (response?.success ? response.data : null),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 꿈 업데이트 Hook
 */
export function useUpdateDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dreamId,
      updates,
    }: {
      dreamId: string;
      updates: {
        is_favorite?: boolean;
        is_public?: boolean;
        dream_keywords?: string[];
        dream_emotion?: string;
        dream_characters?: string[];
        dream_objects?: string[];
      };
    }) => updateDream(dreamId, updates),
    onSuccess: (response, { dreamId }) => {
      if (response.success) {
        toast.success("꿈 정보가 업데이트되었습니다.");
        // 관련 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["user-dreams"] });
        queryClient.invalidateQueries({ queryKey: ["dream", dreamId] });
        queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
      } else {
        toast.error(response.error || "업데이트에 실패했습니다.");
      }
    },
    onError: (error) => {
      console.error("Dream update error:", error);
      toast.error("업데이트 중 오류가 발생했습니다.");
    },
  });
}

/**
 * 꿈 삭제 Hook
 */
export function useDeleteDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDream,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("꿈이 삭제되었습니다.");
        // 관련 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["user-dreams"] });
        queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
      } else {
        toast.error(response.error || "삭제에 실패했습니다.");
      }
    },
    onError: (error) => {
      console.error("Dream delete error:", error);
      toast.error("삭제 중 오류가 발생했습니다.");
    },
  });
}

/**
 * 사용자 분석 데이터 Hook
 */
export function useUserAnalytics() {
  return useQuery({
    queryKey: ["user-analytics"],
    queryFn: getUserAnalytics,
    select: (response) => (response.success ? response.data : null),
    staleTime: 30 * 60 * 1000, // 30분
  });
}

/**
 * 태그 목록 조회 Hook
 */
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    select: (response) => (response.success ? response.data : []),
    staleTime: 60 * 60 * 1000, // 1시간
  });
}

/**
 * 인기 태그 조회 Hook
 */
export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: ["popular-tags", limit],
    queryFn: () => getPopularTags(limit),
    select: (response) => (response.success ? response.data : []),
    staleTime: 30 * 60 * 1000, // 30분
  });
}

/**
 * 꿈 생성 폼 상태 관리 Hook
 */
export function useDreamForm() {
  const [formData, setFormData] = useState<DreamRequest>({
    dream_input_text: "",
    dream_keywords: [],
    dream_emotion: "",
    dream_characters: [],
    dream_objects: [],
    story_preference_genre: "",
    story_preference_length: "",
    story_preference_mood: "",
  });

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (updates: Partial<DreamRequest>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      dream_input_text: "",
      dream_keywords: [],
      dream_emotion: "",
      dream_characters: [],
      dream_objects: [],
      story_preference_genre: "",
      story_preference_length: "",
      story_preference_mood: "",
    });
    setStep(1);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return {
    formData,
    step,
    isLoading,
    setIsLoading,
    updateFormData,
    resetForm,
    nextStep,
    prevStep,
  };
}

/**
 * 즐겨찾기 토글 Hook
 */
export function useFavoriteToggle() {
  const updateDreamMutation = useUpdateDream();

  const toggleFavorite = (dreamId: string, currentFavorite: boolean) => {
    updateDreamMutation.mutate({
      dreamId,
      updates: { is_favorite: !currentFavorite },
    });
  };

  return {
    toggleFavorite,
    isLoading: updateDreamMutation.isPending,
  };
}

/**
 * 공개/비공개 토글 Hook
 */
export function usePublicToggle() {
  const updateDreamMutation = useUpdateDream();

  const togglePublic = (dreamId: string, currentPublic: boolean) => {
    updateDreamMutation.mutate({
      dreamId,
      updates: { is_public: !currentPublic },
    });
  };

  return {
    togglePublic,
    isLoading: updateDreamMutation.isPending,
  };
}

/**
 * 꿈 이미지 생성 Hook
 */
export function useGenerateDreamImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dreamId,
      imagePrompt,
    }: {
      dreamId: string;
      imagePrompt: string;
    }) => {
      const { supabase } = await import("@/utils/supabase/client");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-dream-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            dreamId,
            imagePrompt,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate image");
      }

      return await response.json();
    },
    onSuccess: (response, { dreamId }) => {
      if (response.success) {
        toast.success("✨ 꿈의 이미지가 성공적으로 생성되었습니다!");
        // 관련 캐시 무효화하여 UI 자동 업데이트
        queryClient.invalidateQueries({ queryKey: ["dream", dreamId] });
        queryClient.invalidateQueries({ queryKey: ["user-dreams"] });
      } else {
        toast.error(response.error || "이미지 생성에 실패했습니다.");
      }
    },
    onError: (error) => {
      console.error("Image generation error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "이미지 생성 중 오류가 발생했습니다."
      );
    },
  });
}
