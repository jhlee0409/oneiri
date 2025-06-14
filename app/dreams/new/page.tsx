import AuthGuard from "@/app/components/auth-guard";
import DreamForm from "@/app/components/dream-form";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen oneiri-bg-primary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="font-['Inter'] text-2xl sm:text-4xl md:text-5xl font-medium oneiri-accent mb-3 sm:mb-4">
              오늘의 꿈 조각
            </h1>
            <p className="oneiri-text-primary text-base sm:text-lg mb-2">
              어떤 꿈의 조각들을 가져오셨나요?
            </p>
            <p className="oneiri-text-secondary text-xs sm:text-sm">
              안개 낀 숲, 낯선 속삭임, 알 수 없는 그리움처럼… 떠오르는 모든 것이
              특별한 이야기가 됩니다 ✨
            </p>
          </header>

          <DreamForm />
        </div>
      </div>
    </AuthGuard>
  );
}
