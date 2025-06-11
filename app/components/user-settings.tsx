"use client";

import { useState, useEffect, useRef } from "react";
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
  Camera,
  Upload,
  X,
  RotateCcw,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/supabase";
import { useUserAvatar } from "@/hooks/use-user-avatar";
import Image from "next/image";

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

  // 아바타 관련 상태
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // 아바타 훅 사용
  const { avatarUrl, refetch: refetchAvatar } = useUserAvatar(user);

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

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setAvatarFile(file);
    setShouldDeleteAvatar(false); // 새 파일 선택 시 삭제 플래그 해제

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarDelete = () => {
    // 즉시 삭제하지 않고 플래그만 설정
    setShouldDeleteAvatar(true);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelAvatarChanges = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setShouldDeleteAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 통합된 프로필 저장 함수
  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsUpdatingProfile(true);
    try {
      let newAvatarUrl = profile.avatar_url;

      // 1. 아바타 삭제 처리
      if (shouldDeleteAvatar && profile.avatar_url) {
        const avatarPath = profile.avatar_url.split("/").pop();
        if (avatarPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${avatarPath}`]);
        }
        newAvatarUrl = null;
      }

      // 2. 새 아바타 업로드 처리
      if (avatarFile) {
        // 기존 아바타 삭제 (있는 경우)
        if (profile.avatar_url && !shouldDeleteAvatar) {
          const oldAvatarPath = profile.avatar_url.split("/").pop();
          if (oldAvatarPath) {
            await supabase.storage
              .from("avatars")
              .remove([`${user.id}/${oldAvatarPath}`]);
          }
        }

        // 새 아바타 업로드
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        // 공개 URL 생성
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        newAvatarUrl = urlData.publicUrl;
      }

      // 3. 프로필 업데이트 (닉네임 + 아바타 URL)
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName.trim(),
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 4. 로컬 상태 업데이트
      setProfile({
        ...profile,
        display_name: displayName.trim(),
        avatar_url: newAvatarUrl,
      });

      // 5. 임시 상태들 초기화
      setAvatarFile(null);
      setAvatarPreview(null);
      setShouldDeleteAvatar(false);

      // 6. 아바타 훅 새로고침
      await refetchAvatar();

      toast.success("프로필이 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      toast.error("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 변경사항 감지
  const hasChanges = () => {
    // 프로필이 로드되지 않았으면 변경사항 없음
    if (!profile || loading) return false;

    const nameChanged = displayName.trim() !== (profile.display_name || "");
    const avatarChanged = avatarFile !== null || shouldDeleteAvatar;
    return nameChanged || avatarChanged;
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
    <div className="space-y-6 sm:space-y-8">
      {/* 프로필 설정 섹션 */}
      <section className="oneiri-bg-secondary p-4 sm:p-6 rounded-lg">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <User className="w-4 h-4 sm:w-5 sm:h-5 oneiri-accent" />
          <h2 className="text-lg sm:text-xl font-semibold oneiri-text-primary">
            프로필 정보
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* 아바타 섹션 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium oneiri-text-primary mb-2 sm:mb-3">
              프로필 이미지
            </label>

            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {/* 프로필 이미지 미리보기 */}
              <div className="relative group mx-auto sm:mx-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200 cursor-pointer transition-all duration-200 group-hover:border-accent-primary">
                  {shouldDeleteAvatar ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                  ) : avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="미리보기"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="프로필 이미지"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}

                  {/* 호버 오버레이 - 이미지 선택 */}
                  <div
                    className="absolute rounded-full inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* 변경사항 취소 버튼 (우측 상단 X) */}
                {(avatarPreview || shouldDeleteAvatar) && (
                  <button
                    onClick={cancelAvatarChanges}
                    disabled={isUpdatingProfile}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    title="변경사항 취소"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm oneiri-text-primary">
                  <p className="font-medium">프로필 이미지</p>
                  <p className="text-xs oneiri-text-secondary mt-1">
                    이미지를 클릭하여 변경하세요
                  </p>
                </div>

                {/* 아바타 삭제 버튼 (기존 아바타가 있을 때만) */}
                {profile?.avatar_url &&
                  !shouldDeleteAvatar &&
                  !avatarPreview && (
                    <button
                      onClick={handleAvatarDelete}
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-fit"
                    >
                      <Trash2 className="w-4 h-4" />
                      아바타 삭제
                    </button>
                  )}

                {/* 삭제 예약된 상태 표시 */}
                {shouldDeleteAvatar && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg w-fit">
                    <Trash2 className="w-4 h-4" />
                    삭제 예약됨
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs oneiri-text-secondary mt-2 space-y-1">
              <p>JPG, PNG 파일만 업로드 가능하며, 최대 크기는 5MB입니다.</p>
              {hasChanges() && (
                <p className="text-amber-600 font-medium">
                  변경사항이 있습니다. 하단의 '프로필 저장' 버튼을 클릭하여
                  저장하세요.
                </p>
              )}
            </div>
          </div>

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
            onClick={handleSaveProfile}
            disabled={isUpdatingProfile || !hasChanges()}
            className="px-4 py-2 oneiri-accent-bg text-white rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingProfile ? "저장 중..." : "프로필 저장"}
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
