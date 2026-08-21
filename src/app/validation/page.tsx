"use client";

import { useEffect, useState } from "react";
import { inferProcess } from "../../lib/imageAnalysis";
import { mapToRealProcess } from "../../lib/processMapping";

import {
  loadExperiments,
  saveExperiment,
  type RealExperiment,
} from "../../lib/experimentStorage";

import {
  validatePrediction,
  ValidationResult,
  RealProcessValues,
} from "../../lib/validation";

export default function ValidationPage() {
      const [imagePreview, setImagePreview] = useState<string | null>(null);
const [realImageFile, setRealImageFile] = useState<File | null>(null);

const [isBlindTesting, setIsBlindTesting] = useState(false);

const [blindResult, setBlindResult] = useState<{
  knotCount: number | null;
  concentrationGL: number | null;
  dyeTimeMin: number | null;
  edgeWidthMM: number | null;
} | null>(null);
const [
  validationResult,
  setValidationResult,
] = useState<ValidationResult | null>(
  null
);

const [realParams, setRealParams] = useState({
  knotCount: "",
  concentration: "",
  dyeTime: "",
  edgeWidth: "",
});
const [experiments, setExperiments] =
  useState<RealExperiment[]>([]);

useEffect(() => {
  setExperiments(loadExperiments());
}, []);

  const handleParamChange = (
    key: keyof typeof realParams,
    value: string
  ) => {
    setRealParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;
setRealImageFile(file);
setBlindResult(null);
setValidationResult(null);

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };
const handleBlindTest = async () => {
  if (!realImageFile) {
    alert("请先上传真实扎染作品照片");
    return;
  }
  setIsBlindTesting(true);
  setBlindResult(null);

  try {
    // 1. 把上传的真实图片读取成 DataURL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(String(reader.result));
      };

      reader.onerror = () => {
        reject(new Error("读取图片失败"));
      };

      reader.readAsDataURL(realImageFile);
    });

    // 2. 把 DataURL 加载成浏览器图片对象
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);

      img.onerror = () => {
        reject(new Error("图片加载失败"));
      };

      img.src = dataUrl;
    });

    // 3. 创建一个临时 Canvas
    //    因为你现有的 inferProcess() 接收的是 Canvas
    const canvas = document.createElement("canvas");

    const size = 420;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("无法创建 Canvas");
    }

    // 4. 先铺上和 reverse 页面一样的米白背景
    ctx.fillStyle = "#f7f3e6";
    ctx.fillRect(0, 0, size, size);

    // 5. 保持图片比例，把真实作品绘制进 Canvas
    const scale = Math.min(
      size / image.width,
      size / image.height
    );

    const width = image.width * scale;
    const height = image.height * scale;

    const x = (size - width) / 2;
    const y = (size - height) / 2;

    ctx.drawImage(
      image,
      x,
      y,
      width,
      height
    );

    // 6. 调用你现有的 DyeInverse
    //    这里和 reverse/page.tsx 中的逻辑完全一致
    const reverseResult = inferProcess(canvas);

    // 7. 把 DyeInverse 的数字参数
    //    转成现实实验参数
  const realProcess = mapToRealProcess(
  reverseResult.params
);

// 8. 把预测结果交给 02 AI盲测区域显示
setBlindResult({
  knotCount: realProcess.knotCount,
  concentrationGL: realProcess.concentrationGL,
  dyeTimeMin: realProcess.dyeTimeMin,
  edgeWidthMM: realProcess.edgeWidthMM,
});


  } catch (error) {
    console.error("AI盲测失败：", error);

    alert("AI盲测失败，请重新尝试");
  } finally {
    setIsBlindTesting(false);
  }
};
const handleValidate = () => {
  if (!blindResult) {
    alert("请先完成 AI 盲测");
    return;
  }

  if (!realParams.knotCount
     ||
    !realParams.concentration ||
    !realParams.dyeTime ||
    !realParams.edgeWidth
  ) {
    alert("请填写完整的真实实验参数");
    return;
  }

const actualValues: RealProcessValues = {
  knotCount: Number(realParams.knotCount),
  concentrationGL: Number(realParams.concentration),
  dyeTimeMin: Number(realParams.dyeTime),
  edgeWidthMM: Number(realParams.edgeWidth),
};

  const result = validatePrediction(
    actualValues,
    blindResult
  );

  setValidationResult(result);
};
const handleSaveExperiment = () => {
  if (!imagePreview) {
    alert("请先上传真实扎染作品照片");
    return;
  }

  if (!blindResult) {
    alert("请先完成 AI 盲测");
    return;
  }

  if (
    realParams.knotCount === "" ||
    realParams.concentration === "" ||
    realParams.dyeTime === "" ||
    realParams.edgeWidth === ""
  ) {
    alert("请完整填写真实实验参数");
    return;
  }

  const experiment: RealExperiment = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    image: imagePreview,

    actual: {
      knotCount: Number(realParams.knotCount),
      concentrationGL: Number(realParams.concentration),
      dyeTimeMin: Number(realParams.dyeTime),
      edgeWidthMM: Number(realParams.edgeWidth),
    },

    predicted: {
      knotCount: blindResult.knotCount,
      concentrationGL: blindResult.concentrationGL,
      dyeTimeMin: blindResult.dyeTimeMin,
      edgeWidthMM: blindResult.edgeWidthMM,
    },
  };

  saveExperiment(experiment);

  setExperiments(loadExperiments());

  alert("真实实验已保存");
};

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f3ea 0%, #edf4f5 100%)",
        padding: "48px 24px",
        color: "#17324d",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.16em",
              opacity: 0.6,
              marginBottom: 10,
            }}
          >
            DYE LAB · REAL EXPERIMENT VALIDATION
          </div>

          <h1
            style={{
              fontSize: 36,
              margin: 0,
              marginBottom: 12,
            }}
          >
            真实实验验证中心
          </h1>

          <p
            style={{
              margin: 0,
              lineHeight: 1.8,
              maxWidth: 760,
              opacity: 0.72,
            }}
          >
            上传真实扎染作品并记录实际工艺参数，
            与 AI 逆向识别结果进行盲测对比，
            建立《染见》的真实实验验证数据。
          </p>
        </div>

        {/* 三栏区域 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {/* 左侧 */}
          <section style={cardStyle}>
            <div style={stepStyle}>01</div>

            <h2 style={titleStyle}>
              真实实验
            </h2>

            <p style={textStyle}>
              上传真实完成的扎染作品，并填写实验时提前记录的真实工艺参数。
            </p>

           <div style={{ marginTop: 20 }}>
  {/* 上传真实扎染图片 */}
  <div style={{ marginBottom: 20 }}>
    <label style={labelStyle}>
      真实作品照片
    </label>

    <label
      style={{
        display: "block",
        border: "1px dashed rgba(23,50,77,0.25)",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
        textAlign: "center",
        background: "rgba(23,50,77,0.025)",
      }}
    >
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="真实扎染作品"
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            borderRadius: 12,
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            padding: "45px 12px",
            fontSize: 14,
            opacity: 0.55,
          }}
        >
          点击上传真实扎染作品照片
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
    </label>
  </div>

{/* 扎结数量 */}
<div style={fieldStyle}>
  <label style={labelStyle}>
    扎结数量（个）
  </label>

  <input
    type="number"
    step="1"
    min="1"
    placeholder="例如：12"
    value={realParams.knotCount}
    onChange={(e) =>
      handleParamChange("knotCount", e.target.value)
    }
    style={inputStyle}
  />
</div>


  {/* 染液浓度 */}
  <div style={fieldStyle}>
    <label style={labelStyle}>
      染液浓度（g/L）
    </label>

    <input
      type="number"
      step="0.1"
      placeholder="例如：2.4"
      value={realParams.concentration}
      onChange={(e) =>
        handleParamChange("concentration", e.target.value)
      }
      style={inputStyle}
    />
  </div>

  {/* 单次浸染时间 */}
  <div style={fieldStyle}>
    <label style={labelStyle}>
      单次浸染时间（min）
    </label>

    <input
      type="number"
      step="0.1"
      placeholder="例如：1.0"
      value={realParams.dyeTime}
      onChange={(e) =>
        handleParamChange("dyeTime", e.target.value)
      }
      style={inputStyle}
    />
  </div>

  {/* 实测边缘扩散 */}
  <div style={fieldStyle}>
    <label style={labelStyle}>
      实测边缘过渡宽度（mm）
    </label>

    <input
      type="number"
      step="0.1"
      placeholder="例如：3.5"
      value={realParams.edgeWidth}
      onChange={(e) =>
        handleParamChange("edgeWidth", e.target.value)
      }
      style={inputStyle}
    />
  </div>

  <div
    style={{
      marginTop: 18,
      padding: 14,
      borderRadius: 12,
      background: "rgba(23,50,77,0.05)",
      fontSize: 12,
      lineHeight: 1.7,
      opacity: 0.7,
    }}
  >
    请填写实验过程中真实记录或测量的数据。
    这些数据之后将作为 AI 盲测结果的验证依据。
  </div>
</div>

          </section>

          {/* 中间 */}
          <section style={cardStyle}>
            <div style={stepStyle}>02</div>

            <h2 style={titleStyle}>
              AI 盲测
            </h2>

            <p style={textStyle}>
              将作品交给 DyeInverse 分析，在不知道真实参数的情况下预测工艺。
            </p>

          <div style={{ marginTop: 24 }}>
  {!blindResult ? (
    <div
      style={{
        padding: "34px 24px",
        border: "1px dashed rgba(23,50,77,0.18)",
        borderRadius: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.8,
          opacity: 0.6,
          marginBottom: 20,
        }}
      >
        AI仅分析上传的真实作品照片，
        不读取左侧真实实验参数。
      </div>

      <button
        onClick={handleBlindTest}
        disabled={!realImageFile || isBlindTesting}
        style={{
          padding: "12px 24px",
          border: "none",
          borderRadius: 10,
          background: realImageFile ? "#17324d" : "#aab3bb",
          color: "white",
          cursor: realImageFile ? "pointer" : "not-allowed",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {isBlindTesting ? "AI正在盲测..." : "开始 AI 盲测"}
      </button>
    </div>
  ) : (
    <div>
      <div style={resultRowStyle}>
  <span>预测扎结数量</span>
  <strong>
    {blindResult.knotCount === null
      ? "—"
      : `${Math.round(blindResult.knotCount)} 个`}
  </strong>
</div>


      <div style={resultRowStyle}>
        <span>预测染液浓度</span>
        <strong>
          {blindResult.concentrationGL === null
            ? "—"
            : `${blindResult.concentrationGL.toFixed(1)} g/L`}
        </strong>
      </div>

      <div style={resultRowStyle}>
        <span>预测浸染时间</span>
        <strong>
          {blindResult.dyeTimeMin === null
            ? "—"
            : `${blindResult.dyeTimeMin.toFixed(1)} min`}
        </strong>
      </div>

      <div style={resultRowStyle}>
        <span>预测边缘过渡宽度</span>
        <strong>
          {blindResult.edgeWidthMM === null
            ? "—"
            : `${blindResult.edgeWidthMM.toFixed(1)} mm`}
        </strong>
      </div>
    </div>
  )}
</div>

          </section>

          {/* 右侧 */}
          <section style={cardStyle}>
            <div style={stepStyle}>03</div>

            <h2 style={titleStyle}>
              误差验证
            </h2>

            <p style={textStyle}>
              自动比较真实值与 AI 预测值，计算每项工艺参数的识别误差。
            </p>

           <div style={{ marginTop: 20 }}>
  {!validationResult ? (
    <div
      style={{
        padding: "34px 24px",
        border: "1px dashed rgba(23,50,77,0.18)",
        borderRadius: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.8,
          opacity: 0.6,
          marginBottom: 20,
        }}
      >
        完成 AI 盲测后，系统将比较真实实验值与 AI 预测值。
      </div>

      <button
        onClick={handleValidate}
        disabled={!blindResult}
        style={{
          padding: "12px 24px",
          border: "none",
          borderRadius: 10,
          background: blindResult
            ? "#17324d"
            : "#aab3bb",
          color: "white",
          cursor: blindResult
            ? "pointer"
            : "not-allowed",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        开始误差验证
      </button>
    </div>
  ) : (
    <div>
    <ValidationRow
  label="扎结数量"
  unit="个"
  metric={validationResult.knotCount}
/>


      <ValidationRow
        label="染液浓度"
        unit="g/L"
        metric={validationResult.concentration}
      />

      <ValidationRow
        label="浸染时间"
        unit="min"
        metric={validationResult.dyeTime}
      />

      <ValidationRow
        label="边缘过渡宽度"
        unit="mm"
        metric={validationResult.edgeWidth}
      />
    </div>
  )}
  <button
      onClick={handleSaveExperiment}
      disabled={!blindResult || !validationResult}
      style={{
        width: "100%",
        marginTop: 20,
        padding: "14px 20px",
        border: "none",
        borderRadius: 10,
        background:
          blindResult && validationResult
            ? "#17324d"
            : "#aab3bb",
        color: "#ffffff",
        cursor:
          blindResult && validationResult
            ? "pointer"
            : "not-allowed",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      保存本次真实实验
    </button>

</div>

          </section>
        </div>

        {/* 实验统计 */}
        <section
          style={{
            ...cardStyle,
            marginTop: 20,
          }}
        >
          <div style={stepStyle}>DATA</div>

          <h2 style={titleStyle}>
            真实实验总览
          </h2>

          <div
            style={{
              marginTop: 20,
              padding: 24,
              borderRadius: 16,
              background: "rgba(23, 50, 77, 0.04)",
            }}
          >
            <strong
              style={{
                fontSize: 22,
              }}
            >
           真实实验样本：{experiments.length} 组
            </strong>

            <p
              style={{
                marginBottom: 0,
                opacity: 0.6,
              }}
            >
              暂无统计结果。完成真实实验后，
              系统将在这里自动生成 AI 验证指标。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
function ValidationRow({
  label,
  unit,
  metric,
}: {
  label: string;
  unit: string;
  metric: import("../../lib/validation").ErrorMetric | null;
}) {
  if (!metric) return null;

  const directionText =
    metric.direction === "high"
      ? "AI偏高"
      : metric.direction === "low"
      ? "AI偏低"
      : "基本准确";

  const levelText =
    metric.level === "good"
      ? "误差较小"
      : metric.level === "mild"
      ? "轻微偏差"
      : metric.level === "medium"
      ? "中度偏差"
      : "明显偏差";

  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: "1px solid rgba(23,50,77,0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <span>
          真实值：{metric.actual.toFixed(2)} {unit}
        </span>

        <span>
          AI预测：{metric.predicted.toFixed(2)} {unit}
        </span>

        <span>
          绝对误差：{metric.absoluteError.toFixed(2)} {unit}
        </span>

        <span>
          相对误差：
          {metric.relativeErrorPercent.toFixed(1)}%
        </span>
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {directionText} · {levelText}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(23,50,77,0.10)",
  borderRadius: 22,
  padding: 26,
  boxShadow: "0 12px 40px rgba(23,50,77,0.06)",
};

const stepStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(23,50,77,0.08)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.1em",
};

const titleStyle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 10,
  fontSize: 22,
};

const textStyle: React.CSSProperties = {
  lineHeight: 1.75,
  opacity: 0.68,
  minHeight: 75,
};

const placeholderStyle: React.CSSProperties = {
  marginTop: 20,
  minHeight: 150,
  borderRadius: 16,
  border: "1px dashed rgba(23,50,77,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.48,
  fontSize: 14,
};
const fieldStyle: React.CSSProperties = {
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontSize: 13,
  fontWeight: 600,
  color: "#17324d",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid rgba(23,50,77,0.16)",
  background: "rgba(255,255,255,0.9)",
  color: "#17324d",
  outline: "none",
  fontSize: 14,
};
const resultRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid rgba(23,50,77,0.08)",
  fontSize: 14,
  color: "#17324d",
};
