type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  onChange: (value: number) => void;
};

export default function RangeControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  hint,
  onChange,
}: Props) {
  return (
    <label className="range-control">
      <span className="range-title">
        <span>{label}</span>
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
