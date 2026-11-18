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
  X,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/supabase";
import { useUserAvatar } from "@/hooks/use-user-avatar";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MorningReminderSettings from "./morning-reminder-settings";

const fieldClass =
  "w-full min-h-11 p-3 rounded-lg border border-text-secondary/70 focus:border-accent-primary oneiri-bg-primary oneiri-text-primary placeholder:oneiri-text-secondary";

export default function UserSettings() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalConfirmText, setWithdrawalConfirmText] = useState("");
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // 프로필 저장 결과는 토스트 대신 저장 버튼 아래에 남겨 둔다.
  const [profileMessage, setProfileMessage] = useState<{
    kind: "saved" | "error";
    text: string;
  } | null>(null);

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
      setProfileMessage({ kind: "error", text: "이미지는 5MB 이하만 올릴 수 있어요." });
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      setProfileMessage({ kind: "error", text: "이미지 파일만 올릴 수 있어요." });
      return;
    }

    setProfileMessage(null);
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
    if (!user || !profile || isUpdatingProfile || !hasChanges()) return;
    setIsUpdatingProfile(true);
    setProfileMessage(null);
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

      setProfileMessage({ kind: "saved", text: "프로필을 저장했어요." });
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      setProfileMessage({
        kind: "error",
        text: "프로필을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      });
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

  const handleWithdrawal = async (event: React.MouseEvent) => {
    // 처리하는 동안 대화상자를 열어 두고, 실패하면 그 안에 이유를 보여 준다.
    event.preventDefault();
    if (withdrawalConfirmText !== "탈퇴합니다") {
      setWithdrawalError("확인 문구를 정확히 입력해 주세요.");
      return;
    }

    setIsProcessingWithdrawal(true);
    setWithdrawalError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setWithdrawalError("로그인이 풀렸어요. 다시 로그인한 뒤 시도해 주세요.");
        return;
      }

      const response = await fetch("/api/auth/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ confirmText: withdrawalConfirmText }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "탈퇴 처리 중 오류가 발생했습니다.");
      }

      toast.success(result?.message || "탈퇴 요청이 완료되었습니다.");

      // 추가 안내 메시지
      toast.info("30일 후 모든 데이터가 완전히 삭제됩니다.", {
        duration: 5000,
      });

      // 로그아웃 처리 및 메인 페이지로 이동
      setShowWithdrawalModal(false);
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("탈퇴 처리 오류:", error);
      setWithdrawalError(
        error instanceof Error
          ? error.message
          : "탈퇴 처리 중 오류가 발생했습니다."
      );
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const handleWithdrawalOpenChange = (open: boolean) => {
    setShowWithdrawalModal(open);
    if (!open) {
      setWithdrawalConfirmText("");
      setWithdrawalError(null);
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
      <div className="space-y-6" role="status">
        <span className="sr-only">설정을 불러오고 있어요</span>
        <div className="oneiri-bg-secondary p-6 rounded-lg animate-pulse" aria-hidden="true">
          <div className="h-6 bg-line rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-line rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const avatarPreviewSrc = shouldDeleteAvatar ? null : avatarPreview ?? avatarUrl;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 프로필 설정 섹션 */}
      <section
        aria-labelledby="settings-profile-heading"
        className="oneiri-bg-secondary p-4 sm:p-6 rounded-lg"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <User className="w-4 h-4 sm:w-5 sm:h-5 oneiri-accent" aria-hidden="true" />
          <h2
            id="settings-profile-heading"
            className="text-lg sm:text-xl font-semibold oneiri-text-primary"
          >
            프로필 정보
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* 아바타 섹션 */}
          <div>
            <p className="block text-xs sm:text-sm font-medium oneiri-text-primary mb-2 sm:mb-3">
              프로필 이미지
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {/* 프로필 이미지: 눌러서 새 이미지 고르기 */}
              <div className="relative mx-auto sm:mx-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingProfile}
                  aria-label="프로필 이미지 바꾸기"
                  aria-describedby="settings-avatar-help"
                  className="group relative flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center overflow-hidden rounded-full border-2 border-line bg-bg-primary transition-colors hover:border-accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {avatarPreviewSrc ? (
                    <ImageWithFallback
                      src={avatarPreviewSrc}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                      fallbackMessage="이미지 없음"
                    />
                  ) : (
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" aria-hidden="true" />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-bg-primary/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Camera className="w-6 h-6 text-text-primary" />
                  </span>
                </button>

                {/* 변경사항 취소 (우측 상단 X): 보이는 원은 작아도 누르는 영역은 44px */}
                {(avatarPreview || shouldDeleteAvatar) && (
                  <button
                    type="button"
                    onClick={cancelAvatarChanges}
                    disabled={isUpdatingProfile}
                    aria-label="이미지 변경 취소"
                    className="group absolute -top-4 -right-4 flex h-11 w-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-text-secondary bg-bg-secondary text-text-primary shadow-md transition-colors group-hover:border-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </span>
                  </button>
                )}

                {/* 숨겨진 파일 입력: 위 버튼이 연다 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p id="settings-avatar-help" className="text-xs oneiri-text-secondary break-keep">
                  이미지를 눌러 바꿀 수 있어요. JPG·PNG 이미지를 5MB까지 올릴 수 있어요.
                </p>

                {/* 아바타 삭제 버튼 (기존 아바타가 있을 때만) */}
                {profile?.avatar_url &&
                  !shouldDeleteAvatar &&
                  !avatarPreview && (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      disabled={isUpdatingProfile}
                      className="flex min-h-11 items-center gap-2 px-3 py-2 text-sm text-danger border border-danger/40 rounded-lg hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-fit"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      아바타 삭제
                    </button>
                  )}

                {/* 삭제 예약된 상태 표시 */}
                {shouldDeleteAvatar && (
                  <p className="flex items-center gap-2 px-3 py-2 text-sm text-danger bg-danger/10 border border-danger/40 rounded-lg w-fit">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    저장하면 이미지가 지워져요
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="settings-email"
              className="block text-sm font-medium oneiri-text-primary mb-2"
            >
              이메일
            </label>
            <input
              id="settings-email"
              type="email"
              value={user?.email || ""}
              readOnly
              aria-describedby="settings-email-help"
              className="w-full min-h-11 p-3 rounded-lg border border-line bg-bg-primary oneiri-text-secondary"
            />
            <p id="settings-email-help" className="text-xs oneiri-text-secondary mt-1">
              이메일은 바꿀 수 없어요.
            </p>
          </div>

          <div>
            <label
              htmlFor="settings-nickname"
              className="block text-sm font-medium oneiri-text-primary mb-2"
            >
              닉네임
            </label>
            <input
              id="settings-nickname"
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="다른 사람에게 보일 이름"
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            {/* 저장 직후 disabled가 되면 포커스가 빠지므로 aria-disabled로 막는다 */}
            <button
              type="button"
              onClick={handleSaveProfile}
              aria-disabled={isUpdatingProfile || !hasChanges() || undefined}
              aria-describedby={hasChanges() ? "settings-unsaved" : undefined}
              className="min-h-11 px-4 py-2 oneiri-accent-bg text-bg-primary font-medium rounded-lg hover:brightness-110 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:hover:brightness-100"
            >
              {isUpdatingProfile ? "저장하고 있어요…" : "프로필 저장"}
            </button>
            {hasChanges() && (
              <p id="settings-unsaved" className="text-xs text-accent-primary">
                바꾼 내용이 있어요. 프로필 저장을 눌러야 반영돼요.
              </p>
            )}
            <p role="status" className="text-sm oneiri-text-secondary empty:hidden">
              {profileMessage?.kind === "saved" ? profileMessage.text : ""}
            </p>
            {profileMessage?.kind === "error" && (
              <p role="alert" className="text-sm text-danger break-keep">
                {profileMessage.text}
              </p>
            )}
          </div>
        </div>
      </section>

      <MorningReminderSettings />

      {/* 계정 정보 섹션 */}
      <section
        aria-labelledby="settings-account-heading"
        className="oneiri-bg-secondary p-4 sm:p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-5 h-5 oneiri-accent" aria-hidden="true" />
          <h2
            id="settings-account-heading"
            className="text-xl font-semibold oneiri-text-primary"
          >
            계정 정보
          </h2>
        </div>

        <dl className="space-y-3 text-sm oneiri-text-secondary">
          <div className="flex justify-between">
            <dt>가입일</dt>
            <dd>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("ko-KR")
                : "-"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>계정 상태</dt>
            <dd className="text-accent-primary">활성</dd>
          </div>
          <div className="flex justify-between">
            <dt>마지막 업데이트</dt>
            <dd>
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleDateString("ko-KR")
                : "-"}
            </dd>
          </div>
        </dl>
      </section>

      {/* 계정 관리 섹션 */}
      <section
        aria-labelledby="settings-manage-heading"
        className="oneiri-bg-secondary p-4 sm:p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 oneiri-accent" aria-hidden="true" />
          <h2
            id="settings-manage-heading"
            className="text-xl font-semibold oneiri-text-primary"
          >
            계정 관리
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex min-h-11 items-center gap-2 px-4 py-2 border border-line text-text-primary rounded-lg hover:bg-bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>

          {/* 탈퇴 확인: 포커스를 가두고 Esc·취소로 닫으면 이 버튼으로 돌아온다 */}
          <AlertDialog
            open={showWithdrawalModal}
            onOpenChange={handleWithdrawalOpenChange}
          >
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="flex min-h-11 items-center gap-2 px-4 py-2 text-danger border border-danger/40 rounded-lg hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                회원 탈퇴
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg border-line bg-bg-secondary">
              <AlertDialogHeader className="text-left">
                <AlertDialogTitle className="flex items-center gap-3 text-lg font-semibold oneiri-text-primary">
                  <AlertTriangle className="w-6 h-6 text-danger" aria-hidden="true" />
                  회원 탈퇴 확인
                </AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-danger break-keep">
                  정말 탈퇴할까요? 모든 데이터는 복구할 수 없어요.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div>
                <label
                  htmlFor="settings-withdrawal-confirm"
                  className="block text-sm font-medium oneiri-text-primary mb-2"
                >
                  확인을 위해 &apos;탈퇴합니다&apos;를 입력해 주세요
                </label>
                <input
                  id="settings-withdrawal-confirm"
                  type="text"
                  autoComplete="off"
                  value={withdrawalConfirmText}
                  onChange={(e) => setWithdrawalConfirmText(e.target.value)}
                  aria-invalid={withdrawalError ? true : undefined}
                  aria-describedby={withdrawalError ? "settings-withdrawal-error" : undefined}
                  placeholder="탈퇴합니다"
                  className="w-full min-h-11 p-3 rounded-lg border border-text-secondary/70 focus:border-danger oneiri-bg-primary oneiri-text-primary placeholder:oneiri-text-secondary"
                />
                {withdrawalError && (
                  <p
                    id="settings-withdrawal-error"
                    role="alert"
                    className="mt-2 text-sm text-danger break-keep"
                  >
                    {withdrawalError}
                  </p>
                )}
              </div>

              <AlertDialogFooter className="gap-2 sm:space-x-0">
                <AlertDialogCancel className="mt-0 min-h-11 flex-1 border-line bg-transparent text-text-primary hover:bg-line/40 hover:text-text-primary sm:mt-0">
                  취소
                </AlertDialogCancel>
                <button
                  type="button"
                  onClick={handleWithdrawal}
                  disabled={
                    withdrawalConfirmText !== "탈퇴합니다" ||
                    isProcessingWithdrawal
                  }
                  className="min-h-11 flex-1 px-4 py-2 text-danger border border-danger/40 rounded-md hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingWithdrawal ? "처리하고 있어요…" : "탈퇴 완료"}
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
