import AuthGuard from "./components/auth-guard"
import Header from "./components/header"
import DreamForm from "./components/dream-form"

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <header className="text-center mb-12">
            <h1 className="font-['Inter'] text-4xl md:text-5xl font-medium text-gray-900 mb-4">꿈 기록하기</h1>
            <p className="text-gray-600 text-lg">당신의 꿈을 아름다운 이야기로 변환해보세요</p>
          </header>

          <DreamForm />
        </div>
      </div>
    </AuthGuard>
  )
}
