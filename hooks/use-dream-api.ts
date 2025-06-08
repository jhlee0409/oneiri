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
} from "@/lib/api";
import {
  DreamRequest,
  DreamRecord,
  DreamsListResponse,
  APIResponse,
} from "@/types/supabase";

/**
 * 꿈 스토리 생성 Hook
 */
export function useGenerateDreamStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateDreamStory,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("꿈 이야기가 성공적으로 생성되었습니다! ✨");
        // 사용자 꿈 목록 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["user-dreams"] });
        queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
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
    story_preference_genre: "mysterious",
    story_preference_length: "medium",
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
      story_preference_genre: "mysterious",
      story_preference_length: "medium",
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
