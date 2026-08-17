import type { DyeParams, FoldMode } from "./dye";
import { clamp } from "./dye";

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16) || 24,
    g: Number.parseInt(normalized.slice(2, 4), 16) || 59,
    b: Number.parseInt(normalized.slice(4, 6), 16) || 114,
  };
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashNoise(x: number, y: number, seed: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.113) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function foldSignal(
  fold: FoldMode,
  nx: number,
  ny: number,
  knots: number,
  seed: number,
) {
  const r = Math.sqrt(nx * nx + ny * ny);
  const angle = Math.atan2(ny, nx);
  const k = Math.max(2, knots);

  if (fold === "radial") {
    const rings = Math.sin(r * (14 + k * 1.8) + Math.sin(angle * 4) * 0.7);
    const rays = Math.cos(angle * Math.max(4, Math.round(k / 2)) + r * 2.2);
    return 0.62 * rings + 0.38 * rays;
  }

  if (fold === "accordion") {
    const vertical = Math.sin((nx + 1) * Math.PI * (k * 0.72 + 2));
    const folded = Math.cos((Math.abs(nx) + Math.abs(ny) * 0.2) * Math.PI * 5.2);
    return 0.72 * vertical + 0.28 * folded;
  }

  if (fold === "spiral") {
    const spiral = Math.sin(angle * (2.4 + k * 0.18) + r * (15 + k) + seed * 0.01);
    const ring = Math.cos(r * 19 - angle * 0.8);
    return 0.76 * spiral + 0.24 * ring;
  }

  const gx = Math.sin((nx + 1) * Math.PI * (k * 0.52 + 2.5));
  const gy = Math.sin((ny + 1) * Math.PI * (k * 0.52 + 2.5));
  return 0.5 * gx + 0.5 * gy;
}

function knotResist(
  nx: number,
  ny: number,
  params: DyeParams,
  randomPoints: Array<{ x: number; y: number; radius: number }>,
) {
  let resist = 0;
  const k = Math.max(1, params.knots);

  for (let i = 0; i < k; i += 1) {
    let px = randomPoints[i]?.x ?? 0;
    let py = randomPoints[i]?.y ?? 0;
    const radius = randomPoints[i]?.radius ?? 0.16;

    if (params.fold === "radial") {
      const a = (i / k) * Math.PI * 2;
      const ring = 0.14 + (i % 3) * 0.18;
      px = Math.cos(a) * ring;
      py = Math.sin(a) * ring;
    } else if (params.fold === "accordion") {
      px = -0.72 + (i / Math.max(1, k - 1)) * 1.44;
      py = ((i % 2) * 2 - 1) * 0.18;
    } else if (params.fold === "grid") {
      const side = Math.ceil(Math.sqrt(k));
      const gx = i % side;
      const gy = Math.floor(i / side);
      px = -0.55 + (gx / Math.max(1, side - 1)) * 1.1;
      py = -0.55 + (gy / Math.max(1, side - 1)) * 1.1;
    }

    const dx = nx - px;
    const dy = ny - py;
    const d2 = dx * dx + dy * dy;
    const gaussian = Math.exp(-d2 / Math.max(0.015, radius * radius));
    resist = Math.max(resist, gaussian);
  }

  return resist;
}

export function renderDye(
  canvas: HTMLCanvasElement,
  params: DyeParams,
  resolution = 420,
) {
  const size = resolution;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const image = ctx.createImageData(size, size);
  const data = image.data;
  const dye = hexToRgb(params.color);
  const cloth = { r: 247, g: 243, b: 230 };
  const tightness = params.tightness / 100;
  const concentration = params.concentration / 100;
  const time = params.dyeTime / 120;
  const diffusion = params.diffusion / 100;
  const symmetry = params.symmetry / 100;

  const rng = mulberry32(params.seed);
  const randomPoints = Array.from({ length: Math.max(1, params.knots) }, () => ({
    x: (rng() * 2 - 1) * 0.66,
    y: (rng() * 2 - 1) * 0.66,
    radius: 0.08 + rng() * 0.12,
  }));

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let nx = (x / (size - 1)) * 2 - 1;
      let ny = (y / (size - 1)) * 2 - 1;

      const warp =
        (1 - symmetry) *
        (hashNoise(Math.floor(x / 22), Math.floor(y / 22), params.seed) - 0.5) *
        0.18;
      nx += warp * Math.sin(ny * 5.5);
      ny += warp * Math.cos(nx * 5.2);

      const r = Math.sqrt(nx * nx + ny * ny);
      const signal = foldSignal(params.fold, nx, ny, params.knots, params.seed);
      const pattern = 0.5 + 0.5 * signal;

      const knot = knotResist(nx, ny, params, randomPoints);
      const centerTie = Math.exp(-(r * r) / (0.035 + tightness * 0.05));

      const boundary = 0.44 - tightness * 0.16;
      const softness = 0.08 + diffusion * 0.2;
      const periodicResist =
        1 - smoothstep(boundary, boundary + softness, Math.abs(pattern - 0.5));

      let resist = Math.max(
        knot * (0.45 + tightness * 0.52),
        periodicResist * (0.18 + tightness * 0.55),
        centerTie * (params.fold === "radial" ? 0.78 : 0.28),
      );

      const dyeStrength = clamp(
        concentration * 0.72 + time * 0.24 + diffusion * 0.12,
        0,
        1,
      );

      const edgeFade = smoothstep(1.42, 0.86, r);
      const flow =
        0.9 +
        (hashNoise(x * 0.11, y * 0.11, params.seed + 17) - 0.5) *
          (0.16 + diffusion * 0.08);
      let amount = dyeStrength * (1 - resist) * flow;
      amount *= 0.83 + 0.17 * edgeFade;

      const fiber =
        (hashNoise(x * 0.47, y * 0.09, params.seed + 301) - 0.5) * 0.045;
      amount = clamp(amount + fiber, 0, 1);

      const idx = (y * size + x) * 4;
      data[idx] = Math.round(cloth.r * (1 - amount) + dye.r * amount);
      data[idx + 1] = Math.round(cloth.g * (1 - amount) + dye.g * amount);
      data[idx + 2] = Math.round(cloth.b * (1 - amount) + dye.b * amount);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = "#4d4d4d";
  for (let i = 0; i < 80; i += 1) {
    const py = (i / 80) * size;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(size, py + Math.sin(i * 0.7) * 1.8);
    ctx.stroke();
  }
  ctx.restore();
}

export function compareCanvases(a: HTMLCanvasElement, b: HTMLCanvasElement) {
  const size = 120;
  const tempA = document.createElement("canvas");
  const tempB = document.createElement("canvas");
  tempA.width = tempB.width = size;
  tempA.height = tempB.height = size;

  const ctxA = tempA.getContext("2d", { willReadFrequently: true });
  const ctxB = tempB.getContext("2d", { willReadFrequently: true });
  if (!ctxA || !ctxB) return 0;

  ctxA.drawImage(a, 0, 0, size, size);
  ctxB.drawImage(b, 0, 0, size, size);

  const da = ctxA.getImageData(0, 0, size, size).data;
  const db = ctxB.getImageData(0, 0, size, size).data;

  let diff = 0;
  for (let i = 0; i < da.length; i += 4) {
    diff +=
      Math.abs(da[i] - db[i]) +
      Math.abs(da[i + 1] - db[i + 1]) +
      Math.abs(da[i + 2] - db[i + 2]);
  }

  const maxDiff = size * size * 3 * 255;
  return Math.round(clamp((1 - diff / maxDiff) * 100, 0, 100));
}
