interface ToggleRowProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function ToggleRow({ checked, onChange, label, description, disabled = false }: ToggleRowProps) {
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <p className="toggle-label">{label}</p>
        {description ? <p className="toggle-description">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch${checked ? " is-on" : ""}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-knob" aria-hidden="true" />
      </button>
    </div>
  );
}
