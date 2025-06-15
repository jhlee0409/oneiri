import AuthGuard from "@/app/components/auth-guard";
import UserSettings from "../components/user-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "계정 설정",
  description:
    "Oneiri 계정 설정을 관리하세요. 프로필 정보 수정, 개인정보 보호 설정 등을 변경할 수 있습니다.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold oneiri-text-primary mb-8">
          계정 설정
        </h1>
        <UserSettings />
      </div>
    </AuthGuard>
  );
}
