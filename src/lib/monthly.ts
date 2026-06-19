export const AMOUNT_PER_CHECK = 50;

export const MONTHLY_NOTE =
  "For CR Upkeep (Labor for maintenance) and Water Jugs in the classroom — ₱50";

// 10 months starting June (school year).
export const MONTHS = [
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
] as const;

// Roster, alphabetical.
export const MEMBERS = [
  "Abubakar",
  "Alvin",
  "Amilbangsa",
  "Amsang",
  "Araah",
  "Arellano",
  "Atilano",
  "Bakil",
  "Cabasag",
  "Cabato",
  "Capuyan",
  "Castillo",
  "Daño",
  "Dare",
  "Del Rosario",
  "Engallo",
  "Fajardo",
  "Francisco",
  "Grafia",
  "Guevara",
  "Hadulla",
  "Julian",
  "Lamsing",
  "Maadi",
  "Maghinay",
  "Miguel",
  "Pamagan",
  "Pamigao",
  "Petran",
  "Pino",
  "Polino",
  "Sabino",
  "Said",
  "Saluwan",
  "Santos",
  "Sarcol",
  "Talab",
  "Taleon",
  "Tenorio",
  "Varquez",
  "Villahermosa",
] as const;

export const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function cellKey(member: string, monthIndex: number): string {
  return `${member}:${monthIndex}`;
}
