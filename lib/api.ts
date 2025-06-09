import { supabase } from "@/utils/supabase/client";
import {
  DreamRequest,
  DreamResponse,
  UserAnalytics,
  DreamRecord,
  DreamsListResponse,
  APIResponse,
} from "@/types/supabase";

// 일일 꿈 생성 상태 타입 정의
export interface DailyWeavingStatus {
  weaving_status: {
    current_count: number;
    daily_limit: number;
    remaining: number;
    has_reached_limit: boolean;
    next_reset: string;
    hours_until_reset: number;
  };
  oneiri_message: {
    title: string;
    content: string;
    encouragement?: string;
    hours_until_reset?: number;
  };
  todays_dreams: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  total_dreams: number;
  next_action: "visit_library" | "create_final_dream" | "create_dream";
}

/**
 * 🌙 일일 꿈 생성 상태 조회
 */
export async function getDailyWeavingStatus(): Promise<
  APIResponse<DailyWeavingStatus>
> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("로그인이 필요합니다");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-daily-weaving-status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "꿈 생성 상태 조회에 실패했습니다");
    }

    return result;
  } catch (error) {
    console.error("Get daily weaving status failed:", error);
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
 * AI 꿈 스토리 생성 API 호출 (제한 로직 포함)
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

    // 429 상태 코드 (일일 제한 초과) 특별 처리
    if (response.status === 429) {
      return {
        success: false,
        error: result.error || "일일 꿈 생성 제한에 도달했습니다",
        errorCode: "daily_weaving_limit_reached",
        oneiriMessage: result.oneiri_message,
        weavingStatus: result.weaving_status,
      };
    }

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
 * 특정 꿈 상세 정보 조회 (공개 꿈도 게스트가 접근 가능)
 */
export async function getDreamById(
  dreamId: string
): Promise<APIResponse<DreamRecord>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 로그인된 사용자는 기존 방식으로 처리 (본인 꿈 포함)
    if (session) {
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
    }

    // 게스트 사용자는 공개 꿈만 조회 가능
    const { data: dream, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", dreamId)
      .eq("is_public", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("공개된 꿈을 찾을 수 없습니다");
      }
      throw new Error("꿈 정보 조회에 실패했습니다");
    }

    return {
      success: true,
      data: dream,
    };
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

/**
 * 공개된 꿈들 조회 (페이지네이션 지원)
 */
export async function getPublicDreams(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    emotion?: string;
    genre?: string;
    sort?: string;
    order?: "asc" | "desc";
  } = {}
): Promise<APIResponse<DreamsListResponse>> {
  try {
    const { page = 1, limit = 12, ...filters } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("dreams")
      .select("*")
      .eq("is_public", true)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // 필터 적용
    if (filters.search) {
      query = query.or(
        `generated_story_title.ilike.%${filters.search}%,generated_story_content.ilike.%${filters.search}%,dream_input_text.ilike.%${filters.search}%`
      );
    }

    if (filters.emotion) {
      query = query.eq("dream_emotion", filters.emotion);
    }

    if (filters.genre) {
      query = query.eq("story_preference_genre", filters.genre);
    }

    const { data: dreams, error, count } = await query;

    if (error) {
      throw error;
    }

    // 각 꿈의 작성자 display_name과 총 좋아요 수 (일반 + 게스트) 계산
    const dreamsWithEnhancedData = await Promise.all(
      (dreams || []).map(async (dream) => {
        try {
          // 작성자 이름 가져오기
          const nameResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-user-display-name?user_id=${dream.user_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          let userDisplayName = "익명의 꿈꾸는자";
          if (nameResponse.ok) {
            const nameData = await nameResponse.json();
            userDisplayName = nameData.display_name || "익명의 꿈꾸는자";
          }

          // 게스트 좋아요 수 가져오기
          const { count: guestLikesCount } = await supabase
            .from("guest_likes")
            .select("*", { count: "exact", head: true })
            .eq("dream_id", dream.id);

          // 총 좋아요 수 계산 (일반 좋아요 + 게스트 좋아요)
          const totalLikes = (dream.likes_count || 0) + (guestLikesCount || 0);

          return {
            ...dream,
            user_display_name: userDisplayName,
            total_likes_count: totalLikes,
          };
        } catch (error) {
          console.error(`꿈 ${dream.id} 데이터 로드 실패:`, error);
          return {
            ...dream,
            user_display_name: "익명의 꿈꾸는자",
            total_likes_count: dream.likes_count || 0,
          };
        }
      })
    );

    // 전체 공개 꿈 개수 조회 (필터 적용된 상태)
    let countQuery = supabase
      .from("dreams")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true);

    if (filters.search) {
      countQuery = countQuery.or(
        `generated_story_title.ilike.%${filters.search}%,generated_story_content.ilike.%${filters.search}%,dream_input_text.ilike.%${filters.search}%`
      );
    }

    if (filters.emotion) {
      countQuery = countQuery.eq("dream_emotion", filters.emotion);
    }

    if (filters.genre) {
      countQuery = countQuery.eq("story_preference_genre", filters.genre);
    }

    const { count: totalCount } = await countQuery;

    return {
      success: true,
      data: {
        dreams: dreamsWithEnhancedData,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get public dreams failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
}
