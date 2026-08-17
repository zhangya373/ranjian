export type FoldMode = "radial" | "accordion" | "spiral" | "grid";

export type DyeParams = {
  fold: FoldMode;
  knots: number;
  tightness: number;
  concentration: number;
  dyeTime: number;
  diffusion: number;
  symmetry: number;
  seed: number;
  color: string;
};

export const FOLD_LABELS: Record<FoldMode, string> = {
  radial: "中心放射折",
  accordion: "手风琴折",
  spiral: "螺旋卷折",
  grid: "方格夹染",
};

export const DEFAULT_DYE_PARAMS: DyeParams = {
  fold: "radial",
  knots: 6,
  tightness: 76,
  concentration: 74,
  dyeTime: 58,
  diffusion: 42,
  symmetry: 86,
  seed: 2026,
  color: "#173b72",
};

export const PRESETS: Array<{ name: string; description: string; params: DyeParams }> = [
  {
    name: "月轮",
    description: "中心放射、留白清晰，适合展示传统扎结逻辑。",
    params: {
      fold: "radial",
      knots: 6,
      tightness: 82,
      concentration: 78,
      dyeTime: 62,
      diffusion: 34,
      symmetry: 92,
      seed: 2026,
      color: "#163b73",
    },
  },
  {
    name: "水纹",
    description: "柔和扩散的螺旋纹理，强调染液渗透效果。",
    params: {
      fold: "spiral",
      knots: 5,
      tightness: 58,
      concentration: 68,
      dyeTime: 74,
      diffusion: 72,
      symmetry: 74,
      seed: 1208,
      color: "#24568f",
    },
  },
  {
    name: "折光",
    description: "重复折叠产生节律性留白，适合几何文创。",
    params: {
      fold: "accordion",
      knots: 7,
      tightness: 70,
      concentration: 80,
      dyeTime: 54,
      diffusion: 38,
      symmetry: 88,
      seed: 731,
      color: "#12395e",
    },
  },
];

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function copyParams(params: DyeParams): DyeParams {
  return { ...params };
}
