import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewPaperPage from '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage';

/* =========================
   GLOBAL MOCKS
========================= */

// react-quill
jest.mock('react-quill-new', () => ({
    __esModule: true,
    default: () => <div data-testid="react-quill-mock" />,
}));
jest.mock('react-quill-new/dist/quill.snow.css', () => ({}));

// next/navigation
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({ paperId: 'test-paper-id' })),
}));

// Time context
jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2024-01-15') })),
}));

// redux hooks
jest.mock('@/redux/hooks/hooks', () => ({
    useAppSelector: jest.fn(),
}));

jest.mock(
    '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage/FullPaperPhase',
    () => () => <div data-testid="full-paper-phase" />
);

jest.mock(
    '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage/RevisionPaperPhase',
    () => () => <div />
);

jest.mock(
    '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage/CameraReadyPhase',
    () => () => <div />
);


/* =========================
   RTK QUERY MOCK (IMPORTANT)
========================= */

const mockGetPaperDetailForReviewer = jest.fn();

jest.mock('@/redux/services/paper.service', () => ({
    useLazyGetPaperDetailForReviewerQuery: jest.fn(() => [
        mockGetPaperDetailForReviewer,
        {
            data: null,
            isLoading: false,
            error: null,
        },
    ]),
}));

/* =========================
   HELPERS
========================= */

const mockUnwrapResolve = (value: any) => {
    mockGetPaperDetailForReviewer.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue(value),
    });
};

const mockQueryState = (state: {
    data?: any;
    isLoading?: boolean;
    error?: any;
}) => {
    const { useLazyGetPaperDetailForReviewerQuery } =
        require('@/redux/services/paper.service');

    useLazyGetPaperDetailForReviewerQuery.mockReturnValue([
        mockGetPaperDetailForReviewer,
        {
            data: state.data ?? null,
            isLoading: state.isLoading ?? false,
            error: state.error ?? null,
        },
    ]);
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUnwrapResolve(null);
});

/* =========================
   TESTS
========================= */

describe('ReviewPaperPage - UI Rendering', () => {
    describe('Loading State', () => {
        beforeEach(() => {
            mockQueryState({ isLoading: true });
        });

        it('renders loading text', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Đang tải chi tiết bài báo/i)
            ).toBeInTheDocument();
        });

        it('renders spinner', () => {
            const { container } = render(<ReviewPaperPage />);
            expect(container.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        beforeEach(() => {
            mockQueryState({
                error: { message: 'Error loading paper' },
            });
        });

        it('renders error message', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Có lỗi xảy ra khi tải chi tiết bài báo/i)
            ).toBeInTheDocument();
        });

        it('renders error icon', () => {
            const { container } = render(<ReviewPaperPage />);
            expect(container.querySelector('svg')).toBeInTheDocument();
        });
    });

    describe('No Data State', () => {
        beforeEach(() => {
            mockQueryState({
                data: { data: { paperDetail: null } },
            });
        });

        it('renders no data message', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Không tìm thấy thông tin bài báo/i)
            ).toBeInTheDocument();
        });
    });

    describe('Invalid Phase State', () => {
        beforeEach(() => {
            mockQueryState({
                data: {
                    data: {
                        paperDetail: {
                            currentPaperPhase: {
                                phaseName: 'Invalid Phase',
                            },
                            isHeadReviewer: false,
                        },
                    },
                },
            });
        });

        it('renders invalid phase message', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Không tìm thấy giai đoạn review phù hợp/i)
            ).toBeInTheDocument();
        });

        it('renders back and reload buttons', () => {
            render(<ReviewPaperPage />);
            expect(screen.getByText(/Quay lại/i)).toBeInTheDocument();
            expect(screen.getByText(/Tải lại trang/i)).toBeInTheDocument();
        });

        it('renders acceptable phase list', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Các giai đoạn có thể review/i)
            ).toBeInTheDocument();
        });
    });

    describe('Valid Paper Detail State', () => {
        beforeEach(() => {
            mockQueryState({
                data: {
                    data: {
                        paperDetail: {
                            currentPaperPhase: {
                                phaseName: 'FullPaper',
                                paperPhaseId: 'phase-1',
                            },
                            currentResearchConferencePhase: {
                                registrationStartDate: '2024-01-01',
                                registrationEndDate: '2024-01-31',
                                fullPaperStartDate: '2024-02-01',
                                fullPaperEndDate: '2024-02-28',
                                reviewStartDate: '2024-03-01',
                                reviewEndDate: '2024-03-31',
                            },
                            isHeadReviewer: false,
                            fullPaper: {
                                fullPaperId: 'fp-1',
                                title: 'Test Paper',
                                description: 'Test Description',
                                reviewStatusName: 'Pending',
                                fullPaperUrl: 'http://example.com/paper.pdf',
                            },
                        },
                    },
                },
            });
        });

        it('renders page header', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Chi tiết bài báo/i)
            ).toBeInTheDocument();
        });

        it('renders paper id', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/#test-paper-id/i)
            ).toBeInTheDocument();
        });

        it('renders timeline button', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Xem lịch trình/i)
            ).toBeInTheDocument();
        });

        it('renders phases section', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/Các giai đoạn bài báo/i)
            ).toBeInTheDocument();
        });

        it('renders reviewer badge', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/REVIEWER/i)
            ).toBeInTheDocument();
        });
    });

    describe('Head Reviewer State', () => {
        beforeEach(() => {
            mockQueryState({
                data: {
                    data: {
                        paperDetail: {
                            currentPaperPhase: {
                                phaseName: 'FullPaper',
                            },
                            isHeadReviewer: true,
                            fullPaper: {
                                fullPaperId: 'fp-1',
                                title: 'Test Paper',
                                reviewStatusName: 'Pending',
                            },
                        },
                    },
                },
            });
        });

        it('renders head reviewer badge', () => {
            render(<ReviewPaperPage />);
            expect(
                screen.getByText(/HEAD REVIEWER/i)
            ).toBeInTheDocument();
        });
    });
});
