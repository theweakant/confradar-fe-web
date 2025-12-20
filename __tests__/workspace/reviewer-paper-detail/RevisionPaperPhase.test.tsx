import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RevisionPaperPhase from '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage/RevisionPaperPhase';

// Mock dependencies
jest.mock('@/components/molecules/ReusableDocViewer ', () => ({
    __esModule: true,
    default: () => <div data-testid="doc-viewer-mock" />,
}));

jest.mock('react-quill-new', () => ({
    __esModule: true,
    default: () => <div data-testid="react-quill-mock" />,
}));
jest.mock('react-quill-new/dist/quill.snow.css', () => ({}));

jest.mock('@/redux/services/paper.service', () => ({
    useSubmitPaperRevisionFeedbackMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
    useSubmitPaperRevisionReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
    useListRevisionPaperReviewsQuery: jest.fn(() => ({ data: null, isLoading: false })),
    useDecideRevisionStatusMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
    useMarkCompleteReviseMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
}));

jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2024-03-15') })),
}));

const mockGetStatusIcon = (status?: string) => <span data-testid="status-icon">{status}</span>;
const mockGetStatusColor = (status?: string) => 'bg-gray-100';

const mockPaperDetail = {
    revisionPaper: {
        revisionPaperId: 'rp-1',
        title: 'Test Revision Paper',
        description: 'Test revision description',
        globalStatusName: 'Pending',
        isAllSubmittedRevisionPaperReview: false,
        revisionPaperSubmissions: [],
    },
    isHeadReviewer: false,
    currentResearchConferencePhase: {
        reviseStartDate: '2024-03-01',
        reviseEndDate: '2024-03-31',
        revisionPaperDecideStatusStart: '2024-04-01',
        revisionPaperDecideStatusEnd: '2024-04-15',
        revisionRoundsDetail: [
            {
                revisionRoundDeadlineId: 'round-1',
                roundNumber: 1,
                startSubmissionDate: '2024-03-01',
                endSubmissionDate: '2024-03-15',
            },
        ],
    },
};

const mockCurrentPhase = {
    reviseStartDate: '2024-03-01',
    reviseEndDate: '2024-03-31',
    revisionPaperDecideStatusStart: '2024-04-01',
    revisionPaperDecideStatusEnd: '2024-04-15',
    revisionRoundsDetail: [
        {
            revisionRoundDeadlineId: 'round-1',
            roundNumber: 1,
            startSubmissionDate: '2024-03-01',
            endSubmissionDate: '2024-03-15',
        },
    ],
};

describe('RevisionPaperPhase - UI Rendering Tests', () => {
    describe('No Revision Paper State', () => {
        it('should render no data message when revision paper is missing', () => {
            const paperDetailWithoutRevision = {
                ...mockPaperDetail,
                revisionPaper: null,
            };

            render(
                <RevisionPaperPhase
                    paperDetail={paperDetailWithoutRevision as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Chưa có thông tin Revision Paper/i)).toBeInTheDocument();
        });
    });

    describe('Revision Paper Basic Rendering', () => {
        it('should render Final Review header', () => {
            render(
                <RevisionPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Final Review/i)).toBeInTheDocument();
        });

        it('should render paper title', () => {
            render(
                <RevisionPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Test Revision Paper/i)).toBeInTheDocument();
        });

        it('should render paper description', () => {
            render(
                <RevisionPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Test revision description/i)).toBeInTheDocument();
        });

        it('should render Revision Paper ID', () => {
            render(
                <RevisionPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/rp-1/i)).toBeInTheDocument();
        });
    });

    describe('Rounds Section', () => {
        it('should render rounds header', () => {
            render(
                <RevisionPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Các Round Revision/i)).toBeInTheDocument();
        });

        it('should render no rounds message when no rounds available', () => {
            const paperDetailNoRounds = {
                ...mockPaperDetail,
                currentResearchConferencePhase: {
                    ...mockPaperDetail.currentResearchConferencePhase,
                    revisionRoundsDetail: [],
                },
            };

            render(
                <RevisionPaperPhase
                    paperDetail={paperDetailNoRounds as any}
                    currentPhase={{ ...mockCurrentPhase, revisionRoundsDetail: [] } as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Chưa có vòng revision nào được mở cho bài báo này/i)).toBeInTheDocument();
        });

        // it('should render round tabs when rounds exist', () => {
        //     const paperDetailWithSubmission = {
        //         ...mockPaperDetail,
        //         revisionPaper: {
        //             ...mockPaperDetail.revisionPaper,
        //             revisionPaperSubmissions: [
        //                 {
        //                     revisionPaperSubmissionId: 'sub-1',
        //                     revisionDeadlineRoundId: 'round-1',
        //                     title: 'Submission 1',
        //                     description: 'Test submission',
        //                     revisionPaperUrl: 'http://example.com/revision.pdf',
        //                     revisionSubmissionFeedbacks: [],
        //                 },
        //             ],
        //         },
        //     };

        //     render(
        //         <RevisionPaperPhase
        //             paperDetail={paperDetailWithSubmission as any}
        //             currentPhase={mockCurrentPhase as any}
        //             paperId="test-paper-id"
        //             getStatusIcon={mockGetStatusIcon}
        //             getStatusColor={mockGetStatusColor}
        //         />
        //     );

        //     expect(screen.getByText(/Round 1/i)).toBeInTheDocument();
        // });
    });

    describe('Head Reviewer Actions', () => {
        it('should render decision button for head reviewer', () => {
            const headReviewerPaperDetail = {
                ...mockPaperDetail,
                isHeadReviewer: true,
            };

            const futurePhase = {
                ...mockCurrentPhase,
                revisionPaperDecideStatusStart: '2024-03-01',
                revisionPaperDecideStatusEnd: '2024-03-31',
            };

            render(
                <RevisionPaperPhase
                    paperDetail={headReviewerPaperDetail as any}
                    currentPhase={futurePhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Quyết định cuối cùng/i)).toBeInTheDocument();
        });

        it('should render reviews count button when reviews exist', () => {
            const { useListRevisionPaperReviewsQuery } = require('@/redux/services/paper.service');
            useListRevisionPaperReviewsQuery.mockReturnValue({
                data: {
                    data: [
                        { revisionPaperReviewId: 'review-1' },
                        { revisionPaperReviewId: 'review-2' },
                    ],
                },
                isLoading: false,
            });

            const headReviewerPaperDetail = {
                ...mockPaperDetail,
                isHeadReviewer: true,
            };

            render(
                <RevisionPaperPhase
                    paperDetail={headReviewerPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/2 lượt đánh giá/i)).toBeInTheDocument();
        });

        it('should disable decision button when already decided', () => {
            const decidedPaperDetail = {
                ...mockPaperDetail,
                isHeadReviewer: true,
                revisionPaper: {
                    ...mockPaperDetail.revisionPaper,
                    globalStatusName: 'Accepted',
                },
            };

            render(
                <RevisionPaperPhase
                    paperDetail={decidedPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Đã quyết định trạng thái, không thể lặp lại hành động này/i)).toBeInTheDocument();
        });
    });

    describe('Submission Display', () => {
        it('should render submission information', () => {
            const paperDetailWithSubmission = {
                ...mockPaperDetail,
                revisionPaper: {
                    ...mockPaperDetail.revisionPaper,
                    revisionPaperSubmissions: [
                        {
                            revisionPaperSubmissionId: 'sub-1',
                            revisionDeadlineRoundId: 'round-1',
                            title: 'Round 1 Submission',
                            description: 'First round submission description',
                            revisionPaperUrl: 'http://example.com/revision.pdf',
                            revisionSubmissionFeedbacks: [],
                        },
                    ],
                },
            };

            render(
                <RevisionPaperPhase
                    paperDetail={paperDetailWithSubmission as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/Round 1 Submission/i)).toBeInTheDocument();
            expect(screen.getByText(/First round submission description/i)).toBeInTheDocument();
        });

        it('should render feedback count badge when feedbacks exist', () => {
            const paperDetailWithFeedback = {
                ...mockPaperDetail,
                revisionPaper: {
                    ...mockPaperDetail.revisionPaper,
                    revisionPaperSubmissions: [
                        {
                            revisionPaperSubmissionId: 'sub-1',
                            revisionDeadlineRoundId: 'round-1',
                            title: 'Submission with Feedback',
                            revisionPaperUrl: 'http://example.com/revision.pdf',
                            revisionSubmissionFeedbacks: [
                                { revisionSubmissionFeedbackId: 'fb-1', feedback: 'Test feedback', sortOrder: 1 },
                                { revisionSubmissionFeedbackId: 'fb-2', feedback: 'Test feedback 2', sortOrder: 2 },
                            ],
                        },
                    ],
                },
            };

            render(
                <RevisionPaperPhase
                    paperDetail={paperDetailWithFeedback as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/2 Feedback đã gửi/i)).toBeInTheDocument();
        });
    });

    describe('Reason Display', () => {
        it('should render reason when provided', () => {
            const paperDetailWithReason = {
                ...mockPaperDetail,
                revisionPaper: {
                    ...mockPaperDetail.revisionPaper,
                    reason: 'This is a test reason for revision',
                },
            };

            render(
                <RevisionPaperPhase
                    paperDetail={paperDetailWithReason as any}
                    currentPhase={mockCurrentPhase as any}
                    paperId="test-paper-id"
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                />
            );

            expect(screen.getByText(/This is a test reason for revision/i)).toBeInTheDocument();
        });
    });
});