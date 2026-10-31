import { Search, X } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search app name or package",
  autoFocus = false,
  label = "Search apps",
}: SearchFieldProps) {
  return (
    <div className="search-field">
      <Search size={18} className="search-icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={() => onChange("")}>
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
