"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { REMINDER_UTM_SOURCE } from "@/lib/morning-reminder";

/** 아침 꿈 알림을 눌러 들어온 방문(utm_source=push)을 GA4 이벤트로 보낸다. */
export function ReminderOpenTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const fromReminder = searchParams.get("utm_source") === REMINDER_UTM_SOURCE;
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!fromReminder || trackedPath.current === pathname) return;
    trackedPath.current = pathname;
    trackEvent("reminder_opened", { landing_path: pathname });
  }, [fromReminder, pathname]);

  return null;
}
