import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 공개 꿈(/shared/{id})과 그 opengraph-image는 허용하고, 로그인 전용·내부 경로는 막는다.
      // /_next/는 막지 않는다: 꿈 본문이 클라이언트에서 렌더링되므로 크롤러가 JS를 받아야 한다.
      disallow: [
        "/api/",
        "/library/",
        "/settings",
        "/analysis/",
        "/login",
        "/auth/",
        "/dreams/new",
      ],
    },
    sitemap: "https://www.oneiri.app/sitemap.xml",
  };
}
