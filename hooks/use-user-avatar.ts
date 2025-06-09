import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UseUserAvatarReturn {
  avatarUrl: string | null;
  displayName: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * 사용자 아바타 URL을 관리하는 훅
 * 1. user_profiles.avatar_url이 있으면 우선 사용
 * 2. 없으면 user_metadata.avatar_url을 fallback으로 사용
 * 3. 둘 다 없으면 null 반환
 */
export function useUserAvatar(user: User | null): UseUserAvatarReturn {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserAvatar = async () => {
    if (!user) {
      setAvatarUrl(null);
      setDisplayName(null);
      return;
    }

    setLoading(true);
    try {
      // user_profiles에서 아바타와 닉네임 가져오기
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("avatar_url, display_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("프로필 로드 에러:", error);
      }

      // 아바타 URL 결정 로직
      let finalAvatarUrl: string | null = null;

      if (profile?.avatar_url) {
        // 1순위: 사용자가 업로드한 아바타
        finalAvatarUrl = profile.avatar_url;
      } else if (user.user_metadata?.avatar_url) {
        // 2순위: Google OAuth 아바타 (fallback)
        finalAvatarUrl = user.user_metadata.avatar_url;
      }

      setAvatarUrl(finalAvatarUrl);
      setDisplayName(
        profile?.display_name || user.user_metadata?.full_name || null
      );
    } catch (error) {
      console.error("아바타 로드 오류:", error);
      // 에러 시에도 Google 아바타는 시도
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      setDisplayName(user.user_metadata?.full_name || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAvatar();
  }, [user?.id]); // user.id가 변경될 때만 재실행

  return {
    avatarUrl,
    displayName,
    loading,
    refetch: loadUserAvatar,
  };
}
