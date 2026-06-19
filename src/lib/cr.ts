export type CrItem = {
  key: string;
  label: string;
};

// Bought once for the year (not per-month). Stored under ONE_TIME_MONTH.
export const ONE_TIME_ITEMS: CrItem[] = [
  { key: "water_containers", label: "Water containers" },
  { key: "doorknob_padlock", label: "Doorknob / Padlock" },
];

// Cleaning materials tracked every month.
export const MONTHLY_ITEMS: CrItem[] = [
  { key: "muriatic_acid", label: "Muriatic Acid" },
  { key: "rags", label: "Rags" },
  { key: "tissues", label: "Tissues" },
  { key: "toilet_deodorizer", label: "Toilet deodorizer" },
];

// Sentinel month index used for one-time items.
export const ONE_TIME_MONTH = -1;

export const ONE_TIME_KEYS = ONE_TIME_ITEMS.map((i) => i.key);
export const MONTHLY_KEYS = MONTHLY_ITEMS.map((i) => i.key);
export const CR_ITEM_KEYS = [...ONE_TIME_KEYS, ...MONTHLY_KEYS];

export function crKey(monthIndex: number, itemKey: string): string {
  return `${monthIndex}:${itemKey}`;
}
