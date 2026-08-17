"use client";

import { useMemo, useRef, useState } from "react";
import DyePreview from "../../components/DyePreview";
import RangeControl from "../../components/RangeControl";
import {
  DEFAULT_DYE_PARAMS,
  FOLD_LABELS,
  PRESETS,
  type DyeParams,
  type FoldMode,
} from "../../lib/dye";
import { saveWork } from "../../lib/storage";

export default function WorkshopPage() {
  const [params, setParams] = useState<DyeParams>({ ...DEFAULT_DYE_PARAMS });
  const [message, setMessage] = useState("拖动左侧参数，右侧样布会实时变化。");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const update = <K extends keyof DyeParams>(key: K, value: DyeParams[K]) => {
    setParams((current) => ({ ...current, [key]: value }));
  };

  const recipe = useMemo(
    () => [
      `采用${FOLD_LABELS[params.fold]}，建立主要纹样骨架。`,
      `设置约 ${params.knots} 处扎结，扎结力度 ${params.tightness}%。`,
      `使用主色 ${params.color}，染液浓度 ${params.concentration}%。`,
      `建议数字染色时长 ${params.dyeTime} 秒，扩散度 ${params.diffusion}%。`,
      `目标对称度 ${params.symmetry}%，保留适度手工不规则感。`,
    ],
    [params],
  );

  const saveCurrentWork = () => {
    if (!canvasRef.current) return;
    const now = new Date();
    saveWork({
      id: `${Date.now()}`,
      name: `试染 ${now.toLocaleDateString("zh-CN")} ${now.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      createdAt: now.toISOString(),
      params,
      image: canvasRef.current.toDataURL("image/png"),
    });
    setMessage("作品已保存到本机浏览器，可在“作品”页查看。");
  };

  const exportPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `ranjian-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setMessage("已生成 PNG 样布图。");
  };

  return (
    <section className="page-section">
      <div className="shell">
        <div className="page-heading">
          <div>
            <div className="eyebrow">DyeForward · 工艺 → 结果</div>
            <h1>虚拟试染工坊</h1>
          </div>
          <p>
            把扎染工艺拆成可计算参数。每次调节都会重新计算染液渗透、留白阻染与纹样展开结果。
          </p>
        </div>

        <div className="workshop-layout">
          <aside className="control-panel">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">PROCESS CONTROL</span>
                <h2>工艺控制台</h2>
              </div>
              <button
                className="mini-button"
                onClick={() => setParams({ ...DEFAULT_DYE_PARAMS })}
              >
                重置
              </button>
            </div>

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
              hint="越高，阻染留白越明显。"
              onChange={(value) => update("tightness", value)}
            />
            <RangeControl
              label="染液浓度"
              value={params.concentration}
              hint="影响整体染色深度。"
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
              hint="越高，边缘越柔和、渗色越明显。"
              onChange={(value) => update("diffusion", value)}
            />
            <RangeControl
              label="对称度"
              value={params.symmetry}
              hint="降低后会加入更多手工不规则感。"
              onChange={(value) => update("symmetry", value)}
            />

            <label className="color-control">
              <span>染液主色</span>
              <span className="color-box">
                <input
                  type="color"
                  value={params.color}
                  onChange={(event) => update("color", event.target.value)}
                />
                <code>{params.color.toUpperCase()}</code>
              </span>
            </label>

            <div className="seed-row">
              <span>随机种子</span>
              <button
                className="mini-button"
                onClick={() => update("seed", Math.floor(Math.random() * 99999))}
              >
                换一块布
              </button>
            </div>

            <div className="preset-buttons">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setParams({ ...preset.params })}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </aside>

          <div className="preview-column">
            <div className="preview-card large-preview">
              <div className="preview-toolbar">
                <div>
                  <span className="status-dot" />
                  REAL-TIME SIMULATION
                </div>
                <strong>{FOLD_LABELS[params.fold]}</strong>
              </div>

              <DyePreview
                params={params}
                canvasRef={canvasRef}
                label="当前工艺参数生成的扎染模拟图"
              />

              <div className="preview-actions">
                <button className="button primary" onClick={saveCurrentWork}>
                  保存作品
                </button>
                <button className="button ghost" onClick={exportPng}>
                  导出 PNG
                </button>
              </div>
              <p className="inline-message">{message}</p>
            </div>

            <div className="recipe-card">
              <div>
                <span className="panel-kicker">CRAFT RECIPE</span>
                <h2>数字工艺卡</h2>
              </div>
              <ol>
                {recipe.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              <p className="note">
                这张工艺卡用于数字预演与教学说明；真实布料还会受到材质、温度、染液配方和操作手法影响。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
