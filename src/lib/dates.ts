export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Given the distinct local dates (YYYY-MM-DD) a user was actually active,
// returns the current streak length: consecutive days ending today or
// yesterday (yesterday still counts — the user just hasn't opened the app
// yet today). Any other gap breaks the streak.
export function computeStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort().reverse();
  if (sorted.length === 0) return 0;

  const today = getLocalDateString();
  const yesterday = getLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  const cursor = new Date(`${sorted[0]}T00:00:00`);

  for (let i = 1; i < sorted.length; i++) {
    cursor.setDate(cursor.getDate() - 1);
    if (sorted[i] === getLocalDateString(cursor)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
