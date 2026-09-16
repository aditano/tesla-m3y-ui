export function ToggleRow({
  on,
  label,
  hint,
  onClick,
}: {
  on: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button className="row" type="button" onClick={onClick}>
      <span className="row-copy">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className={`toggle ${on ? "on" : ""}`} aria-hidden="true">
        <i />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          className={value === opt.id ? "on" : ""}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FollowPips({
  value,
  onChange,
}: {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onChange: (n: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
}) {
  const steps = [1, 2, 3, 4, 5, 6, 7] as const;
  return (
    <div className="follow-picker">
      {steps.map((n) => (
        <button key={n} type="button" className={value === n ? "on" : ""} onClick={() => onChange(n)}>
          {n}
        </button>
      ))}
    </div>
  );
}
