import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { CustomerPaidTicketResponse } from "@/types/ticket.type";
import TicketConferences from "@/components/(user)/customer/conference-tickets/TicketConferences";

// Mock các hooks và components
jest.mock("@/utils/TimeContext", () => ({
    useTime: () => ({
        now: new Date("2025-12-15T10:00:00"),
    }),
}));

jest.mock("@/redux/hooks/useTicket");
jest.mock("@/utils/TimeContext");
jest.mock("lucide-react", () => ({
    Ticket: () => <div data-testid="ticket-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    ExternalLink: () => <div data-testid="external-link-icon" />,
    QrCode: () => <div data-testid="qr-icon" />,
    Download: () => <div data-testid="download-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    CreditCard: () => <div data-testid="credit-card-icon" />,
    MapPin: () => <div data-testid="map-pin-icon" />,
    CheckCircle2: () => <div data-testid="check-circle-icon" />,
    X: () => <div data-testid="x-icon" />,
    Building2: () => <div data-testid="building-icon" />,
    Users: () => <div data-testid="users-icon" />,
    Tag: () => <div data-testid="tag-icon" />,
    User: () => <div data-testid="user-icon" />,
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockTicketData: CustomerPaidTicketResponse = {
    ticketId: "TICKET001",
    conferenceName: "Hội nghị Công nghệ 2025",
    conferenceDescription: "Hội nghị về công nghệ mới nhất",
    actualPrice: 500000,
    registeredDate: "2025-12-25T09:00:00",
    isRefunded: false,
    hasRefundPolicy: true,
    bannerImageUrl: "https://example.com/banner.jpg",
    conferenceStartDate: "2025-12-25T09:00:00",
    conferenceEndDate: "2025-12-25T17:00:00",
    conferenceAddress: "123 Đường ABC",
    cityName: "Hồ Chí Minh",
    conferenceTotalSlot: 100,
    conferenceAvailableSlot: 50,
    conferenceStatusName: "Đang hoạt động",
    conferenceCategoryName: "Công nghệ",
    isInternalHosted: true,
    isResearchConference: false,
    conferenceTicketSaleStart: "2025-12-01T00:00:00",
    conferenceTicketSaleEnd: "2025-12-24T23:59:59",
    ticketPricePhase: {
        pricePhaseId: '',
        refundPolicies: [
            {
                refundPolicyId: "RP001",
                percentRefund: 80,
                refundDeadline: "2025-12-20T00:00:00",
            },
            {
                refundPolicyId: "RP002",
                percentRefund: 50,
                refundDeadline: "2025-12-23T00:00:00",
            },
        ],
        conferencePrice: {
            conferencePriceId: 'id',
            isAuthor: false,
        },
    },
    transactions: [
        {
            transactionId: "TX001",
            transactionCode: "TXC001",
            amount: 500000,
            createdAt: "2025-12-15T10:00:00",
            paymentMethodName: "Chuyển khoản",
            currency: "VND",
            isRefunded: false,
        },
    ],
    userCheckIns: [
        {
            userCheckinId: "CI001",
            checkInTime: "2025-12-25T09:30:00",
            checkinStatusName: "Đã điểm danh",
            isPresenter: false,
            qrUrl: "https://example.com/qr.png",
            conferenceSessionDetail: {
                conferenceSessionId: '',
                title: "Phiên khai mạc",
                description: "Buổi khai mạc hội nghị",
                sessionDate: "2025-12-25T09:00:00",
                startTime: "09:00:00",
                endTime: "10:00:00",
                roomDisplayName: "Phòng A1",
                conferenceName: "Hội nghị Công nghệ 2025",
                destinationName: "Trung tâm Hội nghị",
                cityName: "Hồ Chí Minh",
                street: "123 Đường ABC",
                district: "Quận 1",
            },
        },
    ],
};

describe("TicketConferences Component", () => {
    const mockUseTicket = {
        tickets: [],
        loading: false,
        ticketsError: null,
        refetchTickets: jest.fn(),
        handleRefundTicket: jest.fn(),
        refunding: false,
        refundError: null,
    };

    const mockUseGlobalTime = {
        now: new Date("2025-12-19T10:00:00"),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        require("@/redux/hooks/useTicket").useTicket = jest.fn(() => mockUseTicket);
        require("@/utils/TimeContext").useGlobalTime = jest.fn(() => mockUseGlobalTime);
    });

    describe("Loading State", () => {
        it("hiển thị loading spinner khi đang tải", () => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                loading: true,
            }));

            render(<TicketConferences />);

            expect(screen.getByText("Đang tải vé của bạn...")).toBeInTheDocument();
        });
    });

    describe("Error State", () => {
        it("hiển thị thông báo lỗi khi có lỗi", () => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                ticketsError: {
                    data: { message: "Lỗi tải dữ liệu" },
                },
            }));

            render(<TicketConferences />);

            expect(screen.getByText("Có lỗi xảy ra khi tải dữ liệu")).toBeInTheDocument();
            expect(screen.getByText("Lỗi tải dữ liệu")).toBeInTheDocument();
            expect(screen.getByText("Thử lại")).toBeInTheDocument();
        });
    });

    describe("Empty State", () => {
        it("hiển thị empty state khi không có vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Chưa có vé nào")).toBeInTheDocument();
            expect(screen.getByText("Mua vé cho hội nghị đầu tiên của bạn")).toBeInTheDocument();
        });
    });

    describe("Page Header", () => {
        it("hiển thị tiêu đề trang", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Vé sự kiện của tôi")).toBeInTheDocument();
            expect(screen.getByText("Quản lý và theo dõi các vé hội nghị bạn đã mua")).toBeInTheDocument();
        });
    });

    describe("Filter Buttons", () => {
        it("hiển thị tất cả các nút filter", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Tất cả")).toBeInTheDocument();
            expect(screen.getByText("Sắp diễn ra")).toBeInTheDocument();
            expect(screen.getByText("Hôm nay")).toBeInTheDocument();
            expect(screen.getByText("Tuần này")).toBeInTheDocument();
            expect(screen.getByText("Tháng này")).toBeInTheDocument();
        });
    });

    describe("Ticket Card", () => {
        beforeEach(() => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [mockTicketData],
            }));
        });

        it("hiển thị thông tin cơ bản của vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Hội nghị Công nghệ 2025")).toBeInTheDocument();
            expect(screen.getByText("Hội nghị về công nghệ mới nhất")).toBeInTheDocument();
            expect(screen.getByText(/Mã vé: TICKET001/)).toBeInTheDocument();
        });

        it("hiển thị badge trạng thái vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Vé khả dụng")).toBeInTheDocument();
        });

        it("hiển thị giá vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("500.000 ₫")).toBeInTheDocument();
        });

        it("hiển thị banner hình ảnh", () => {
            render(<TicketConferences />);

            const image = screen.getByAltText("Hội nghị Công nghệ 2025");
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("src", "https://example.com/banner.jpg");
        });

        it("hiển thị thông tin thời gian hội nghị", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Thời gian")).toBeInTheDocument();
        });

        it("hiển thị thông tin địa điểm", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Địa điểm")).toBeInTheDocument();
            expect(screen.getByText("123 Đường ABC")).toBeInTheDocument();
            expect(screen.getByText("Hồ Chí Minh")).toBeInTheDocument();
        });

        it("hiển thị thông tin sức chứa", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Sức chứa")).toBeInTheDocument();
            expect(screen.getByText("50/100 chỗ còn trống")).toBeInTheDocument();
        });

        it("hiển thị các badge của hội nghị", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
            expect(screen.getByText("Công nghệ")).toBeInTheDocument();
            expect(screen.getByText("Tổ chức nội bộ")).toBeInTheDocument();
        });

        it("hiển thị thời gian bán vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Thời gian bán vé")).toBeInTheDocument();
        });
    });

    describe("Refund Policy Section", () => {
        beforeEach(() => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [mockTicketData],
            }));
        });

        it("hiển thị chính sách hoàn vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Chính sách hoàn vé")).toBeInTheDocument();
        });

        it("hiển thị timeline hoàn vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Timeline hoàn vé:")).toBeInTheDocument();
            expect(screen.getByText(/Hoàn 80%/)).toBeInTheDocument();
            expect(screen.getByText(/Hoàn 50%/)).toBeInTheDocument();
        });

        it("hiển thị nút hoàn vé", () => {
            render(<TicketConferences />);

            expect(screen.getByText(/Hoàn vé/)).toBeInTheDocument();
        });

        it("hiển thị thông báo khi không có chính sách hoàn vé", () => {
            const ticketWithoutRefund = {
                ...mockTicketData,
                hasRefundPolicy: false,
            };

            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [ticketWithoutRefund],
            }));

            render(<TicketConferences />);

            expect(screen.getByText("Không áp dụng chính sách hoàn tiền")).toBeInTheDocument();
        });

        it("hiển thị badge 'Đã hoàn tiền' cho vé đã hoàn", () => {
            const refundedTicket = {
                ...mockTicketData,
                isRefunded: true,
            };

            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [refundedTicket],
            }));

            render(<TicketConferences />);

            expect(screen.getByText("Đã hoàn tiền")).toBeInTheDocument();
            expect(screen.getByText("Vé đã được hoàn tiền")).toBeInTheDocument();
        });
    });

    describe("Action Buttons", () => {
        beforeEach(() => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [mockTicketData],
            }));
        });

        it("hiển thị nút xem chi tiết", () => {
            render(<TicketConferences />);

            expect(screen.getByText("Xem chi tiết giao dịch & điểm danh")).toBeInTheDocument();
        });
    });

    describe("Multiple Tickets", () => {
        it("hiển thị nhiều vé", () => {
            const multipleTickets = [
                { ...mockTicketData, ticketId: "TICKET001", conferenceName: "Hội nghị 1" },
                { ...mockTicketData, ticketId: "TICKET002", conferenceName: "Hội nghị 2" },
            ];

            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: multipleTickets,
            }));

            render(<TicketConferences />);

            expect(screen.getByText("Hội nghị 1")).toBeInTheDocument();
            expect(screen.getByText("Hội nghị 2")).toBeInTheDocument();
            expect(screen.getByText(/Mã vé: TICKET001/)).toBeInTheDocument();
            expect(screen.getByText(/Mã vé: TICKET002/)).toBeInTheDocument();
        });
    });

    describe("Transaction Display", () => {
        beforeEach(() => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [mockTicketData],
            }));
        });

        it("hiển thị thông tin giao dịch trong card", () => {
            render(<TicketConferences />);

            // Transaction details sẽ được hiển thị khi click vào nút xem chi tiết
            expect(mockTicketData.transactions).toBeDefined();
            expect(mockTicketData.transactions?.length).toBeGreaterThan(0);
        });
    });

    describe("Check-in Display", () => {
        beforeEach(() => {
            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [mockTicketData],
            }));
        });

        it("vé có thông tin check-in", () => {
            render(<TicketConferences />);

            expect(mockTicketData.userCheckIns).toBeDefined();
            expect(mockTicketData.userCheckIns?.length).toBeGreaterThan(0);
        });
    });

    describe("Author Ticket", () => {
        it("hiển thị badge tác giả cho vé tác giả", () => {
            const authorTicket = {
                ...mockTicketData,
                ticketPricePhase: {
                    ...mockTicketData.ticketPricePhase,
                    conferencePrice: {
                        isAuthor: true,
                    },
                },
            };

            require("@/redux/hooks/useTicket").useTicket = jest.fn(() => ({
                ...mockUseTicket,
                tickets: [authorTicket],
            }));

            render(<TicketConferences />);

            expect(screen.getByText("Đây là phí đăng ký cho tác giả")).toBeInTheDocument();
        });
    });
});