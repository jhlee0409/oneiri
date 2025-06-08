import Image from "next/image";
import GoogleLoginForm from "../components/google-login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen oneiri-bg-primary flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-12">
          <Image
            src="/oneiri_logo.png"
            alt="Oneiri"
            width={100}
            height={100}
            className="mx-auto mb-4 rounded-full"
          />
          <h1 className="font-['Inter'] text-4xl font-medium oneiri-accent mb-4">
            Oneiri
          </h1>
          <p className="oneiri-text-primary text-lg">
            흩어진 꿈의 조각들이, 한 편의 이야기가 됩니다.
          </p>
        </div>
        <GoogleLoginForm />
        <div className="mt-8 text-center text-sm oneiri-text-secondary">
          <p>로그인하고 당신만의 꿈의 서재를 채워가세요.</p>
        </div>
      </div>
    </div>
  );
}
