import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*", // 모든 크롤러에게 적용
      allow: "/", // 사이트 전체의 수집을 허용
      disallow: [
        "/api/", // API 엔드포인트는 크롤링 방지
        "/_next/", // Next.js 내부 파일들은 크롤링 방지
        "/private/", // 비공개 경로가 있다면 추가
      ],
    },
    sitemap: "https://oneiri.vercel.app/sitemap.xml", // 사이트맵 위치 명시
  };
}
