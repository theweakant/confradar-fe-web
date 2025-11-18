import React, { Fragment, useEffect, useState } from "react";
import { Clock, MapPin, ArrowLeft, X, Crown, Mic, Users } from "lucide-react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { PaperAuthor, SessionDetailForScheduleResponse } from "@/types/conference.type";
import { useAppSelector } from "@/redux/hooks/hooks";
import { RootState } from "@/redux/store";
import { checkUserRole } from "@/helper/conference";
import { useTicket } from "@/redux/hooks/useTicket";
import { usePresenter } from "@/redux/hooks/useAssigningPresenterSession";
import { toast } from "sonner";

interface SessionDetailDialogProps {
    open: boolean;
    session: SessionDetailForScheduleResponse | null;
    sessionForChange: SessionDetailForScheduleResponse[];
    onClose: () => void;
    onBack?: () => void;
}

const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
    open,
    session,
    sessionForChange,
    onClose,
    onBack,
}) => {
    const user = useAppSelector((state: RootState) => state.auth.user);

    const [sessionReason, setSessionReason] = useState("");
    const [isSubmittingSession, setIsSubmittingSession] = useState(false);
    const [validTicket, setValidTicket] = useState<string | null>(null);

    const { fetchTicketsByConference, loadingByConference, ticketsByConferenceError } = useTicket();
    const { changeSession, changePresenter, loading: changeLoading, changeSessionError, changePresenterError } = usePresenter();

    const [presenterReason, setPresenterReason] = useState("");
    const [selectedNewPresenter, setSelectedNewPresenter] = useState<string>("");
    const [isSubmittingPresenter, setIsSubmittingPresenter] = useState(false);
    const [showPresenterModal, setShowPresenterModal] = useState(false);

    const userRole = session ? checkUserRole(session, user) : null;

    useEffect(() => {
        const loadTickets = async () => {
            if (open && session?.conferenceId) {
                try {
                    const response = await fetchTicketsByConference(session.conferenceId);

                    // Tìm ticket có isRefunded = false
                    const validTicketItem = response?.data?.items?.find(
                        (ticket) => ticket.isRefunded === false
                    );

                    if (validTicketItem) {
                        setValidTicket(validTicketItem.ticketId);
                    } else {
                        setValidTicket(null);
                    }
                } catch (error) {
                    console.error("Error fetching tickets:", error);
                    setValidTicket(null);
                }
            }
        };

        loadTickets();
    }, [open, session?.conferenceId]);

    // Reset reason khi đóng dialog
    useEffect(() => {
        if (!open) {
            setSessionReason("");
            setPresenterReason("");
            setSelectedNewPresenter("");
            setShowPresenterModal(false);
        }
    }, [open]);

    const shouldShowChangeButton = () => {
        if (!session || !user || !sessionForChange || sessionForChange.length === 0) {
            return false;
        }

        // Kiểm tra user có phải là presenter trong BẤT KỲ session nào của conference không
        const isPresenterInConference = sessionForChange.some(s => {
            const role = checkUserRole(s, user);
            return role?.isPresenter;
        });

        // Kiểm tra session hiện tại user KHÔNG phải là presenter
        const currentRole = checkUserRole(session, user);
        const isNotPresenterInCurrentSession = !currentRole?.isPresenter;

        return isPresenterInConference && isNotPresenterInCurrentSession;
    };

    const shouldShowChangePresenterButton = () => {
        if (!session || !user) {
            return false;
        }

        const currentRole = checkUserRole(session, user);
        return currentRole?.isRootAuthor === true;
    };

    const getAvailableAuthorsForPresenterChange = (): PaperAuthor[] => {
        if (!session || !user) return [];

        const allAuthors: PaperAuthor[] = [];

        session.presenterAuthor?.forEach(paper => {
            paper.paperAuthor?.forEach(author => {
                // Loại trừ user hiện tại và những author đã có trong list
                if (author.userId !== user.userId &&
                    !allAuthors.some(a => a.userId === author.userId)) {
                    allAuthors.push(author);
                }
            });
        });

        return allAuthors;
    };

    const getRootAuthorPaperId = (): string | null => {
        if (!session || !user) return null;

        const rootAuthorPaper = session.presenterAuthor?.find(paper =>
            paper.paperAuthor?.some(author =>
                author.userId === user.userId && author.isRootAuthor
            )
        );

        return rootAuthorPaper?.paperId || null;
    };


    const getPresenterPaperId = (): string | null => {
        if (!user || !sessionForChange) return null;

        for (const sess of sessionForChange) {
            const presenterPaper = sess.presenterAuthor?.find((paper) =>
                paper.paperAuthor?.some((author) =>
                    author.userId === user.userId && author.isPresenter
                )
            );

            if (presenterPaper) {
                return presenterPaper.paperId;
            }
        }

        return null;
    };

    // Hàm xử lý khi click button
    const handleRequestChangeSession = async () => {
        // Validate ticket
        if (!validTicket) {
            toast.error("Bạn chưa mua vé cho hội nghị này để có thể gửi yêu cầu");
            return;
        }

        // Validate reason
        if (!sessionReason.trim()) {
            toast.error("Vui lòng nhập lý do yêu cầu đổi lịch");
            return;
        }

        // Validate session
        if (!session?.conferenceSessionId) {
            toast.error("Không tìm thấy thông tin phiên họp");
            return;
        }

        // Tìm paperId
        const paperId = getPresenterPaperId();
        if (!paperId) {
            toast.error("Không tìm thấy bài báo mà bạn là diễn giả");
            return;
        }

        try {
            setIsSubmittingSession(true);

            const response = await changeSession({
                newSessionId: session.conferenceSessionId,
                ticketId: validTicket,
                paperId: paperId,
                reason: sessionReason.trim(),
            });

            if (response.success) {
                toast.success(response.message || "Gửi yêu cầu đổi lịch thành công");
                setSessionReason("");
                onClose();
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi gửi yêu cầu");
            }
        } catch (error: unknown) {
            console.error("Error requesting change session:", error);
            toast.error(
                // error?.data?.message ||
                // changeSessionError ||
                "Có lỗi xảy ra khi gửi yêu cầu"
            );
        } finally {
            setIsSubmittingSession(false);
        }
    };

    const handleRequestChangePresenter = async () => {
        if (!validTicket) {
            toast.error("Bạn chưa mua vé cho hội nghị này để có thể gửi yêu cầu");
            return;
        }

        if (!selectedNewPresenter) {
            toast.error("Vui lòng chọn diễn giả mới");
            return;
        }

        if (!presenterReason.trim()) {
            toast.error("Vui lòng nhập lý do yêu cầu đổi diễn giả");
            return;
        }

        const paperId = getRootAuthorPaperId();
        if (!paperId) {
            toast.error("Không tìm thấy bài báo mà bạn là tác giả chính");
            return;
        }

        try {
            setIsSubmittingPresenter(true);

            const response = await changePresenter({
                ticketId: validTicket,
                paperId: paperId,
                newUserId: selectedNewPresenter,
                reason: presenterReason.trim(),
            });

            if (response.success) {
                toast.success(response.message || "Gửi yêu cầu đổi diễn giả thành công");
                setPresenterReason("");
                setSelectedNewPresenter("");
                setShowPresenterModal(false);
                onClose();
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi gửi yêu cầu");
            }
        } catch (error: unknown) {
            console.error("Error requesting change presenter:", error);
            toast.error(
                // error?.data?.message ||
                // changePresenterError ||
                "Có lỗi xảy ra khi gửi yêu cầu"
            );
        } finally {
            setIsSubmittingPresenter(false);
        }
    };

    const availableAuthors = getAvailableAuthorsForPresenterChange();

    return (
        <Transition appear show={open} as={Fragment} unmount={true}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            {onBack && (
                                                <button
                                                    onClick={onBack}
                                                    className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
                                                >
                                                    <ArrowLeft className="w-5 h-5 text-white" />
                                                </button>
                                            )}
                                            <div className="flex-1">
                                                <DialogTitle className="text-xl font-bold text-white">
                                                    {session?.title || "Chi tiết phiên họp"}
                                                </DialogTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {userRole?.isRootAuthor && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded">
                                                            <Crown className="w-3 h-3" />
                                                            Bạn là Tác giả gốc
                                                        </span>
                                                    )}
                                                    {userRole?.isPresenter && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded">
                                                            <Mic className="w-3 h-3" />
                                                            Bạn là Diễn giả
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="flex items-center gap-3 flex-1">
                                            {onBack && (
                                                <button
                                                    onClick={onBack}
                                                    className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
                                                >
                                                    <ArrowLeft className="w-5 h-5 text-white" />
                                                </button>
                                            )}
                                            <DialogTitle className="text-xl font-bold text-white">
                                                {session?.title || "Chi tiết phiên họp"}
                                            </DialogTitle>
                                        </div> */}
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 max-h-[80vh] overflow-y-auto"
                                    style={{
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "rgba(96,165,250,0.7) transparent",
                                    }}>
                                    {session ? (
                                        <div className="space-y-4">
                                            {session.description && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Mô tả
                                                    </label>
                                                    <p className="text-gray-200 mt-1">
                                                        {session.description}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {session.startTime && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-400">
                                                            Thời gian bắt đầu
                                                        </label>
                                                        <div className="flex items-center gap-2 text-gray-200 mt-1">
                                                            <Clock className="w-4 h-4 text-blue-400" />
                                                            {new Date(session.startTime).toLocaleString(
                                                                "vi-VN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {session.endTime && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-400">
                                                            Thời gian kết thúc
                                                        </label>
                                                        <div className="flex items-center gap-2 text-gray-200 mt-1">
                                                            <Clock className="w-4 h-4 text-blue-400" />
                                                            {new Date(session.endTime).toLocaleString(
                                                                "vi-VN",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {(session.roomDisplayName || session.roomNumber) && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Phòng họp
                                                    </label>
                                                    <div className="flex items-center gap-2 text-gray-200 mt-1">
                                                        <MapPin className="w-4 h-4 text-green-400" />
                                                        {session.roomDisplayName ||
                                                            `Phòng ${session.roomNumber}`}
                                                    </div>
                                                </div>
                                            )}

                                            {session.destinationName && (
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Địa điểm
                                                    </label>
                                                    <div className="text-gray-200 mt-1">
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="w-4 h-4 text-green-400 mt-1" />
                                                            <div>
                                                                <div>{session.destinationName}</div>
                                                                {(session.destinationStreet ||
                                                                    session.destinationDistrict) && (
                                                                        <div className="text-sm text-gray-400 mt-1">
                                                                            {[
                                                                                session.destinationStreet,
                                                                                session.destinationDistrict,
                                                                                session.cityName,
                                                                            ]
                                                                                .filter(Boolean)
                                                                                .join(", ")}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {session.presenterAuthor && session.presenterAuthor.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">
                                                        Danh sách bài báo sẽ trình bày
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {session.presenterAuthor.map((paper) => (
                                                            <div
                                                                key={paper.paperId}
                                                                className="border border-gray-700 rounded-lg p-4 bg-gray-700/40"
                                                            >
                                                                {/* Tiêu đề bài báo */}
                                                                <div>
                                                                    <label className="text-xs uppercase tracking-wider text-gray-400">
                                                                        Tiêu đề bài báo
                                                                    </label>
                                                                    <h4 className="text-md font-semibold text-blue-300">
                                                                        {paper.paperTitle || "Untitled Paper"}
                                                                    </h4>
                                                                </div>

                                                                {/* Mô tả */}
                                                                {paper.paperDescription && (
                                                                    <div className="mt-2">
                                                                        <label className="text-xs uppercase tracking-wider text-gray-400">
                                                                            Mô tả bài báo
                                                                        </label>
                                                                        <p className="text-sm text-gray-300 leading-relaxed">
                                                                            {paper.paperDescription}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Giai đoạn hiện tại */}
                                                                {paper.paperPhaseName && (
                                                                    <div className="mt-2">
                                                                        <label className="text-xs uppercase tracking-wider text-gray-400">
                                                                            Trạng thái hiện tại của bài báo
                                                                        </label>
                                                                        <p className="text-sm text-orange-400 font-medium">
                                                                            {paper.paperPhaseName}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Tác giả */}
                                                                {paper.paperAuthor && paper.paperAuthor.length > 0 && (
                                                                    <div className="mt-3">
                                                                        <label className="text-sm font-semibold text-gray-400">
                                                                            Tác giả
                                                                        </label>

                                                                        <ul className="mt-1 space-y-1">
                                                                            {paper.paperAuthor.map((author) => (
                                                                                <li
                                                                                    key={author.userId}
                                                                                    className="flex items-center justify-between bg-gray-800/60 px-3 py-2 rounded-lg"
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        {author.avatarUrl ? (
                                                                                            <img
                                                                                                src={author.avatarUrl}
                                                                                                className="w-7 h-7 rounded-full"
                                                                                                alt={author.fullName}
                                                                                            />
                                                                                        ) : (
                                                                                            <div className="w-7 h-7 rounded-full bg-gray-600" />
                                                                                        )}

                                                                                        <span className="text-gray-200 text-sm">
                                                                                            {author.fullName}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className="flex gap-2">
                                                                                        {author.isRootAuthor && (
                                                                                            <span className="px-2 py-0.5 text-xs bg-amber-600 text-white font-medium rounded">
                                                                                                Tác giả chính
                                                                                            </span>
                                                                                        )}
                                                                                        {!author.isRootAuthor && (
                                                                                            <span className="px-2 py-0.5 text-xs bg-gray-500 text-white font-medium rounded">
                                                                                                Đồng tác giả
                                                                                            </span>
                                                                                        )}
                                                                                        {author.isPresenter && (
                                                                                            <span className="px-2 py-0.5 text-xs bg-emerald-600 text-white font-medium rounded">
                                                                                                Diễn giả cho bài báo này
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {shouldShowChangeButton() && (
                                                <div className="mt-4">
                                                    <label className="text-sm font-semibold text-gray-400">
                                                        Lý do yêu cầu chuyển lịch trình bày
                                                    </label>
                                                    <textarea
                                                        value={sessionReason}
                                                        onChange={(e) => setSessionReason(e.target.value)}
                                                        placeholder="Nhập lý do yêu cầu đổi lịch..."
                                                        className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                        rows={3}
                                                        disabled={isSubmittingSession || loadingByConference}
                                                    />
                                                </div>
                                            )}

                                            {shouldShowChangePresenterButton() && showPresenterModal && (
                                                <div className="mt-4 border border-purple-600 rounded-lg p-4 bg-purple-900/20">
                                                    <h4 className="text-md font-semibold text-purple-300 mb-3">
                                                        Yêu cầu đổi diễn giả
                                                    </h4>

                                                    {/* Chọn diễn giả mới */}
                                                    <div className="mb-3">
                                                        <label className="text-sm font-semibold text-gray-400 block mb-2">
                                                            Chọn diễn giả mới
                                                        </label>

                                                        {availableAuthors.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {availableAuthors.map((author) => (
                                                                    <label
                                                                        key={author.userId}
                                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedNewPresenter === author.userId
                                                                            ? 'bg-purple-600/30 border-2 border-purple-500'
                                                                            : 'bg-gray-700/40 border-2 border-gray-600 hover:bg-gray-700/60'
                                                                            }`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name="newPresenter"
                                                                            value={author.userId}
                                                                            checked={selectedNewPresenter === author.userId}
                                                                            onChange={(e) => setSelectedNewPresenter(e.target.value)}
                                                                            className="w-4 h-4 text-purple-600"
                                                                            disabled={isSubmittingPresenter}
                                                                        />

                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            {author.avatarUrl ? (
                                                                                <img
                                                                                    src={author.avatarUrl}
                                                                                    className="w-8 h-8 rounded-full"
                                                                                    alt={author.fullName}
                                                                                />
                                                                            ) : (
                                                                                <div className="w-8 h-8 rounded-full bg-gray-600" />
                                                                            )}

                                                                            <div>
                                                                                <span className="text-gray-200 text-sm font-medium">
                                                                                    {author.fullName}
                                                                                </span>
                                                                                <div className="flex gap-1 mt-1">
                                                                                    {author.isRootAuthor && (
                                                                                        <span className="px-1.5 py-0.5 text-xs bg-amber-600 text-white rounded">
                                                                                            Tác giả chính
                                                                                        </span>
                                                                                    )}
                                                                                    {!author.isRootAuthor && (
                                                                                        <span className="px-1.5 py-0.5 text-xs bg-gray-500 text-white rounded">
                                                                                            Đồng tác giả
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-400 text-sm italic">
                                                                Không có tác giả khác để chọn làm diễn giả
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Nhập lý do */}
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-400">
                                                            Lý do yêu cầu đổi diễn giả
                                                        </label>
                                                        <textarea
                                                            value={presenterReason}
                                                            onChange={(e) => setPresenterReason(e.target.value)}
                                                            placeholder="Nhập lý do yêu cầu đổi diễn giả..."
                                                            className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                                            rows={3}
                                                            disabled={isSubmittingPresenter || loadingByConference}
                                                        />
                                                    </div>

                                                    {/* Buttons cho presenter change */}
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                                            onClick={handleRequestChangePresenter}
                                                            disabled={isSubmittingPresenter || loadingByConference || !selectedNewPresenter || !presenterReason.trim()}
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            {isSubmittingPresenter ? "Đang gửi..." : "Xác nhận đổi diễn giả"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                            onClick={() => {
                                                                setShowPresenterModal(false);
                                                                setSelectedNewPresenter("");
                                                                setPresenterReason("");
                                                            }}
                                                            disabled={isSubmittingPresenter}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-48" />
                                    )}

                                    {/* <div className="mt-6 flex justify-end gap-2"> */}
                                    <div className="mt-6 flex justify-between items-center gap-2">
                                        <div className="flex gap-2">
                                            {/* Button đổi session (giữ nguyên) */}
                                            {shouldShowChangeButton() && (
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                                    onClick={handleRequestChangeSession}
                                                    disabled={isSubmittingSession || loadingByConference || changeLoading}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    {isSubmittingSession ? "Đang gửi..." : "Yêu cầu chuyển lịch trình bày"}
                                                </button>
                                            )}

                                            {/* Button đổi presenter (mới - chỉ root author) */}
                                            {shouldShowChangePresenterButton() && !showPresenterModal && (
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                                    onClick={() => setShowPresenterModal(true)}
                                                    disabled={isSubmittingPresenter || loadingByConference || changeLoading || availableAuthors.length === 0}
                                                >
                                                    <Users className="w-4 h-4" />
                                                    Yêu cầu đổi diễn giả
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-auto">
                                            {onBack && (
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                    onClick={onBack}
                                                    disabled={isSubmittingSession || isSubmittingPresenter || changeLoading}

                                                >
                                                    Quay lại
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                                onClick={() => {
                                                    if (onBack) {
                                                        onBack();
                                                    } else {
                                                        onClose();
                                                    }
                                                }}
                                                disabled={isSubmittingSession || isSubmittingPresenter || changeLoading}
                                            >
                                                Đóng
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SessionDetailDialog;