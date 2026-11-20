export const TIME_ZONE = 'Europe/Zurich';

/** Menüleisten-Uhr, z. B. «Do., 19. Nov.  14:05» (immer Zürcher Zeit). */
export function formatClock(date: Date): string {
  try {
    const day = date.toLocaleDateString('de-CH', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const time = date.toLocaleTimeString('de-CH', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day}  ${time}`;
  } catch {
    return '';
  }
}

/** Zeitstempel für «Last login: …» im Terminal. */
export function formatLastLogin(date: Date): string {
  try {
    return date.toLocaleString('de-CH', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
