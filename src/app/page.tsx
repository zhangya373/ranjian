import Link from "next/link";
import DyePreview from "../components/DyePreview";
import ProcessStrip from "../components/ProcessStrip";
import { PRESETS } from "../lib/dye";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">AI × 非遗扎染 × 工艺仿真</div>
            <h1>
              不只生成图案，
              <br />
              更找到<span>做出它的方法。</span>
            </h1>
            <p>
              「染见」把传统扎染中的折叠、扎结、浓度、染时与扩散参数转化为可计算的数字工艺，
              支持虚拟试染、目标图案逆向推演与复刻训练。
            </p>

            <div className="hero-actions">
              <Link className="button primary" href="/workshop">
                开始虚拟试染
              </Link>
              <Link className="button ghost" href="/reverse">
                上传图案 · AI反推工艺
              </Link>
            </div>

            <div className="hero-facts">
              <div>
                <strong>7+</strong>
                <span>可调工艺参数</span>
              </div>
              <div>
                <strong>4</strong>
                <span>数字折染模型</span>
              </div>
              <div>
                <strong>双向</strong>
                <span>结果 ↔ 工艺推演</span>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="paper-note">Digital Dye No. 01</div>
            <DyePreview params={PRESETS[0].params} />
            <div className="hero-art-caption">
              <span>中心放射折</span>
              <span>扎结 6 · 浓度 78%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <div className="eyebrow">核心逻辑</div>
              <h2>把“经验试错”变成“可预演、可解释、可复刻”</h2>
            </div>
            <p>
              先在数字工坊中调参数观察结果，再从目标图案反推出建议工艺，
              最后用复刻挑战检验“做得像不像”。
            </p>
          </div>
          <ProcessStrip />
        </div>
      </section>

      <section className="section alt-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <div className="eyebrow">虚拟样布</div>
              <h2>同一种靛蓝，不同工艺会产生不同纹样</h2>
            </div>
            <Link className="text-link" href="/workshop">
              进入工坊 →
            </Link>
          </div>

          <div className="preset-grid">
            {PRESETS.map((preset) => (
              <article className="preset-card" key={preset.name}>
                <DyePreview params={preset.params} />
                <div className="preset-body">
                  <span className="tag">数字工艺样本</span>
                  <h3>{preset.name}</h3>
                  <p>{preset.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell feature-grid">
          <article className="feature-card">
            <span>01</span>
            <h3>虚拟试染</h3>
            <p>拖动扎结力度、浓度、时间、扩散等参数，画布实时反馈纹样变化。</p>
          </article>
          <article className="feature-card">
            <span>02</span>
            <h3>逆向工艺</h3>
            <p>上传目标扎染图，提取留白、对称、边界与主色特征，给出工艺建议。</p>
          </article>
          <article className="feature-card">
            <span>03</span>
            <h3>复刻训练</h3>
            <p>面对一个目标样布自己调工艺，系统计算像素相似度并给出复刻分数。</p>
          </article>
        </div>
      </section>
    </>
  );
}
