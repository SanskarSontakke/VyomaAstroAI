import { getDailyInsights } from './astro/insights';
import { getRahuKaal, getAbhijitMuhurta } from './astro/rahu';
import { log } from './logger';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    log.warn('Notifications', 'Not supported in this browser');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  log.info('Notifications', 'Permission result', { result });
  return result === 'granted';
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    log.info('Notifications', 'Service worker registered');
    return reg;
  } catch(err) {
    log.error('Notifications', 'SW registration failed', err);
    return null;
  }
}

export async function scheduleDailyNotification(profile) {
  if (!profile) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const sw = await registerServiceWorker();
  if (!sw) return;

  // Ensure active registration
  const readyReg = await navigator.serviceWorker.ready;
  if (!readyReg.active) return;

  const now = new Date();
  const notifTime = new Date();
  notifTime.setHours(7, 0, 0, 0); // 7:00 AM
  if (notifTime <= now) notifTime.setDate(notifTime.getDate() + 1);
  const delay = notifTime.getTime() - now.getTime();

  // Build the notification content
  try {
    const insights = getDailyInsights(profile, new Date());
    if (!insights) {
        log.warn('Notifications', 'Insufficient data for daily insights');
        return;
    }
    const rahu = getRahuKaal(new Date(), profile.latitude, profile.longitude);
    const abhijit = getAbhijitMuhurta(new Date(), profile.latitude, profile.longitude);

    const score = insights.dailyOutlook.score;
    const scoreEmoji = score >= 4 ? '★' : score >= 3 ? '◆' : '▲';
    const title = `Naksha — ${scoreEmoji} Score ${score}/5 today`;
    const body = [
      insights.dailyOutlook.title + '.',
      `Rahu Kaal: ${rahu.formattedStart}–${rahu.formattedEnd}.`,
      `Best window: ${abhijit.formattedStart}–${abhijit.formattedEnd}.`,
    ].join(' ');

    readyReg.active.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      delay,
      title,
      body,
      tag: `daily-${profile.id}`,
    });

    log.info('Notifications', `Scheduled for ${notifTime.toLocaleString()}`, { profileId: profile.id });
    return { scheduledFor: notifTime };
  } catch(err) {
    log.error('Notifications', 'Failed to build notification content', err);
  }
}

export function cancelNotifications() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()));
  }
}
