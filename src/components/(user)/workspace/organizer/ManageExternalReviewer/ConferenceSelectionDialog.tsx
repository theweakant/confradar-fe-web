import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Conference, ConferenceStatus } from '@/types/conference.type';
import { ApiResponse, ApiResponsePagination } from '@/types/api.type';
import { City } from '@/types/city.type';

interface ConferenceSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectConference: (conference: Conference) => void;
    conferencesData: ApiResponsePagination<Conference[]> | undefined;
    isLoadingConferences: boolean;
    citiesData: ApiResponse<City[]> | undefined;
    conferenceStatusesData: ApiResponse<ConferenceStatus[]> | undefined;
    conferenceFilters: {
        page: number;
        pageSize: number;
        searchKeyword: string;
        cityId: string;
        conferenceStatusId: string;
        startDate: string;
        endDate: string;
    };
    onFilterChange: (key: string, value: any) => void;
    onPageChange: (newPage: number) => void;
    onClearFilters: () => void;
}

export const ConferenceSelectionDialog: React.FC<ConferenceSelectionDialogProps> = ({
    isOpen,
    onClose,
    onSelectConference,
    conferencesData,
    isLoadingConferences,
    citiesData,
    conferenceStatusesData,
    conferenceFilters,
    onFilterChange,
    onPageChange,
    onClearFilters,
}) => {
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                        Chọn hội nghị nghiên cứu
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Search and Filters */}
                                <div className="space-y-3 mb-4">
                                    {/* Search */}
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo tên hội nghị..."
                                            value={conferenceFilters.searchKeyword}
                                            onChange={(e) => onFilterChange('searchKeyword', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Filters Row 1 */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <select
                                            value={conferenceFilters.cityId}
                                            onChange={(e) => onFilterChange('cityId', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Tất cả thành phố</option>
                                            {Array.isArray(citiesData?.data) &&
                                                citiesData.data.map((city: City) => (
                                                    <option key={city.cityId} value={city.cityId}>
                                                        {city.cityName}
                                                    </option>
                                                ))}
                                        </select>

                                        <select
                                            value={conferenceFilters.conferenceStatusId}
                                            onChange={(e) => onFilterChange('conferenceStatusId', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Tất cả trạng thái</option>
                                            {Array.isArray(conferenceStatusesData?.data) &&
                                                conferenceStatusesData.data.map((status: ConferenceStatus) => (
                                                    <option key={status.conferenceStatusId} value={status.conferenceStatusId}>
                                                        {status.conferenceStatusName}
                                                    </option>
                                                ))}
                                        </select>

                                        <select
                                            value={conferenceFilters.pageSize}
                                            onChange={(e) => onFilterChange('pageSize', parseInt(e.target.value))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="6">6 / trang</option>
                                            <option value="9">9 / trang</option>
                                            <option value="12">12 / trang</option>
                                            <option value="18">18 / trang</option>
                                        </select>
                                    </div>

                                    {/* Filters Row 2 - Date Range */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
                                            <input
                                                type="date"
                                                value={conferenceFilters.startDate}
                                                onChange={(e) => onFilterChange('startDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
                                            <input
                                                type="date"
                                                value={conferenceFilters.endDate}
                                                onChange={(e) => onFilterChange('endDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Clear Filters Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={onClearFilters}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Xóa tất cả bộ lọc
                                        </button>
                                    </div>
                                </div>

                                {/* Conference Grid */}
                                {isLoadingConferences ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="text-gray-600 ml-3">Đang tải danh sách hội nghị...</p>
                                    </div>
                                ) : (conferencesData?.data?.items?.length ?? 0) > 0 ? (
                                    <>
                                        {/* Results Count */}
                                        <div className="text-sm text-gray-600 mb-3">
                                            Tìm thấy {conferencesData?.data.totalItems || conferencesData?.data.totalCount} hội nghị
                                        </div>

                                        {/* Conference Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto mb-4">
                                            {conferencesData?.data.items.map((conference: Conference) => (
                                                <div
                                                    key={conference.conferenceId}
                                                    onClick={() => onSelectConference(conference)}
                                                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                                                >
                                                    {conference.bannerImageUrl ? (
                                                        <img
                                                            src={conference.bannerImageUrl}
                                                            alt={conference.conferenceName}
                                                            className="w-full h-32 object-cover rounded-md mb-2"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                                                            <span className="text-gray-400 text-sm">Không có ảnh</span>
                                                        </div>
                                                    )}
                                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                                        {conference.conferenceName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        ID: {conference.conferenceId}
                                                    </p>
                                                    {conference.startDate && (
                                                        <p className="text-xs text-gray-500">
                                                            📅 {formatDate(conference.startDate)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {(conferencesData?.data?.totalPages ?? 0) > 1 && (
                                            <div className="flex items-center justify-between border-t pt-4">
                                                <div className="text-sm text-gray-600">
                                                    Trang {conferenceFilters.page} / {conferencesData?.data.totalPages}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => onPageChange(1)}
                                                        disabled={conferenceFilters.page === 1}
                                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                    >
                                                        Đầu
                                                    </button>
                                                    <button
                                                        onClick={() => onPageChange(conferenceFilters.page - 1)}
                                                        disabled={conferenceFilters.page === 1}
                                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                    >
                                                        Trước
                                                    </button>
                                                    <span className="px-3 py-1 text-sm text-gray-700">
                                                        {conferenceFilters.page}
                                                    </span>
                                                    <button
                                                        onClick={() => onPageChange(conferenceFilters.page + 1)}
                                                        disabled={conferenceFilters.page === conferencesData?.data.totalPages}
                                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                    >
                                                        Sau
                                                    </button>
                                                    <button
                                                        onClick={() => onPageChange(conferencesData?.data?.totalPages ?? 1)}
                                                        disabled={conferenceFilters.page === (conferencesData?.data?.totalPages ?? 1)}
                                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                    >
                                                        Cuối
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        Không tìm thấy hội nghị nào
                                    </div>
                                )}

                                {/* Back Button */}
                                <div className="flex justify-start mt-4 pt-4 border-t">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        ← Quay lại
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};