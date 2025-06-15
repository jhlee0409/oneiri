import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "Oneiri에 로그인하여 당신의 꿈을 기록하고 이야기로 만들어보세요. Google 계정으로 간편하게 시작할 수 있습니다.",
  openGraph: {
    title: "로그인 - Oneiri",
    description: "Oneiri에 로그인하여 당신의 꿈을 이야기로 만들어보세요.",
    url: "https://www.oneiri.app/login",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
