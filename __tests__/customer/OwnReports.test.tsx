import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OwnReports from '@/components/(user)/customer/report/OwnReports';

// Mock các dependencies
jest.mock('@/redux/hooks/useReport');
jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Flag: () => <div data-testid="flag-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    CheckCircle2: () => <div data-testid="check-circle-icon" />,
    X: () => <div data-testid="x-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    User: () => <div data-testid="user-icon" />,
    MessageSquare: () => <div data-testid="message-square-icon" />,
    AlertCircle: () => <div data-testid="alert-circle-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
    CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, className, onClick, disabled }: any) => (
        <button data-testid="button" className={className} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/badge', () => ({
    Badge: ({ children, className }: any) => <span data-testid="badge" className={className}>{children}</span>,
}));

jest.mock('@headlessui/react', () => {
    const React = require('react');

    const Dialog = ({ children }: any) => <div data-testid="dialog">{children}</div>;
    Dialog.Panel = ({ children }: any) => (
        <div data-testid="dialog-panel">{children}</div>
    );
    Dialog.Title = ({ children }: any) => (
        <h3 data-testid="dialog-title">{children}</h3>
    );

    const Transition = ({ children, show }: any) =>
        show ? <div data-testid="transition">{children}</div> : null;

    Transition.Child = ({ children }: any) => <>{children}</>;

    return {
        Dialog,
        Transition,
        Fragment: React.Fragment,
    };
});

// jest.mock('@headlessui/react', () => ({
//     Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
//     Transition: ({ children, show }: any) => show ? <div data-testid="transition">{children}</div> : null,
// }));

const mockUseReport = require('@/redux/hooks/useReport').useReport as jest.Mock;

describe('OwnReports Component - UI Rendering Tests', () => {
    const mockReports = [
        {
            reportId: '1',
            reportSubject: 'Test Report 1',
            reason: 'Test Reason 1',
            description: 'Test Description 1',
            createdAt: '2024-01-01T10:00:00Z',
            hasResolve: false,
            user: {
                fullName: 'John Doe',
                userName: 'johndoe',
                email: 'john@example.com',
            },
            reportFeedback: null,
        },
        {
            reportId: '2',
            reportSubject: 'Test Report 2',
            reason: 'Test Reason 2',
            description: 'Test Description 2',
            createdAt: '2024-01-02T10:00:00Z',
            hasResolve: true,
            user: {
                fullName: 'Jane Smith',
                userName: 'janesmith',
                email: 'jane@example.com',
            },
            reportFeedback: {
                reportSubject: 'Feedback Subject',
                reason: 'Feedback Reason',
                admin: {
                    fullName: 'Admin User',
                    userName: 'admin',
                    email: 'admin@example.com',
                },
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should render loading spinner when loading is true', () => {
            mockUseReport.mockReturnValue({
                ownReports: [],
                loading: true,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });

            render(<OwnReports />);

            expect(screen.getByText('Đang tải báo cáo của bạn...')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should render error message when there is an error', () => {
            mockUseReport.mockReturnValue({
                ownReports: [],
                loading: false,
                ownReportsError: { data: { message: 'Network error' } },
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });

            render(<OwnReports />);

            expect(screen.getByText('Có lỗi xảy ra khi tải dữ liệu')).toBeInTheDocument();
            expect(screen.getByText('Network error')).toBeInTheDocument();
            expect(screen.getByText('Thử lại')).toBeInTheDocument();
        });
    });

    describe('Page Header', () => {
        beforeEach(() => {
            mockUseReport.mockReturnValue({
                ownReports: mockReports,
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });
        });

        it('should render page title', () => {
            render(<OwnReports />);

            expect(screen.getByText('Báo cáo của tôi')).toBeInTheDocument();
        });

        it('should render page description', () => {
            render(<OwnReports />);

            expect(screen.getByText('Quản lý và theo dõi các báo cáo vấn đề bạn đã gửi')).toBeInTheDocument();
        });

        it('should render flag icon in header', () => {
            render(<OwnReports />);

            const flagIcons = screen.getAllByTestId('flag-icon');
            expect(flagIcons.length).toBeGreaterThan(0);
        });

        it('should render "Báo cáo mới" button in header', () => {
            render(<OwnReports />);

            const buttons = screen.getAllByText('Báo cáo mới');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('Filter Options', () => {
        beforeEach(() => {
            mockUseReport.mockReturnValue({
                ownReports: mockReports,
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });
        });

        it('should render all filter buttons', () => {
            render(<OwnReports />);

            const buttons = screen.getAllByTestId('button');

            expect(buttons.some(btn => btn.textContent === 'Tất cả')).toBe(true);
            expect(buttons.some(btn => btn.textContent === 'Chờ xử lý')).toBe(true);
            expect(buttons.some(btn => btn.textContent === 'Đã xử lý')).toBe(true);

            // expect(screen.getByText('Tất cả')).toBeInTheDocument();
            // expect(screen.getByText('Chờ xử lý')).toBeInTheDocument();
            // expect(screen.getByText('Đã xử lý')).toBeInTheDocument();
        });
    });

    describe('Reports List', () => {
        beforeEach(() => {
            mockUseReport.mockReturnValue({
                ownReports: mockReports,
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });
        });

        it('should render report cards', () => {
            render(<OwnReports />);

            const cards = screen.getAllByTestId('card');
            expect(cards.length).toBe(2);
        });

        it('should render report subjects', () => {
            render(<OwnReports />);

            expect(screen.getByText('Test Report 1')).toBeInTheDocument();
            expect(screen.getByText('Test Report 2')).toBeInTheDocument();
        });

        it('should render report reasons', () => {
            render(<OwnReports />);

            expect(screen.getByText('Test Reason 1')).toBeInTheDocument();
            expect(screen.getByText('Test Reason 2')).toBeInTheDocument();
        });

        it('should render report descriptions', () => {
            render(<OwnReports />);

            expect(screen.getByText('Test Description 1')).toBeInTheDocument();
            expect(screen.getByText('Test Description 2')).toBeInTheDocument();
        });

        it('should render "Lý do" labels', () => {
            render(<OwnReports />);

            const labels = screen.getAllByText('Lý do');
            expect(labels.length).toBe(2);
        });

        it('should render "Mô tả" labels', () => {
            render(<OwnReports />);

            const labels = screen.getAllByText('Mô tả');
            expect(labels.length).toBe(2);
        });

        it('should render user information', () => {
            render(<OwnReports />);

            expect(screen.getByText(/Người gửi: John Doe/)).toBeInTheDocument();
            expect(screen.getByText(/Người gửi: Jane Smith/)).toBeInTheDocument();
        });

        it('should render calendar icons', () => {
            render(<OwnReports />);

            const calendarIcons = screen.getAllByTestId('calendar-icon');
            expect(calendarIcons.length).toBe(2);
        });

        it('should render alert circle icons', () => {
            render(<OwnReports />);

            const alertIcons = screen.getAllByTestId('alert-circle-icon');
            expect(alertIcons.length).toBe(2);
        });
    });

    describe('Status Badges', () => {
        beforeEach(() => {
            mockUseReport.mockReturnValue({
                ownReports: mockReports,
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });
        });

        it('should render "Chờ xử lý" badge for unresolved report', () => {
            render(<OwnReports />);

            const pendingBadges = screen.getAllByText('Chờ xử lý');
            expect(pendingBadges.length).toBeGreaterThan(0);
        });

        it('should render "Đã xử lý" badge for resolved report', () => {
            render(<OwnReports />);

            const resolvedBadges = screen.getAllByText('Đã xử lý');
            expect(resolvedBadges.length).toBeGreaterThan(0);
        });

        it('should render clock icon for pending status', () => {
            render(<OwnReports />);

            const clockIcons = screen.getAllByTestId('clock-icon');
            expect(clockIcons.length).toBeGreaterThan(0);
        });

        it('should render check circle icon for resolved status', () => {
            render(<OwnReports />);

            const checkIcons = screen.getAllByTestId('check-circle-icon');
            expect(checkIcons.length).toBeGreaterThan(0);
        });
    });

    describe('Feedback Section', () => {
        beforeEach(() => {
            mockUseReport.mockReturnValue({
                ownReports: mockReports,
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });
        });

        it('should render "Phản hồi" heading', () => {
            render(<OwnReports />);

            const feedbackHeadings = screen.getAllByText('Phản hồi');
            expect(feedbackHeadings.length).toBe(2);
        });

        it('should render feedback content when available', () => {
            render(<OwnReports />);

            expect(screen.getByText('Feedback Subject')).toBeInTheDocument();
            expect(screen.getByText('Feedback Reason')).toBeInTheDocument();
        });

        it('should render admin information in feedback', () => {
            render(<OwnReports />);

            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        it('should render "Quản trị viên" label', () => {
            render(<OwnReports />);

            expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
        });

        it('should render "Tiêu đề phản hồi" label', () => {
            render(<OwnReports />);

            expect(screen.getByText('Tiêu đề phản hồi')).toBeInTheDocument();
        });

        it('should render "Nội dung phản hồi" label', () => {
            render(<OwnReports />);

            expect(screen.getByText('Nội dung phản hồi')).toBeInTheDocument();
        });

        it('should render no feedback message when feedback is null', () => {
            render(<OwnReports />);

            expect(screen.getByText('Chưa có phản hồi từ quản trị viên')).toBeInTheDocument();
            expect(screen.getByText('Báo cáo của bạn đang được xem xét')).toBeInTheDocument();
        });

        it('should render message square icons', () => {
            render(<OwnReports />);

            const messageIcons = screen.getAllByTestId('message-square-icon');
            expect(messageIcons.length).toBe(2);
        });
    });

    describe('Empty State', () => {
        it('should render empty state when no reports', () => {
            mockUseReport.mockReturnValue({
                ownReports: [],
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });

            render(<OwnReports />);

            expect(screen.getByText('Chưa có báo cáo nào')).toBeInTheDocument();
            expect(screen.getByText('Bạn chưa gửi báo cáo nào')).toBeInTheDocument();
            expect(screen.getByText('Tạo báo cáo mới')).toBeInTheDocument();
        });
    });

    describe('Create Report Dialog Elements', () => {
        beforeEach(() => {
            mockUseReport.mockReturnValue({
                ownReports: [],
                loading: false,
                ownReportsError: null,
                getOwnReportsLazy: jest.fn(),
                createReport: jest.fn(),
            });
        });

        it('should render form labels in dialog', async () => {
            render(<OwnReports />);

            await userEvent.click(screen.getByText('Báo cáo mới'));

            expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
            expect(screen.getByText('Lý do')).toBeInTheDocument();
            expect(screen.getByText('Mô tả chi tiết')).toBeInTheDocument();

            // expect(screen.getByText(/Tiêu đề/)).toBeInTheDocument();
            // expect(screen.getByText(/Lý do/)).toBeInTheDocument();
            // expect(screen.getByText(/Mô tả chi tiết/)).toBeInTheDocument();
        });

        it('should render required asterisks', async () => {
            render(<OwnReports />);

            await userEvent.click(screen.getByText('Báo cáo mới'));

            const requiredLabels = screen.getAllByText(/^\*$/);
            expect(requiredLabels.length).toBeGreaterThanOrEqual(3);
        });

        it('should render input placeholders', async () => {
            render(<OwnReports />);

            await userEvent.click(screen.getByText('Báo cáo mới'));

            expect(screen.getByPlaceholderText('Nhập tiêu đề báo cáo')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Nhập lý do báo cáo')).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText('Mô tả chi tiết vấn đề của bạn')
            ).toBeInTheDocument();
        });

        it('should render dialog action buttons', async () => {
            render(<OwnReports />);

            await userEvent.click(screen.getByText('Báo cáo mới'));

            expect(await screen.findByText('Hủy')).toBeInTheDocument();
            expect(await screen.findByText('Gửi báo cáo')).toBeInTheDocument();
        });
    });
});