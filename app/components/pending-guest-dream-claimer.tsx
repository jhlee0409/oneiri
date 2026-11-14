"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { claimGuestDream } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { clearPendingGuestDream, loadPendingGuestDreamId } from "@/lib/guest-dream";

/** 로그인 전에 게스트로 만든 꿈 이야기가 남아 있으면 로그인한 사용자의 서재로 옮긴다. */
export function PendingGuestDreamClaimer() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  // StrictMode의 이중 effect 실행이나 재렌더로 같은 꿈을 두 번 옮기지 않도록 막는다.
  const claimingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const guestDreamId = loadPendingGuestDreamId();
    if (!guestDreamId || claimingIdRef.current === guestDreamId) return;
    claimingIdRef.current = guestDreamId;

    void claimGuestDream(guestDreamId).then((result) => {
      // 네트워크·서버 오류면 키를 남겨 다음 페이지 로드에서 다시 시도한다.
      if (result.status === "retry") return;
      clearPendingGuestDream();
      if (result.status === "gone") return;

      trackEvent("guest_dream_claimed");
      queryClient.invalidateQueries({ queryKey: ["user-dreams"] });
      toast.success("체험으로 만든 꿈이 서재에 저장됐어요");
      router.push(`/library/dreams/${result.dreamId}`);
    });
  }, [user, queryClient, router]);

  return null;
}
