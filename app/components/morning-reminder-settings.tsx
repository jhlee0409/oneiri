"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { trackEvent } from "@/lib/analytics";
import { getPushReminderStatus } from "@/lib/api";
import {
  DEFAULT_REMINDER_HOUR,
  REMINDER_HOURS,
  REMINDER_SETTINGS_ANCHOR,
} from "@/lib/morning-reminder";
import {
  disableMorningReminder,
  enableMorningReminder,
  getCurrentPushSubscription,
  getPushSupport,
  type PushSupport,
} from "@/lib/push-reminder";

export default function MorningReminderSettings() {
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(DEFAULT_REMINDER_HOUR);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const currentSupport = getPushSupport();
      setSupport(currentSupport);
      if (currentSupport === "supported") {
        setPermissionDenied(Notification.permission === "denied");
        const subscription = await getCurrentPushSubscription();
        if (subscription) {
          const result = await getPushReminderStatus(subscription.endpoint);
          if (!cancelled && result.success && result.data) {
            setEnabled(result.data.subscribed && result.data.enabled);
            setHour(result.data.reminder_hour);
          }
        }
      }
      if (!cancelled) setIsLoading(false);
    };
    load().catch((error) => {
      console.error("아침 꿈 알림 상태 조회 실패:", error);
      if (!cancelled) setIsLoading(false);
    });

    // 꿈을 엮은 뒤 '알림 켜기'로 들어오면 이 섹션으로 스크롤한다.
    if (window.location.hash === `#${REMINDER_SETTINGS_ANCHOR}`) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = async (nextHour: number) => {
    const result = await enableMorningReminder(nextHour);
    if (result.ok) return true;
    if (result.reason === "denied") {
      setPermissionDenied(true);
      toast.error("알림 권한이 꺼져 있어요. 브라우저 설정에서 허용해 주세요.");
    } else if (result.reason === "unsupported") {
      toast.error("이 브라우저에서는 알림을 받을 수 없어요.");
    } else {
      toast.error(result.message || "알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
    return false;
  };

  const handleToggle = async (checked: boolean) => {
    setIsSaving(true);
    try {
      if (checked) {
        if (await subscribe(hour)) {
          setEnabled(true);
          trackEvent("reminder_enabled", { reminder_hour: hour });
          toast.success(`매일 아침 ${hour}시에 꿈을 떠올리도록 알려드릴게요.`);
        }
      } else {
        const result = await disableMorningReminder();
        if (result.ok) {
          setEnabled(false);
          trackEvent("reminder_disabled");
          toast.success("아침 꿈 알림을 껐어요.");
        } else {
          toast.error(result.message || "알림을 끄지 못했어요.");
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = async (nextHour: number) => {
    const previousHour = hour;
    setHour(nextHour);
    if (!enabled) return;

    setIsSaving(true);
    try {
      if (await subscribe(nextHour)) {
        toast.success(`이제 아침 ${nextHour}시에 알려드릴게요.`);
      } else {
        setHour(previousHour);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canToggle = support === "supported" && !isLoading && !isSaving;

  return (
    <section
      id={REMINDER_SETTINGS_ANCHOR}
      ref={sectionRef}
      className="oneiri-bg-secondary p-4 sm:p-6 rounded-lg scroll-mt-24"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <BellRing className="w-4 h-4 sm:w-5 sm:h-5 oneiri-accent" />
        <h2 className="text-lg sm:text-xl font-semibold oneiri-text-primary">
          아침 꿈 알림
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <label
              htmlFor="morning-reminder-toggle"
              className="block text-sm font-medium oneiri-text-primary"
            >
              매일 아침 꿈 기록 알림 받기
            </label>
            <p className="text-xs oneiri-text-secondary">
              꿈은 깨어난 뒤 몇 분 만에 흐려져요. 아직 오늘의 꿈을 기록하지 않은
              날에만 한 번 알려드려요.
            </p>
          </div>
          <Switch
            id="morning-reminder-toggle"
            checked={enabled}
            disabled={!canToggle || (permissionDenied && !enabled)}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="morning-reminder-hour"
            className="text-sm font-medium oneiri-text-primary"
          >
            알림 시각
          </label>
          <select
            id="morning-reminder-hour"
            value={hour}
            disabled={support !== "supported" || isLoading || isSaving}
            onChange={(e) => handleHourChange(Number(e.target.value))}
            className="p-2 rounded-lg border border-gray-300 focus:border-accent-primary focus:outline-none oneiri-bg-primary oneiri-text-primary text-sm disabled:opacity-50"
          >
            {REMINDER_HOURS.map((h) => (
              <option key={h} value={h}>
                오전 {h}시
              </option>
            ))}
          </select>
          <span className="text-xs oneiri-text-secondary">한국 시간 기준</span>
        </div>

        {support === "ios-needs-install" && (
          <p className="text-xs text-amber-600">
            iPhone·iPad에서는 Safari 공유 버튼의 &apos;홈 화면에 추가&apos;로
            Oneiri를 설치한 뒤, 홈 화면 앱에서 알림을 켤 수 있어요.
          </p>
        )}
        {support === "unsupported" && (
          <p className="text-xs text-amber-600">
            이 브라우저는 알림을 지원하지 않아요. 최신 Chrome, Edge, Safari 등에서
            시도해 주세요.
          </p>
        )}
        {support === "supported" && permissionDenied && !enabled && (
          <p className="text-xs text-amber-600">
            알림 권한이 차단되어 있어요. 브라우저 주소창의 사이트 설정에서 알림을
            허용한 뒤 다시 켜 주세요.
          </p>
        )}
      </div>
    </section>
  );
}
