import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에서 세션을 갱신한다:
     * - api/ (API 라우트는 자체적으로 인증 처리)
     * - _next/static, _next/image (정적 자산·이미지 최적화)
     * - favicon.ico, robots.txt, sitemap.xml, ads.txt
     * - 이미지/정적 파일 확장자
     */
    "/((?!api/|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|ads\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|txt|xml|webmanifest|js|css|map|woff|woff2|ttf|otf)$).*)",
  ],
};
