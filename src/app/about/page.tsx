export default function AboutPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <div className="page-heading">
          <div>
            <div className="eyebrow">ABOUT RANJIAN</div>
            <h1>关于「染见」</h1>
          </div>
          <p>
            这是一个面向非遗扎染学习、创作预演和工艺数字化的学生创新项目原型。
          </p>
        </div>

        <div className="about-grid">
          <article className="about-card wide">
            <span className="panel-kicker">WHY</span>
            <h2>我们想解决什么？</h2>
            <p>
              普通生成式AI擅长“生成一个好看的扎染图”，但它通常不会告诉使用者：
              这块纹样可能由什么折法、多少处扎结、怎样的阻染力度和染色过程形成。
              「染见」把关注点从“结果生成”转向“工艺理解与可复刻设计”。
            </p>
          </article>

          <article className="about-card">
            <span>01</span>
            <h3>DyeForward</h3>
            <p>输入工艺参数，实时仿真数字样布，观察参数变化对纹样的影响。</p>
          </article>

          <article className="about-card">
            <span>02</span>
            <h3>DyeInverse</h3>
            <p>从目标纹样提取视觉特征，再反推出一组可解释的建议工艺参数。</p>
          </article>

          <article className="about-card">
            <span>03</span>
            <h3>Similarity</h3>
            <p>把目标样布与复刻样布进行比较，为非遗学习提供量化反馈。</p>
          </article>

          <article className="about-card wide">
            <span className="panel-kicker">ROADMAP</span>
            <h2>从比赛原型到真正AI</h2>
            <div className="roadmap">
              <div>
                <strong>V1 · 现在</strong>
                <p>Canvas工艺仿真 + 图像特征逆向 + 本地作品库。</p>
              </div>
              <div>
                <strong>V2 · 数据化</strong>
                <p>采集真实扎染“工艺参数—结果照片”成对数据，建立训练集。</p>
              </div>
              <div>
                <strong>V3 · 模型化</strong>
                <p>训练折法分类、参数回归和相似度模型，替换规则推演模块。</p>
              </div>
              <div>
                <strong>V4 · 落地</strong>
                <p>接入Supabase账号/作品库与云端模型，支持教学与文创共创。</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
