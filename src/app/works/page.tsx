"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteWork,
  loadWorks,
  type SavedWork,
} from "../../lib/storage";
import { FOLD_LABELS } from "../../lib/dye";

export default function WorksPage() {
  const [works, setWorks] = useState<SavedWork[]>([]);

  useEffect(() => {
    setWorks(loadWorks());
  }, []);

  const remove = (id: string) => {
    deleteWork(id);
    setWorks(loadWorks());
  };

  return (
    <section className="page-section">
      <div className="shell">
        <div className="page-heading">
          <div>
            <div className="eyebrow">LOCAL ARCHIVE</div>
            <h1>我的数字样布</h1>
          </div>
          <p>
            第一版先把作品存到浏览器 localStorage，不需要数据库也能完成“设计—保存—回看”的闭环。
          </p>
        </div>

        {works.length ? (
          <div className="works-grid">
            {works.map((work) => (
              <article className="work-card" key={work.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={work.image} alt={work.name} />
                <div className="work-body">
                  <span className="tag">{FOLD_LABELS[work.params.fold]}</span>
                  <h3>{work.name}</h3>
                  <p>
                    扎结 {work.params.knots} · 力度 {work.params.tightness}% · 浓度{" "}
                    {work.params.concentration}%
                  </p>
                  <div className="work-actions">
                    <a href={work.image} download={`${work.name}.png`}>
                      导出
                    </a>
                    <button onClick={() => remove(work.id)}>删除</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-works">
            <span>EMPTY ARCHIVE</span>
            <h2>还没有保存作品</h2>
            <p>先去虚拟试染工坊调出一块你喜欢的样布，再点击“保存作品”。</p>
            <Link className="button primary" href="/workshop">
              去试染
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
