import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, Upload, FileText, Users, Search } from "lucide-react";
import { useState, useCallback, useEffect, Fragment } from "react";
import Image from "next/image";
import { AvailableCustomerResponse } from "@/types/paper.type";
import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";

interface SubmissionFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SubmissionFormData) => Promise<{ success: boolean }>;
    title: string;
    loading?: boolean;
    includeCoauthors?: boolean;
    availableCustomers?: AvailableCustomerResponse[];
    isLoadingCustomers?: boolean;
    onLoadCustomers?: () => void;
    initialData?: SubmissionFormData;
    isEditMode?: boolean;
    shouldCloseOnSuccess?: boolean;
}

export interface SubmissionFormData {
    title: string;
    description: string;
    file: File | null;
    coAuthorIds?: string[];
}

const SubmissionFormDialog: React.FC<SubmissionFormDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    loading = false,
    includeCoauthors = false,
    availableCustomers = [],
    isLoadingCustomers = false,
    onLoadCustomers,
    initialData,
    isEditMode,
    shouldCloseOnSuccess = false,
}) => {
    const [formData, setFormData] = useState<SubmissionFormData>({
        title: "",
        description: "",
        file: null,
        coAuthorIds: []
    });

    const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
    const [isCoauthorDialogOpen, setIsCoauthorDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isFormInitialized, setIsFormInitialized] = useState(false);

    const handleFileChange = useCallback((file: File | null) => {
        if (file) {
            setFormData(prev => ({ ...prev, file }));

            // Create preview URL for supported formats
            if (file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const url = URL.createObjectURL(file);
                setFilePreviewUrl(url);
            }
        }
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, [handleFileChange]);

    const filteredCustomers = availableCustomers.filter((c) =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
        if (!selectedCoauthors.some(c => c.userId === user.userId)) {
            setSelectedCoauthors(prev => [...prev, user]);
            setFormData(prev => ({
                ...prev,
                coAuthorIds: [...(prev.coAuthorIds || []), user.userId]
            }));
        }
        setIsCoauthorDialogOpen(false);
    };

    const handleOpenCoauthorDialog = () => {
        setIsCoauthorDialogOpen(true);
        if (onLoadCustomers) {
            onLoadCustomers();
        }
    };

    const handleRemoveCoauthor = (userId: string) => {
        setSelectedCoauthors(prev => prev.filter(c => c.userId !== userId));
        setFormData(prev => ({
            ...prev,
            coAuthorIds: prev.coAuthorIds?.filter(id => id !== userId)
        }));
    };

    const handleSubmit = async () => {
        const result = await onSubmit(formData);

        if (result.success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({ title: "", description: "", file: null, coAuthorIds: [] });
        setSelectedCoauthors([]);
        setFilePreviewUrl(null);
        setIsFormInitialized(false);
        onClose();
    };

    useEffect(() => {
        if (isOpen && !isFormInitialized) {
            if (initialData) {
                setFormData(initialData);
                if (initialData.coAuthorIds && availableCustomers.length > 0) {
                    const coauthors = availableCustomers.filter(c =>
                        initialData.coAuthorIds?.includes(c.userId)
                    );
                    setSelectedCoauthors(coauthors);
                }
            } else {
                setFormData({ title: "", description: "", file: null, coAuthorIds: [] });
                setSelectedCoauthors([]);
                setFilePreviewUrl(null);
            }
            setIsFormInitialized(true);
        }

        if (!isOpen) {
            setIsFormInitialized(false);
        }
    }, [isOpen, initialData, availableCustomers, isFormInitialized]);

    return (
        <>
            {/* Main Dialog with Animation */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => { }}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
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
                            <DialogPanel className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                                    <DialogTitle className="text-xl font-bold text-white">
                                        {title}
                                    </DialogTitle>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content - Two Columns */}
                                <div className="max-h-[70vh] overflow-auto px-6 py-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                                        {/* Left Column - Form Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Tiêu đề <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="Nhập tiêu đề bài báo"
                                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Mô tả <span className="text-red-400">*</span>
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Nhập mô tả chi tiết về bài báo"
                                                    rows={6}
                                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
                                                />
                                            </div>

                                            {/* Co-authors section */}
                                            {includeCoauthors && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-sm font-medium text-gray-300">
                                                            <Users className="w-4 h-4 inline mr-1" />
                                                            Đồng tác giả ({selectedCoauthors.length})
                                                        </label>
                                                        <button
                                                            onClick={handleOpenCoauthorDialog}
                                                            disabled={isLoadingCustomers}
                                                            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                                        >
                                                            + Thêm
                                                        </button>
                                                    </div>

                                                    {selectedCoauthors.length > 0 ? (
                                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                                            {selectedCoauthors.map((coauthor) => (
                                                                <div
                                                                    key={coauthor.userId}
                                                                    className="flex items-center justify-between bg-gray-700 p-2 rounded-lg"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Image
                                                                            src={coauthor.avatarUrl || "/default-avatar.png"}
                                                                            alt={coauthor.fullName || ""}
                                                                            width={24}
                                                                            height={24}
                                                                            className="rounded-full"
                                                                        />
                                                                        <span className="text-sm text-white">{coauthor.fullName}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveCoauthor(coauthor.userId)}
                                                                        className="text-red-400 hover:text-red-300 text-xs"
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400">Chưa có đồng tác giả</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column - File Upload */}
                                        <div className="space-y-4">
                                            <label className="block text-sm font-medium text-gray-300">
                                                Tải lên file <span className="text-red-400">*</span>
                                            </label>

                                            {/* Upload Area */}
                                            <div
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                className={`relative border-2 border-dashed rounded-xl transition-all ${dragActive
                                                    ? "border-blue-500 bg-blue-500/10"
                                                    : "border-gray-600 bg-gray-700/50"
                                                    }`}
                                            >
                                                {!formData.file ? (
                                                    <div className="p-8 text-center">
                                                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                        <p className="text-sm text-gray-300 mb-2">
                                                            Kéo thả file vào đây hoặc
                                                        </p>
                                                        <label className="inline-block">
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                                                className="hidden"
                                                            />
                                                            <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg cursor-pointer transition">
                                                                Chọn file
                                                            </span>
                                                        </label>
                                                        <p className="text-xs text-gray-400 mt-3">
                                                            Hỗ trợ: PDF, DOC, DOCX (tối đa 10MB)
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between mb-3 p-3 bg-gray-800 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-5 h-5 text-blue-400" />
                                                                <div>
                                                                    <p className="text-sm text-white font-medium">{formData.file.name}</p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, file: null }));
                                                                    setFilePreviewUrl(null);
                                                                }}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>

                                                        {/* File Preview */}
                                                        {filePreviewUrl && (
                                                            <div className="border border-gray-600 rounded-lg overflow-auto max-h-[40vh]">
                                                                <ReusableDocViewer
                                                                    fileUrl={filePreviewUrl}
                                                                    minHeight={300}
                                                                    checkUrlBeforeRender={false}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={
                                            !formData.title.trim() ||
                                            !formData.description.trim() ||
                                            (!isEditMode && !formData.file) ||
                                            loading
                                        }
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                                    >
                                        {loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Nộp bài")}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            {/* Coauthor Dialog with Animation */}
            <Transition appear show={isCoauthorDialogOpen} as={Fragment}>
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
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
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
                            <DialogPanel className="w-full max-w-md rounded-2xl bg-gray-800 border border-gray-700 p-6 text-white">
                                <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                                    Chọn đồng tác giả
                                </DialogTitle>

                                {/* Search bar */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-700 text-sm rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* List available customers */}
                                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                    {isLoadingCustomers ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="text-gray-400 text-sm mt-2">Đang tải danh sách...</p>
                                        </div>
                                    ) : filteredCustomers.length > 0 ? (
                                        filteredCustomers.map((user) => {
                                            const isSelected = selectedCoauthors.some(c => c.userId === user.userId);
                                            return (
                                                <button
                                                    key={user.userId}
                                                    onClick={() => handleSelectCoauthor(user)}
                                                    disabled={isSelected}
                                                    className={`flex items-center gap-3 w-full text-left rounded-lg p-3 transition ${isSelected
                                                        ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                                                        : 'bg-gray-700 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    <Image
                                                        src={user.avatarUrl || "/default-avatar.png"}
                                                        alt={user.fullName || ""}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{user.fullName}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="ml-auto text-xs text-green-400">✓ Đã chọn</span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-400 text-sm text-center py-3">
                                            {availableCustomers.length === 0
                                                ? "Không có người dùng nào."
                                                : "Không tìm thấy kết quả."
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="mt-5 flex justify-end">
                                    <button
                                        onClick={() => setIsCoauthorDialogOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default SubmissionFormDialog;

// import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// import { X, Upload, FileText, Users, Search } from "lucide-react";
// import { useState, useCallback, useEffect } from "react";
// import Image from "next/image";
// import { AvailableCustomerResponse } from "@/types/paper.type";
// import ReusableDocViewer from "@/components/molecules/ReusableDocViewer ";

// interface SubmissionFormDialogProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSubmit: (data: SubmissionFormData) => Promise<{ success: boolean }>;
//     title: string;
//     loading?: boolean;
//     includeCoauthors?: boolean;
//     availableCustomers?: AvailableCustomerResponse[];
//     isLoadingCustomers?: boolean;
//     onLoadCustomers?: () => void;
//     initialData?: SubmissionFormData;
//     isEditMode?: boolean;
//     shouldCloseOnSuccess?: boolean;
// }

// export interface SubmissionFormData {
//     title: string;
//     description: string;
//     file: File | null;
//     coAuthorIds?: string[];
// }

// const SubmissionFormDialog: React.FC<SubmissionFormDialogProps> = ({
//     isOpen,
//     onClose,
//     onSubmit,
//     title,
//     loading = false,
//     includeCoauthors = false,
//     availableCustomers = [],
//     isLoadingCustomers = false,
//     onLoadCustomers,
//     initialData,
//     isEditMode,
//     shouldCloseOnSuccess = false,
// }) => {
//     const [formData, setFormData] = useState<SubmissionFormData>({
//         title: "",
//         description: "",
//         file: null,
//         coAuthorIds: []
//     });

//     const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
//     const [isCoauthorDialogOpen, setIsCoauthorDialogOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
//     const [dragActive, setDragActive] = useState(false);
//     const [isFormInitialized, setIsFormInitialized] = useState(false);

//     const handleFileChange = useCallback((file: File | null) => {
//         if (file) {
//             setFormData(prev => ({ ...prev, file }));

//             // Create preview URL for supported formats
//             if (file.type === 'application/pdf' ||
//                 file.type === 'application/msword' ||
//                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//                 const url = URL.createObjectURL(file);
//                 setFilePreviewUrl(url);
//             }
//         }
//     }, []);

//     const handleDrag = useCallback((e: React.DragEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         if (e.type === "dragenter" || e.type === "dragover") {
//             setDragActive(true);
//         } else if (e.type === "dragleave") {
//             setDragActive(false);
//         }
//     }, []);

//     const handleDrop = useCallback((e: React.DragEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);

//         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//             handleFileChange(e.dataTransfer.files[0]);
//         }
//     }, [handleFileChange]);

//     // const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
//     //     if (!selectedCoauthors.some(c => c.userId === user.userId)) {
//     //         setSelectedCoauthors(prev => [...prev, user]);
//     //         setFormData(prev => ({
//     //             ...prev,
//     //             coAuthorIds: [...(prev.coAuthorIds || []), user.userId]
//     //         }));
//     //     }
//     // };

//     const filteredCustomers = availableCustomers.filter((c) =>
//         c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
//         if (!selectedCoauthors.some(c => c.userId === user.userId)) {
//             setSelectedCoauthors(prev => [...prev, user]);
//             setFormData(prev => ({
//                 ...prev,
//                 coAuthorIds: [...(prev.coAuthorIds || []), user.userId]
//             }));
//         }
//         setIsCoauthorDialogOpen(false);
//     };

//     const handleOpenCoauthorDialog = () => {
//         setIsCoauthorDialogOpen(true);
//         if (onLoadCustomers) {
//             onLoadCustomers(); // Load customers nếu chưa có
//         }
//     };

//     const handleRemoveCoauthor = (userId: string) => {
//         setSelectedCoauthors(prev => prev.filter(c => c.userId !== userId));
//         setFormData(prev => ({
//             ...prev,
//             coAuthorIds: prev.coAuthorIds?.filter(id => id !== userId)
//         }));
//     };

//     const handleSubmit = async () => {
//         const result = await onSubmit(formData);

//         if (result.success) {
//             handleClose();
//         }
//     };

//     // const handleSubmit = async () => {
//     //     await onSubmit(formData);
//     //     handleClose();
//     // };

//     const handleClose = () => {
//         setFormData({ title: "", description: "", file: null, coAuthorIds: [] });
//         setSelectedCoauthors([]);
//         setFilePreviewUrl(null);
//         setIsFormInitialized(false);
//         onClose();
//     };

//     useEffect(() => {
//         if (isOpen && !isFormInitialized) {
//             if (initialData) {
//                 // Edit mode - load data có sẵn
//                 setFormData(initialData);
//                 if (initialData.coAuthorIds && availableCustomers.length > 0) {
//                     const coauthors = availableCustomers.filter(c =>
//                         initialData.coAuthorIds?.includes(c.userId)
//                     );
//                     setSelectedCoauthors(coauthors);
//                 }
//             } else {
//                 setFormData({ title: "", description: "", file: null, coAuthorIds: [] });
//                 setSelectedCoauthors([]);
//                 setFilePreviewUrl(null);
//             }
//             setIsFormInitialized(true);
//         }

//         if (!isOpen) {
//             setIsFormInitialized(false);
//         }
//     }, [isOpen, initialData, availableCustomers, isFormInitialized]);

//     // useEffect(() => {
//     //     if (isOpen && initialData) {
//     //         setFormData(initialData);
//     //         if (initialData.coAuthorIds) {
//     //             const coauthors = availableCustomers.filter(c =>
//     //                 initialData.coAuthorIds?.includes(c.userId)
//     //             );
//     //             setSelectedCoauthors(coauthors);
//     //         }
//     //     }
//     // }, [isOpen, initialData, availableCustomers]);

//     return (
//         <>
//             <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

//                 <div className="fixed inset-0 flex items-center justify-center p-4">
//                     <DialogPanel className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
//                         {/* Header */}
//                         <div className="flex items-center justify-between p-6 border-b border-gray-700">
//                             <DialogTitle className="text-xl font-bold text-white">
//                                 {title}
//                             </DialogTitle>
//                             <button
//                                 onClick={handleClose}
//                                 className="text-gray-400 hover:text-white transition-colors"
//                             >
//                                 <X className="w-6 h-6" />
//                             </button>
//                         </div>

//                         {/* Content - Two Columns */}
//                         <div className="max-h-[70vh] overflow-auto px-6 py-4">
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
//                                 {/* Left Column - Form Fields */}
//                                 <div className="space-y-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-300 mb-2">
//                                             Tiêu đề <span className="text-red-400">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={formData.title}
//                                             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                                             placeholder="Nhập tiêu đề bài báo"
//                                             className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-300 mb-2">
//                                             Mô tả <span className="text-red-400">*</span>
//                                         </label>
//                                         <textarea
//                                             value={formData.description}
//                                             onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                                             placeholder="Nhập mô tả chi tiết về bài báo"
//                                             rows={6}
//                                             className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
//                                         />
//                                     </div>

//                                     {/* Co-authors section (only for Abstract) */}
//                                     {includeCoauthors && (
//                                         <div>
//                                             <div className="flex items-center justify-between mb-2">
//                                                 <label className="block text-sm font-medium text-gray-300">
//                                                     <Users className="w-4 h-4 inline mr-1" />
//                                                     Đồng tác giả ({selectedCoauthors.length})
//                                                 </label>
//                                                 <button
//                                                     onClick={handleOpenCoauthorDialog} // Sửa lại đây
//                                                     disabled={isLoadingCustomers}
//                                                     className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
//                                                 >
//                                                     + Thêm
//                                                 </button>
//                                             </div>

//                                             {selectedCoauthors.length > 0 ? (
//                                                 <div className="space-y-2 max-h-32 overflow-y-auto">
//                                                     {selectedCoauthors.map((coauthor) => (
//                                                         <div
//                                                             key={coauthor.userId}
//                                                             className="flex items-center justify-between bg-gray-700 p-2 rounded-lg"
//                                                         >
//                                                             <div className="flex items-center gap-2">
//                                                                 <Image
//                                                                     src={coauthor.avatarUrl || "/default-avatar.png"}
//                                                                     alt={coauthor.fullName || ""}
//                                                                     width={24}
//                                                                     height={24}
//                                                                     className="rounded-full"
//                                                                 />
//                                                                 <span className="text-sm text-white">{coauthor.fullName}</span>
//                                                             </div>
//                                                             <button
//                                                                 onClick={() => handleRemoveCoauthor(coauthor.userId)}
//                                                                 className="text-red-400 hover:text-red-300 text-xs"
//                                                             >
//                                                                 Xóa
//                                                             </button>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <p className="text-xs text-gray-400">Chưa có đồng tác giả</p>
//                                             )}
//                                         </div>
//                                     )}
//                                     {/* {includeCoauthors && (
//                                     <div>
//                                         <div className="flex items-center justify-between mb-2">
//                                             <label className="block text-sm font-medium text-gray-300">
//                                                 <Users className="w-4 h-4 inline mr-1" />
//                                                 Đồng tác giả ({selectedCoauthors.length})
//                                             </label>
//                                             <button
//                                                 onClick={onLoadCustomers}
//                                                 disabled={isLoadingCustomers}
//                                                 className="text-xs text-blue-400 hover:text-blue-300"
//                                             >
//                                                 + Thêm
//                                             </button>
//                                         </div>

//                                         {selectedCoauthors.length > 0 ? (
//                                             <div className="space-y-2 max-h-32 overflow-y-auto">
//                                                 {selectedCoauthors.map((coauthor) => (
//                                                     <div
//                                                         key={coauthor.userId}
//                                                         className="flex items-center justify-between bg-gray-700 p-2 rounded-lg"
//                                                     >
//                                                         <div className="flex items-center gap-2">
//                                                             <Image
//                                                                 src={coauthor.avatarUrl || "/default-avatar.png"}
//                                                                 alt={coauthor.fullName || ""}
//                                                                 width={24}
//                                                                 height={24}
//                                                                 className="rounded-full"
//                                                             />
//                                                             <span className="text-sm text-white">{coauthor.fullName}</span>
//                                                         </div>
//                                                         <button
//                                                             onClick={() => handleRemoveCoauthor(coauthor.userId)}
//                                                             className="text-red-400 hover:text-red-300 text-xs"
//                                                         >
//                                                             Xóa
//                                                         </button>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         ) : (
//                                             <p className="text-xs text-gray-400">Chưa có đồng tác giả</p>
//                                         )}
//                                     </div>
//                                 )} */}
//                                 </div>

//                                 {/* Right Column - File Upload */}
//                                 <div className="space-y-4">
//                                     <label className="block text-sm font-medium text-gray-300">
//                                         Tải lên file <span className="text-red-400">*</span>
//                                     </label>

//                                     {/* Upload Area */}
//                                     <div
//                                         onDragEnter={handleDrag}
//                                         onDragLeave={handleDrag}
//                                         onDragOver={handleDrag}
//                                         onDrop={handleDrop}
//                                         className={`relative border-2 border-dashed rounded-xl transition-all ${dragActive
//                                             ? "border-blue-500 bg-blue-500/10"
//                                             : "border-gray-600 bg-gray-700/50"
//                                             }`}
//                                     >
//                                         {!formData.file ? (
//                                             <div className="p-8 text-center">
//                                                 <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//                                                 <p className="text-sm text-gray-300 mb-2">
//                                                     Kéo thả file vào đây hoặc
//                                                 </p>
//                                                 <label className="inline-block">
//                                                     <input
//                                                         type="file"
//                                                         accept=".pdf,.doc,.docx"
//                                                         onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
//                                                         className="hidden"
//                                                     />
//                                                     <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg cursor-pointer transition">
//                                                         Chọn file
//                                                     </span>
//                                                 </label>
//                                                 <p className="text-xs text-gray-400 mt-3">
//                                                     Hỗ trợ: PDF, DOC, DOCX (tối đa 10MB)
//                                                 </p>
//                                             </div>
//                                         ) : (
//                                             <div className="p-4">
//                                                 <div className="flex items-center justify-between mb-3 p-3 bg-gray-800 rounded-lg">
//                                                     <div className="flex items-center gap-2">
//                                                         <FileText className="w-5 h-5 text-blue-400" />
//                                                         <div>
//                                                             <p className="text-sm text-white font-medium">{formData.file.name}</p>
//                                                             <p className="text-xs text-gray-400">
//                                                                 {(formData.file.size / 1024 / 1024).toFixed(2)} MB
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                     <button
//                                                         onClick={() => {
//                                                             setFormData(prev => ({ ...prev, file: null }));
//                                                             setFilePreviewUrl(null);
//                                                         }}
//                                                         className="text-red-400 hover:text-red-300"
//                                                     >
//                                                         <X className="w-5 h-5" />
//                                                     </button>
//                                                 </div>

//                                                 {/* File Preview */}
//                                                 {filePreviewUrl && (
//                                                     // <div className="border border-gray-600 rounded-lg overflow-hidden">
//                                                     <div className="border border-gray-600 rounded-lg overflow-auto max-h-[40vh]">
//                                                         <ReusableDocViewer
//                                                             fileUrl={filePreviewUrl}
//                                                             minHeight={300}
//                                                             checkUrlBeforeRender={false}
//                                                         />
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Footer */}
//                         <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
//                             <button
//                                 onClick={handleClose}
//                                 className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
//                             >
//                                 Hủy
//                             </button>
//                             <button
//                                 onClick={handleSubmit}
//                                 disabled={
//                                     !formData.title.trim() ||
//                                     !formData.description.trim() ||
//                                     (!isEditMode && !formData.file) ||
//                                     loading
//                                 }
//                                 className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
//                             >
//                                 {loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Nộp bài")}
//                             </button>
//                         </div>
//                         {/* <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
//                         <button
//                             onClick={handleClose}
//                             className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
//                         >
//                             Hủy
//                         </button>
//                         <button
//                             onClick={handleSubmit}
//                             disabled={!formData.title.trim() || !formData.description.trim() || !formData.file || loading}
//                             className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
//                         >
//                             {loading ? "Đang xử lý..." : "Nộp bài"}
//                         </button>
//                     </div> */}
//                     </DialogPanel>
//                 </div>
//             </Dialog>

//             <Dialog
//                 open={isCoauthorDialogOpen}
//                 onClose={() => setIsCoauthorDialogOpen(false)}
//                 className="relative z-[60]"
//             >
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

//                 <div className="fixed inset-0 flex items-center justify-center p-4">
//                     <DialogPanel className="w-full max-w-md rounded-2xl bg-gray-800 border border-gray-700 p-6 text-white">
//                         <DialogTitle as="h3" className="text-lg font-semibold mb-4">
//                             Chọn đồng tác giả
//                         </DialogTitle>

//                         {/* Search bar */}
//                         <div className="relative mb-4">
//                             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Tìm kiếm theo tên..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full bg-gray-700 text-sm rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
//                             />
//                         </div>

//                         {/* List available customers */}
//                         <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
//                             {isLoadingCustomers ? (
//                                 <div className="text-center py-4">
//                                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
//                                     <p className="text-gray-400 text-sm mt-2">Đang tải danh sách...</p>
//                                 </div>
//                             ) : filteredCustomers.length > 0 ? (
//                                 filteredCustomers.map((user) => {
//                                     const isSelected = selectedCoauthors.some(c => c.userId === user.userId);
//                                     return (
//                                         <button
//                                             key={user.userId}
//                                             onClick={() => handleSelectCoauthor(user)}
//                                             disabled={isSelected}
//                                             className={`flex items-center gap-3 w-full text-left rounded-lg p-3 transition ${isSelected
//                                                 ? 'bg-gray-600 opacity-50 cursor-not-allowed'
//                                                 : 'bg-gray-700 hover:bg-gray-600'
//                                                 }`}
//                                         >
//                                             <Image
//                                                 src={user.avatarUrl || "/default-avatar.png"}
//                                                 alt={user.fullName || ""}
//                                                 width={32}
//                                                 height={32}
//                                                 className="rounded-full"
//                                             />
//                                             <div>
//                                                 <p className="font-medium">{user.fullName}</p>
//                                                 <p className="text-xs text-gray-400">{user.email}</p>
//                                             </div>
//                                             {isSelected && (
//                                                 <span className="ml-auto text-xs text-green-400">✓ Đã chọn</span>
//                                             )}
//                                         </button>
//                                     );
//                                 })
//                             ) : (
//                                 <p className="text-gray-400 text-sm text-center py-3">
//                                     {availableCustomers.length === 0
//                                         ? "Không có người dùng nào."
//                                         : "Không tìm thấy kết quả."
//                                     }
//                                 </p>
//                             )}
//                         </div>

//                         {/* Buttons */}
//                         <div className="mt-5 flex justify-end">
//                             <button
//                                 onClick={() => setIsCoauthorDialogOpen(false)}
//                                 className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
//                             >
//                                 Đóng
//                             </button>
//                         </div>
//                     </DialogPanel>
//                 </div>
//             </Dialog>
//         </>
//     );
// };

// export default SubmissionFormDialog;