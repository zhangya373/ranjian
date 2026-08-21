export type RealProcessValues = {
  tensionN: number | null;
  concentrationGL: number | null;
  dyeTimeMin: number | null;
  edgeWidthMM: number | null;
};

export type ErrorDirection =
  | "high"
  | "low"
  | "accurate";

export type ErrorLevel =
  | "good"
  | "mild"
  | "medium"
  | "high";

export type ErrorMetric = {
  actual: number;
  predicted: number;

  // AI预测值 - 真实值
  signedError: number;

  // 绝对误差
  absoluteError: number;

  // 相对误差百分比
  relativeErrorPercent: number;

  // AI偏高 / 偏低 / 基本准确
  direction: ErrorDirection;

  // 偏差等级
  level: ErrorLevel;
};

export type ValidationResult = {
  tension: ErrorMetric | null;
  concentration: ErrorMetric | null;
  dyeTime: ErrorMetric | null;
  edgeWidth: ErrorMetric | null;
};

function getErrorLevel(
  percent: number
): ErrorLevel {
  if (percent < 10) return "good";
  if (percent < 20) return "mild";
  if (percent < 35) return "medium";

  return "high";
}

function compareValue(
  actual: number | null,
  predicted: number | null
): ErrorMetric | null {
  if (
    actual === null ||
    predicted === null ||
    !Number.isFinite(actual) ||
    !Number.isFinite(predicted)
  ) {
    return null;
  }

  const signedError =
    predicted - actual;

  const absoluteError =
    Math.abs(signedError);

  const relativeErrorPercent =
    actual === 0
      ? 0
      : (absoluteError /
          Math.abs(actual)) *
        100;

  let direction: ErrorDirection =
    "accurate";

  if (signedError > 0.0001) {
    direction = "high";
  } else if (signedError < -0.0001) {
    direction = "low";
  }

  return {
    actual,
    predicted,
    signedError,
    absoluteError,
    relativeErrorPercent,
    direction,
    level: getErrorLevel(
      relativeErrorPercent
    ),
  };
}

export function validatePrediction(
  actual: RealProcessValues,
  predicted: RealProcessValues
): ValidationResult {
  return {
    tension: compareValue(
      actual.tensionN,
      predicted.tensionN
    ),

    concentration: compareValue(
      actual.concentrationGL,
      predicted.concentrationGL
    ),

    dyeTime: compareValue(
      actual.dyeTimeMin,
      predicted.dyeTimeMin
    ),

    edgeWidth: compareValue(
      actual.edgeWidthMM,
      predicted.edgeWidthMM
    ),
  };
}
