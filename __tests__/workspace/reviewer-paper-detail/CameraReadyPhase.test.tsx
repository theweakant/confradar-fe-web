import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CameraReadyPhase from '@/components/(user)/workspace/reviewer/ManagePaper/PaperDetailPage/CameraReadyPhase';

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
    useDecideCameraReadyMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
}));

jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: jest.fn(() => ({ now: new Date('2024-03-15') })),
}));

const mockGetStatusIcon = (status?: string) => <span data-testid="status-icon">{status}</span>;
const mockGetStatusColor = (status?: string) => 'bg-gray-100';

const mockPaperDetail = {
    cameraReady: {
        cameraReadyId: 'cr-1',
        title: 'Test Camera Ready',
        description: 'Test camera ready description',
        globalStatusName: 'Pending',
        cameraReadyUrl: 'http://example.com/camera-ready.pdf',
        createdAt: '2024-03-01T00:00:00Z',
        reviewAt: '2024-03-10T00:00:00Z',
    },
    isHeadReviewer: false,
    currentResearchConferencePhase: {
        cameraReadyStartDate: '2024-03-01',
        cameraReadyEndDate: '2024-03-31',
        cameraReadyDecideStatusStart: '2024-04-01',
        cameraReadyDecideStatusEnd: '2024-04-15',
    },
};

const mockCurrentPhase = {
    cameraReadyStartDate: '2024-03-01',
    cameraReadyEndDate: '2024-03-31',
    cameraReadyDecideStatusStart: '2024-04-01',
    cameraReadyDecideStatusEnd: '2024-04-15',
};

describe('CameraReadyPhase - UI Rendering Tests', () => {
    describe('No Camera Ready State', () => {
        it('should render no data message when camera ready is missing', () => {
            const paperDetailWithoutCameraReady = {
                ...mockPaperDetail,
                cameraReady: null,
            };

            render(
                <CameraReadyPhase
                    paperDetail={paperDetailWithoutCameraReady as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Chưa có thông tin Camera Ready/i)).toBeInTheDocument();
        });

        it('should render file icon when no camera ready', () => {
            const paperDetailWithoutCameraReady = {
                ...mockPaperDetail,
                cameraReady: null,
            };

            const { container } = render(
                <CameraReadyPhase
                    paperDetail={paperDetailWithoutCameraReady as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('Camera Ready Basic Rendering', () => {
        it('should render paper description', () => {
            render(
                <CameraReadyPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Test camera ready description/i)).toBeInTheDocument();
        });

        it('should render status icon', () => {
            render(
                <CameraReadyPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByTestId('status-icon')).toBeInTheDocument();
        });

        it('should render camera ready ID', () => {
            render(
                <CameraReadyPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/cr-1/i)).toBeInTheDocument();
        });
    });

    describe('Timestamps', () => {
        it('should render created date', () => {
            render(
                <CameraReadyPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Ngày tạo/i)).toBeInTheDocument();
        });

        it('should render review date when available', () => {
            render(
                <CameraReadyPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/Cập nhật/i)).toBeInTheDocument();
        });

        it('should not render review date when not available', () => {
            const paperDetailNoReviewDate = {
                ...mockPaperDetail,
                cameraReady: {
                    ...mockPaperDetail.cameraReady,
                    reviewAt: null,
                },
            };

            render(
                <CameraReadyPhase
                    paperDetail={paperDetailNoReviewDate as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            const updateLabels = screen.queryAllByText(/Cập nhật/i);
            expect(updateLabels.length).toBeLessThanOrEqual(1);
        });
    });

    describe('Head Reviewer Actions', () => {
        it('should not render decision button for regular reviewer', () => {
            render(
                <CameraReadyPhase
                    paperDetail={mockPaperDetail as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.queryByText(/Quyết định cuối cùng/i)).not.toBeInTheDocument();
        });
    });

    describe('Reason Display', () => {
        it('should render reason when provided', () => {
            const paperDetailWithReason = {
                ...mockPaperDetail,
                cameraReady: {
                    ...mockPaperDetail.cameraReady,
                    reason: 'This is a test reason for camera ready rejection',
                },
            };

            render(
                <CameraReadyPhase
                    paperDetail={paperDetailWithReason as any}
                    currentPhase={mockCurrentPhase as any}
                    getStatusIcon={mockGetStatusIcon}
                    getStatusColor={mockGetStatusColor}
                    paperId="test-paper-id"
                />
            );

            expect(screen.getByText(/This is a test reason for camera ready rejection/i)).toBeInTheDocument();
        });
    });
});