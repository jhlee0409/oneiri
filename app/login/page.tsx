import GoogleLoginForm from "../components/google-login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-12">
          <h1 className="font-['Inter'] text-4xl font-medium text-gray-900 mb-4">
            Oneiri
          </h1>
          <p className="text-gray-600 text-lg">
            흩어진 꿈의 조각들이, 한 편의 이야기가 됩니다.
          </p>
        </div>
        <GoogleLoginForm />
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>로그인하고 당신만의 꿈의 서재를 채워가세요.</p>
        </div>
      </div>
    </div>
  );
}
