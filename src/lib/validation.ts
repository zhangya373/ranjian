export type ErrorDirection =
  | "high"
  | "low"
  | "accurate";

export type ErrorLevel =
  | "good"
  | "mild"
  | "medium"
  | "large";

export type ErrorMetric = {
  actual: number;
  predicted: number;
  absoluteError: number;
  relativeErrorPercent: number;
  direction: ErrorDirection;
  level: ErrorLevel;
};

/**
 * 真实实验参数
 */
export type RealProcessValues = {
  knotCount: number;
  concentrationGL: number;
  dyeTimeMin: number;
  edgeWidthMM: number;
};

/**
 * AI 预测参数
 *
 * AI 某些参数可能识别不到，
 * 所以允许为 null。
 */
export type PredictedProcessValues = {
  knotCount: number | null;
  concentrationGL: number | null;
  dyeTimeMin: number | null;
  edgeWidthMM: number | null;
};

/**
 * 验证结果
 */
export type ValidationResult = {
  knotCount: ErrorMetric | null;
  concentration: ErrorMetric | null;
  dyeTime: ErrorMetric | null;
  edgeWidth: ErrorMetric | null;
};

/**
 * 计算单项误差
 */
function calculateErrorMetric(
  actual: number,
  predicted: number | null
): ErrorMetric | null {
  if (predicted === null) {
    return null;
  }

  const absoluteError = Math.abs(
    predicted - actual
  );

  const relativeErrorPercent =
    actual === 0
      ? absoluteError === 0
        ? 0
        : 100
      : (absoluteError / Math.abs(actual)) *
        100;

  let direction: ErrorDirection;

  if (Math.abs(predicted - actual) < 0.000001) {
    direction = "accurate";
  } else if (predicted > actual) {
    direction = "high";
  } else {
    direction = "low";
  }

  let level: ErrorLevel;

  if (relativeErrorPercent <= 10) {
    level = "good";
  } else if (relativeErrorPercent <= 20) {
    level = "mild";
  } else if (relativeErrorPercent <= 40) {
    level = "medium";
  } else {
    level = "large";
  }

  return {
    actual,
    predicted,
    absoluteError,
    relativeErrorPercent,
    direction,
    level,
  };
}

/**
 * 比较真实实验参数与 AI 预测参数
 */
export function validatePrediction(
  actual: RealProcessValues,
  predicted: PredictedProcessValues
): ValidationResult {
  return {
    knotCount: calculateErrorMetric(
      actual.knotCount,
      predicted.knotCount
    ),

    concentration: calculateErrorMetric(
      actual.concentrationGL,
      predicted.concentrationGL
    ),

    dyeTime: calculateErrorMetric(
      actual.dyeTimeMin,
      predicted.dyeTimeMin
    ),

    edgeWidth: calculateErrorMetric(
      actual.edgeWidthMM,
      predicted.edgeWidthMM
    ),
  };
}
