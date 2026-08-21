import type { DyeParams } from "./dye";

export type CalibrationPoint = {
  digital: number;
  real: number;
};

export type CalibrationProfile = {
  tensionN: CalibrationPoint[];
  concentrationGL: CalibrationPoint[];
  dyeTimeMin: CalibrationPoint[];
  edgeWidthMM: CalibrationPoint[];
};

export const currentCalibration: CalibrationProfile = {
  // 数字扎结力度 → 现实绳张力 N
  // 说明：此项为工程经验估计，并非标准化实测值
  // 暂时保留，用于兼容现有页面和功能
  tensionN: [
    { digital: 0, real: 4.0 },
    { digital: 20, real: 6.0 },
    { digital: 40, real: 9.0 },
    { digital: 60, real: 12.0 },
    { digital: 80, real: 15.0 },
    { digital: 100, real: 18.0 },
  ],

  // 数字染液浓度 → 靛蓝染液浓度 g/L
  concentrationGL: [
    { digital: 0, real: 0.5 },
    { digital: 20, real: 0.8 },
    { digital: 40, real: 1.2 },
    { digital: 60, real: 1.8 },
    { digital: 80, real: 2.5 },
    { digital: 100, real: 3.5 },
  ],

  // DyeSim数字染色时间 → 现实单次浸染时间 min
  dyeTimeMin: [
    { digital: 0, real: 0.25 },
    { digital: 20, real: 0.5 },
    { digital: 40, real: 0.75 },
    { digital: 60, real: 1.0 },
    { digital: 80, real: 2.0 },
    { digital: 100, real: 5.0 },
  ],

  // 数字扩散度 → 蓝白边缘过渡宽度 mm
  // 此项为视觉工程估计值
  edgeWidthMM: [
    { digital: 0, real: 1.0 },
    { digital: 20, real: 2.0 },
    { digital: 40, real: 3.5 },
    { digital: 60, real: 5.0 },
    { digital: 80, real: 7.0 },
    { digital: 100, real: 9.5 },
  ],
};

function interpolate(
  points: CalibrationPoint[],
  value: number
): number | null {
  if (points.length < 2) {
    return null;
  }

  const sorted = [...points].sort(
    (a, b) => a.digital - b.digital
  );

  if (value <= sorted[0].digital) {
    return sorted[0].real;
  }

  if (value >= sorted[sorted.length - 1].digital) {
    return sorted[sorted.length - 1].real;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];

    if (
      value >= a.digital &&
      value <= b.digital
    ) {
      const ratio =
        (value - a.digital) /
        (b.digital - a.digital);

      return (
        a.real +
        ratio * (b.real - a.real)
      );
    }
  }

  return null;
}

export function mapToRealProcess(
  params: DyeParams
) {
  return {
    // 旧参数：暂时保留
    tensionN: interpolate(
      currentCalibration.tensionN,
      params.tightness
    ),

    // 新参数：扎结数量
    // 直接使用 DyeParams.knots
    knotCount:
      typeof params.knots === "number"
        ? Math.max(
            0,
            Math.round(params.knots)
          )
        : null,

    concentrationGL: interpolate(
      currentCalibration.concentrationGL,
      params.concentration
    ),

    dyeTimeMin: interpolate(
      currentCalibration.dyeTimeMin,
      params.dyeTime
    ),

    edgeWidthMM: interpolate(
      currentCalibration.edgeWidthMM,
      params.diffusion
    ),
  };
}

export function tightnessLabel(
  value: number
) {
  if (value < 30) return "较松";
  if (value < 55) return "中等";
  if (value < 80) return "较紧";

  return "紧";
}
