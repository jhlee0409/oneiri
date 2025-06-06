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
            <p className="text-gray-600 text-lg">
              가장 사소한 조각이 가장 특별한 이야기가 되기도 해요
            </p>
          </header>

          <DreamForm />
        </div>
      </div>
    </AuthGuard>
  );
}
