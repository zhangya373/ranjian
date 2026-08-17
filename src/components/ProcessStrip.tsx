const steps = [
  ["01", "折叠", "Fold"],
  ["02", "扎结", "Bind"],
  ["03", "浸染", "Dye"],
  ["04", "扩散", "Diffuse"],
  ["05", "展开", "Reveal"],
];

export default function ProcessStrip() {
  return (
    <div className="process-strip" aria-label="扎染工艺流程">
      {steps.map(([no, cn, en], index) => (
        <div className="process-step" key={no}>
          <span>{no}</span>
          <strong>{cn}</strong>
          <small>{en}</small>
          {index < steps.length - 1 ? <i>→</i> : null}
        </div>
      ))}
    </div>
  );
}
