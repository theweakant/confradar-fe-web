export interface SortOption {
    value: string;
    label: string;
}

export type DropdownSelectProps = {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    placeholder: string;
    id: string;
};