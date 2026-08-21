export type ExperimentProcess = {
  tensionN: number | null;
  concentrationGL: number | null;
  dyeTimeMin: number | null;
  edgeWidthMM: number | null;
};

export type RealExperiment = {
  id: string;

  // 保存时间
  createdAt: string;

  // 用户上传的真实扎染照片
  image: string;

  // 用户填写的真实实验参数
  actual: ExperimentProcess;

  // AI 盲测预测参数
  predicted: ExperimentProcess;
};

const KEY = "ranjian-real-experiments-v1";

export function loadExperiments(): RealExperiment[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(KEY);

    if (!raw) return [];

    return JSON.parse(raw) as RealExperiment[];
  } catch {
    return [];
  }
}

export function saveExperiment(
  experiment: RealExperiment
) {
  const current = loadExperiments();

  const next = [
    experiment,
    ...current,
  ];

  window.localStorage.setItem(
    KEY,
    JSON.stringify(next)
  );
}

export function deleteExperiment(id: string) {
  const next = loadExperiments().filter(
    (experiment) => experiment.id !== id
  );

  window.localStorage.setItem(
    KEY,
    JSON.stringify(next)
  );
}

export function clearExperiments() {
  window.localStorage.removeItem(KEY);
}
