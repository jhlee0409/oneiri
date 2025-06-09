import AuthGuard from "@/app/components/auth-guard";
import UserSettings from "../components/user-settings";

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
