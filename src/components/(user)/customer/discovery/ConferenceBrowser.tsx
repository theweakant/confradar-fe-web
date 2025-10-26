"use client";

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useConference } from '@/redux/hooks/conference/useConference';
import { useGetAllCategoriesQuery } from '@/redux/services/category.service';
import { ConferenceResponse } from '@/types/conference.type';
import { Category } from '@/types/category.type';

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
  const [startDateFilter, setStartDateFilter] = useState<string | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const itemsPerPage = 12;

  // API calls
  const { conferences, loading: conferencesLoading, error: conferencesError } = useConference();
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetAllCategoriesQuery();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, selectedPrice, selectedRating, sortBy, bannerFilter]);

  // Build categories options from API
  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    ...(categoriesData?.data?.map((cat: Category) => ({
      value: cat.categoryId,
      label: cat.conferenceCategoryName
    })) || [])
  ];

  const locations = [
    { value: 'all', label: 'Tất cả địa điểm' },
    { value: 'hanoi', label: 'Hà Nội' },
    { value: 'hcm', label: 'TP.HCM' },
    { value: 'danang', label: 'Đà Nẵng' },
    { value: 'cantho', label: 'Cần Thơ' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Tất cả mức giá' },
    { value: 'free', label: 'Miễn phí' },
    { value: 'under1m', label: 'Dưới 1 triệu' },
    { value: '1m-2m', label: '1-2 triệu' },
    { value: 'above2m', label: 'Trên 2 triệu' }
  ];

  const ratings = [
    { value: 'all', label: 'Tất cả đánh giá' },
    { value: '4plus', label: '4+ sao' },
    { value: '4.5plus', label: '4.5+ sao' },
    { value: '4.8plus', label: '4.8+ sao' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Ngày diễn ra' },
    { value: 'price-low', label: 'Giá thấp đến cao' },
    { value: 'price-high', label: 'Giá cao đến thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'attendees', label: 'Nhiều người tham gia' }
  ];

  // Filter và sort logic
  const filteredConferences = conferences.filter((conf: ConferenceResponse) => {
    const matchesSearch = (conf.conferenceName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (conf.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const confCategory = conf.isResearchConference ? 'research' : 'technical';
    const matchesBannerFilter = bannerFilter === 'all' || confCategory === bannerFilter;

    const matchesCategory = bannerFilter !== 'all'
      ? true
      : (selectedCategory === 'all' || conf.categoryId === selectedCategory);

    const matchesLocation = selectedLocation === 'all' ||
      (conf.address?.toLowerCase().includes(locations.find(l => l.value === selectedLocation)?.label.toLowerCase() || '') || false);

    const matchesRating = selectedRating === 'all';

    const confStartTime = new Date(conf.startDate || '');
    const confEndTime = new Date(conf.endDate || '');
    let matchesDate = true;

    if (startDateFilter) {
      matchesDate = matchesDate && confEndTime >= new Date(startDateFilter);
    }
    if (endDateFilter) {
      matchesDate = matchesDate && confStartTime <= new Date(endDateFilter);
    }

    return matchesSearch && matchesBannerFilter && matchesCategory && matchesLocation && matchesRating && matchesDate;
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
      case 'price-low':
        // Since API doesn't have direct price, we'll sort by capacity as alternative
        return (a.capacity || 0) - (b.capacity || 0);
      case 'price-high':
        return (b.capacity || 0) - (a.capacity || 0);
      case 'rating':
        // Sort by name as alternative since no rating in API
        return (a.conferenceName || '').localeCompare(b.conferenceName || '');
      case 'attendees':
        // Sort by capacity as closest to attendees
        return (b.capacity || 0) - (a.capacity || 0);
      case 'date':
      default:
        return new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime();
    }
  });

  // Pagination
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
    // <div className="min-h-screen bg-black text-white p-4">
    <div className="text-white p-4 pb-12">
      {/* <div className="max-w-7xl mx-auto"> */}
      {/* <div className="max-w-6xl mx-auto bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mt-8 shadow-2xl"> */}
      <div className="max-w-6xl mx-auto bg-gray-900/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">

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
            // className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        {/* <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-800"> */}
        {/* <div className="mb-8 p-6 rounded-lg"> */}
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

            {/* Start Date */}
            <div className="flex flex-col w-full">
              <label className="text-xs text-gray-300 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDateFilter || ''}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col w-full">
              <label className="text-xs text-gray-300 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={endDateFilter || ''}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* <DropdownSelect
              id="location"
              value={selectedLocation}
              options={locations}
              onChange={setSelectedLocation}
              placeholder="Địa điểm"
            /> */}
            <div className="flex flex-col w-full">
              <label className="text-xs text-gray-300 mb-1">Mức giá</label>
              <DropdownSelect
                id="price"
                value={selectedPrice}
                options={priceRanges}
                onChange={setSelectedPrice}
                placeholder="Chọn mức giá"
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-xs text-gray-300 mb-1">Đánh giá</label>
              <DropdownSelect
                id="rating"
                value={selectedRating}
                options={ratings}
                onChange={setSelectedRating}
                placeholder="Chọn đánh giá"
              />
            </div>
            <DropdownSelect
              id="sort"
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
              placeholder="Sắp xếp"
            />
          </div>
        </div>

        {/* Results Header */}
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

        {/* Loading State */}
        {conferencesLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {conferencesError && (
          <div className="flex justify-center items-center py-12">
            <div className="text-red-400 text-center">
              <p>Có lỗi xảy ra khi tải dữ liệu hội nghị</p>
              <p className="text-sm mt-2">{conferencesError}</p>
            </div>
          </div>
        )}

        {/* Conference Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedConferences.map((conference: ConferenceResponse) => (
            <div key={conference.conferenceId}
              onClick={() => router.push(`/customer/discovery/conference-detail/${conference.conferenceId}`)}
              className="group relative bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden
             cursor-pointer transition-all duration-500
             hover:scale-[1.03] hover:border-blue-500 hover:shadow-[0_12px_30px_rgba(59,130,246,0.4)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/10 via-transparent to-blue-500/10 blur-xl"></div>
              </div>

              {/* Conference Image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
                  alt={conference.conferenceName || 'Conference'}
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
              </div>

              {/* Conference Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
                  {conference.conferenceName}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{conference.description}</p>

                {/* Date & Location */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(conference.startDate || '')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{conference.address}</span>
                  </div>
                </div>

                {/* Capacity & Type */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users size={12} />
                    <span>{conference.capacity}</span>
                  </div>
                  <div className="text-xs text-blue-400">
                    {conference.isResearchConference ? 'Nghiên cứu' : 'Công nghệ'}
                  </div>
                </div>

                {/* Date range */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {conference.endDate && formatDate(conference.endDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700 shadow-md"
            // className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={16} />
              Trước
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700 shadow-md"
            // className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
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