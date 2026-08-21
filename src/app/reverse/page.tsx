"use client";

import { useRef, useState } from "react";
import DyePreview from "../../components/DyePreview";
import { FOLD_LABELS } from "../../lib/dye";
import {
  inferProcess,
  type ReverseResult,
} from "../../lib/imageAnalysis";

function drawImageContain(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  size = 420,
) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#f7f3e6";
  ctx.fillRect(0, 0, size, size);

  const scale = Math.min(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;
  ctx.drawImage(image, x, y, width, height);
}

export default function ReversePage() {
  const sourceRef = useRef<HTMLCanvasElement>(null);
  const [sourceReady, setSourceReady] = useState(false);
  const [result, setResult] = useState<ReverseResult | null>(null);
  const [fileName, setFileName] = useState("尚未上传");
  const [status, setStatus] = useState(
    "上传一张扎染作品，浏览器会在本地提取纹样特征。",
  );

  const loadFile = (file?: File) => {
    if (!file || !sourceRef.current) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (!sourceRef.current) return;
        drawImageContain(sourceRef.current, image);
        setSourceReady(true);
        setResult(null);
        setFileName(file.name);
        setStatus("图片已载入。点击“开始逆向推演”生成工艺建议。");
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const runInference = () => {
    if (!sourceRef.current || !sourceReady) {
      setStatus("请先上传一张图片。");
      return;
    }
    const next = inferProcess(sourceRef.current);
    setResult(next);
    setStatus("逆向推演完成：已生成一组可用于虚拟复刻的建议参数。");
  };

  return (
    <section className="page-section">
      <div className="shell">
        <div className="page-heading">
          <div>
            <div className="eyebrow">DyeInverse · 结果 → 工艺</div>
            <h1>AI逆向工艺设计</h1>
          </div>
          <p>
            不问“能不能生成一张像这样的图”，而是尝试回答：
            “如果想做出它，应该怎么折、怎么扎、染多深？”
          </p>
        </div>

        <div className="reverse-layout">
          <div className="upload-card">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">TARGET IMAGE</span>
                <h2>目标纹样</h2>
              </div>
              <span className="file-name">{fileName}</span>
            </div>

            <label className="upload-zone">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => loadFile(event.target.files?.[0])}
              />
              <span className="upload-icon">＋</span>
              <strong>上传目标扎染图片</strong>
              <small>支持 JPG / PNG / WEBP，图片只在当前浏览器中分析。</small>
            </label>

            <canvas
              ref={sourceRef}
              className={`source-canvas ${sourceReady ? "show" : ""}`}
              aria-label="上传的目标扎染图片"
            />

            <button className="button primary full-button" onClick={runInference}>
              开始逆向推演
            </button>
            <p className="inline-message">{status}</p>
          </div>

          <div className="reverse-result">
            {result ? (
              <>
                <div className="result-topline">
                  <div>
                    <span className="panel-kicker">INVERSE RECIPE</span>
                    <h2>建议工艺方案</h2>
                  </div>
                  <div className="confidence">
                    <strong>{result.confidence}%</strong>
                    <span>推演置信度</span>
                  </div>
                </div>

                <div className="reverse-preview-grid">
                  <div>
                    <span className="small-label">按建议参数重新仿真</span>
                    <DyePreview params={result.params} />
                  </div>

                  <div className="metric-list">
                    <Metric label="折叠方式" value={FOLD_LABELS[result.params.fold]} />
                    <Metric label="扎结数量" value={`${result.params.knots} 处`} />
                    <Metric label="扎结力度" value={`${result.params.tightness}%`} />
                    <Metric label="染液浓度" value={`${result.params.concentration}%`} />
                    <Metric label="染色时间" value={`${result.params.dyeTime} 秒`} />
                    <Metric label="扩散度" value={`${result.params.diffusion}%`} />
                    <Metric label="主色提取" value={result.params.color.toUpperCase()} />
                  </div>
                </div>

                <div className="evidence-card">
                  <span className="panel-kicker">EVIDENCE CHAIN</span>
                  <h3>为什么这样判断？</h3>
                  <ul>
                    {result.explanation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="prototype-note">
                  <strong>当前原型说明：</strong>
                  这一版使用“图像特征提取＋工艺规则模型”完成本地逆向推演，
                  已经可以完整演示“作品 → 参数 → 重新仿真”的闭环。后续可把这里替换为你们自己训练的分类/回归模型。
                </div>
              </>
            ) : (
              <div className="empty-result">
                <span>AI INVERSE</span>
                <h2>等待目标纹样</h2>
                <p>
                  上传后，系统会分析留白比例、主色、镜像/旋转对称度、边缘锐度与径向明暗变化，
                  再映射为建议工艺参数。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}