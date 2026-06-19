import { MONTHS } from "./monthly";

export type CrItem = {
  key: string;
  label: string;
};

// Bought once for the year (not per-month). Stored under ONE_TIME_MONTH.
export const ONE_TIME_ITEMS: CrItem[] = [
  { key: "water_containers", label: "Water containers — for the CR" },
  { key: "doorknob_padlock", label: "Doorknob / Padlock — for the CR" },
  { key: "tv_labor", label: "Labor cost for the TV installation" },
  { key: "tv_wall_bracket", label: "New wall bracket for the TV" },
];

// Sentinel month index used for one-time items.
export const ONE_TIME_MONTH = -1;

export const ONE_TIME_KEYS = ONE_TIME_ITEMS.map((i) => i.key);

export function crKey(monthIndex: number, itemKey: string): string {
  return `${monthIndex}:${itemKey}`;
}

/**
 * Maps today's real month onto our June-start range (0 = Jun … 9 = Mar).
 * April/May fall outside the school year, so we default to June (0).
 */
export function currentMonthIndex(now: Date): number {
  const m = now.getMonth(); // 0 = Jan … 11 = Dec
  if (m >= 5 && m <= 11) return m - 5; // Jun..Dec -> 0..6
  if (m >= 0 && m <= 2) return m + 7; // Jan..Mar -> 7..9
  return 0; // Apr/May -> June
}

export { MONTHS };
