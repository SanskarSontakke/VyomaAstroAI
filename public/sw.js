self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        requireInteraction: false,
        silent: false,
      });
    }, delay);
  }
});
