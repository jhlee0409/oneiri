"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/components/footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // 홈페이지에서는 푸터를 렌더링하지 않음 (FullPageWrapper에서 자체 처리)
  if (isHomePage) {
    return null;
  }

  return <Footer />;
}
