export const C = {
  bg: "#01020a",
  panel: "rgba(3,6,18,0.97)",
  panelSoft: "rgba(10,20,44,0.80)",
  border: "rgba(110,165,255,0.15)",
  borderGlow: "rgba(77,249,255,0.52)",
  cyan: "#4df9ff",
  violet: "#b58cff",
  gold: "#ffd166",
  green: "#4dffc3",
  red: "#ff5580",
  orange: "#ffac5f",
  text: "#eef5ff",
  textSub: "#8ab8d8",
  textMuted: "#4d6e8a",
  ink: "#060d1e",
  earthBlue: "#3c82ff",
};

export let screenW = 400;
export let screenH = 800;

export function setViewport(width: number, height: number) {
  screenW = width;
  screenH = height;
}
