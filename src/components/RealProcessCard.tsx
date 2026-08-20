import { tightnessLabel } from "../lib/processMapping";

type Props = {
  tightness: number;
  tensionN: number | null;
  concentrationGL: number | null;
  dyeTimeMin: number | null;
  edgeWidthMM: number | null;
};

function showValue(value: number | null, unit: string) {
  if (value === null) return "待实验标定";
  return `${value.toFixed(1)} ${unit}`;
}

export default function RealProcessCard({
  tightness,
  tensionN,
  concentrationGL,
  dyeTimeMin,
  edgeWidthMM,
}: Props) {
  return (
    <section
      style={{
        marginTop: 18,
        padding: 20,
        border: "1px solid rgba(20,54,91,.14)",
        borderRadius: 18,
        background: "#faf8f2",
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: 0.55,
        }}
      >
        REAL PROCESS
      </div>

      <h3
        style={{
          margin: "5px 0 6px",
        }}
      >
        现实工艺参数映射
      </h3>

      <p
        style={{
          fontSize: 13,
          opacity: 0.65,
        }}
      >
        将 DyeSim 数字参数转换为现实扎染可执行参数
      </p>

      <Row
        name="扎结等级"
        value={tightnessLabel(tightness)}
      />

      <Row
        name="绳张力"
        value={showValue(tensionN, "N")}
      />

      <Row
        name="染液浓度"
        value={showValue(concentrationGL, "g/L")}
      />

      <Row
        name="现实染色时间"
        value={showValue(dyeTimeMin, "min")}
      />

      <Row
        name="预计边缘扩散"
        value={showValue(edgeWidthMM, "mm")}
      />

      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 12,
          background: "rgba(20,54,91,.06)",
          fontSize: 12,
          lineHeight: 1.7,
          opacity: 0.75,
        }}
      >
        V1 经验标定：基于公开靛蓝扎染工艺资料与工程估算建立，
        用于数字试染与现实工艺之间的初步映射，后续可通过真实样本继续校准。
      </div>
    </section>
  );
}

function Row({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "9px 0",
        borderBottom: "1px solid rgba(20,54,91,.08)",
      }}
    >
      <span
        style={{
          opacity: 0.65,
        }}
      >
        {name}
      </span>

      <strong
        style={{
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}
