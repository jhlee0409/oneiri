import { supabase } from "@/utils/supabase/client";
import {
  DreamRequest,
  DreamResponse,
  UserAnalytics,
  DreamRecord,
  DreamsListResponse,
  APIResponse,
} from "@/types/supabase";

/**
 * AI 꿈 스토리 생성 API 호출
 */
export async function generateDreamStory(
  dreamData: DreamRequest
): Promise<APIResponse<DreamResponse>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-dream-story`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dreamData),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "스토리 생성에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Dream story generation failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}

/**
 * 사용자의 꿈 목록 조회
 */
export async function getUserDreams(
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
): Promise<APIResponse<DreamsListResponse>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const searchParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-dreams?${searchParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "꿈 목록 조회에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Get user dreams failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}

/**
 * 특정 꿈 상세 정보 조회
 */
export async function getDreamById(
  dreamId: string
): Promise<APIResponse<DreamRecord>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-dreams?id=${dreamId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "꿈 정보 조회에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Get dream by id failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}

/**
 * 꿈 정보 업데이트 (즐겨찾기, 공개여부 등)
 */
export async function updateDream(
  dreamId: string,
  updates: {
    is_favorite?: boolean;
    is_public?: boolean;
    dream_keywords?: string[];
    dream_emotion?: string;
    dream_characters?: string[];
    dream_objects?: string[];
  }
): Promise<APIResponse<DreamRecord>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-dreams?id=${dreamId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "꿈 정보 업데이트에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Update dream failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}

/**
 * 꿈 삭제
 */
export async function deleteDream(
  dreamId: string
): Promise<APIResponse<{ message: string }>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-dreams?id=${dreamId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "꿈 삭제에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Delete dream failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}

/**
 * 사용자 분석 데이터 조회
 */
export async function getUserAnalytics(): Promise<APIResponse<UserAnalytics>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-analytics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "분석 데이터 조회에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Get user analytics failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}

/**
 * 태그 목록 조회
 */
export async function getTags(): Promise<
  APIResponse<
    Array<{ id: string; name: string; category: string; color: string }>
  >
> {
  try {
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name, category, color")
      .order("category")
      .order("name");

    if (error) {
      throw error;
    }

    // null 값들을 기본값으로 변환
    const formattedTags =
      tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        category: tag.category || "general",
        color: tag.color || "#6B7280",
      })) || [];

    return {
      success: true,
      data: formattedTags,
    };
  } catch (error) {
    console.error("Get tags failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "태그 조회에 실패했습니다",
    };
  }
}

/**
 * 인기 태그 조회
 */
export async function getPopularTags(
  limit = 10
): Promise<APIResponse<Array<{ name: string; count: number }>>> {
  try {
    const { data: tags, error } = await supabase.rpc("get_popular_tags", {
      limit_count: limit,
    });

    if (error) {
      throw error;
    }

    // 함수 반환값을 올바른 형식으로 변환
    const formattedTags =
      (tags ?? []).map((tag: { tag_name: string; usage_count: number }) => ({
        name: tag.tag_name,
        count: tag.usage_count,
      })) || [];

    return {
      success: true,
      data: formattedTags,
    };
  } catch (error) {
    console.error("Get popular tags failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "인기 태그 조회에 실패했습니다",
    };
  }
}
