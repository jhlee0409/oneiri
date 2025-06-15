import type { Metadata } from "next";
import NoticesClient from "./notices-client";

export const metadata: Metadata = {
  title: "업데이트 공지사항",
  description:
    "Oneiri의 최신 업데이트 소식과 새로운 기능을 확인해보세요. 지속적으로 개선되는 꿈 기록 플랫폼의 변화를 만나보세요.",
  openGraph: {
    title: "업데이트 공지사항 - Oneiri",
    description: "Oneiri의 최신 업데이트와 새로운 기능을 확인해보세요.",
    url: "https://www.oneiri.app/notices",
  },
};

export default function NoticesPage() {
  return <NoticesClient />;
}
