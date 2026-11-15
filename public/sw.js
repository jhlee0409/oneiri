// Oneiri 서비스 워커: 아침 꿈 알림(Web Push)만 처리한다. 캐싱은 하지 않는다.
// 사용자가 알림을 켰을 때만 등록된다(lib/push-reminder.ts).

const DEFAULT_NOTIFICATION = {
  title: "Oneiri",
  body: "어젯밤 꿈을 이야기로 엮어보세요.",
  url: "/dreams/new",
};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : undefined };
  }

  const title = data.title || DEFAULT_NOTIFICATION.title;
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || DEFAULT_NOTIFICATION.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "morning-reminder",
      lang: "ko-KR",
      data: { url: data.url || DEFAULT_NOTIFICATION.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl =
    (event.notification.data && event.notification.data.url) ||
    DEFAULT_NOTIFICATION.url;
  const target = new URL(rawUrl, self.location.origin);
  // 다른 출처로는 열지 않는다.
  const url =
    target.origin === self.location.origin
      ? target.href
      : new URL(DEFAULT_NOTIFICATION.url, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        try {
          const focused = await client.focus();
          await focused.navigate(url);
          return;
        } catch {
          // 이 서비스 워커가 제어하지 않는 창은 navigate할 수 없다 — 새 창으로 연다.
          break;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
