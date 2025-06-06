import GoogleLoginForm from "../components/google-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-12">
          <h1 className="font-['Inter'] text-4xl font-medium text-gray-900 mb-4">꿈 일기</h1>
          <p className="text-gray-600 text-lg">AI가 당신의 꿈을 아름다운 이야기로 변환해드립니다</p>
        </div>

        <GoogleLoginForm />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>로그인하여 당신만의 꿈 컬렉션을 시작해보세요</p>
        </div>
      </div>
    </div>
  )
}
