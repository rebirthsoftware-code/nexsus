/** Sitedeki vurgu renkleri ve üzerlerinde okunabilir metin rengi */
export type Accent = "cobalt" | "coral" | "lime" | "lilac" | "sun";

export const accentBg: Record<Accent, string> = {
  cobalt: "bg-cobalt text-paper",
  coral: "bg-coral text-ink",
  lime: "bg-lime text-ink",
  lilac: "bg-lilac text-ink",
  sun: "bg-sun text-ink",
};

export const accentHex: Record<Accent, string> = {
  cobalt: "#2d3fe7",
  coral: "#ff5b38",
  lime: "#c8f03c",
  lilac: "#b9a2ff",
  sun: "#ffc83d",
};
