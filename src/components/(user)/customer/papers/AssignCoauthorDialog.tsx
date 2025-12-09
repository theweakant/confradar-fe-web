import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Users, Search, X } from "lucide-react";
import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { AvailableCustomerResponse } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import { toast } from "sonner";

interface AssignCoauthorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    paperId: string;
    conferenceId?: string | null;
    currentCoauthors: Array<{ userId: string; fullName?: string; email?: string; avatarUrl?: string }>;
    onSuccess?: () => void;
}

const AssignCoauthorDialog: React.FC<AssignCoauthorDialogProps> = ({
    isOpen,
    onClose,
    paperId,
    conferenceId,
    currentCoauthors,
    onSuccess
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
    const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomerResponse[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [customersError, setCustomersError] = useState<string | null>(null);

    const {
        fetchAvailableCustomers,
        handleAssignAuthor,
        loading: assignLoading,
        assignAuthorError
    } = usePaperCustomer();

    useEffect(() => {
        if (isOpen && conferenceId) {
            loadAvailableCustomers();
        }
    }, [isOpen, conferenceId]);

    useEffect(() => {
        if (assignAuthorError) {
            toast.error("Có lỗi xảy ra khi thêm đồng tác giả");
        }
    }, [assignAuthorError]);

    const loadAvailableCustomers = async () => {
        if (!conferenceId) return;

        setIsLoadingCustomers(true);
        setCustomersError(null);

        try {
            const response = await fetchAvailableCustomers(conferenceId);
            setAvailableCustomers(response.data || []);
        } catch (error) {
            setCustomersError("Có lỗi xảy ra khi tải danh sách người dùng");
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
        if (!selectedCoauthors.some(c => c.userId === user.userId)) {
            setSelectedCoauthors(prev => [...prev, user]);
        }
    };

    const handleRemoveCoauthor = (userId: string) => {
        setSelectedCoauthors(prev => prev.filter(c => c.userId !== userId));
    };

    const handleSubmit = async () => {
        if (selectedCoauthors.length === 0) {
            toast.error("Vui lòng chọn ít nhất một đồng tác giả");
            return;
        }

        try {
            const userIds = selectedCoauthors.map(c => c.userId);
            const result = await handleAssignAuthor(paperId, userIds);

            if (result.success) {
                toast.success("Thêm đồng tác giả thành công!");
                setSelectedCoauthors([]);
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi thêm đồng tác giả");
        }
    };

    const handleClose = () => {
        setSelectedCoauthors([]);
        setSearchTerm("");
        onClose();
    };

    const filteredCustomers = availableCustomers.filter(c => {
        const isAlreadyCoauthor = currentCoauthors.some(author => author.userId === c.userId);
        const matchesSearch = c.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        return !isAlreadyCoauthor && matchesSearch;
    });

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={() => { }}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Thêm đồng tác giả
                                </DialogTitle>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Selected Co-authors */}
                                {selectedCoauthors.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Đã chọn ({selectedCoauthors.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCoauthors.map((coauthor) => (
                                                <div
                                                    key={coauthor.userId}
                                                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                                                >
                                                    <Image
                                                        src={coauthor.avatarUrl || "/images/default-avatar.jpg"}
                                                        alt={coauthor.fullName || ""}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                    <span className="text-sm text-gray-900">{coauthor.fullName}</span>
                                                    <button
                                                        onClick={() => handleRemoveCoauthor(coauthor.userId)}
                                                        className="ml-2 text-red-500 hover:text-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Search bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white border border-gray-300 text-sm rounded-lg pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* List available customers */}
                                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                    {isLoadingCustomers ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="text-gray-500 text-sm mt-2">Đang tải danh sách...</p>
                                        </div>
                                    ) : customersError ? (
                                        <div className="text-center py-8">
                                            <p className="text-red-600 text-sm">{customersError}</p>
                                            <button
                                                onClick={() => {
                                                    setCustomersError(null);
                                                    loadAvailableCustomers();
                                                }}
                                                className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    ) : filteredCustomers.length > 0 ? (
                                        filteredCustomers.map((user) => {
                                            const isSelected = selectedCoauthors.some(c => c.userId === user.userId);
                                            return (
                                                <button
                                                    key={user.userId}
                                                    onClick={() => handleSelectCoauthor(user)}
                                                    className={`flex items-center gap-3 w-full text-left rounded-lg p-3 transition ${isSelected
                                                        ? 'bg-blue-50 border-2 border-blue-500'
                                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                                        }`}
                                                >
                                                    <Image
                                                        src={user.avatarUrl || "/images/default-avatar.jpg"}
                                                        alt={user.fullName || ""}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{user.fullName}</p>
                                                        <p className="text-xs text-gray-600">{user.email}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="text-blue-600 text-sm font-medium">✓</span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">
                                                {availableCustomers.length === 0
                                                    ? "Không có người dùng khả dụng"
                                                    : "Không tìm thấy kết quả"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={selectedCoauthors.length === 0 || assignLoading}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                                >
                                    {assignLoading ? "Đang xử lý..." : `Thêm (${selectedCoauthors.length})`}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AssignCoauthorDialog;