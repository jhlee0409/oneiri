// 전역 user-profile 캐시 관리
interface UserProfileCache {
  display_name: string;
  avatar_url: string | null;
  cached_at: number;
}

// 메모리 캐시 (5분 TTL)
const profileCache = new Map<string, UserProfileCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// 진행 중인 요청들을 추적 (중복 요청 방지)
const pendingRequests = new Map<string, Promise<UserProfileCache>>();

/**
 * 사용자 프로필 정보를 캐시와 함께 가져오기
 * 같은 user_id에 대해서는 중복 요청하지 않음
 */
export async function getUserProfile(userId: string): Promise<{
  display_name: string;
  avatar_url: string | null;
}> {
  // 1. 캐시 확인
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.cached_at < CACHE_TTL) {
    return {
      display_name: cached.display_name,
      avatar_url: cached.avatar_url,
    };
  }

  // 2. 진행 중인 요청 확인 (중복 요청 방지)
  if (pendingRequests.has(userId)) {
    const result = await pendingRequests.get(userId)!;
    return {
      display_name: result.display_name,
      avatar_url: result.avatar_url,
    };
  }

  // 3. 새로운 요청 생성
  const requestPromise = fetchUserProfile(userId);
  pendingRequests.set(userId, requestPromise);

  try {
    const result = await requestPromise;
    return {
      display_name: result.display_name,
      avatar_url: result.avatar_url,
    };
  } finally {
    // 요청 완료 후 pending에서 제거
    pendingRequests.delete(userId);
  }
}

/**
 * 실제 API 호출 함수
 */
async function fetchUserProfile(userId: string): Promise<UserProfileCache> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-user-profile?user_id=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    let display_name = "익명의 꿈꾸는자";
    let avatar_url: string | null = null;

    if (response.ok) {
      const data = await response.json();
      display_name = data.display_name || "익명의 꿈꾸는자";
      avatar_url = data.avatar_url || null;
    }

    const cacheEntry: UserProfileCache = {
      display_name,
      avatar_url,
      cached_at: Date.now(),
    };

    // 캐시에 저장
    profileCache.set(userId, cacheEntry);
    return cacheEntry;
  } catch (error) {
    console.error(`사용자 ${userId} 프로필 로드 실패:`, error);

    const fallbackEntry: UserProfileCache = {
      display_name: "익명의 꿈꾸는자",
      avatar_url: null,
      cached_at: Date.now(),
    };

    profileCache.set(userId, fallbackEntry);
    return fallbackEntry;
  }
}

/**
 * 여러 user_id에 대해 한 번에 프로필 정보 가져오기
 */
export async function getUserProfiles(userIds: string[]): Promise<
  Record<
    string,
    {
      display_name: string;
      avatar_url: string | null;
    }
  >
> {
  const results: Record<
    string,
    { display_name: string; avatar_url: string | null }
  > = {};

  // 병렬로 모든 프로필 가져오기 (캐시 활용)
  await Promise.all(
    userIds.map(async (userId) => {
      const profile = await getUserProfile(userId);
      results[userId] = profile;
    })
  );

  return results;
}

/**
 * 캐시 무효화 (프로필 업데이트 시 사용)
 */
export function invalidateUserProfile(userId: string) {
  profileCache.delete(userId);
  pendingRequests.delete(userId);
}

/**
 * 전체 캐시 클리어
 */
export function clearProfileCache() {
  profileCache.clear();
  pendingRequests.clear();
}
