import AuthGuard from "./components/auth-guard";
import DreamForm from "./components/dream-form";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <header className="text-center mb-12">
            <h1 className="font-['Inter'] text-4xl md:text-5xl font-medium text-gray-900 mb-4">
              오늘의 꿈 조각
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              어떤 꿈의 조각들을 가져오셨나요?
            </p>
            <p className="text-gray-500 text-sm">
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
