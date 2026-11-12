"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AUTH_EVENT_PARAM, trackEvent } from "@/lib/analytics";

/** OAuth 콜백이 붙인 auth_event 파라미터를 GA4 이벤트로 보내고 URL에서 제거한다. */
export function AuthEventTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const authEvent = searchParams.get(AUTH_EVENT_PARAM);

  useEffect(() => {
    if (authEvent !== "sign_up" && authEvent !== "login") return;

    trackEvent(authEvent, { method: "google" });

    const params = new URLSearchParams(searchParams.toString());
    params.delete(AUTH_EVENT_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [authEvent, pathname, router, searchParams]);

  return null;
}
