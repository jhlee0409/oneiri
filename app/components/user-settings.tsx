"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertTriangle,
  User,
  Shield,
  LogOut,
  Info,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/supabase";

export default function UserSettings() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalConfirmText, setWithdrawalConfirmText] = useState("");
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (user) {
        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("프로필 로드 에러:", profileError);
        } else {
          setProfile(profileData);
          setDisplayName(profileData.display_name || "");
        }
      }
    } catch (error) {
      console.error("사용자 데이터 로드 오류:", error);
      toast.error("사용자 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, display_name: displayName.trim() });
      toast.success("프로필이 업데이트되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      toast.error("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleWithdrawal = async () => {
    if (withdrawalConfirmText !== "탈퇴합니다") {
      toast.error("확인 문구를 정확히 입력해주세요.");
      return;
    }

    setIsProcessingWithdrawal(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // 새로운 Edge Function을 직접 호출
      const response = await supabase.functions.invoke(
        "handle-user-withdrawal",
        {
          body: { confirmText: withdrawalConfirmText },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.error) {
        throw new Error(
          response.error.message || "탈퇴 처리 중 오류가 발생했습니다."
        );
      }

      const result = response.data;
      toast.success(result.message || "탈퇴 요청이 완료되었습니다.");

      // 추가 안내 메시지
      toast.info("30일 후 모든 데이터가 완전히 삭제됩니다.", {
        duration: 5000,
      });

      // 로그아웃 처리 및 메인 페이지로 이동
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("탈퇴 처리 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "탈퇴 처리 중 오류가 발생했습니다."
      );
    } finally {
      setIsProcessingWithdrawal(false);
      setShowWithdrawalModal(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("로그아웃되었습니다.");
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="oneiri-bg-secondary p-6 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 프로필 설정 섹션 */}
      <section className="oneiri-bg-secondary p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 oneiri-accent" />
          <h2 className="text-xl font-semibold oneiri-text-primary">
            프로필 정보
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium oneiri-text-primary mb-2">
              이메일
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 oneiri-text-secondary"
            />
            <p className="text-xs oneiri-text-secondary mt-1">
              이메일은 변경할 수 없습니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium oneiri-text-primary mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="표시될 닉네임을 입력하세요"
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-accent-primary focus:outline-none oneiri-bg-primary oneiri-text-primary"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile || !displayName.trim()}
            className="px-4 py-2 oneiri-accent-bg text-white rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingProfile ? "업데이트 중..." : "프로필 업데이트"}
          </button>
        </div>
      </section>

      {/* 계정 정보 섹션 */}
      <section className="oneiri-bg-secondary p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-5 h-5 oneiri-accent" />
          <h2 className="text-xl font-semibold oneiri-text-primary">
            계정 정보
          </h2>
        </div>

        <div className="space-y-3 text-sm oneiri-text-secondary">
          <div className="flex justify-between">
            <span>가입일:</span>
            <span>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("ko-KR")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>계정 상태:</span>
            <span className="text-green-600">활성</span>
          </div>
          <div className="flex justify-between">
            <span>마지막 업데이트:</span>
            <span>
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleDateString("ko-KR")
                : "-"}
            </span>
          </div>
        </div>
      </section>

      {/* 계정 관리 섹션 */}
      <section className="oneiri-bg-secondary p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 oneiri-accent" />
          <h2 className="text-xl font-semibold oneiri-text-primary">
            계정 관리
          </h2>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 oneiri-accent-bg text-white rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>

          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            회원 탈퇴
          </button>
        </div>
      </section>

      {/* 탈퇴 확인 모달 */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold oneiri-text-primary">
                회원 탈퇴 확인
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <p className="font-medium text-red-600">
                정말로 탈퇴하시겠습니까? 모든 데이터는 복구할 수 없습니다.
              </p>

              <div>
                <label className="block text-sm font-medium oneiri-text-primary mb-2">
                  '탈퇴합니다'를 입력하세요
                </label>
                <input
                  type="text"
                  value={withdrawalConfirmText}
                  onChange={(e) => setWithdrawalConfirmText(e.target.value)}
                  placeholder="탈퇴합니다"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none oneiri-bg-primary oneiri-text-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawalModal(false);
                  setWithdrawalConfirmText("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={
                  withdrawalConfirmText !== "탈퇴합니다" ||
                  isProcessingWithdrawal
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingWithdrawal ? "처리 중..." : "탈퇴 완료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
