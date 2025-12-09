import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, CheckCircle, AlertCircle, Users, FileText, Eye, LucideIcon } from 'lucide-react';
import { CurrentResearchConferencePhaseForReviewer, ResearchPhaseDtoDetail, RevisionDeadlineDetail, RevisionRoundDeadlineForReviewer } from '@/types/paper.type';
import { ResearchConferencePhaseResponse, RevisionRoundDeadlineResponse } from '@/types/conference.type';
import { useGlobalTime } from '@/utils/TimeContext';

interface TimelineDialogProps {
    isOpen: boolean;
    onClose: () => void;
    phaseData?: ResearchPhaseDtoDetail | CurrentResearchConferencePhaseForReviewer | ResearchConferencePhaseResponse | null;
    revisionDeadlines?: RevisionDeadlineDetail[] | RevisionRoundDeadlineForReviewer[] | RevisionRoundDeadlineResponse[];
    variant?: 'reviewer' | 'submitted';
    theme?: 'light' | 'dark';
}

const TimelineDialog: React.FC<TimelineDialogProps> = ({
    isOpen,
    onClose,
    phaseData,
    revisionDeadlines = [],
    variant = 'reviewer',
    theme
}) => {
    const { now } = useGlobalTime();
    const formatDate = (date?: string) => {
        if (!date) return 'Chưa xác định';
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isDateInRange = (start?: string, end?: string) => {
        if (!start || !end) return false;
        // const now = new Date();
        return now >= new Date(start) && now <= new Date(end);
    };

    const getPhaseStatus = (start?: string, end?: string) => {
        if (!start || !end) return 'pending';
        // const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now < startDate) return 'upcoming';
        if (now > endDate) return 'completed';
        return 'active';
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            // active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
            // completed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600',
            // upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
            // pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'

            active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-400',
            completed: 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 opacity-60',
            upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
            pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
        };

        const icons = {
            active: <CheckCircle className="w-3.5 h-3.5" />,
            completed: <CheckCircle className="w-3.5 h-3.5" />,
            upcoming: <Clock className="w-3.5 h-3.5" />,
            pending: <AlertCircle className="w-3.5 h-3.5" />
        };

        const labels = {
            active: 'Đang diễn ra',
            completed: 'Đã kết thúc',
            upcoming: 'Sắp diễn ra',
            pending: 'Chờ xác định'
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const PhaseSection = ({
        title,
        icon: Icon,
        items,
        color = 'blue'
    }: {
        title: string;
        icon: LucideIcon;
        items: { label: string; start?: string; end?: string; note?: string }[];
        color?: 'blue' | 'green' | 'purple' | 'orange';
    }) => {
        const colorClasses = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
            green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
            purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400',
            orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
        };

        const iconColorClasses = {
            blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
        };

        const hasValidItems = items.some(item => item.start || item.end);
        if (!hasValidItems) return null;

        return (
            <div className="space-y-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClasses[color]}`}>
                    <div className={`p-1.5 rounded-md ${iconColorClasses[color]}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>

                <div className="space-y-2 pl-4">
                    {items.map((item, idx) => {
                        if (!item.start && !item.end) return null;
                        const status = getPhaseStatus(item.start, item.end);

                        return (
                            // <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                            <div key={idx} className={`rounded-lg p-3 space-y-2 transition-all
    ${status === 'active' ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
    ${status === 'completed' ? 'border border-gray-300 dark:border-gray-700 opacity-60 bg-gray-50 dark:bg-gray-800' : ''}
    ${status === 'upcoming' ? 'border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : ''} 
    ${status === 'pending' ? 'border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' : ''}
`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                                        {item.note && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.note}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={status} />
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                        <span>{formatDate(item.start)}</span>
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500">→</span>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                        <span>{formatDate(item.end)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const bgGradient = variant === 'reviewer'
        ? 'from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900'
        : 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';

    const headerColor = variant === 'reviewer'
        ? 'text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
        : 'text-green-900 dark:text-green-100 border-green-200 dark:border-green-800';

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                // className="relative z-50" 
                className={`relative z-50 ${theme === 'dark' ? 'dark' : ''}`}
                onClose={onClose
                }>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all">
                                {/* Header */}
                                <div className={`bg-gradient-to-r ${bgGradient} px-6 py-4 border-b ${headerColor}`}>
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-lg font-bold flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Lịch trình các giai đoạn
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Xem chi tiết thời gian và trạng thái các giai đoạn của hội nghị
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
                                    {!phaseData ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 dark:text-gray-400">Không có thông tin lịch trình</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Registration & Abstract Phase */}
                                            <PhaseSection
                                                title="Giai đoạn Đăng ký & Abstract"
                                                icon={FileText}
                                                color="blue"
                                                items={[
                                                    {
                                                        label: 'Thời gian đăng ký',
                                                        start: phaseData?.registrationStartDate,
                                                        end: phaseData?.registrationEndDate,
                                                        note: 'Khách hàng chỉ được mua vé và nộp bài báo trong khoảng này'
                                                    },
                                                    {
                                                        label: 'Quyết định trạng thái Abstract',
                                                        start: phaseData?.abstractDecideStatusStart,
                                                        end: phaseData?.abstractDecideStatusEnd,
                                                        note: 'Organizer phải decide status và assign trong khoảng này'
                                                    }
                                                ]}
                                            />

                                            {/* Full Paper Phase */}
                                            <PhaseSection
                                                title="Giai đoạn Full Paper"
                                                icon={FileText}
                                                color="green"
                                                items={[
                                                    {
                                                        label: 'Nộp Full Paper',
                                                        start: phaseData?.fullPaperStartDate,
                                                        end: phaseData?.fullPaperEndDate,
                                                        note: 'Khách hàng phải nộp Full Paper trong khoảng này'
                                                    },
                                                    {
                                                        label: 'Review Full Paper',
                                                        start: phaseData?.reviewStartDate,
                                                        end: phaseData?.reviewEndDate,
                                                        note: 'Các reviewer phải nộp đánh giá trong khoảng này'
                                                    },
                                                    {
                                                        label: 'Quyết định trạng thái Full Paper',
                                                        start: phaseData?.fullPaperDecideStatusStart,
                                                        end: phaseData?.fullPaperDecideStatusEnd,
                                                        note: 'Head reviewer phải quyết định trạng thái Full Paper trong khoảng này'
                                                    }
                                                ]}
                                            />

                                            {/* Revision Phase */}
                                            <PhaseSection
                                                title="Giai đoạn Revision"
                                                icon={Eye}
                                                color="purple"
                                                items={[
                                                    {
                                                        label: 'Thời gian Revise',
                                                        start: phaseData?.reviseStartDate,
                                                        end: phaseData?.reviseEndDate,
                                                        note: 'Các vòng chỉnh sửa bài báo diễn ra trong thời gian này'
                                                    },
                                                    // {
                                                    //     label: 'Review Revision Paper',
                                                    //     start: phaseData?.revisionPaperReviewStart,
                                                    //     end: phaseData?.revisionPaperReviewEnd,
                                                    //     note: 'Các reviewer phải nộp review trong khoảng này'
                                                    // },
                                                    {
                                                        label: 'Quyết định trạng thái Revision Paper',
                                                        start: phaseData?.revisionPaperDecideStatusStart,
                                                        end: phaseData?.revisionPaperDecideStatusEnd,
                                                        note: 'Head reviewer phải quyết định trạng thái Revision Paper trong khoảng này'
                                                    }
                                                ]}
                                            />

                                            {/* Revision Rounds */}
                                            {revisionDeadlines && revisionDeadlines.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400">
                                                        <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                                                            <Users className="w-4 h-4" />
                                                        </div>
                                                        <h3 className="font-semibold text-sm">Các vòng Revision</h3>
                                                    </div>
                                                    <div className="space-y-2 pl-4">
                                                        {revisionDeadlines.map((round, idx) => (
                                                            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        Vòng {round.roundNumber || idx + 1}
                                                                    </p>
                                                                    <StatusBadge status={getPhaseStatus(round.startSubmissionDate, round.endSubmissionDate)} />
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                                                        <span>{formatDate(round.startSubmissionDate)}</span>
                                                                    </div>
                                                                    <span className="text-gray-400 dark:text-gray-500">→</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                                                        <span>{formatDate(round.endSubmissionDate)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Camera Ready Phase */}
                                            <PhaseSection
                                                title="Giai đoạn Camera Ready"
                                                icon={CheckCircle}
                                                color="orange"
                                                items={[
                                                    {
                                                        label: 'Nộp Camera Ready',
                                                        start: phaseData?.cameraReadyStartDate,
                                                        end: phaseData?.cameraReadyEndDate,
                                                        note: 'Customer phải nộp Camera Ready trong khoảng này'
                                                    },
                                                    {
                                                        label: 'Quyết định trạng thái Camera Ready',
                                                        start: phaseData?.cameraReadyDecideStatusStart,
                                                        end: phaseData?.cameraReadyDecideStatusEnd,
                                                        note: 'Head reviewer phải decide status trong khoảng này'
                                                    }
                                                ]}
                                            />

                                            {phaseData && 'authorPaymentStart' in phaseData && (
                                                <PhaseSection
                                                    title="Giai đoạn thanh toán cho bài báo"
                                                    icon={FileText}
                                                    color="green"
                                                    items={[
                                                        {
                                                            label: 'Thanh toán cho bài báo (nếu được chấp nhận)',
                                                            start: phaseData.authorPaymentStart,
                                                            end: phaseData.authorPaymentEnd,
                                                            note: 'Khách hàng phải thanh toán cho bài báo trong khoảng này'
                                                        }
                                                    ]}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={onClose}
                                        className="w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TimelineDialog;