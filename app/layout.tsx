import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { createClient } from "@/utils/supabase/server";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // 웹사이트의 기준 URL. 소셜 공유 시 절대 경로를 만드는 데 사용됩니다.
  metadataBase: new URL("https://oneiri.vercel.app"), // 현재 배포된 도메인

  // 브라우저 탭에 표시될 제목 형식 (예: "나의 꿈 서재 | Oneiri")
  title: {
    template: "%s | Oneiri",
    default: "Oneiri: 간밤의 꿈, 한 편의 이야기가 되다", // 홈페이지 등 기본 제목
  },

  // 기본 설명 (모든 페이지에 적용될 수 있는, 검색 결과에 표시될 문구)
  description:
    "어젯밤 꾼 모호한 꿈 조각들을 들려주세요. Oneiri의 AI가 세상에 단 하나뿐인 신비로운 이야기로 만들어 드립니다. 당신의 무의식 속에서 새로운 영감을 발견하세요.",

  // PWA 설정 연결
  manifest: "/manifest.json",

  // 기본 소셜 공유 설정 (Open Graph)
  openGraph: {
    title: "Oneiri: 간밤의 꿈, 한 편의 이야기가 되다",
    description:
      "당신의 흩어진 꿈 조각으로, AI와 함께 세상에 없던 이야기를 만들어보세요.",
    url: "https://oneiri.vercel.app",
    siteName: "Oneiri",
    // 공유 시 보일 기본 이미지 (로고나 메인 비주얼)
    images: [
      {
        url: "/og-image.png", // public 폴더에 위치한 이미지 경로
        width: 1200,
        height: 630,
        alt: "Oneiri Logo and concept art",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },

  // 트위터 공유 설정
  twitter: {
    card: "summary_large_image",
    title: "Oneiri: 간밤의 꿈, 한 편의 이야기가 되다",
    description:
      "당신의 흩어진 꿈 조각으로, AI와 함께 세상에 없던 이야기를 만들어보세요.",
    images: ["/og-image.png"], // 위 og:image와 동일한 경로 사용
  },

  // 추가 SEO 설정
  keywords: [
    "꿈 해석",
    "AI 스토리",
    "꿈 일기",
    "창작",
    "상상력",
    "무의식",
    "꿈 분석",
  ],
  authors: [{ name: "Oneiri Team" }],
  creator: "Oneiri",
  publisher: "Oneiri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <QueryProvider>
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
