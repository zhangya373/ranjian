import type { DyeParams, FoldMode } from "./dye";
import { clamp } from "./dye";

export type ImageMetrics = {
  whiteRatio: number;
  darkLuminance: number;
  horizontalSymmetry: number;
  verticalSymmetry: number;
  rotationalSymmetry: number;
  edgeSharpness: number;
  radialTransitions: number;
  dominantColor: string;
};

export type ReverseResult = {
  params: DyeParams;
  metrics: ImageMetrics;
  confidence: number;
  explanation: string[];
};

function luminance(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function analyzeCanvas(canvas: HTMLCanvasElement): ImageMetrics {
  const sample = document.createElement("canvas");
  const size = 160;
  sample.width = size;
  sample.height = size;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      whiteRatio: 0,
      darkLuminance: 0.5,
      horizontalSymmetry: 0,
      verticalSymmetry: 0,
      rotationalSymmetry: 0,
      edgeSharpness: 0,
      radialTransitions: 4,
      dominantColor: "#173b72",
    };
  }

  ctx.fillStyle = "#f7f3e6";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(canvas, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const lum = new Float32Array(size * size);
  let whiteCount = 0;
  let darkLumSum = 0;
  let darkCount = 0;
  let colorR = 0;
  let colorG = 0;
  let colorB = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const l = luminance(data[i], data[i + 1], data[i + 2]);
      lum[y * size + x] = l;

      if (l > 0.82) whiteCount += 1;
      if (l < 0.68) {
        darkLumSum += l;
        darkCount += 1;
        colorR += data[i];
        colorG += data[i + 1];
        colorB += data[i + 2];
      }
    }
  }

  let hDiff = 0;
  let vDiff = 0;
  let rDiff = 0;
  let pairs = 0;
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const a = lum[y * size + x];
      hDiff += Math.abs(a - lum[y * size + (size - 1 - x)]);
      vDiff += Math.abs(a - lum[(size - 1 - y) * size + x]);
      rDiff += Math.abs(a - lum[(size - 1 - y) * size + (size - 1 - x)]);
      pairs += 1;
    }
  }

  let gradient = 0;
  let gradientCount = 0;
  for (let y = 1; y < size - 1; y += 3) {
    for (let x = 1; x < size - 1; x += 3) {
      const current = lum[y * size + x];
      gradient +=
        Math.abs(current - lum[y * size + x + 1]) +
        Math.abs(current - lum[(y + 1) * size + x]);
      gradientCount += 2;
    }
  }

  const radialBins = 28;
  const radialSum = new Array(radialBins).fill(0);
  const radialCount = new Array(radialBins).fill(0);
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const bin = Math.min(radialBins - 1, Math.floor((r / maxR) * radialBins));
      radialSum[bin] += lum[y * size + x];
      radialCount[bin] += 1;
    }
  }

  const profile = radialSum.map((sum, i) => sum / Math.max(1, radialCount[i]));
  let transitions = 0;
  let previousSign = 0;
  for (let i = 2; i < profile.length; i += 1) {
    const delta = profile[i] - profile[i - 1];
    if (Math.abs(delta) < 0.018) continue;
    const sign = delta > 0 ? 1 : -1;
    if (previousSign && sign !== previousSign) transitions += 1;
    previousSign = sign;
  }

  const avgDark = darkCount ? darkLumSum / darkCount : 0.58;
  const dominantColor =
    darkCount > 20
      ? rgbToHex(colorR / darkCount, colorG / darkCount, colorB / darkCount)
      : "#173b72";

  return {
    whiteRatio: whiteCount / (size * size),
    darkLuminance: avgDark,
    horizontalSymmetry: clamp(1 - hDiff / Math.max(1, pairs), 0, 1),
    verticalSymmetry: clamp(1 - vDiff / Math.max(1, pairs), 0, 1),
    rotationalSymmetry: clamp(1 - rDiff / Math.max(1, pairs), 0, 1),
    edgeSharpness: clamp(gradient / Math.max(1, gradientCount) * 5.5, 0, 1),
    radialTransitions: transitions,
    dominantColor,
  };
}

function inferFold(metrics: ImageMetrics): FoldMode {
  const mirror = (metrics.horizontalSymmetry + metrics.verticalSymmetry) / 2;

  if (metrics.rotationalSymmetry > 0.76 && metrics.radialTransitions >= 3) {
    return "radial";
  }

  if (mirror > 0.73 && metrics.edgeSharpness > 0.22) {
    return "grid";
  }

  if (metrics.rotationalSymmetry > 0.62 && mirror < 0.7) {
    return "spiral";
  }

  return "accordion";
}

export function inferProcess(canvas: HTMLCanvasElement): ReverseResult {
  const metrics = analyzeCanvas(canvas);
  const fold = inferFold(metrics);
  const avgSymmetry =
    (metrics.horizontalSymmetry +
      metrics.verticalSymmetry +
      metrics.rotationalSymmetry) /
    3;

  const knots = Math.round(clamp(3 + metrics.radialTransitions * 0.9, 3, 10));
  const tightness = Math.round(clamp(48 + metrics.whiteRatio * 62, 35, 95));
  const concentration = Math.round(
    clamp((0.82 - metrics.darkLuminance) * 145 + 52, 35, 95),
  );
  const diffusion = Math.round(
    clamp(78 - metrics.edgeSharpness * 62, 18, 86),
  );
  const symmetry = Math.round(clamp(avgSymmetry * 110, 45, 96));
  const dyeTime = Math.round(clamp(28 + concentration * 0.55, 30, 90));

  const confidence = Math.round(
    clamp(
      55 +
        Math.abs(metrics.rotationalSymmetry - 0.6) * 30 +
        metrics.edgeSharpness * 10,
      55,
      92,
    ),
  );

  const explanations = [
    `识别到约 ${Math.round(metrics.whiteRatio * 100)}% 的高亮留白，推测扎结力度为 ${tightness}%。`,
    `纹样旋转对称度约 ${Math.round(metrics.rotationalSymmetry * 100)}%，当前更接近“${
      fold === "radial"
        ? "中心放射折"
        : fold === "spiral"
          ? "螺旋卷折"
          : fold === "grid"
            ? "方格夹染"
            : "手风琴折"
    }”。`,
    `边界锐度指标为 ${Math.round(metrics.edgeSharpness * 100)}%，因此把扩散度估计为 ${diffusion}%。`,
    `深色区域平均明度为 ${metrics.darkLuminance.toFixed(2)}，据此估计染液浓度 ${concentration}%、染色时间 ${dyeTime} 秒。`,
  ];

  return {
    metrics,
    confidence,
    explanation: explanations,
    params: {
      fold,
      knots,
      tightness,
      concentration,
      dyeTime,
      diffusion,
      symmetry,
      seed: 2026,
      color: metrics.dominantColor,
    },
  };
}
