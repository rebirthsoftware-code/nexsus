/** Sitedeki vurgu renkleri ve üzerlerinde okunabilir metin rengi */
export type Accent = "brand" | "coral" | "lime" | "lilac" | "sun";

export const accentBg: Record<Accent, string> = {
  brand: "bg-brand text-paper",
  coral: "bg-coral text-ink",
  lime: "bg-lime text-ink",
  lilac: "bg-lilac text-ink",
  sun: "bg-sun text-ink",
};

export const accentHex: Record<Accent, string> = {
  brand: "#015efb",
  coral: "#ff5b38",
  lime: "#c8f03c",
  lilac: "#b9a2ff",
  sun: "#ffc83d",
};
