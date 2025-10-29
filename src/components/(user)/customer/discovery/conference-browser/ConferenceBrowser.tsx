"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConference } from '@/redux/hooks/conference/useConference';
import { useGetAllCategoriesQuery } from '@/redux/services/category.service';
import { useGetAllCitiesQuery } from '@/redux/services/city.service';
import { CategoryOption, ConferenceResponse } from '@/types/conference.type';
import { Category } from '@/types/category.type';
import { City } from '@/types/city.type';
import { mockStatusData } from '@/data/mockStatus.data';

import "react-day-picker/style.css";
import SearchFilter from './SearchFilter';
import ConferenceList from './ConferenceList';
import Pagination from './Pagination';
import { SortOption } from '@/types/ui-type/conference-browser.type';
import { getCurrentPrice } from '@/utils/conferenceUtils';


interface SearchSortFilterConferenceProps {
  bannerFilter?: 'technical' | 'research' | 'all';
}


// const SearchSortFilterConference: React.FC = () => {
const ConferenceBrowser: React.FC<SearchSortFilterConferenceProps> = ({
  bannerFilter = 'all'
}) => {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  // const [startDateFilter, setStartDateFilter] = useState<string | null>(null);
  // const [endDateFilter, setEndDateFilter] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);

  // const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  // const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // const startDateFilter = dateRange[0];
  // const endDateFilter = dateRange[1];

  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const itemsPerPage = 12;

  const {
    // defaultConferences,
    lazyConferencesWithPrices,
    statusConferences,
    // fetchDefaultConferences,
    fetchConferencesWithPrices,
    fetchConferencesByStatus,
    defaultLoading,
    lazyWithPricesLoading,
    statusConferencesLoading,
    defaultError,
    lazyWithPricesError,
    statusConferencesError
  } = useConference({ page: currentPage, pageSize: itemsPerPage });

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetAllCategoriesQuery();
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useGetAllCitiesQuery();

  const getCurrentConferences = (): ConferenceResponse[] => {
    if (selectedStatus !== 'all') {
      return statusConferences?.items || [];
    } else {
      return lazyConferencesWithPrices?.items || [];
    }
    // else if (searchQuery || selectedCity !== 'all' || startDateFilter || endDateFilter) {
    //   return lazyConferencesWithPrices?.items || [];
    // } else return []
    // else {
    //   return defaultConferences?.items || [];
    // }
  };

  const currentConferences = getCurrentConferences();

  const allPrices = currentConferences.flatMap(conf =>
    (conf?.conferencePrices ?? [])
      .map(p => getCurrentPrice(p))
      .filter(price => typeof price === 'number' && price > 0)
  );
  // const allPrices = React.useMemo(() => {
  //   return currentConferences.flatMap(conf =>
  //     (conf?.conferencePrices ?? [])
  //       .map(p => getCurrentPrice(p))
  //     // .filter(price => typeof price === 'number' && price > 0)
  //   );
  // }, [currentConferences]);

  // const absoluteMaxPrice = React.useMemo(() => {
  //   return allPrices.length ? Math.max(...allPrices) : 0;
  // }, [allPrices]);

  // const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const absoluteMaxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  const [priceRange, setPriceRange] = useState<[number, number]>([0, absoluteMaxPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedStatus, selectedLocation, selectedPrice, selectedRating, sortBy]);

  useEffect(() => {
    const hasFilters = searchQuery || selectedCity !== 'all' || startDateFilter || endDateFilter;

    if (selectedStatus !== 'all') {
      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        ...(searchQuery && { searchKeyword: searchQuery }),
        ...(selectedCity !== 'all' && { cityId: selectedCity }),
        ...(startDateFilter && { startDate: startDateFilter.toISOString().split('T')[0] }),
        ...(endDateFilter && { endDate: endDateFilter.toISOString().split('T')[0] })
      };
      fetchConferencesByStatus(selectedStatus, params);
    } else {
      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        ...(searchQuery && { searchKeyword: searchQuery }),
        ...(selectedCity !== 'all' && { cityId: selectedCity }),
        ...(startDateFilter && { startDate: startDateFilter.toISOString().split('T')[0] }),
        ...(endDateFilter && { endDate: endDateFilter.toISOString().split('T')[0] })
      };
      fetchConferencesWithPrices(params);
    }
    // else if (hasFilters) {
    //   const params = {
    //     page: currentPage,
    //     pageSize: itemsPerPage,
    //     ...(searchQuery && { searchKeyword: searchQuery }),
    //     ...(selectedCity !== 'all' && { cityId: selectedCity }),
    //     ...(startDateFilter && { startDate: startDateFilter.toISOString().split('T')[0] }),
    //     ...(endDateFilter && { endDate: endDateFilter.toISOString().split('T')[0] })
    //   };
    //   fetchConferencesWithPrices(params);
    // }
    // else {
    //   fetchDefaultConferences({ page: currentPage, pageSize: itemsPerPage });
    // }
  }, [currentPage, searchQuery, selectedCity, selectedStatus, startDateFilter, endDateFilter, fetchConferencesWithPrices, fetchConferencesByStatus]);

  //   useEffect(() => {
  //   if (absoluteMaxPrice > 0) {
  //     setPriceRange(prev => {
  //       const prevIsDefault = prev[1] === 0 || prev[1] === 5000000;
  //       return prevIsDefault
  //         ? [0, absoluteMaxPrice]
  //         : [
  //             Math.min(prev[0], absoluteMaxPrice),
  //             Math.min(prev[1], absoluteMaxPrice),
  //           ];
  //     });
  //   }
  // }, [absoluteMaxPrice]);

  useEffect(() => {
    if (absoluteMaxPrice > 0) {
      setPriceRange([0, absoluteMaxPrice]);
    }
  }, [absoluteMaxPrice]);

  const categories: CategoryOption[] = [
    { value: 'all', label: 'Tất cả danh mục' },
    ...(categoriesData?.data?.map((cat: Category) => ({
      value: cat.conferenceCategoryId,
      label: cat.conferenceCategoryName
    })) || [])
  ];

  const cities: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả thành phố' },
    ...(citiesData?.data?.map((city: City) => ({
      value: city.cityId,
      label: city.cityName ?? 'Thành phố không xác định'
    })) || [])
  ];

  const statuses: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...mockStatusData.map((status) => ({
      value: status.statusId,
      label: status.name
    }))
  ];

  // const locations = [
  //   { value: 'all', label: 'Tất cả địa điểm' },
  //   { value: 'hanoi', label: 'Hà Nội' },
  //   { value: 'hcm', label: 'TP.HCM' },
  //   { value: 'danang', label: 'Đà Nẵng' },
  //   { value: 'cantho', label: 'Cần Thơ' }
  // ];

  const sortOptions: SortOption[] = [
    { value: 'date', label: 'Ngày diễn ra' },
    { value: 'price-low', label: 'Giá thấp đến cao' },
    { value: 'price-high', label: 'Giá cao đến thấp' },
    { value: 'attendees-low', label: 'Số người tham gia thấp → cao' },
    { value: 'attendees-high', label: 'Số người tham gia cao → thấp' },
  ];

  const getMinPrice = (conf: ConferenceResponse) => {
    if (!conf.conferencePrices || conf.conferencePrices.length === 0) return null;
    return Math.min(...conf.conferencePrices.map(p => getCurrentPrice(p)));
  };

  const getMaxPrice = (conf: ConferenceResponse) => {
    if (!conf.conferencePrices || conf.conferencePrices.length === 0) return null;
    return Math.max(...conf.conferencePrices.map(p => getCurrentPrice(p)));
  };

  const filteredConferences = currentConferences.filter((conf: ConferenceResponse) => {
    const confType = conf.isResearchConference ? 'research' : 'technical';
    const matchesBannerFilter = bannerFilter === 'all' || confType === bannerFilter;

    const matchesCategory = selectedCategory === 'all' || conf.conferenceCategoryId === selectedCategory;

    if (absoluteMaxPrice === 0) {
      return matchesBannerFilter && matchesCategory;
    }

    const minPrice = getMinPrice(conf);
    const maxPrice = getMaxPrice(conf);

    if (minPrice === null || maxPrice === null) {
      return matchesBannerFilter && matchesCategory;
    }

    const matchesPrice = (minPrice <= priceRange[1]) && (maxPrice >= priceRange[0]);

    return matchesBannerFilter && matchesCategory && matchesPrice;
  });

  // const filteredConferences = mockConferences.filter(conf => {
  //   const matchesSearch = conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     conf.description.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesCategory = selectedCategory === 'all' || conf.category === selectedCategory;
  //   const matchesLocation = selectedLocation === 'all' ||
  //     conf.location.toLowerCase().includes(locations.find(l => l.value === selectedLocation)?.label.toLowerCase() || '');
  //   const matchesRating = selectedRating === 'all' ||
  //     (selectedRating === '4plus' && conf.rating >= 4) ||
  //     (selectedRating === '4.5plus' && conf.rating >= 4.5) ||
  //     (selectedRating === '4.8plus' && conf.rating >= 4.8);

  //   return matchesSearch && matchesCategory && matchesLocation && matchesRating;
  // });

  const sortedConferences = [...filteredConferences].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': {
        const aMin = getMinPrice(a) ?? Infinity;
        const bMin = getMinPrice(b) ?? Infinity;
        return aMin - bMin;
      }
      case 'price-high': {
        const aMax = getMaxPrice(a) ?? 0;
        const bMax = getMaxPrice(b) ?? 0;
        return bMax - aMax;
      }
      case 'attendees-low':
        return (a.totalSlot ?? 0) - (b.totalSlot ?? 0);
      case 'attendees-high':
        return (b.totalSlot ?? 0) - (a.totalSlot ?? 0);
      case 'date':
      default:
        return new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime();
    }
  });

  const getPaginationData = () => {
    const filteredCount = sortedConferences.length;

    if (selectedStatus !== 'all') {
      const apiResponse = statusConferences;
      if (apiResponse) {
        return {
          totalPages: apiResponse.totalPages,
          totalCount: filteredCount,
          currentPage: currentPage,
          pageSize: itemsPerPage,
          paginatedConferences: sortedConferences
        };
      }
    } else {
      const apiResponse = lazyConferencesWithPrices;
      if (apiResponse) {
        return {
          totalPages: apiResponse.totalPages,
          totalCount: filteredCount,
          currentPage: currentPage,
          pageSize: itemsPerPage,
          paginatedConferences: sortedConferences
        };
      }
      // else if (searchQuery || selectedCity !== 'all' || startDateFilter || endDateFilter) {
      //   const apiResponse = lazyConferencesWithPrices;
      //   if (apiResponse) {
      //     return {
      //       totalPages: apiResponse.totalPages,
      //       totalCount: filteredCount,
      //       currentPage: currentPage,
      //       pageSize: itemsPerPage,
      //       paginatedConferences: sortedConferences
      //     };
      //   }
    }
    // else {
    //   const apiResponse = defaultConferences;
    //   if (apiResponse) {
    //     return {
    //       totalPages: apiResponse.totalPages,
    //       totalCount: filteredCount,
    //       currentPage: currentPage,
    //       pageSize: itemsPerPage,
    //       paginatedConferences: sortedConferences
    //     };
    //   }
    // }

    return {
      // totalPages: Math.ceil(filteredCount / itemsPerPage),
      totalPages: 0,
      totalCount: filteredCount,
      currentPage: currentPage,
      pageSize: itemsPerPage,
      paginatedConferences: sortedConferences
    };
  };

  const { totalPages, totalCount, currentPage: serverCurrentPage, pageSize: serverPageSize, paginatedConferences } = getPaginationData();

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // const DropdownSelect = ({
  //   value,
  //   options,
  //   onChange,
  //   placeholder,
  //   id
  // }: {
  //   value: string;
  //   options: { value: string; label: string }[];
  //   onChange: (value: string) => void;
  //   placeholder: string;
  //   id: string;
  // }) => (
  //   <div className="relative">
  //     <button
  //       onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
  //       className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all shadow-md"
  //     // className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-4xl hover:bg-gray-700 transition-colors"
  //     >
  //       <span className="text-sm">
  //         {options.find(opt => opt.value === value)?.label || placeholder}
  //       </span>
  //       <ChevronDown size={16} className={`transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
  //     </button>

  //     {openDropdown === id && (
  //       <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
  //         {options.map((option) => (
  //           <button
  //             key={option.value}
  //             onClick={() => {
  //               onChange(option.value);
  //               setOpenDropdown(null);
  //             }}
  //             className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
  //           >
  //             {option.label}
  //           </button>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );

  return (
    <div className="text-white p-4 pb-12">
      <div className="max-w-6xl mx-auto bg-gray-900/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">

        <SearchFilter
          searchQuery={searchInput}
          setSearchQuery={setSearchInput}
          onSearchSubmit={() => {
            setSearchQuery(searchInput);
            setCurrentPage(1);
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          startDateFilter={startDateFilter}
          setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter}
          setEndDateFilter={setEndDateFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          cities={cities}
          statuses={statuses}
          absoluteMaxPrice={absoluteMaxPrice}
          allPrices={allPrices}
          sortOptions={sortOptions}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          onClearFilters={() => {
            setSearchInput('');
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedCity('all');
            setSelectedStatus('all');
            setStartDateFilter(null);
            setEndDateFilter(null);
            setPriceRange([0, absoluteMaxPrice]);
            setSortBy('date');
          }}
        // DropdownSelect={DropdownSelect}
        />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Kết quả hội nghị {bannerFilter === 'technical' ? 'Kỹ thuật' : 'Nghiên cứu'} ({totalCount} hội nghị)
          </h2>
          {(defaultLoading || lazyWithPricesLoading || statusConferencesLoading) && (
            <div className="text-sm text-blue-400">Đang tải...</div>
          )}
          <div className="text-sm text-gray-400">
            Trang {currentPage} / {totalPages} (Hiển thị {paginatedConferences.length} / {totalCount})
          </div>
        </div>

        {(defaultLoading || lazyWithPricesLoading || statusConferencesLoading) && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {(defaultError || lazyWithPricesError || statusConferencesError) && (
          <div className="flex justify-center items-center py-12">
            <div className="text-red-400 text-center">
              <p>Có lỗi xảy ra khi tải dữ liệu hội nghị {bannerFilter === 'technical' ? 'kỹ thuật' : 'nghiên cứu'}</p>
              <p className="text-sm mt-2">{defaultError?.data?.message || lazyWithPricesError?.data?.message || statusConferencesError?.data?.message}</p>
            </div>
          </div>
        )}

        {!defaultLoading && !lazyWithPricesLoading && !statusConferencesLoading &&
          !defaultError && !lazyWithPricesError && !statusConferencesError &&
          totalCount === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400 text-center">
                <p>Không tìm thấy hội nghị {bannerFilter === 'technical' ? 'kỹ thuật' : 'nghiên cứu'} nào</p>
                <p className="text-sm mt-2">Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
              </div>
            </div>
          )}

        {totalCount > 0 && (
          <ConferenceList
            paginatedConferences={paginatedConferences}
            getMinPrice={getMinPrice}
            getMaxPrice={getMaxPrice}
            formatDate={formatDate}
            // onCardClick={(conferenceId) => router.push(`/customer/discovery/conference-detail/${conferenceId}`)}
            onCardClick={(conference) => {
              const type = conference.isResearchConference ? 'research' : 'technical';
              router.push(`/customer/discovery/${type}/${conference.conferenceId}`);
            }}
          />
        )}

        {totalCount > 0 && totalPages > 1 && (
          <Pagination
            currentPage={serverCurrentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ConferenceBrowser;


//version chụp report 3
// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Search,
//   Filter,
//   Calendar,
//   MapPin,
//   Users,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// interface Conference {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   date: string;
//   location: string;
//   price: number;
//   rating: number;
//   reviewCount: number;
//   attendees: number;
//   image: string;
//   organizer: string;
//   status: "upcoming" | "ongoing" | "completed";
// }

// interface SearchSortFilterConferenceProps {
//   bannerFilter?: "technical" | "research" | "all";
// }

// const ConferenceBrowser: React.FC<SearchSortFilterConferenceProps> = ({
//   bannerFilter = "all",
// }) => {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [selectedLocation, setSelectedLocation] = useState("all");
//   const [selectedPrice, setSelectedPrice] = useState("all");
//   const [selectedRating, setSelectedRating] = useState("all");
//   const [sortBy, setSortBy] = useState("date");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [openDropdown, setOpenDropdown] = useState<string | null>(null);

//   const itemsPerPage = 12;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [
//     searchQuery,
//     selectedCategory,
//     selectedLocation,
//     selectedPrice,
//     selectedRating,
//     sortBy,
//     bannerFilter,
//   ]);

//   const mockConferences: Conference[] = Array.from({ length: 12 }, (_, i) => ({
//     id: `${i + 1}`,
//     title: `Hội nghị Mẫu ${i + 1}`,
//     description: `Mô tả hội nghị ngắn gọn số ${i + 1}`,
//     category: i % 2 === 0 ? "technical" : "research",
//     date: `2025-0${(i % 9) + 1}-${10 + (i % 20)}`,
//     location: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"][i % 4],
//     price: (i + 1) * 500000,
//     rating: 4.2,
//     reviewCount: 100,
//     attendees: 300 + i * 10,
//     image: "https://placehold.co/600x400?text=Conference+Image",
//     organizer: `Organizer ${i + 1}`,
//     status: "upcoming",
//   }));

//   const categories = [
//     { value: "all", label: "Tất cả danh mục" },
//     { value: "technical", label: "Công nghệ" },
//     { value: "research", label: "Nghiên cứu" },
//   ];

//   const locations = [
//     { value: "all", label: "Tất cả địa điểm" },
//     { value: "hanoi", label: "Hà Nội" },
//     { value: "hcm", label: "TP.HCM" },
//     { value: "danang", label: "Đà Nẵng" },
//     { value: "cantho", label: "Cần Thơ" },
//   ];

//   const ratings = [
//     { value: "all", label: "Tất cả đánh giá" },
//     { value: "4plus", label: "4+ sao" },
//     { value: "4.5plus", label: "4.5+ sao" },
//   ];

//   const sortOptions = [
//     { value: "date", label: "Ngày diễn ra" },
//     { value: "price-low", label: "Giá thấp đến cao" },
//     { value: "price-high", label: "Giá cao đến thấp" },
//   ];

//   const filtered = mockConferences.filter((conf) => {
//     const matchesSearch =
//       conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       conf.description.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory =
//       selectedCategory === "all" || conf.category === selectedCategory;
//     const matchesLocation =
//       selectedLocation === "all" ||
//       conf.location
//         .toLowerCase()
//         .includes(
//           locations.find((l) => l.value === selectedLocation)?.label.toLowerCase() ||
//           ""
//         );
//     const matchesRating =
//       selectedRating === "all" ||
//       (selectedRating === "4plus" && conf.rating >= 4) ||
//       (selectedRating === "4.5plus" && conf.rating >= 4.5);
//     return matchesSearch && matchesCategory && matchesLocation && matchesRating;
//   });

//   const sorted = [...filtered].sort((a, b) => {
//     switch (sortBy) {
//       case "price-low":
//         return a.price - b.price;
//       case "price-high":
//         return b.price - a.price;
//       default:
//         return new Date(a.date).getTime() - new Date(b.date).getTime();
//     }
//   });

//   const totalPages = Math.ceil(sorted.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

//   const formatDate = (dateString: string) => {
//     const d = new Date(dateString);
//     return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
//       .toString()
//       .padStart(2, "0")}/${d.getFullYear()}`;
//   };

//   const DropdownSelect = ({
//     id,
//     value,
//     options,
//     onChange,
//     placeholder,
//   }: {
//     id: string;
//     value: string;
//     options: { value: string; label: string }[];
//     onChange: (v: string) => void;
//     placeholder: string;
//   }) => (
//     <div className="relative">
//       <button
//         onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
//         className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:border-gray-400"
//       >
//         <span className="text-sm">
//           {options.find((opt) => opt.value === value)?.label || placeholder}
//         </span>
//         <ChevronDown size={16} />
//       </button>

//       {openDropdown === id && (
//         <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-56 overflow-y-auto">
//           {options.map((opt) => (
//             <button
//               key={opt.value}
//               onClick={() => {
//                 onChange(opt.value);
//                 setOpenDropdown(null);
//               }}
//               className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="bg-white text-gray-800 min-h-screen p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Search */}
//         <div className="mb-6">
//           <div className="relative max-w-xl mx-auto">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//               size={18}
//             />
//             <input
//               type="text"
//               placeholder="Tìm kiếm hội nghị..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm"
//             />
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
//           <div className="flex items-center gap-2 mb-4 text-gray-700">
//             <Filter size={18} />
//             <h3 className="font-medium text-base">Bộ lọc</h3>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//             <DropdownSelect
//               id="category"
//               value={selectedCategory}
//               options={categories}
//               onChange={setSelectedCategory}
//               placeholder="Danh mục"
//             />
//             <DropdownSelect
//               id="location"
//               value={selectedLocation}
//               options={locations}
//               onChange={setSelectedLocation}
//               placeholder="Địa điểm"
//             />
//             <DropdownSelect
//               id="rating"
//               value={selectedRating}
//               options={ratings}
//               onChange={setSelectedRating}
//               placeholder="Đánh giá"
//             />
//             <DropdownSelect
//               id="sort"
//               value={sortBy}
//               options={sortOptions}
//               onChange={setSortBy}
//               placeholder="Sắp xếp"
//             />
//           </div>
//         </div>

//         {/* Results */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//           {paginated.map((conf) => (
//             <div
//               key={conf.id}
//               onClick={() =>
//                 router.push(`/customer/discovery/conference-detail/${conf.id}`)
//               }
//               className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
//             >
//               <div className="relative aspect-video">
//                 <Image
//                   src={conf.image}
//                   alt={conf.title}
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//               <div className="p-3">
//                 <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
//                   {conf.title}
//                 </h3>
//                 <p className="text-xs text-gray-500 mb-2 line-clamp-2">
//                   {conf.description}
//                 </p>

//                 <div className="flex items-center justify-between text-xs text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <Calendar size={12} />
//                     <span>{formatDate(conf.date)}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <MapPin size={12} />
//                     <span>{conf.location}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <Users size={12} />
//                     <span>{conf.attendees}</span>
//                   </div>
//                   <span className="text-gray-400">{conf.organizer}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center items-center gap-2 mt-8">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
//             >
//               <ChevronLeft size={14} className="inline mr-1" />
//               Trước
//             </button>
//             <span className="text-sm text-gray-500">
//               Trang {currentPage} / {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
//             >
//               Sau
//               <ChevronRight size={14} className="inline ml-1" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ConferenceBrowser;