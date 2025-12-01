"use client";

import { useState, useEffect, Fragment } from "react";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/molecules/DataTable";
import { SearchBar } from "@/components/molecules/SearchBar";
import { StatCard } from "@/components/molecules/StatCard";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import {
  useLazyListCollaboratorContractsQuery,
  useCreateCollaboratorContractMutation
} from "@/redux/services/contract.service";
import {
  useLazyGetCollaboratorAccountsQuery,
  useLazyListOrganizationsQuery
} from "@/redux/services/user.service";
import {
  CollaboratorContractResponse,
  CreateCollaboratorContractRequest
} from "@/types/contract.type";
import {
  CollaboratorAccountResponse,
  Organization
} from "@/types/user.type";
import { toast } from "sonner";
import { parseApiError } from "@/helper/api";
import { useRouter } from "next/navigation";
import { truncateText } from "@/helper/format";

interface ContractFilters {
  userId?: string;
  organizationId?: string;
  conferenceName?: string;
  page: number;
  pageSize: number;
}

export default function ManageCollaboratorContract() {
  const router = useRouter();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ContractFilters>({
    page: 1,
    pageSize: 10
  });
  const [sortField, setSortField] = useState<string>("conferenceCreatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedContract, setSelectedContract] = useState<CollaboratorContractResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // API hooks - using lazy queries as requested
  const [triggerGetContracts, {
    data: contractsData,
    isLoading: isLoadingContracts,
    error: contractsError
  }] = useLazyListCollaboratorContractsQuery();

  const [triggerGetCollaborators, {
    data: collaboratorsData,
    isLoading: isLoadingCollaborators
  }] = useLazyGetCollaboratorAccountsQuery();

  const [triggerGetOrganizations, {
    data: organizationsData,
    isLoading: isLoadingOrganizations
  }] = useLazyListOrganizationsQuery();

  const [createContract, { isLoading: isCreating, error: createError }] = useCreateCollaboratorContractMutation();

  // Data extraction
  const contracts: CollaboratorContractResponse[] = contractsData?.data.items || [];
  const collaborators: CollaboratorAccountResponse[] = collaboratorsData?.data || [];
  const organizations: Organization[] = organizationsData?.data || [];

  // Error handling
  const createErrorMessage = parseApiError<string>(createError);

  // Initial data loading
  useEffect(() => {
    loadContracts();
    triggerGetCollaborators();
    triggerGetOrganizations();
  }, []);

  // Load contracts with current filters
  const loadContracts = () => {
    const params: Partial<ContractFilters> = {
      page: filters.page,
      pageSize: filters.pageSize
    };

    if (filters.userId) params.userId = filters.userId;
    if (filters.organizationId) params.organizationId = filters.organizationId;
    if (filters.conferenceName) params.conferenceName = filters.conferenceName;

    triggerGetContracts(params);
  };

  // Reload contracts when filters change
  useEffect(() => {
    loadContracts();
  }, [filters]);

  // Show toast when create error occurs
  useEffect(() => {
    if (createErrorMessage) {
      toast.error(createErrorMessage.data?.message || "Có lỗi xảy ra khi tạo hợp đồng");
    }
  }, [createErrorMessage]);

  // Search and sort functionality
  // const filteredAndSortedContracts = contracts
  //   .filter(contract => {
  //     if (!searchTerm) return true;
  //     const searchLower = searchTerm.toLowerCase();
  //     return (
  //       contract.organizationName?.toLowerCase().includes(searchLower) ||
  //       contract.conferenceName?.toLowerCase().includes(searchLower)
  //     );
  //   })
  //   .sort((a, b) => {
  //     if (sortField === "conferenceCreatedAt") {
  //       const dateA = new Date(a.conferenceCreatedAt || 0).getTime();
  //       const dateB = new Date(b.conferenceCreatedAt || 0).getTime();
  //       return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  //     }
  //     return 0;
  //   });

  // Event handlers
  const handleView = (contract: CollaboratorContractResponse) => {
    setSelectedContract(contract);
    setIsDetailModalOpen(true);
  };

  const handleCreate = () => {
    // setIsCreateModalOpen(true);
    router.push('/workspace/organizer/manage-user/manage-collaborator/create-collaborator-contract');
  };

  const handleFilterChange = (key: keyof ContractFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value)
    }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1
    }));
  };

  // Table columns
  const columns: Column<CollaboratorContractResponse>[] = [
    {
      key: "name",
      header: "Tên tài khoản",
      className: "text-left",
      render: (contract) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{contract.collaboratorContractFullName}</p>
          <p className="text-sm text-gray-500 truncate">{contract.collaboratorContractEmail}</p>
        </div>
      ),
    },
    {
      key: "organization",
      header: "Tổ chức",
      className: "text-left",
      render: (contract) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{contract.organizationName}</p>
          {/* <p className="text-sm text-gray-500 truncate">{contract.organizationDescription}</p> */}
        </div>
      ),
    },

    {
      key: "conference",
      header: "Hội nghị",
      className: "text-left",
      render: (contract) => (
        <div className="max-w-xs">
        <p 
          className="font-medium text-gray-900"{...(contract.conferenceName && { title: contract.conferenceName })}>
          {truncateText(contract.conferenceName, 10)}
        </p>
          <p className="text-sm text-gray-500">
            {contract.conferenceStartDate && contract.conferenceEndDate && (
              `${new Date(contract.conferenceStartDate).toLocaleDateString()} - ${new Date(contract.conferenceEndDate).toLocaleDateString()}`
            )}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-left",
      render: (contract) => (
        <StatusBadge
          status={contract.isClosed ? "Đã đóng" : "Đang mở"}
          variant={contract.isClosed ? "danger" : "success"}
        />
      ),
    },
    {
      key: "commission",
      header: "Hoa hồng",
      className: "text-left",
      render: (contract) => (
        <span className="text-gray-900 font-medium">
          {contract.commission ? `${contract.commission}%` : "N/A"}
        </span>
      ),
    },
    {
      key: "signDay",
      header: "Ngày ký",
      className: "text-left",
      render: (contract) => (
        <span className="text-gray-900">
          {contract.signDay ? new Date(contract.signDay).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-left",
      render: (contract) => (
        <button
          onClick={() => handleView(contract)}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
        >
          Xem chi tiết
        </button>
      ),
    },
  ];

  // Statistics
  const stats = [
    {
      title: "Tổng hợp đồng",
      value: contracts.length.toString(),
      icon: FileText,
      variant: "info" as const
    },
    {
      title: "Đang hoạt động",
      value: contracts.filter(c => !c.isClosed).length.toString(),
      icon: FileText,
      variant: "success" as const
    },
    {
      title: "Đã đóng",
      value: contracts.filter(c => c.isClosed).length.toString(),
      icon: FileText,
      variant: "danger" as const
    }
  ];

  if (isLoadingContracts) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý hợp đồng Đối tác
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý hợp đồng Đối tác trong hệ thống
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{isCreating ? "Đang tạo..." : "Tạo mới hợp đồng tối tác"}</span>
            </button>
          </div>
        </div>

        {/* Stats - Compact Version */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Tổng hợp đồng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{contracts.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {contracts.filter(c => !c.isClosed).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Đã đóng</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {contracts.filter(c => c.isClosed).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Controls - Compact */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.conferenceName || ""}
                  onChange={(e) => handleFilterChange('conferenceName', e.target.value)}
                  placeholder="Tìm theo tên hội nghị..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Filter */}
            <Select
              value={filters.userId || "all"}
              onValueChange={(value) => handleFilterChange('userId', value === "all" ? "" : value)}
              disabled={isLoadingCollaborators}
            >
              <SelectTrigger className="w-[200px] h-9 text-sm">
                <SelectValue placeholder="Tất cả đối tác" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả đối tác</SelectItem>
                  {collaborators.map((collaborator) => (
                    <SelectItem key={collaborator.userId} value={collaborator.userId}>
                      {collaborator.fullName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Organization Filter */}
            <Select
              value={filters.organizationId || "all"}
              onValueChange={(value) => handleFilterChange('organizationId', value === "all" ? "" : value)}
              disabled={isLoadingOrganizations}
            >
              <SelectTrigger className="w-[200px] h-9 text-sm">
                <SelectValue placeholder="Tất cả tổ chức" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả tổ chức</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.organizationId} value={org.organizationId || ""}>
                      {org.organizationName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200"></div>

            {/* Page Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <Select
                value={filters.pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[70px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Page Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 whitespace-nowrap">Trang:</span>
              <input
                type="number"
                min="1"
                value={filters.page}
                onChange={(e) => handleFilterChange('page', Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              />
              {contractsData?.data.totalPages && (
                <span className="text-xs text-gray-500">
                  / {Math.ceil((contractsData.data.totalPages || 0) / filters.pageSize)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <DataTable
            columns={columns}
            data={contracts}
            keyExtractor={(contract) => contract.collaboratorContractId || Math.random().toString()}
            emptyMessage="Không tìm thấy hợp đồng nào"
          />
        </div>

        {/* Pagination Info - Compact */}
        {contractsData?.data && (
          <div className="mt-4 flex items-center justify-center">
            <div className="text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              Hiển thị <span className="font-semibold text-gray-900">{Math.min(filters.pageSize, contracts.length)}</span> trong tổng số <span className="font-semibold text-gray-900">{contractsData.data.totalItems}</span> kết quả
            </div>
          </div>
        )}

        {/* <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý hợp đồng Đối tác
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              <Plus className="w-5 h-5" />
              {isCreating ? "Đang tạo..." : "Tạo hợp đồng mới"}
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý hợp đồng Đối tác trong hệ thống
          </p>
        </div>

    
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={filters.conferenceName || ""}
              onChange={(e) => handleFilterChange('conferenceName', e.target.value)}
              placeholder="Tìm kiếm theo tên hội nghị..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        
          <select
            value={filters.userId || ""}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingCollaborators}
          >
            <option value="">Tất cả Đối tác</option>
            {collaborators.map((collaborator) => (
              <option key={collaborator.userId} value={collaborator.userId}>
                {collaborator.fullName} ({collaborator.email})
              </option>
            ))}
          </select>

        
          <select
            value={filters.organizationId || ""}
            onChange={(e) => handleFilterChange('organizationId', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoadingOrganizations}
          >
            <option value="">Tất cả tổ chức</option>
            {organizations.map((org) => (
              <option key={org.organizationId} value={org.organizationId || ""}>
                {org.organizationName}
              </option>
            ))}
          </select>
        </div>

      
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm text-gray-600">
            Hiển thị:
            <select
              value={filters.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            kết quả mỗi trang
          </label>

          <label className="text-sm text-gray-600">
            Trang:
            <input
              type="number"
              min="1"
              value={filters.page}
              onChange={(e) => handleFilterChange('page', Math.max(1, Number(e.target.value)))}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Sắp xếp theo ngày tạo: {sortOrder === 'asc' ? 'Cũ → Mới' : 'Mới → Cũ'}
          </button>
        </div> */}


        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={<stat.icon className="w-5 h-5" />}
              color="green"
            />
          ))}
        </div> */}

        {/* <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={contracts}
            keyExtractor={(contract) => contract.collaboratorContractId || Math.random().toString()}
            emptyMessage="Không tìm thấy hợp đồng nào"
          />
        </div>

    
        {contractsData?.data.totalPages && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Hiển thị {Math.min(filters.pageSize, contracts.length)} / {contractsData.data.totalItems} kết quả
            (Trang {filters.page} / {Math.ceil((contractsData.data.totalPages || 0) / filters.pageSize)})
          </div>
        )} */}
      </div>

      {/* Contract Detail Modal */}
      <ContractDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
      />

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          loadContracts();
        }}
        collaborators={collaborators}
      />
    </div>
  );
}

// Contract Detail Modal Component
interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: CollaboratorContractResponse | null;
}

function ContractDetailModal({ isOpen, onClose, contract }: ContractDetailModalProps) {
  if (!contract) return null;

  const permissionFields: { label: string; key: keyof CollaboratorContractResponse }[] = [
    { label: 'Media Step', key: 'isMediaStep' },
    { label: 'Policy Step', key: 'isPolicyStep' },
    { label: 'Session Step', key: 'isSessionStep' },
    { label: 'Price Step', key: 'isPriceStep' },
    { label: 'Ticket Selling', key: 'isTicketSelling' },
    { label: 'Sponsor Step', key: 'isSponsorStep' },
  ];

  return (

    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-lg">

              {/* HEADER */}
              <Dialog.Title className="text-xl font-semibold text-gray-900 p-6 border-b">
                Chi tiết hợp đồng đối tác
              </Dialog.Title>

              {/* BODY */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổ chức
                    </label>
                    <p className="text-gray-900">{contract.organizationName}</p>
                    <p className="text-sm text-gray-500">{contract.organizationDescription}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hội nghị
                    </label>
                    <p className="text-gray-900">{contract.conferenceName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày ký
                    </label>
                    <p className="text-gray-900">
                      {contract.signDay ? new Date(contract.signDay).toLocaleDateString() : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày thanh toán cuối
                    </label>
                    <p className="text-gray-900">
                      {contract.finalizePaymentDate ? new Date(contract.finalizePaymentDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hoa hồng
                    </label>
                    <p className="text-gray-900">
                      {contract.commission ? `${contract.commission}%` : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <StatusBadge
                      status={contract.isClosed ? "Đã đóng" : "Đang mở"}
                      variant={contract.isClosed ? "danger" : "success"}
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quyền được cấp
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {
                      // [
                      //   { label: 'Media Step', key: 'isMediaStep' },
                      //   { label: 'Policy Step', key: 'isPolicyStep' },
                      //   { label: 'Session Step', key: 'isSessionStep' },
                      //   { label: 'Price Step', key: 'isPriceStep' },
                      //   { label: 'Ticket Selling', key: 'isTicketSelling' },
                      //   { label: 'Sponsor Step', key: 'isSponsorStep' }
                      // ]
                      permissionFields.map((item) => (
                        <div key={item.key} className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${contract[item.key] ? "bg-green-500" : "bg-red-500"
                              }`}
                          ></span>
                          <span className="text-sm">{item.label}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {contract.contractUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File hợp đồng
                    </label>
                    <a
                      href={contract.contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Xem file hợp đồng
                    </a>
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
    // <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    //   <div className="fixed inset-0 bg-black/25" />
    //   <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
    //     <DialogContent className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
    //       <DialogHeader>
    //         <DialogTitle className="text-xl font-semibold text-gray-900 p-6 border-b">
    //           Chi tiết hợp đồng cộng tác
    //         </DialogTitle>
    //       </DialogHeader>

    //       <div className="p-6 space-y-4">
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               Tổ chức
    //             </label>
    //             <p className="text-gray-900">{contract.organizationName}</p>
    //             <p className="text-sm text-gray-500">{contract.organizationDescription}</p>
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               Hội nghị
    //             </label>
    //             <p className="text-gray-900">{contract.conferenceName}</p>
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               Ngày ký
    //             </label>
    //             <p className="text-gray-900">
    //               {contract.signDay ? new Date(contract.signDay).toLocaleDateString() : "N/A"}
    //             </p>
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               Ngày thanh toán cuối
    //             </label>
    //             <p className="text-gray-900">
    //               {contract.finalizePaymentDate ? new Date(contract.finalizePaymentDate).toLocaleDateString() : "N/A"}
    //             </p>
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               Hoa hồng
    //             </label>
    //             <p className="text-gray-900">
    //               {contract.commission ? `${contract.commission}%` : "N/A"}
    //             </p>
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               Trạng thái
    //             </label>
    //             <StatusBadge
    //               status={contract.isClosed ? "Đã đóng" : "Đang mở"}
    //               variant={contract.isClosed ? "danger" : "success"}
    //             />
    //           </div>
    //         </div>

    //         {/* Permissions */}
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-2">
    //             Quyền được cấp
    //           </label>
    //           <div className="grid grid-cols-2 gap-2">
    //             <div className="flex items-center">
    //               <span className={`w-2 h-2 rounded-full mr-2 ${contract.isMediaStep ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //               <span className="text-sm">Media Step</span>
    //             </div>
    //             <div className="flex items-center">
    //               <span className={`w-2 h-2 rounded-full mr-2 ${contract.isPolicyStep ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //               <span className="text-sm">Policy Step</span>
    //             </div>
    //             <div className="flex items-center">
    //               <span className={`w-2 h-2 rounded-full mr-2 ${contract.isSessionStep ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //               <span className="text-sm">Session Step</span>
    //             </div>
    //             <div className="flex items-center">
    //               <span className={`w-2 h-2 rounded-full mr-2 ${contract.isPriceStep ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //               <span className="text-sm">Price Step</span>
    //             </div>
    //             <div className="flex items-center">
    //               <span className={`w-2 h-2 rounded-full mr-2 ${contract.isTicketSelling ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //               <span className="text-sm">Ticket Selling</span>
    //             </div>
    //             <div className="flex items-center">
    //               <span className={`w-2 h-2 rounded-full mr-2 ${contract.isSponsorStep ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //               <span className="text-sm">Sponsor Step</span>
    //             </div>
    //           </div>
    //         </div>

    //         {contract.contractUrl && (
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700 mb-1">
    //               File hợp đồng
    //             </label>
    //             <a
    //               href={contract.contractUrl}
    //               target="_blank"
    //               rel="noopener noreferrer"
    //               className="text-blue-600 hover:text-blue-800 underline"
    //             >
    //               Xem file hợp đồng
    //             </a>
    //           </div>
    //         )}

    //         <div className="flex justify-end pt-4">
    //           <button
    //             onClick={onClose}
    //             className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
    //           >
    //             Đóng
    //           </button>
    //         </div>
    //       </div>
    //     </DialogContent>
    //   </div>
    // </Dialog>
  );
}

// Create Contract Modal Component (Placeholder)
interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collaborators: CollaboratorAccountResponse[];
}

function CreateContractModal({ isOpen, onClose, onSuccess, collaborators }: CreateContractModalProps) {
  // This is a placeholder component as requested
  // The actual form implementation will be done later

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Nền mờ */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
              {/* Header */}
              <Dialog.Title className="text-xl font-semibold text-gray-900 p-6 border-b">
                Tạo hợp đồng đối tác mới
              </Dialog.Title>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Form tạo hợp đồng sẽ được implement sau với các field sau:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>userId (từ danh sách collaborators)</li>
                  <li>isMediaStep, isPolicyStep, isSessionStep, isPriceStep, isTicketSelling, isSponsorStep</li>
                  <li>commission</li>
                  <li>signDay</li>
                  <li>finalizePaymentDate</li>
                  <li>conferenceId</li>
                  <li>contractFile</li>
                </ul>

                {/* Footer */}
                <div className="flex justify-end pt-4 space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Form sẽ được implement sau");
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Tạo hợp đồng
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
    // <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    //   <div className="fixed inset-0 bg-black/25" />
    //   <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
    //     <DialogContent className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
    //       <DialogHeader>
    //         <DialogTitle className="text-xl font-semibold text-gray-900 p-6 border-b">
    //           Tạo hợp đồng cộng tác mới
    //         </DialogTitle>
    //       </DialogHeader>

    //       <div className="p-6">
    //         <p className="text-gray-600 mb-4">
    //           Form tạo hợp đồng sẽ được implement sau với các field sau:
    //         </p>
    //         <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
    //           <li>userId (từ danh sách collaborators)</li>
    //           <li>isMediaStep, isPolicyStep, isSessionStep, isPriceStep, isTicketSelling, isSponsorStep</li>
    //           <li>commission</li>
    //           <li>signDay</li>
    //           <li>finalizePaymentDate</li>
    //           <li>conferenceId</li>
    //           <li>contractFile</li>
    //         </ul>

    //         <div className="flex justify-end pt-4 space-x-2">
    //           <button
    //             onClick={onClose}
    //             className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
    //           >
    //             Hủy
    //           </button>
    //           <button
    //             onClick={() => {
    //               toast.info("Form sẽ được implement sau");
    //               onClose();
    //             }}
    //             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    //           >
    //             Tạo hợp đồng
    //           </button>
    //         </div>
    //       </div>
    //     </DialogContent>
    //   </div>
    // </Dialog>
  );
}