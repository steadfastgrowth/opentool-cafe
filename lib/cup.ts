export function hash32(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const CERAMICS = ["#fff6e4", "#f0d59a", "#e7c27a", "#d4a574", "#c47a4a", "#8b4518", "#2a160c", "#6a4a32"];
const COFFEES = ["#3d2314", "#5c3317", "#2a160c", "#4a2c17", "#1a0d08"];
const PLATES = ["#d35400", "#f0b429", "#2a160c", "#6a4a32", "#c47a4a"];

export function cupColors(seed: string) {
  const h = hash32(seed);
  return {
    ceramic: CERAMICS[h % CERAMICS.length],
    coffee: COFFEES[(h >>> 8) % COFFEES.length],
    plate: PLATES[(h >>> 16) % PLATES.length],
    fill: 6 + ((h >>> 20) % 5),
    handleRight: Boolean(h & 1),
    foam: Boolean(h & 2),
  };
}

export function cupLabel(name: string) {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
  return (clean || "GUEST").toUpperCase();
}
