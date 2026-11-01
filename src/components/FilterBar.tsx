export interface ChipOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  chips?: ChipOption[];
  activeChip?: string;
  onChipChange?: (value: string) => void;
  sortOptions?: SortOption[];
  sort?: string;
  onSortChange?: (value: string) => void;
}

export function FilterBar({
  chips,
  activeChip,
  onChipChange,
  sortOptions,
  sort,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      {chips && chips.length > 0 ? (
        <div className="chip-row" role="group" aria-label="Filter apps">
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`chip${activeChip === chip.value ? " is-active" : ""}`}
              aria-pressed={activeChip === chip.value}
              onClick={() => onChipChange?.(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}

      {sortOptions && sortOptions.length > 0 ? (
        <div className="segmented" role="group" aria-label="Sort order">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`segmented-btn${sort === option.value ? " is-active" : ""}`}
              aria-pressed={sort === option.value}
              onClick={() => onSortChange?.(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
