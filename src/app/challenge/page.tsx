"use client";

import { useRef, useState } from "react";
import DyePreview from "../../components/DyePreview";
import RangeControl from "../../components/RangeControl";
import {
  DEFAULT_DYE_PARAMS,
  FOLD_LABELS,
  type DyeParams,
  type FoldMode,
} from "../../lib/dye";
import { compareCanvases } from "../../lib/simulator";

const TARGET: DyeParams = {
  fold: "radial",
  knots: 7,
  tightness: 84,
  concentration: 72,
  dyeTime: 66,
  diffusion: 31,
  symmetry: 91,
  seed: 417,
  color: "#173e77",
};

export default function ChallengePage() {
  const [params, setParams] = useState<DyeParams>({
    ...DEFAULT_DYE_PARAMS,
    seed: TARGET.seed,
  });
  const [score, setScore] = useState<number | null>(null);
  const targetRef = useRef<HTMLCanvasElement>(null);
  const userRef = useRef<HTMLCanvasElement>(null);

  const update = <K extends keyof DyeParams>(key: K, value: DyeParams[K]) => {
    setParams((current) => ({ ...current, [key]: value }));
    setScore(null);
  };

  const calculate = () => {
    if (!targetRef.current || !userRef.current) return;
    setScore(compareCanvases(targetRef.current, userRef.current));
  };

  return (
    <section className="page-section">
      <div className="shell">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Similarity · 复刻训练</div>
            <h1>非遗复刻挑战</h1>
          </div>
          <p>
            只看目标样布，不看答案。自己调整折法与工艺参数，再让系统计算两块数字样布的像素相似度。
          </p>
        </div>

        <div className="challenge-grid">
          <div className="challenge-target">
            <span className="small-label">TARGET · 目标样布</span>
            <DyePreview params={TARGET} canvasRef={targetRef} />
            <p>提示：目标纹样具有明显的中心放射与高留白特征。</p>
          </div>

          <div className="challenge-target">
            <span className="small-label">YOUR WORK · 你的复刻</span>
            <DyePreview params={params} canvasRef={userRef} />
            <div className="score-box">
              {score === null ? (
                <span>调整参数后计算相似度</span>
              ) : (
                <>
                  <strong>{score}</strong>
                  <span>/ 100 相似度</span>
                </>
              )}
            </div>
          </div>

          <aside className="control-panel compact-panel">
            <label className="select-control">
              <span>折叠方式</span>
              <select
                value={params.fold}
                onChange={(event) =>
                  update("fold", event.target.value as FoldMode)
                }
              >
                {Object.entries(FOLD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <RangeControl
              label="扎结数量"
              value={params.knots}
              min={2}
              max={10}
              unit=" 处"
              onChange={(value) => update("knots", value)}
            />
            <RangeControl
              label="扎结力度"
              value={params.tightness}
              onChange={(value) => update("tightness", value)}
            />
            <RangeControl
              label="染液浓度"
              value={params.concentration}
              onChange={(value) => update("concentration", value)}
            />
            <RangeControl
              label="染色时间"
              value={params.dyeTime}
              min={10}
              max={120}
              unit=" 秒"
              onChange={(value) => update("dyeTime", value)}
            />
            <RangeControl
              label="扩散度"
              value={params.diffusion}
              onChange={(value) => update("diffusion", value)}
            />
            <RangeControl
              label="对称度"
              value={params.symmetry}
              onChange={(value) => update("symmetry", value)}
            />
            <button className="button primary full-button" onClick={calculate}>
              计算复刻相似度
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
