"use client";

import React, { useEffect, useState, Fragment } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConference } from '@/redux/hooks/conference/useConference';
import { useGetAllCategoriesQuery } from '@/redux/services/category.service';
import { ConferenceResponse } from '@/types/conference.type';
import { Category } from '@/types/category.type';

import "react-day-picker/style.css";
import SearchFilter from './SearchFilter';
import ConferenceList from './ConferenceList';
import Pagination from './Pagination';


interface SearchSortFilterConferenceProps {
  bannerFilter?: 'technical' | 'research' | 'all';
}


// const SearchSortFilterConference: React.FC = () => {
const ConferenceBrowser: React.FC<SearchSortFilterConferenceProps> = ({
  bannerFilter = 'all'
}) => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const { conferences, loading: conferencesLoading, error: conferencesError } = useConference();
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetAllCategoriesQuery();

  // const allPrices = conferences.flatMap(
  //   conf => conf.prices?.map(p => p.actualPrice ?? p.ticketPrice ?? 0) ?? []
  // );

  const allPrices = conferences.flatMap(conf =>
    (conf?.prices ?? [])
      .map(p => p?.actualPrice ?? p?.ticketPrice ?? 0)
      .filter(price => typeof price === 'number' && price > 0)
  );

  const absoluteMaxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  const [priceRange, setPriceRange] = useState<[number, number]>([0, absoluteMaxPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, selectedPrice, selectedRating, sortBy, bannerFilter]);

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

  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    ...(categoriesData?.data?.map((cat: Category) => ({
      value: cat.categoryId,
      label: cat.conferenceCategoryName
    })) || [])
  ];

  // const locations = [
  //   { value: 'all', label: 'Tất cả địa điểm' },
  //   { value: 'hanoi', label: 'Hà Nội' },
  //   { value: 'hcm', label: 'TP.HCM' },
  //   { value: 'danang', label: 'Đà Nẵng' },
  //   { value: 'cantho', label: 'Cần Thơ' }
  // ];

  const sortOptions = [
    { value: 'date', label: 'Ngày diễn ra' },
    { value: 'price-low', label: 'Giá thấp đến cao' },
    { value: 'price-high', label: 'Giá cao đến thấp' },
    { value: 'attendees-low', label: 'Số người tham gia thấp → cao' },
    { value: 'attendees-high', label: 'Số người tham gia cao → thấp' },
  ];

  const getMinPrice = (conf: ConferenceResponse) => {
    if (!conf.prices || conf.prices.length === 0) return null;
    return Math.min(...conf.prices.map(p => p.ticketPrice ?? Infinity));
  };

  const getMaxPrice = (conf: ConferenceResponse) => {
    if (!conf.prices || conf.prices.length === 0) return null;
    return Math.max(...conf.prices.map(p => p.ticketPrice ?? 0));
  };

  const filteredConferences = conferences.filter((conf: ConferenceResponse) => {
    const matchesSearch = (conf.conferenceName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (conf.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const confCategory = conf.isResearchConference ? 'research' : 'technical';
    const matchesBannerFilter = bannerFilter === 'all' || confCategory === bannerFilter;

    const matchesCategory = bannerFilter !== 'all'
      ? true
      : (selectedCategory === 'all' || conf.categoryId === selectedCategory);

    // const matchesLocation = selectedLocation === 'all' ||
    //   (conf.address?.toLowerCase().includes(locations.find(l => l.value === selectedLocation)?.label.toLowerCase() || '') || false);

    const matchesRating = selectedRating === 'all';

    const confStartTime = new Date(conf.startDate || '');
    const confEndTime = new Date(conf.endDate || '');
    let matchesDate = true;

    if (startDateFilter && endDateFilter) {
      const filterStart = new Date(startDateFilter);
      const filterEnd = new Date(endDateFilter);
      matchesDate = confStartTime <= filterEnd && confEndTime >= filterStart;
    } else if (startDateFilter) {
      const filterStart = new Date(startDateFilter);
      matchesDate = confEndTime >= filterStart;
    } else if (endDateFilter) {
      const filterEnd = new Date(endDateFilter);
      matchesDate = confStartTime <= filterEnd;
    }

    // if (startDateFilter) {
    //   matchesDate = matchesDate && confEndTime >= new Date(startDateFilter);
    // }
    // if (endDateFilter) {
    //   matchesDate = matchesDate && confStartTime <= new Date(endDateFilter);
    // }

    if (absoluteMaxPrice === 0) {
      return matchesSearch && matchesBannerFilter && matchesCategory && matchesRating && matchesDate;
    }

    const minPrice = getMinPrice(conf);
    const maxPrice = getMaxPrice(conf);

    if (minPrice === null || maxPrice === null) {
      return matchesSearch && matchesBannerFilter && matchesCategory && matchesRating && matchesDate;
    }

    const matchesPrice =
      (minPrice <= priceRange[1]) && (maxPrice >= priceRange[0]);

    return matchesSearch && matchesBannerFilter && matchesCategory && matchesRating && matchesDate && matchesPrice;
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
        const aMin = getMinPrice(a) ?? 0;
        const bMin = getMinPrice(b) ?? 0;
        return bMin - aMin;
      }
      case 'attendees-low':
        return (a.capacity ?? 0) - (b.capacity ?? 0);
      case 'attendees-high':
        return (b.capacity ?? 0) - (a.capacity ?? 0);
      case 'date':
      default:
        return new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime();
    }
  });

  const totalPages = Math.ceil(sortedConferences.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConferences = sortedConferences.slice(startIndex, startIndex + itemsPerPage);

  // const formatPrice = (price: number) => {
  //   if (price === 0) return 'Miễn phí';
  //   return new Intl.NumberFormat('vi-VN', {
  //     style: 'currency',
  //     currency: 'VND'
  //   }).format(price);
  // };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('vi-VN', {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric'
  //   });
  // };
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  // const formatPrice = (price: number) => `${price.toLocaleString()} VND`;

  const DropdownSelect = ({
    value,
    options,
    onChange,
    placeholder,
    id
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    placeholder: string;
    id: string;
  }) => (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all shadow-md"
      // className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-4xl hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm">
          {options.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={16} className={`transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
      </button>

      {openDropdown === id && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpenDropdown(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="text-white p-4 pb-12">
      <div className="max-w-6xl mx-auto bg-gray-900/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">

        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          startDateFilter={startDateFilter}
          setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter}
          setEndDateFilter={setEndDateFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          absoluteMaxPrice={absoluteMaxPrice}
          allPrices={allPrices}
          sortOptions={sortOptions}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          DropdownSelect={DropdownSelect}
        />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Kết quả ({sortedConferences.length} hội nghị)
          </h2>
          {conferencesLoading && (
            <div className="text-sm text-blue-400">Đang tải...</div>
          )}
          <div className="text-sm text-gray-400">
            Trang {currentPage} / {totalPages}
          </div>
        </div>

        {conferencesLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {conferencesError && (
          <div className="flex justify-center items-center py-12">
            <div className="text-red-400 text-center">
              <p>Có lỗi xảy ra khi tải dữ liệu hội nghị</p>
              <p className="text-sm mt-2">{conferencesError}</p>
            </div>
          </div>
        )}

        <ConferenceList
          paginatedConferences={paginatedConferences}
          getMinPrice={getMinPrice}
          getMaxPrice={getMaxPrice}
          formatDate={formatDate}
          onCardClick={(conferenceId) => router.push(`/customer/discovery/conference-detail/${conferenceId}`)}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
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