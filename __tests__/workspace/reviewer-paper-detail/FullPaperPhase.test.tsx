import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FullPaperPhase from '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage/FullPaperPhase';

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
    useSubmitFullPaperReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
    useDecideFullPaperStatusMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
}));

jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2024-03-15') })),
}));

jest.mock('@/redux/hooks/hooks', () => ({
    useAppSelector: jest.fn(() => 'user-123'),
}));

const mockGetStatusIcon = (status?: string) => <span data-testid="status-icon">{status}</span>;
const mockGetStatusColor = (status?: string) => 'bg-gray-100';

const mockPaperDetail = {
    fullPaper: {
        fullPaperId: 'fp-1',
        title: 'Test Full Paper',
        description: 'Test description for full paper',
        reviewStatusName: 'Pending',
        fullPaperUrl: 'http://example.com/paper.pdf',
        isAllSubmittedFullPaperReview: false,
        fullPaperReviews: [],
    },
    isHeadReviewer: false,
    currentResearchConferencePhase: null,
    currentPaperPhase: null,
};

const mockCurrentPhase = {
    researchConferencePhaseId: 'phase-1',
    reviewStartDate: '2024-03-01',
    reviewEndDate: '2024-03-31',
    fullPaperDecideStatusStart: '2024-04-01',
    fullPaperDecideStatusEnd: '2024-04-15',
};

describe('FullPaperPhase - UI Rendering Tests', () => {
    describe('No Full Paper State', () => {
        it('should render no data message when full paper is missing', () => {
            const paperDetailWithoutFullPaper = {
                ...mockPaperDetail,
                fullPaper: null,
            };

            render(
                <FullPaperPhase
                    paperDetail={paperDetailWithoutFullPaper as any}
                    currentPhase={mockCurrentPhase}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Chưa có thông tin Full Paper/i)).toBeInTheDocument();
        });

        it('should render file icon when no full paper', () => {
            const paperDetailWithoutFullPaper = {
                ...mockPaperDetail,
                fullPaper: null,
            };

            const { container } = render(
                <FullPaperPhase
                    paperDetail={paperDetailWithoutFullPaper as any}
                    currentPhase={mockCurrentPhase}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('Full Paper Basic Rendering', () => {
        // it('should render Full Paper header', () => {
        //     render(
        //         <FullPaperPhase
        //             paperDetail={mockPaperDetail as any}
        //             currentPhase={mockCurrentPhase as any}
        //             getStatusIcon={mockGetStatusIcon}
        //             getStatusColor={mockGetStatusColor}
        //             paperId="test-paper-id"
        //         />
        //     );

        //     expect(screen.getByText(/Full Paper/i)).toBeInTheDocument();
        // });

        it('should render paper title', () => {
            render(
                <FullPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Test Full Paper/i)).toBeInTheDocument();
        });

        it('should render paper description', () => {
            render(
                <FullPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Test description for full paper/i)).toBeInTheDocument();
        });

        it('should render status icon', () => {
            render(
                <FullPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByTestId('status-icon')).toBeInTheDocument();
        });
    });

    describe('Reviewer Actions', () => {
        it('should render review button for regular reviewer in review period', () => {
            render(
                <FullPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Đánh giá Full Paper/i)).toBeInTheDocument();
        });

        it('should render time notice when not in review period', () => {
            const futurePhase = {
                ...mockCurrentPhase,
                reviewStartDate: '2024-05-01',
                reviewEndDate: '2024-05-31',
            };

            render(
                <FullPaperPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={futurePhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Hiện không trong thời gian đánh giá Full Paper/i)).toBeInTheDocument();
        });
    });

    describe('Head Reviewer Actions', () => {
        it('should render decision button for head reviewer', () => {
            const headReviewerPaperDetail = {
                ...mockPaperDetail,
                isHeadReviewer: true,
                fullPaper: {
                    ...mockPaperDetail.fullPaper,
                    fullPaperReviews: [{ fullPaperReviewId: 'review-1', reviewerName: 'Reviewer 1' }],
                },
            };

            render(
                <FullPaperPhase
                    paperDetail={headReviewerPaperDetail as any}
                    currentPhase={{
                        ...mockCurrentPhase,
                        fullPaperDecideStatusStart: '2024-03-01',
                        fullPaperDecideStatusEnd: '2024-03-31',
                    } as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Quyết định cuối cùng/i)).toBeInTheDocument();
        });

        it('should render reviews count button when reviews exist', () => {
            const headReviewerPaperDetail = {
                ...mockPaperDetail,
                isHeadReviewer: true,
                fullPaper: {
                    ...mockPaperDetail.fullPaper,
                    fullPaperReviews: [
                        { fullPaperReviewId: 'review-1' },
                        { fullPaperReviewId: 'review-2' },
                    ],
                },
            };

            render(
                <FullPaperPhase
                    paperDetail={headReviewerPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/2 lượt đánh giá/i)).toBeInTheDocument();
        });

        it('should disable decision button when already decided', () => {
            const decidedPaperDetail = {
                ...mockPaperDetail,
                isHeadReviewer: true,
                fullPaper: {
                    ...mockPaperDetail.fullPaper,
                    reviewStatusName: 'Accepted',
                    fullPaperReviews: [{ fullPaperReviewId: 'review-1' }],
                },
            };

            render(
                <FullPaperPhase
                    paperDetail={decidedPaperDetail as any}
                    currentPhase={{
                        ...mockCurrentPhase,
                        fullPaperDecideStatusStart: '2024-03-01',
                        fullPaperDecideStatusEnd: '2024-03-31',
                    } as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Đã quyết định trạng thái, không thể lặp lại hành động này/i)).toBeInTheDocument();
        });
    });

    describe('Reason Display', () => {
        it('should render reason when provided', () => {
            const paperDetailWithReason = {
                ...mockPaperDetail,
                fullPaper: {
                    ...mockPaperDetail.fullPaper,
                    reason: 'This is a test reason for rejection',
                },
            };

            render(
                <FullPaperPhase
                    paperDetail={paperDetailWithReason as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/This is a test reason for rejection/i)).toBeInTheDocument();
        });
    });
});