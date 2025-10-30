import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Search } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { AvailableCustomerResponse } from "@/types/paper.type";

const AbstractPhase: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
    const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomerResponse[]>([
        { userId: "u1", fullName: "Nguyễn Văn A", email: "a@gmail.com" },
        { userId: "u2", fullName: "Trần Thị B", email: "b@gmail.com" },
        { userId: "u3", fullName: "Phạm Minh C", email: "c@gmail.com" },
    ]);

    const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
        if (!selectedCoauthors.some((c) => c.userId === user.userId)) {
            setSelectedCoauthors((prev) => [...prev, user]);
        }
        setIsDialogOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("File uploaded:", file.name);
        }
    };

    const filteredCustomers = availableCustomers.filter((c) =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Giai đoạn Abstract</h3>
            <p className="text-gray-400">Nộp abstract và chọn đồng tác giả cho bài báo của bạn.</p>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <label className="block text-sm font-medium mb-2">Tải lên tệp abstract (.pdf)</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
          file:rounded-lg file:border-0 file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Đồng tác giả ({selectedCoauthors.length})</h4>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                    >
                        + Thêm đồng tác giả
                    </button>
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
                            {filteredCustomers.length > 0 ? (
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
                                <p className="text-gray-400 text-sm text-center py-3">Không tìm thấy kết quả.</p>
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