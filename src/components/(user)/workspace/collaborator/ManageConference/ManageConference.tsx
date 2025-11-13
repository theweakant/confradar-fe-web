"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { Plus, Calendar, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";

import { ConferenceTable } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceTable";
import { Conference } from "@/types/conference.type";

import { useGetTechConferencesForCollaboratorAndOrganizerQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";

import { RoomCalendar } from "@/components/(user)/workspace/TestRoomCalendar/RoomCalendar";
// import ConferenceCalendar from "@/components/molecules/Calendar/index";
// import { SessionScheduleCalendar } from "@/components/molecules/Calendar/RoomCalendar";
// import PaperScheduleCalendar from "@/components/molecules/Calendar/PaperScheduleCalendar";

export default function ManageConference() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(
    null,
  );
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendarType, setCalendarType] = useState<
    "conference" | "session" | "paper"
  >("conference");
const [showRoomCalendar, setShowRoomCalendar] = useState(false);
  // RTK Query hooks
  const { data, isLoading, isFetching, error, refetch } =
    useGetTechConferencesForCollaboratorAndOrganizerQuery({
      page,
      pageSize,
      ...(filterCategory !== "all" && { conferenceCategoryId: filterCategory }),
      ...(filterStatus !== "all" && { conferenceStatusId: filterStatus }),
      ...(searchQuery && { searchKeyword: searchQuery }),
      ...(filterCity !== "all" && { cityId: filterCity }),
    });

  const { data: citiesData, isLoading: citiesLoading } = useGetAllCitiesQuery();
  const { data: statusesData, isLoading: statusesLoading } =
    useGetAllConferenceStatusesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery();

  const conferences = (data?.data?.items || []).slice().sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const totalConferences = data?.data?.totalCount || 0;
  const totalPages = data?.data?.totalPages || 1;

  const cities = citiesData?.data || [];
  const statuses = statusesData?.data || [];
  const categories = categoriesData?.data || [];

  const handleOpenCalendar = (type: "conference" | "session" | "paper") => {
    console.log("Opening calendar:", type); // Debug log
    setCalendarType(type);
    setShowCalendarDialog(true);
    console.log("showCalendarDialog:", true); // Debug log
  };

  const conferencesWithCategory = conferences.map((conf) => ({
    ...conf,
    sessions: conf.sessions ?? [],
    conferenceCategoryName: categories.find(
      (cat) => cat.conferenceCategoryId === conf.conferenceCategoryId,
    )?.conferenceCategoryName,
  }));

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    ...categories.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName || "N/A",
    })),
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...statuses.map((status) => ({
      value: status.conferenceStatusId,
      label: status.conferenceStatusName || "N/A",
    })),
  ];

  const cityOptions = [
    { value: "all", label: "Tất cả thành phố" },
    ...cities.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    })),
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus, filterCity, filterCategory]);

  const handleView = (conference: Conference) => {
    router.push(
      `/workspace/collaborator/manage-conference/view-detail/${conference.conferenceId}`,
    );
  };

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const confirmDelete = async () => {
    if (deleteConferenceId) {
      try {
        toast.success("Xóa hội thảo thành công!");
        setDeleteConferenceId(null);
        refetch();
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa hội thảo!");
        console.error("Delete error:", error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Hội thảo
              </h1>

              <div className="flex items-center gap-3">

                {/* <Button
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => setShowRoomCalendar(true)}
                >
                  <Calendar className="w-5 h-5" />
                  Xem danh sách phòng
                </Button> */}

                <Link href="/workspace/collaborator/manage-conference/create-tech-conference">
                  <Button className="flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-5 h-5" />
                    Thêm hội thảo
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              Quản lý thông tin các hội thảo trên ConfRadar
            </p>
          </div>

          <SearchFilter
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm kiếm theo tên, mô tả, địa chỉ..."
            filters={[
              {
                value: filterCategory,
                onValueChange: setFilterCategory,
                options: categoryOptions,
              },
              {
                value: filterStatus,
                onValueChange: setFilterStatus,
                options: statusOptions,
              },
              {
                value: filterCity,
                onValueChange: setFilterCity,
                options: cityOptions,
              },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Tổng hội thảo"
              value={isLoading ? "..." : totalConferences}
              icon={<Calendar className="w-10 h-10" />}
              color="blue"
            />
          </div>

          <div className="flex justify-end mb-4">
            <Link href="/workspace/collaborator/manage-conference/view-draft-list">
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1.5"
              >
                Xem Draft
              </Button>
            </Link>
          </div>

          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <ConferenceTable
                conferences={conferences}
                onView={handleView}
                onEdit={(conference) => {
                  console.log("Edit conference:", conference);
                }}
                onDelete={handleDelete}
                statuses={statuses}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>

                  <span className="px-4 py-2 text-sm text-gray-700">
                    Trang {page} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCalendarDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {calendarType === "conference" &&
                      "Lịch Hội nghị & Hội thảo"}
                    {calendarType === "session" && "Session Schedule Calendar"}
                    {calendarType === "paper" && "Paper Schedule Calendar"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {calendarType === "conference" &&
                      "Theo dõi và quản lý các sự kiện sắp tới"}
                    {calendarType === "session" &&
                      "Manage session schedules and timings"}
                    {calendarType === "paper" &&
                      "Schedule and manage paper presentations"}
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendarDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCalendarDialog(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
{/* Room Calendar Modal */}
{showRoomCalendar && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách phòng khả dụng
          </h2>
          <button
            onClick={() => setShowRoomCalendar(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Hiển thị tất cả phòng trong khoảng thời gian hội nghị
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <RoomCalendar/>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <Button variant="outline" onClick={() => setShowRoomCalendar(false)}>
          Đóng
        </Button>
      </div>
    </div>
  </div>
)}
      {/* Alert Dialog */}
      <AlertDialog
        open={!!deleteConferenceId}
        onOpenChange={() => setDeleteConferenceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hội thảo này? Hành động này không thể
              hoàn tác và sẽ xóa tất cả các đăng ký liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
