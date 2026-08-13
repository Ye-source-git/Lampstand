// Seasonal reading plans (Advent, Holy Week) recur every year, but on
// dates that move — Easter especially, which shifts by up to five weeks
// year to year. Rather than storing fixed dates anywhere, the window for
// each season is computed on the fly from the calendar year.

export type SeasonKey = "advent" | "holy-week";

// The Anonymous Gregorian algorithm (Meeus/Jones/Butcher) for computing the
// date of Easter Sunday — deterministic date math, not looked up from any
// external source. Verified against known Easter dates 2023-2030.
export function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function atMidnight(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Windows are inclusive of both start and end, and expressed in the
// *local* calendar (a user's own "today" — there's no attempt to align
// this to a particular timezone or liturgical hour boundary).
export function getSeasonWindow(key: SeasonKey, year: number): { start: Date; end: Date } {
  if (key === "advent") {
    // Simplified to a fixed Dec 1-24 window rather than the traditional
    // "fourth Sunday before Christmas" (which would otherwise vary the
    // start by up to a week) — predictable, and close enough for a plan
    // that isn't calendar-locked day-to-day anyway.
    return { start: new Date(year, 11, 1), end: new Date(year, 11, 24) };
  }
  if (key === "holy-week") {
    const easter = atMidnight(computeEaster(year));
    return { start: addDays(easter, -7), end: easter }; // Palm Sunday through Easter Sunday
  }
  throw new Error(`Unknown season: ${key}`);
}

export function isInSeason(key: SeasonKey, today: Date = new Date()): boolean {
  const t = atMidnight(today);
  const { start, end } = getSeasonWindow(key, t.getFullYear());
  return t >= atMidnight(start) && t <= atMidnight(end);
}
