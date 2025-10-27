"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownSelectProps {
    id?: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
    id,
    value,
    options,
    onChange,
    placeholder,
}) => {
    const [open, setOpen] = useState(false);

    const toggleDropdown = () => setOpen((prev) => !prev);
    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setOpen(false);
    };

    return (
        <div className="relative" id={id}>
            <button
                type="button"
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all shadow-md"
            >
                <span className="text-sm">
                    {options.find((opt) => opt.value === value)?.label || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors ${option.value === value ? "bg-gray-700" : ""
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownSelect;