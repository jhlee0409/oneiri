"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface UserAvatarProps {
  userId?: string;
  user?: User | null;
  size?: "sm" | "md" | "lg";
  displayName?: string;
  className?: string;
  fallbackUrl?: string; // 추가 fallback URL (예: Google OAuth)
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

export function UserAvatar({
  userId,
  user,
  size = "md",
  displayName,
  className,
  fallbackUrl,
}: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvatar = async () => {
      // userId나 user 중 하나는 있어야 함
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        // user_profiles에서 아바타 URL 가져오기
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("avatar_url")
          .eq("id", targetUserId)
          .single();

        if (!error && profile?.avatar_url) {
          // 1순위: 사용자가 업로드한 아바타
          setAvatarUrl(profile.avatar_url);
        } else if (user?.user_metadata?.avatar_url) {
          // 2순위: Google OAuth 아바타
          setAvatarUrl(user.user_metadata.avatar_url);
        } else if (fallbackUrl) {
          // 3순위: 제공된 fallback URL
          setAvatarUrl(fallbackUrl);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error("아바타 로드 오류:", error);
        // 에러 시 fallback 시도
        if (user?.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        } else if (fallbackUrl) {
          setAvatarUrl(fallbackUrl);
        } else {
          setAvatarUrl(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [userId, user?.id, user?.user_metadata?.avatar_url, fallbackUrl]);

  const getInitials = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return "🌙";
  };

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-gray-200 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <div className="animate-pulse bg-gray-300 w-full h-full rounded-full" />
      ) : avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={displayName || "프로필 이미지"}
          width={size === "sm" ? 24 : size === "md" ? 32 : 48}
          height={size === "sm" ? 24 : size === "md" ? 32 : 48}
          className="w-full h-full object-cover"
          onError={() => setAvatarUrl(null)} // 이미지 로드 실패 시 fallback
        />
      ) : displayName || user?.user_metadata?.full_name ? (
        <span
          className={cn(
            "font-medium text-gray-600",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg"
          )}
        >
          {getInitials()}
        </span>
      ) : (
        <UserIcon className={cn("text-gray-400", iconSizes[size])} />
      )}
    </div>
  );
}
