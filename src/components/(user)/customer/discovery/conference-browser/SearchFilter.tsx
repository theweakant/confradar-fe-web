import React, { Fragment } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import { DayPicker } from "react-day-picker";
import { Slider } from "@/components/ui/slider";
import "react-day-picker/style.css";
import { CategoryOption } from '@/types/conference.type';
import { SortOption } from '@/types/ui-type/conference-browser.type';
import DropdownSelect from './DropdownSelect';

interface SearchFilterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    startDateFilter: Date | null;
    setStartDateFilter: (date: Date | null) => void;
    endDateFilter: Date | null;
    setEndDateFilter: (date: Date | null) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    categories: CategoryOption[];
    absoluteMaxPrice: number;
    allPrices: number[];
    sortOptions: SortOption[];
    openDropdown: string | null;
    setOpenDropdown: (dropdown: string | null) => void;
    // DropdownSelect: any;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    categories,
    absoluteMaxPrice,
    allPrices,
    sortOptions,
    openDropdown,
    setOpenDropdown,
    // DropdownSelect
}) => {
    return (
        <>
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm hội nghị..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 rounded-lg bg-gray-800/50 border border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <Filter size={20} className="text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Bộ lọc</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-300 mb-1">Danh mục</label>
                        <DropdownSelect
                            id="category"
                            value={selectedCategory}
                            options={categories}
                            onChange={setSelectedCategory}
                            placeholder="Danh mục"
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-300 mb-1">Ngày bắt đầu</label>
                        <Popover className="relative w-full">
                            {({ open }) => (
                                <>
                                    <Popover.Button
                                        className="w-full px-4 py-2 text-left bg-gray-800 text-white border border-gray-600 rounded-lg flex justify-between items-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {startDateFilter ? startDateFilter.toLocaleDateString() : 'Chọn ngày'}
                                        <ChevronDown className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
                                    </Popover.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <Popover.Panel className="absolute z-10 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg">
                                            <DayPicker
                                                mode="single"
                                                selected={startDateFilter || undefined}
                                                onSelect={(date) => setStartDateFilter(date ?? null)}
                                                required={false}
                                            />
                                            <div className="flex justify-between mt-2 gap-2">
                                                <button
                                                    onClick={() => setStartDateFilter(null)}
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    onClick={() => setStartDateFilter(new Date())}
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                                                >
                                                    Today
                                                </button>
                                            </div>
                                        </Popover.Panel>
                                    </Transition>
                                </>
                            )}
                        </Popover>
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-300 mb-1">Ngày kết thúc</label>
                        <Popover className="relative w-full">
                            {({ open }) => (
                                <>
                                    <Popover.Button
                                        className="w-full px-4 py-2 text-left bg-gray-800 text-white border border-gray-600 rounded-lg flex justify-between items-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {endDateFilter ? endDateFilter.toLocaleDateString() : 'Chọn ngày'}
                                        <ChevronDown className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
                                    </Popover.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <Popover.Panel className="absolute z-10 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg">
                                            <DayPicker
                                                mode="single"
                                                selected={endDateFilter || undefined}
                                                onSelect={(date) => setEndDateFilter(date ?? null)}
                                                required={false}
                                            />
                                            <div className="flex justify-between mt-2 gap-2">
                                                <button
                                                    onClick={() => setEndDateFilter(null)}
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    onClick={() => setEndDateFilter(new Date())}
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                                                >
                                                    Today
                                                </button>
                                            </div>
                                        </Popover.Panel>
                                    </Transition>
                                </>
                            )}
                        </Popover>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">Khoảng giá (VND)</label>
                        <Slider
                            min={0}
                            max={absoluteMaxPrice}
                            step={50000}
                            value={priceRange}
                            disabled={!allPrices.length}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                        {!allPrices.length && (
                            <p className="text-xs text-red-400 italic">
                                Bộ lọc giá hiện không khả dụng
                            </p>
                        )}

                        {allPrices.length > 0 && (
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{priceRange[0].toLocaleString()}đ</span>
                                <span>{priceRange[1].toLocaleString()}đ</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-300 mb-1">Sắp xếp theo:</label>
                        <DropdownSelect
                            id="sort"
                            value={sortBy}
                            options={sortOptions}
                            onChange={setSortBy}
                            placeholder="Sắp xếp"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchFilter;