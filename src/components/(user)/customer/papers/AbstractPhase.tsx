import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AvailableCustomerResponse, Abstract } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/paper/usePaper";

interface AbstractPhaseProps {
    paperId?: string;
    abstract?: Abstract | null;
}

const AbstractPhase: React.FC<AbstractPhaseProps> = ({ paperId, abstract }) => {
    const isSubmitted = !!abstract;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
    const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomerResponse[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [customersError, setCustomersError] = useState<string | null>(null);

    const {
        fetchAvailableCustomers,
        handleSubmitAbstract,
        submitAbstractError,
        loading: submitLoading
    } = usePaperCustomer();

    const loadAvailableCustomers = async () => {
        if (isLoadingCustomers || availableCustomers.length > 0) return;

        setIsLoadingCustomers(true);
        setCustomersError(null);

        try {
            const response = await fetchAvailableCustomers();
            setAvailableCustomers(response.data || []);
        } catch (error: any) {
            if (error?.data?.Message) {
                setCustomersError(error.data.Message);
            } else if (error?.data?.Errors) {
                const errors = Object.values(error.data.Errors);
                setCustomersError(errors.length > 0 ? errors[0] as string : "Có lỗi xảy ra khi tải danh sách người dùng");
            } else {
                setCustomersError("Có lỗi xảy ra khi tải danh sách người dùng");
            }
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
        if (!selectedCoauthors.some((c) => c.userId === user.userId)) {
            setSelectedCoauthors((prev) => [...prev, user]);
        }
        setIsDialogOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmitAbstractForm = async () => {
        if (!selectedFile || !paperId || !title.trim() || !description.trim()) {
            alert("Vui lòng chọn file abstract, nhập title, description và đảm bảo có Paper ID");
            return;
        }

        try {
            const coAuthorIds = selectedCoauthors.map(c => c.userId);
            await handleSubmitAbstract({
                abstractFile: selectedFile,
                paperId,
                title: title.trim(),
                description: description.trim(),
                coAuthorId: coAuthorIds
            });

            alert("Nộp abstract thành công!");
            // Reset form
            setSelectedFile(null);
            setTitle("");
            setDescription("");
            setSelectedCoauthors([]);
        } catch (error: any) {
            let errorMessage = "Có lỗi xảy ra khi nộp abstract";

            if (error?.data?.Message) {
                errorMessage = error.data.Message;
            } else if (error?.data?.Errors) {
                const errors = Object.values(error.data.Errors);
                errorMessage = errors.length > 0 ? errors[0] as string : errorMessage;
            }

            alert(errorMessage);
        }
    };

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
        loadAvailableCustomers();
    };

    const filteredCustomers = availableCustomers.filter((c) =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Giai đoạn Abstract</h3>
            <p className="text-gray-400">Nộp abstract và chọn đồng tác giả cho bài báo của bạn.</p>

            {/* Show current abstract if exists */}
            {abstract && (
                <div className="bg-green-900/20 border border-green-700 rounded-xl p-5">
                    <h4 className="font-semibold text-green-400 mb-2">Abstract đã nộp</h4>
                    <div className="space-y-2">
                        <p className="text-green-300 text-sm">
                            Abstract ID: {abstract.abstractId}
                        </p>
                        {abstract.title && (
                            <p className="text-green-300 text-sm">
                                <span className="font-medium">Tiêu đề:</span> {abstract.title}
                            </p>
                        )}
                        {abstract.description && (
                            <p className="text-green-300 text-sm">
                                <span className="font-medium">Mô tả:</span> {abstract.description}
                            </p>
                        )}
                        {abstract.globalStatusId && (
                            <p className="text-green-300 text-sm">
                                <span className="font-medium">Trạng thái:</span> {abstract.globalStatusId}
                            </p>
                        )}
                        {abstract.created && (
                            <p className="text-green-300 text-sm">
                                <span className="font-medium">Ngày tạo:</span> {new Date(abstract.created).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                        {abstract.reviewedAt && (
                            <p className="text-green-300 text-sm">
                                <span className="font-medium">Ngày đánh giá:</span> {new Date(abstract.reviewedAt).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                        {abstract.fileUrl && (
                            <a
                                href={abstract.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
                            >
                                Xem file abstract →
                            </a>
                        )}
                    </div>
                </div>
            )}

            {isSubmitted && (
                <p className="text-sm text-yellow-400 mt-2">
                    Bạn đã nộp abstract, không thể nộp lại.
                </p>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Nhập tiêu đề bài báo"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Mô tả</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Nhập mô tả bài báo"
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tải lên tệp abstract (.pdf)</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={isSubmitted}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
        file:rounded-lg file:border-0 file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white hover:file:bg-blue-700
        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {selectedFile && (
                        <p className="text-green-400 text-sm mt-2">
                            Đã chọn: {selectedFile.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Đồng tác giả ({selectedCoauthors.length})</h4>
                    <button
                        onClick={handleOpenDialog}
                        disabled={isSubmitted || isLoadingCustomers || customersError !== null} // ✅
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                    >
                        {isLoadingCustomers ? "Đang tải..." : "+ Thêm đồng tác giả"}
                    </button>
                    {/* <button
                        onClick={handleOpenDialog}
                        disabled={isLoadingCustomers || customersError !== null}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                    >
                        {isLoadingCustomers ? "Đang tải..." : "+ Thêm đồng tác giả"}
                    </button> */}
                </div>

                {selectedCoauthors.length > 0 ? (
                    <ul className="space-y-2">
                        {selectedCoauthors.map((c) => (
                            <li key={c.userId} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={c.avatarUrl || "/default-avatar.png"}
                                        alt={c.fullName || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <div>
                                        <p className="font-medium">{c.fullName}</p>
                                        <p className="text-xs text-gray-400">{c.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        setSelectedCoauthors((prev) => prev.filter((x) => x.userId !== c.userId))
                                    }
                                    className="text-red-400 hover:text-red-500 text-sm"
                                >
                                    Xóa
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm">Chưa có đồng tác giả nào được thêm.</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmitAbstractForm}
                    disabled={isSubmitted || !selectedFile || !paperId || !title.trim() || !description.trim() || submitLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
                >
                    {isSubmitted ? "Đã nộp Abstract" : submitLoading ? "Đang nộp..." : "Nộp Abstract"}
                </button>
                {/* <button
                    onClick={handleSubmitAbstractForm}
                    disabled={!selectedFile || !paperId || submitLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
                >
                    {submitLoading ? "Đang nộp..." : "Nộp Abstract"}
                </button> */}
            </div>

            {/* Error Messages */}
            {submitAbstractError && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                    <p className="text-red-400 text-sm">
                        Lỗi: {typeof submitAbstractError === 'string' ? submitAbstractError : 'Có lỗi xảy ra khi nộp abstract'}
                    </p>
                </div>
            )}

            {customersError && (
                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                    <p className="text-red-400 text-sm">
                        Lỗi tải danh sách: {customersError}
                    </p>
                </div>
            )}

            <Dialog open={isDialogOpen} as="div" className="relative z-50" onClose={setIsDialogOpen}>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl p-6 text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
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
                            ) : customersError ? (
                                <div className="text-center py-4">
                                    <p className="text-red-400 text-sm">{customersError}</p>
                                    <button
                                        onClick={() => {
                                            setCustomersError(null);
                                            loadAvailableCustomers();
                                        }}
                                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : filteredCustomers.length > 0 ? (
                                filteredCustomers.map((user) => (
                                    <button
                                        key={user.userId}
                                        onClick={() => handleSelectCoauthor(user)}
                                        className="flex items-center gap-3 w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition"
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
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm text-center py-3">
                                    {availableCustomers.length === 0 ? "Không có người dùng nào." : "Không tìm thấy kết quả."}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default AbstractPhase;