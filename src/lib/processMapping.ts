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
  tensionN: [],
  concentrationGL: [],
  dyeTimeMin: [],
  edgeWidthMM: [],
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

    if (value >= a.digital && value <= b.digital) {
      const ratio =
        (value - a.digital) /
        (b.digital - a.digital);

      return a.real + ratio * (b.real - a.real);
    }
  }

  return null;
}

export function mapToRealProcess(params: DyeParams) {
  return {
    tensionN: interpolate(
      currentCalibration.tensionN,
      params.tightness
    ),

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

export function tightnessLabel(value: number) {
  if (value < 30) return "较松";
  if (value < 55) return "中等";
  if (value < 80) return "较紧";

  return "紧";
}
