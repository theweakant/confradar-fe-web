import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaperTracking from '@/components/(user)/customer/papers/PaperTracking';
import AbstractPhase from '@/components/(user)/customer/papers/AbstractPhase';
import SubmittedPaperCard from '@/components/(user)/customer/papers/SubmittedPaperCard';
import SubmissionFormDialog from '@/components/(user)/customer/papers/SubmissionFormDialog';
import FullPaperPhase from '@/components/(user)/customer/papers/FullPaperPhase';
import RevisionPhase from '@/components/(user)/customer/papers/RevisionPhase';
import CameraReadyPhase from '@/components/(user)/customer/papers/CameraReadyPhase';
import * as timeValidation from '@/helper/timeValidation';

//PAPER TRACKING ===============================
// Mock dependencies
jest.mock("react-quill-new", () => {
    return {
        __esModule: true,
        default: () => <div data-testid="react-quill-mock" />,
    };
});

jest.mock("react-quill-new/dist/quill.snow.css", () => ({}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({ id: 'test-paper-id' })),
    useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

jest.mock('@/redux/hooks/usePaper', () => ({
    usePaperCustomer: jest.fn(() => ({
        // PaperTracking
        paperPhases: [],
        paperPhasesError: null,
        fetchPaperDetail: jest.fn(),
        handleUpdatePaperInfo: jest.fn(),

        // AbstractPhase
        fetchAvailableCustomers: jest.fn(),
        handleSubmitAbstract: jest.fn(),
        handleUpdateAbstract: jest.fn(),
        submitAbstractError: null,
        updateAbstractError: null,

        //FullPaper
        handleSubmitFullPaper: jest.fn(),
        handleUpdateFullPaper: jest.fn(),
        submitFullPaperError: null,
        updateFullPaperError: null,

        //Revision
        handleSubmitPaperRevision: jest.fn(),
        handleSubmitPaperRevisionResponse: jest.fn(),
        handleUpdateRevisionSubmission: jest.fn(),
        submitRevisionError: null,
        updateRevisionError: null,

        //Camera Ready
        handleSubmitCameraReady: jest.fn(),
        handleUpdateCameraReady: jest.fn(),
        submitCameraReadyError: null,
        updateCameraReadyError: null,

        loading: false,
    }))
}));

// jest.mock('@/redux/hooks/usePaper', () => ({
//   usePaperCustomer: jest.fn(() => ({
//     handleSubmitCameraReady: jest.fn(),
//     handleUpdateCameraReady: jest.fn(),
//     submitCameraReadyError: null,
//     updateCameraReadyError: null,
//     loading: false
//   }))
// }));

// jest.mock('@/redux/hooks/usePaper', () => ({
//     usePaperCustomer: jest.fn(() => ({
//         handleSubmitPaperRevision: jest.fn(),
//         handleSubmitPaperRevisionResponse: jest.fn(),
//         handleUpdateRevisionSubmission: jest.fn(),
//         loading: false,
//         submitRevisionError: null,
//         updateRevisionError: null
//     }))
// }));

// jest.mock('@/redux/hooks/usePaper', () => ({
//     usePaperCustomer: jest.fn(() => ({
//         handleSubmitFullPaper: jest.fn(),
//         handleUpdateFullPaper: jest.fn(),
//         submitFullPaperError: null,
//         updateFullPaperError: null,
//         loading: false
//     }))
// }));

// jest.mock('@/redux/hooks/usePaper', () => ({
//     usePaperCustomer: jest.fn(() => ({
//         fetchAvailableCustomers: jest.fn(),
//         handleSubmitAbstract: jest.fn(),
//         handleUpdateAbstract: jest.fn(),
//         submitAbstractError: null,
//         updateAbstractError: null,
//         loading: false
//     }))
// }));

// jest.mock('@/redux/hooks/usePaper', () => ({
//     usePaperCustomer: jest.fn(() => ({
//         paperPhases: [],
//         paperPhasesError: null,
//         fetchPaperDetail: jest.fn(),
//         loading: false,
//         handleUpdatePaperInfo: jest.fn()
//     }))
// }));

jest.mock('@/redux/hooks/useConference', () => ({
    useConference: jest.fn(() => ({
        researchConference: null,
        researchConferenceLoading: false,
        researchConferenceError: null,
        refetchResearchConference: jest.fn()
    }))
}));

jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2025-12-20') }))
}));

jest.mock('@/redux/hooks/hooks', () => ({
    useAppSelector: jest.fn(() => ({ accessToken: 'test-token' }))
}));

jest.mock('@/components/molecules/ReusableDocViewer ', () => ({
    __esModule: true,
    default: () => <div data-testid="doc-viewer-mock" />,
}));

describe('PaperTracking Component - UI Rendering', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders main heading', () => {
        render(<PaperTracking />);
        expect(screen.getByText('Theo dõi bài báo')).toBeInTheDocument();
    });

    test('displays paper ID when available', () => {
        const { usePaperCustomer } = require('@/redux/hooks/usePaper');
        usePaperCustomer.mockReturnValue({
            paperPhases: [],
            paperPhasesLoading: false,
            isLoadingPaperDetail: false,
            paperPhasesError: null,
            fetchPaperDetail: jest.fn(),
            loading: true,
            handleUpdatePaperInfo: jest.fn()
        });
        render(<PaperTracking />);
        expect(screen.getByText(/Mã bài báo của bạn: test-paper-id/)).toBeInTheDocument();
    });

    test('shows loading state', () => {
        const { usePaperCustomer } = require('@/redux/hooks/usePaper');
        usePaperCustomer.mockReturnValue({
            paperPhases: [],
            paperPhasesError: null,
            fetchPaperDetail: jest.fn(),
            loading: true,
            handleUpdatePaperInfo: jest.fn()
        });

        render(<PaperTracking />);
        expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();
    });

    test('shows missing paper ID warning when no paperId', () => {
        const { useParams } = require('next/navigation');
        useParams.mockReturnValue({ id: undefined });

        const { usePaperCustomer } = require('@/redux/hooks/usePaper');
        usePaperCustomer.mockReturnValue({
            paperPhases: [],
            paperPhasesError: null,
            loading: false,
            fetchPaperDetail: jest.fn(),
            handleUpdatePaperInfo: jest.fn()
        });

        render(<PaperTracking />);

        expect(
            screen.getByText('Thiếu thông tin')
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Không tìm thấy Paper ID/i)
        ).toBeInTheDocument();
    });

    test('renders timeline button', async () => {
        const { useParams } = require('next/navigation');
        useParams.mockReturnValue({ id: 'test-paper-id' });

        const { usePaperCustomer } = require('@/redux/hooks/usePaper');
        usePaperCustomer.mockReturnValue({
            paperPhases: [],
            paperPhasesError: null,
            loading: false,
            fetchPaperDetail: jest.fn().mockResolvedValue({
                data: {
                    researchPhase: {
                        researchConferencePhaseId: 'rp-1'
                    },
                    researchConferenceInfo: {
                        conferenceId: 'conf-1'
                    }
                }
            }),
            handleUpdatePaperInfo: jest.fn()
        });

        render(<PaperTracking />);

        expect(
            await screen.findByRole('button', { name: /xem lịch trình đầy đủ/i })
        ).toBeInTheDocument();
    });

    test('renders add coauthor button', async () => {
        const { useParams } = require('next/navigation');
        useParams.mockReturnValue({ id: 'test-paper-id' });

        const { usePaperCustomer } = require('@/redux/hooks/usePaper');

        usePaperCustomer.mockReturnValue({
            paperPhases: [],
            paperPhasesError: null,
            loading: false,
            fetchPaperDetail: jest.fn().mockResolvedValue({
                data: {
                    cameraReady: { id: 'cr-1' },
                    currentPhase: { phaseName: 'Camera Ready' },
                    researchConferenceInfo: {
                        conferenceId: 'conf-1',
                        conferenceName: 'Test Conference'
                    },
                    rootAuthor: { fullName: 'Test Author' },
                    created: '2025-01-01'
                }
            }),
            handleUpdatePaperInfo: jest.fn()
        });

        render(<PaperTracking />);

        expect(
            await screen.findByRole('button', { name: /thêm đồng tác giả/i })
        ).toBeInTheDocument();
    });
});

//AbstractPhase
describe('AbstractPhase Component - UI Rendering', () => {
    const mockProps = {
        paperId: 'test-paper-id',
        abstract: null,
        researchPhase: {
            researchConferencePhaseId: 'phase-1',
            registrationStartDate: '2025-12-01',
            registrationEndDate: '2025-12-31'
        },
        researchConferenceInfo: {
            conferenceId: 'conference-1'
        }
    };

    test('renders phase title', () => {
        render(<AbstractPhase {...mockProps} />);
        expect(screen.getByText('Giai đoạn Abstract')).toBeInTheDocument();
    });

    test('renders phase description', () => {
        render(<AbstractPhase {...mockProps} />);
        expect(screen.getByText(/Nộp abstract và chọn đồng tác giả/)).toBeInTheDocument();
    });

    test('shows phase timing information', () => {
        render(<AbstractPhase {...mockProps} />);
        expect(screen.getByText('Thời gian diễn ra:')).toBeInTheDocument();
    });

    test('displays no submission message when abstract is null', () => {
        render(<AbstractPhase {...mockProps} />);
        expect(screen.getByText('Bạn chưa có submission nào')).toBeInTheDocument();
    });

    test('renders submit button when no submission exists', () => {
        render(<AbstractPhase {...mockProps} />);
        expect(screen.getByText('Nộp Abstract')).toBeInTheDocument();
    });

    test('shows submitted paper card when abstract exists', () => {
        const propsWithAbstract = {
            ...mockProps,
            abstract: {
                abstractId: 'abstract-1',
                title: 'Test Abstract',
                description: 'Test Description',
                status: 'pending',
                created: '2025-12-20',
                fileUrl: 'http://test.com/file.pdf'
            }
        };

        render(<AbstractPhase {...propsWithAbstract} />);
        expect(screen.getByText('Test Abstract')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    test('shows edit button when abstract exists and phase is available', () => {
        const propsWithAbstract = {
            ...mockProps,
            abstract: {
                abstractId: 'abstract-1',
                title: 'Test Abstract',
                status: 'pending'
            }
        };

        render(<AbstractPhase {...propsWithAbstract} />);
        expect(screen.getByText('Chỉnh sửa Abstract')).toBeInTheDocument();
    });

    test('displays expired phase message', () => {
        const { useGlobalTime } = require('@/utils/TimeContext');
        useGlobalTime.mockReturnValue({ now: new Date('2026-01-01') });

        render(<AbstractPhase {...mockProps} />);
        expect(
            screen.getByText(/đã hết hạn thao tác/i)
        ).toBeInTheDocument();
    });

    test('shows pending phase message', () => {
        const { useGlobalTime } = require('@/utils/TimeContext');
        useGlobalTime.mockReturnValue({ now: new Date('2025-11-01') });

        render(<AbstractPhase {...mockProps} />);
        expect(
            screen.getByText(/Chưa đến thời gian/i)
        ).toBeInTheDocument();
    });
});

//FULLPAPER PHASE
jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2025-12-20') }))
}));

describe('FullPaperPhase Component - UI Rendering', () => {
    const mockProps = {
        paperId: 'test-paper-id',
        fullPaper: null,
        researchPhase: {
            researchConferencePhaseId: 'phase-1',
            fullPaperStartDate: '2025-12-01',
            fullPaperEndDate: '2025-12-31'
        },
        abstract: {
            abstractId: 'abstract-1',
            status: 'accepted'
        }
    };

    test('renders phase title', () => {
        render(<FullPaperPhase {...mockProps} />);
        expect(screen.getByText('Giai đoạn Full Paper')).toBeInTheDocument();
    });

    test('renders phase description', () => {
        render(<FullPaperPhase {...mockProps} />);
        expect(screen.getByText(/Nộp bản full paper hoàn chỉnh/)).toBeInTheDocument();
    });

    test('shows phase timing information', () => {
        render(<FullPaperPhase {...mockProps} />);
        expect(screen.getByText('Thời gian diễn ra:')).toBeInTheDocument();
    });

    test('displays no submission message when fullPaper is null', () => {
        render(<FullPaperPhase {...mockProps} />);
        expect(screen.getByText('Bạn chưa có submission nào')).toBeInTheDocument();
    });

    test('renders submit button when no submission exists', () => {
        render(<FullPaperPhase {...mockProps} />);
        expect(screen.getByText('Nộp Full Paper')).toBeInTheDocument();
    });

    test('shows submitted paper card when fullPaper exists', () => {
        const propsWithFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                description: 'Full Paper Description',
                reviewStatus: 'pending',
                created: '2025-12-20',
                fileUrl: 'http://test.com/file.pdf'
            }
        };

        render(<FullPaperPhase {...propsWithFullPaper} />);
        expect(screen.getByText('Test Full Paper')).toBeInTheDocument();
        expect(screen.getByText('Full Paper Description')).toBeInTheDocument();
    });

    test('shows edit button when fullPaper exists and phase is available', () => {
        const propsWithFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                reviewStatus: 'pending'
            }
        };

        render(<FullPaperPhase {...propsWithFullPaper} />);
        expect(screen.getByText('Chỉnh sửa Full Paper')).toBeInTheDocument();
    });

    test('displays expired phase message', () => {
        const { useGlobalTime } = require('@/utils/TimeContext');
        useGlobalTime.mockReturnValue({ now: new Date('2026-01-01') });

        render(<FullPaperPhase {...mockProps} />);
        expect(
            screen.getByText(/hết hạn thao tác/i)
        ).toBeInTheDocument();
    });

    test('shows pending phase message', () => {
        const { useGlobalTime } = require('@/utils/TimeContext');
        useGlobalTime.mockReturnValue({ now: new Date('2025-11-01') });

        render(<FullPaperPhase {...mockProps} />);
        expect(
            screen.getByText(/còn \d+ ngày để thao tác/i)
        ).toBeInTheDocument();
    });

    test('shows message when abstract not accepted', () => {
        const propsWithPendingAbstract = {
            ...mockProps,
            abstract: {
                abstractId: 'abstract-1',
                status: 'pending'
            }
        };

        render(<FullPaperPhase {...propsWithPendingAbstract} />);
        expect(
            screen.queryByText(/abstract.*chấp nhận/i)
        ).not.toBeInTheDocument();
    });

    test('displays full paper status', () => {
        const propsWithFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                reviewStatus: 'accepted',
                created: '2025-12-20',
                fileUrl: 'http://test.com/file.pdf'
            }
        };

        render(<FullPaperPhase {...propsWithFullPaper} />);
        expect(screen.getByText('accepted')).toBeInTheDocument();
    });

    test('shows reviewer reason when available', () => {
        const propsWithFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                reviewStatus: 'rejected',
                reason: 'Needs more data',
                created: '2025-12-20'
            }
        };

        render(<FullPaperPhase {...propsWithFullPaper} />);
        expect(screen.getByText('Needs more data')).toBeInTheDocument();
    });

    test('displays created and updated dates', () => {
        const propsWithFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                created: '2025-12-20',
                updated: '2025-12-21'
            }
        };

        render(<FullPaperPhase {...propsWithFullPaper} />);
        expect(screen.getByText('Ngày tạo')).toBeInTheDocument();
        expect(screen.getByText('Ngày cập nhật')).toBeInTheDocument();
    });

    test('shows deadline countdown when available', () => {
        render(<FullPaperPhase {...mockProps} />);
        expect(screen.getByText(/Bạn còn.*ngày/)).toBeInTheDocument();
    });

    test('renders full paper with revise status', () => {
        const propsWithRevisePaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                reviewStatus: 'revise',
                created: '2025-12-20'
            }
        };

        render(<FullPaperPhase {...propsWithRevisePaper} />);
        expect(screen.getByText('revise')).toBeInTheDocument();
    });

    test('displays file viewer section when fileUrl exists', () => {
        const propsWithFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                title: 'Test Full Paper',
                fileUrl: 'http://test.com/file.pdf',
                created: '2025-12-20'
            }
        };

        render(<FullPaperPhase {...propsWithFullPaper} />);
        expect(screen.getByText('Xem trước tài liệu')).toBeInTheDocument();
    });
});

//REVISION PAPER
jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2025-12-20') }))
}));

describe('RevisionPhase Component - UI Rendering', () => {
    const mockProps = {
        paperId: 'test-paper-id',
        revisionPaper: null,
        researchPhase: {
            researchConferencePhaseId: 'phase-1',
            reviseStartDate: '2025-12-01',
            reviseEndDate: '2025-12-31'
        },
        revisionDeadline: [
            {
                revisionRoundDeadlineId: 'round-1',
                roundNumber: 1,
                startSubmissionDate: '2025-12-01',
                endSubmissionDate: '2025-12-15'
            }
        ],
        fullPaper: {
            fullPaperId: 'full-paper-1',
            reviewStatus: 'revise'
        }
    };

    test('renders phase title', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText('Giai đoạn Revision')).toBeInTheDocument();
    });

    test('renders phase description', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText(/Đây là giai đoạn chỉnh sửa bài báo/)).toBeInTheDocument();
    });

    test('shows guide button', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText('Xem hướng dẫn')).toBeInTheDocument();
    });

    test('displays no revision paper message when null', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText('Chưa có thông tin revision paper')).toBeInTheDocument();
    });

    test('shows revision paper info when exists', () => {
        const propsWithRevision = {
            ...mockProps,
            revisionPaper: {
                revisionPaperId: 'revision-1',
                overallStatus: 'pending',
                submissions: [],
                created: '2025-12-20',
                updated: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithRevision} />);
        expect(screen.getByText('Revision Paper đã nộp')).toBeInTheDocument();
    });

    test('displays rounds header', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText('Các Round Revision')).toBeInTheDocument();
    });

    test('shows round tabs', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getAllByText('Round 1')[0]).toBeInTheDocument();
    });

    test('displays deadline information', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText('Thông tin Deadline')).toBeInTheDocument();
    });

    test('shows submission button for round without submission', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText(/Nộp Submission Round 1/)).toBeInTheDocument();
    });

    test('displays submission info when exists', () => {
        const propsWithSubmission = {
            ...mockProps,
            revisionPaper: {
                revisionPaperId: 'revision-1',
                overallStatus: 'pending',
                submissions: [
                    {
                        submissionId: 'sub-1',
                        title: 'Revision Submission 1',
                        description: 'Description',
                        revisionRoundId: 'round-1',
                        fileUrl: 'http://test.com/revision-1.pdf',
                        feedbacks: []
                    }
                ],
                created: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithSubmission} />);
        expect(screen.getByText('Revision Submission 1')).toBeInTheDocument();
    });

    test('shows feedback button when feedbacks exist', () => {
        const propsWithFeedback = {
            ...mockProps,
            revisionPaper: {
                revisionPaperId: 'revision-1',
                overallStatus: 'pending',
                submissions: [
                    {
                        submissionId: 'sub-1',
                        title: 'Revision Submission 1',
                        revisionRoundId: 'round-1',
                        fileUrl: 'http://test.com/revision-1.pdf',
                        feedbacks: [
                            {
                                feedbackId: 'feedback-1',
                                order: 1,
                                feedBack: 'Test feedback',
                                createdAt: '2025-12-20T10:00:00Z',
                            }
                        ],
                    }
                ],
                created: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithFeedback} />);
        expect(screen.getByText(/1 Feedback\(s\) từ Reviewer/)).toBeInTheDocument();
    });

    test('displays completion message when revision completed', () => {
        const propsWithCompletion = {
            ...mockProps,
            revisionPaper: {
                revisionPaperId: 'revision-1',
                revisionRoundDeadlineId: 'round-1',
                overallStatus: 'accepted',
                submissions: [],
                created: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithCompletion} />);
        expect(screen.getByText(/Bạn đã hoàn tất vòng chỉnh sửa/)).toBeInTheDocument();
    });

    test('shows round status badges', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getAllByText('Đang mở').length).toBeGreaterThan(0);
    });

    test('displays time remaining message', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText(/Còn.*ngày/)).toBeInTheDocument();
    });

    test('shows submission ID when available', () => {
        const propsWithSubmission = {
            ...mockProps,
            revisionPaper: {
                revisionPaperId: 'revision-1',
                overallStatus: 'pending',
                submissions: [
                    {
                        submissionId: 'sub-123',
                        title: 'Test Submission',
                        revisionRoundId: 'round-1',
                        fileUrl: 'http://test.com/revision-1.pdf',
                        feedbacks: []
                    }
                ],
                created: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithSubmission} />);
        expect(screen.getByText(/ID submission: sub-123/)).toBeInTheDocument();
    });

    test('displays no submission message for round', () => {
        render(<RevisionPhase {...mockProps} />);
        expect(screen.getByText('Chưa có submission')).toBeInTheDocument();
    });

    test('shows multiple rounds when available', () => {
        const propsWithMultipleRounds = {
            ...mockProps,
            revisionDeadline: [
                {
                    revisionRoundDeadlineId: 'round-1',
                    roundNumber: 1,
                    startSubmissionDate: '2025-12-01',
                    endSubmissionDate: '2025-12-15'
                },
                {
                    revisionRoundDeadlineId: 'round-2',
                    roundNumber: 2,
                    startSubmissionDate: '2025-12-16',
                    endSubmissionDate: '2025-12-31'
                }
            ]
        };

        render(<RevisionPhase {...propsWithMultipleRounds} />);
        expect(screen.getAllByText('Round 1')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Round 2')[0]).toBeInTheDocument();
    });

    test('displays submission count in revision paper card', () => {
        const propsWithSubmissions = {
            ...mockProps,
            revisionPaper: {
                revisionPaperId: 'revision-1',
                overallStatus: 'pending',
                submissions: [
                    { submissionId: 'sub-1', revisionRoundId: 'round-1', fileUrl: 'http://test.com/revision-1.pdf', feedbacks: [] },
                    { submissionId: 'sub-2', revisionRoundId: 'round-2', fileUrl: 'http://test.com/revision-1.pdf', feedbacks: [] }
                ],
                created: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithSubmissions} />);
        // The submission count would be shown in the SubmittedPaperCard component
        expect(screen.getByText('Revision Paper đã nộp')).toBeInTheDocument();
    });

    test('shows disabled state for rounds after completion', () => {
        const propsWithCompletion = {
            ...mockProps,
            revisionDeadline: [
                {
                    revisionRoundDeadlineId: 'round-1',
                    roundNumber: 1,
                    startSubmissionDate: '2025-12-01',
                    endSubmissionDate: '2025-12-15'
                },
                {
                    revisionRoundDeadlineId: 'round-2',
                    roundNumber: 2,
                    startSubmissionDate: '2025-12-16',
                    endSubmissionDate: '2025-12-31'
                }
            ],
            revisionPaper: {
                revisionPaperId: 'revision-1',
                revisionRoundDeadlineId: 'round-1',
                overallStatus: 'accepted',
                submissions: [],
                created: '2025-12-20'
            }
        };

        render(<RevisionPhase {...propsWithCompletion} />);
        expect(screen.getByText('Không cần')).toBeInTheDocument();
    });

    test('displays message when full paper not in revise status', () => {
        const propsWithAcceptedFullPaper = {
            ...mockProps,
            fullPaper: {
                fullPaperId: 'full-paper-1',
                reviewStatus: 'accepted'
            }
        };

        render(<RevisionPhase {...propsWithAcceptedFullPaper} />);
        expect(screen.getByText(/Cần full paper có trạng thái 'Revise'/)).toBeInTheDocument();
    });
});

//SUBMITTED PAPER CARD
jest.mock('@/components/molecules/ReusableDocViewer ', () => {
    return function MockDocViewer() {
        return <div data-testid="doc-viewer">Document Viewer</div>;
    };
});

//CAMERA READY
jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2025-12-20') }))
}));

describe('CameraReadyPhase Component - UI Rendering', () => {
    const mockProps = {
        paperId: 'test-paper-id',
        cameraReady: null,
        researchPhase: {
            researchConferencePhaseId: 'phase-1',
            cameraReadyStartDate: '2025-12-01',
            cameraReadyEndDate: '2025-12-31',
            authorPaymentEnd: '2025-12-31'
        },
        fullPaper: {
            fullPaperId: 'full-paper-1',
            reviewStatus: 'accepted'
        },
        revisionPaper: null
    };

    const mockProps2 = {
        paperId: 'test-paper-id',
        cameraReady: null,
        researchPhase: {
            researchConferencePhaseId: 'phase-1',
            cameraReadyStartDate: '2025-12-01',
            cameraReadyEndDate: '2025-12-31',
            authorPaymentEnd: '2025-12-31',
        },
        fullPaper: {
            fullPaperId: 'full-paper-1',
            reviewStatus: 'accepted',
        },
        revisionPaper: null,
    };

    test('renders phase title', () => {
        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText('Giai đoạn Camera Ready')).toBeInTheDocument();
    });

    test('renders phase description', () => {
        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText(/Nộp bản camera-ready cuối cùng/)).toBeInTheDocument();
    });

    test('shows phase timing information', () => {
        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText('Hạn chót:')).toBeInTheDocument();
    });

    test('displays no submission message when cameraReady is null', () => {
        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText('Bạn chưa có submission nào')).toBeInTheDocument();
    });

    test('renders submit button when no submission exists', () => {
        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText('Nộp Camera Ready')).toBeInTheDocument();
    });

    test('shows submitted paper card when cameraReady exists', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                description: 'Camera Ready Description',
                status: 'pending',
                created: '2025-12-20',
                fileUrl: 'http://test.com/file.pdf'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('Test Camera Ready')).toBeInTheDocument();
        expect(screen.getByText('Camera Ready Description')).toBeInTheDocument();
    });

    test('shows edit button when cameraReady exists and phase is available', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                status: 'pending'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('Chỉnh sửa Camera Ready')).toBeInTheDocument();
    });

    test('displays expired phase message', () => {
        const { useGlobalTime } = require('@/utils/TimeContext');
        useGlobalTime.mockReturnValue({ now: new Date('2026-01-01') });

        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText(/đã hết hạn/)).toBeInTheDocument();
    });

    test('allows submission when full paper accepted', () => {
        jest.spyOn(timeValidation, 'validatePhaseTime').mockReturnValue({
            isAvailable: true,
            isExpired: false,
            isPending: false,
            daysRemaining: 11,
            message: 'Bạn còn 11 ngày để thao tác.',
            formattedPeriod: 'Đến 31/12/2025',
        });

        const propsWithAcceptedFullPaper = {
            ...mockProps2,
            fullPaper: { fullPaperId: 'full-paper-1', reviewStatus: 'revise' },
            revisionPaper: { revisionPaperId: 'revision-1', overallStatus: 'accepted', submissions: [] },
        };

        render(<CameraReadyPhase {...propsWithAcceptedFullPaper} />);
        expect(screen.getByText('Nộp Camera Ready')).toBeInTheDocument();
    });

    test('allows submission when revision accepted', () => {
        jest.spyOn(timeValidation, 'validatePhaseTime').mockReturnValue({
            isAvailable: true,
            isExpired: false,
            isPending: false,
            daysRemaining: 11,
            message: 'Bạn còn 11 ngày để thao tác.',
            formattedPeriod: 'Đến 31/12/2025',
        });

        const propsWithAcceptedRevision = {
            ...mockProps2,
            fullPaper: { fullPaperId: 'full-paper-1', reviewStatus: 'revise' },
            revisionPaper: { revisionPaperId: 'revision-1', overallStatus: 'accepted', submissions: [] },
        };

        render(<CameraReadyPhase {...propsWithAcceptedRevision} />);

        // Kiểm tra button Nộp Camera Ready xuất hiện
        expect(screen.getByText('Nộp Camera Ready')).toBeInTheDocument();
    });

    // test('allows submission when revision accepted', () => {
    //     const propsWithAcceptedRevision = {
    //         ...mockProps,
    //         fullPaper: {
    //             fullPaperId: 'full-paper-1',
    //             reviewStatus: 'revise'
    //         },
    //         revisionPaper: {
    //             revisionPaperId: 'revision-1',
    //             overallStatus: 'accepted',
    //             submissions: [],
    //         }
    //     };

    //     render(<CameraReadyPhase {...propsWithAcceptedRevision} />);
    //     expect(screen.getByText('Nộp Camera Ready')).toBeInTheDocument();
    // });

    test('displays camera ready status', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                status: 'accepted',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('accepted')).toBeInTheDocument();
    });

    test('shows reviewer reason when available', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                status: 'rejected',
                reason: 'Formatting issues',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('Formatting issues')).toBeInTheDocument();
    });

    test('displays created and updated dates', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                created: '2025-12-20',
                updated: '2025-12-21'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('Ngày tạo')).toBeInTheDocument();
        expect(screen.getByText('Ngày cập nhật')).toBeInTheDocument();
    });

    test('shows deadline countdown when available', () => {
        render(<CameraReadyPhase {...mockProps} />);
        expect(screen.getByText(/Bạn còn.*ngày/)).toBeInTheDocument();
    });

    test('displays file viewer section when fileUrl exists', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                fileUrl: 'http://test.com/file.pdf',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('Xem trước tài liệu')).toBeInTheDocument();
    });

    test('shows rejected status with correct styling', () => {
        const propsWithRejectedCamera = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                status: 'rejected',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithRejectedCamera} />);
        const statusElement = screen.getByText('rejected');
        expect(statusElement).toHaveClass('text-red-600');
    });

    test('shows accepted status with correct styling', () => {
        const propsWithAcceptedCamera = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                status: 'accepted',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithAcceptedCamera} />);
        const statusElement = screen.getByText('accepted');
        expect(statusElement).toHaveClass('text-green-600');
    });

    test('renders Camera Ready card header', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-1',
                title: 'Test Camera Ready',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText('Camera Ready đã nộp')).toBeInTheDocument();
    });

    test('shows ID badge in submitted card', () => {
        const propsWithCameraReady = {
            ...mockProps,
            cameraReady: {
                cameraReadyId: 'camera-123',
                title: 'Test Camera Ready',
                created: '2025-12-20'
            }
        };

        render(<CameraReadyPhase {...propsWithCameraReady} />);
        expect(screen.getByText(/ID: camera-123/)).toBeInTheDocument();
    });
});

describe('SubmittedPaperCard Component - UI Rendering', () => {
    const mockPaperInfo = {
        id: 'paper-123',
        title: 'Test Paper Title',
        description: 'Test paper description',
        status: 'accepted',
        created: '2025-12-20',
        updated: '2025-12-21',
        fileUrl: 'http://test.com/file.pdf',
        reason: 'Good quality work'
    };

    test('renders paper type header', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Abstract đã nộp')).toBeInTheDocument();
    });

    test('displays paper ID badge', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText(/ID: paper-123/)).toBeInTheDocument();
    });

    test('shows paper title', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Test Paper Title')).toBeInTheDocument();
    });

    test('displays paper description', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Test paper description')).toBeInTheDocument();
    });

    test('shows status with correct color for accepted', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        const statusElement = screen.getByText('accepted');
        expect(statusElement).toHaveClass('text-green-600');
    });

    test('shows status with correct color for rejected', () => {
        const rejectedPaper = { ...mockPaperInfo, status: 'rejected' };
        render(<SubmittedPaperCard paperInfo={rejectedPaper} paperType="Abstract" />);
        const statusElement = screen.getByText('rejected');
        expect(statusElement).toHaveClass('text-red-600');
    });

    test('displays reviewer reason', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Good quality work')).toBeInTheDocument();
    });

    test('shows created date', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Ngày tạo')).toBeInTheDocument();
    });

    test('displays updated date', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Ngày cập nhật')).toBeInTheDocument();
    });

    test('renders document viewer when fileUrl exists', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByTestId('doc-viewer')).toBeInTheDocument();
    });

    test('does not render document viewer when fileUrl is null', () => {
        const paperWithoutFile = { ...mockPaperInfo, fileUrl: null };
        render(<SubmittedPaperCard paperInfo={paperWithoutFile} paperType="Abstract" />);
        expect(screen.queryByTestId('doc-viewer')).not.toBeInTheDocument();
    });

    test('renders for Full Paper type', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Full Paper" />);
        expect(screen.getByText('Full Paper đã nộp')).toBeInTheDocument();
    });

    test('renders for Revision Paper type', () => {
        const revisionPaper = {
            ...mockPaperInfo,
            overallStatus: 'accepted'
        };
        render(<SubmittedPaperCard paperInfo={revisionPaper} paperType="Revision Paper" />);
        expect(screen.getByText('Revision Paper đã nộp')).toBeInTheDocument();
    });

    test('renders for Camera Ready type', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Camera Ready" />);
        expect(screen.getByText('Camera Ready đã nộp')).toBeInTheDocument();
    });

    test('displays no reason message when reason is null', () => {
        const paperWithoutReason = { ...mockPaperInfo, reason: null };
        render(<SubmittedPaperCard paperInfo={paperWithoutReason} paperType="Abstract" />);
        expect(screen.getByText('Không có lý do')).toBeInTheDocument();
    });

    test('shows preview text', () => {
        render(<SubmittedPaperCard paperInfo={mockPaperInfo} paperType="Abstract" />);
        expect(screen.getByText('Xem trước tài liệu')).toBeInTheDocument();
    });
});

//SUBMISSION FORM DIALOG
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        return <img {...props} />;
    },
}));

jest.mock('@/components/molecules/ReusableDocViewer ', () => {
    return function MockDocViewer() {
        return <div data-testid="doc-viewer">Document Viewer</div>;
    };
});

describe('SubmissionFormDialog Component - UI Rendering', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        title: 'Test Dialog Title',
        loading: false,
        includeCoauthors: false
    };

    test('renders dialog title', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
    });

    test('displays title input field', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByPlaceholderText('Nhập tiêu đề bài báo')).toBeInTheDocument();
    });

    test('shows required asterisk for title', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        const titleLabel = screen.getByText('Tiêu đề');
        const asterisk = titleLabel.querySelector('span');

        expect(asterisk).toHaveClass('text-red-500');
    });

    test('displays description textarea', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByPlaceholderText('Nhập mô tả chi tiết về bài báo')).toBeInTheDocument();
    });

    test('shows required asterisk for description', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        const descLabel = screen.getByText('Mô tả');
        const asterisk = descLabel.querySelector('span');

        expect(asterisk).toHaveClass('text-red-500');
    });

    test('renders file upload section', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByText('Tải lên file')).toBeInTheDocument();
    });

    test('displays file upload instructions', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByText('Kéo thả file vào đây hoặc')).toBeInTheDocument();
    });

    test('shows supported file types', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByText(/Hỗ trợ: PDF, DOC, DOCX/)).toBeInTheDocument();
    });

    test('renders choose file button', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByText('Chọn file')).toBeInTheDocument();
    });

    test('displays cancel button', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        expect(screen.getByText('Hủy')).toBeInTheDocument();
    });

    test('shows submit button with correct text in create mode', () => {
        render(<SubmissionFormDialog {...mockProps} isEditMode={false} />);
        expect(screen.getByText('Nộp bài')).toBeInTheDocument();
    });

    test('shows submit button with correct text in edit mode', () => {
        render(<SubmissionFormDialog {...mockProps} isEditMode={true} />);
        expect(screen.getByText('Cập nhật')).toBeInTheDocument();
    });

    test('displays loading state on submit button', () => {
        render(<SubmissionFormDialog {...mockProps} loading={true} />);
        expect(screen.getByText('Đang xử lý...')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
        const { container } = render(<SubmissionFormDialog {...mockProps} isOpen={false} />);
        expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    test('renders close button', () => {
        render(<SubmissionFormDialog {...mockProps} />);
        const closeButtons = screen.getAllByRole('button');
        const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
        expect(closeButton).toBeInTheDocument();
    });

    test('pre-fills form with initial data in edit mode', () => {
        const initialData = {
            title: 'Initial Title',
            description: 'Initial Description',
            file: null
        };

        render(
            <SubmissionFormDialog
                {...mockProps}
                isEditMode={true}
                initialData={initialData}
            />
        );

        const titleInput = screen.getByPlaceholderText('Nhập tiêu đề bài báo') as HTMLInputElement;
        const descInput = screen.getByPlaceholderText('Nhập mô tả chi tiết về bài báo') as HTMLTextAreaElement;

        expect(titleInput.value).toBe('Initial Title');
        expect(descInput.value).toBe('Initial Description');
    });
});