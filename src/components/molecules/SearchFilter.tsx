import { SearchBar } from "./SearchBar";
import { SelectSection } from "./SelectSection";

interface SelectOption {
  value: string;
  label: string;
}

interface FilterConfig {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  className?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  className = "",
}: SearchFilterProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

        {filters.map((filter, index) => (
          <SelectSection
            key={index}
            value={filter.value}
            onValueChange={filter.onValueChange}
            options={filter.options}
            placeholder={filter.placeholder}
            className={filter.className}
          />
        ))}
      </div>
    </div>
  );
}
