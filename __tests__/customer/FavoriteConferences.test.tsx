import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { FavouriteConferenceDetailResponse } from "@/types/conference.type";
import FavoriteConferences from "@/components/(user)/customer/favorite-conferences/FavoriteConferences";

// Mock các hooks và components
// jest.mock("@/redux/hooks/useConference");
const mockFetchFavouriteConferences = jest.fn();
const mockRemoveFavourite = jest.fn();

jest.mock("@/redux/hooks/useConference", () => ({
    useConference: () => ({
        lazyFavouriteConferences: [],
        fetchFavouriteConferences: mockFetchFavouriteConferences,
        favouriteConferencesLoading: false,
        favouriteConferencesError: null,
        removeFavourite: mockRemoveFavourite,
        deletingFromFavourite: false,
    }),
}));
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("lucide-react", () => ({
    Heart: () => <div data-testid="heart-icon" />,
    MapPin: () => <div data-testid="map-pin-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    Users: () => <div data-testid="users-icon" />,
    ExternalLink: () => <div data-testid="external-link-icon" />,
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockConferenceData: FavouriteConferenceDetailResponse = {
    conferenceId: "CONF001",
    conferenceName: "Hội nghị Công nghệ AI 2025",
    conferenceDescription: "Hội nghị về trí tuệ nhân tạo và machine learning",
    conferenceStartDate: "2025-12-25T09:00:00",
    conferenceEndDate: "2025-12-27T17:00:00",
    availableSlot: 150,
    isResearchConference: false,
    bannerImageUrl: "https://example.com/banner.jpg",
    favouriteCreatedAt: "2025-12-10T10:00:00",
};

describe("FavoriteConferences Component", () => {
    const mockUseConference = {
        lazyFavouriteConferences: [],
        fetchFavouriteConferences: jest.fn(),
        favouriteConferencesLoading: false,
        favouriteConferencesError: null,
        removeFavourite: jest.fn(),
        deletingFromFavourite: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        require("@/redux/hooks/useConference").useConference = jest.fn(
            () => mockUseConference
        );
    });

    describe("Loading State", () => {
        it("hiển thị loading spinner khi đang tải", () => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                favouriteConferencesLoading: true,
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Đang tải lịch sử giao dịch...")).toBeInTheDocument();
            const spinner = document.querySelector(".animate-spin");
            expect(spinner).toBeInTheDocument();
        });
    });

    describe("Error State", () => {
        it("hiển thị thông báo lỗi khi có lỗi", () => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                favouriteConferencesError: {
                    data: { message: "Lỗi tải dữ liệu yêu thích" },
                },
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Có lỗi xảy ra")).toBeInTheDocument();
            expect(screen.getByText("Lỗi tải dữ liệu yêu thích")).toBeInTheDocument();
            expect(screen.getByText("Thử lại")).toBeInTheDocument();
        });
    });

    describe("Empty State", () => {
        it("hiển thị empty state khi không có hội nghị yêu thích", () => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [],
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Chưa có hội thảo yêu thích")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Thêm những hội thảo bạn quan tâm vào danh sách yêu thích để dễ dàng theo dõi"
                )
            ).toBeInTheDocument();
            expect(screen.getByText("Khám phá hội thảo")).toBeInTheDocument();
        });
    });

    describe("Page Header", () => {
        it("hiển thị tiêu đề trang", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText("Hội nghị yêu thích")).toBeInTheDocument();
            expect(
                screen.getByText("Danh sách các hội nghị bạn đã đánh dấu yêu thích")
            ).toBeInTheDocument();
        });
    });

    describe("Filter Buttons", () => {
        it("hiển thị tất cả các nút filter", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText("Phổ biến nhất")).toBeInTheDocument();
            expect(screen.getByText("Ngày bắt đầu (Mới nhất)")).toBeInTheDocument();
            expect(screen.getByText("Ngày bắt đầu (Cũ nhất)")).toBeInTheDocument();
            expect(screen.getByText("Theo bảng chữ cái")).toBeInTheDocument();
            expect(screen.getByText("Thêm yêu thích gần đây")).toBeInTheDocument();
        });

        it("hiển thị filter 'Phổ biến nhất' là active mặc định", () => {
            render(<FavoriteConferences />);

            const popularButton = screen.getByText("Phổ biến nhất").closest("button");
            expect(popularButton).toHaveClass("bg-red-600");
        });
    });

    describe("Conference Card", () => {
        beforeEach(() => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
        });

        it("hiển thị thông tin cơ bản của hội nghị", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText("Hội nghị Công nghệ AI 2025")).toBeInTheDocument();
            expect(
                screen.getByText("Hội nghị về trí tuệ nhân tạo và machine learning")
            ).toBeInTheDocument();
        });

        it("hiển thị ngày bắt đầu và kết thúc", () => {
            render(<FavoriteConferences />);

            // Dates will be formatted to Vietnamese format
            const dateElements = screen.getAllByTestId("calendar-icon");
            expect(dateElements.length).toBeGreaterThan(0);
        });

        it("hiển thị badge loại hội nghị", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText("Công nghệ")).toBeInTheDocument();
        });

        it("hiển thị badge 'Nghiên cứu' cho hội nghị nghiên cứu", () => {
            const researchConference = {
                ...mockConferenceData,
                isResearchConference: true,
            };

            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [researchConference],
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Nghiên cứu")).toBeInTheDocument();
        });

        it("hiển thị số chỗ còn lại", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText("Còn lại: 150 chỗ")).toBeInTheDocument();
        });

        it("hiển thị ngày thêm vào yêu thích", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText(/Yêu thích từ:/)).toBeInTheDocument();
        });

        it("hiển thị banner hình ảnh", () => {
            render(<FavoriteConferences />);

            const bannerDiv = document.querySelector('[style*="banner.jpg"]');
            expect(bannerDiv).toBeInTheDocument();
        });

        it("hiển thị placeholder khi không có banner", () => {
            const conferenceWithoutBanner = {
                ...mockConferenceData,
                bannerImageUrl: undefined,
            };

            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [conferenceWithoutBanner],
            }));

            render(<FavoriteConferences />);

            const gradientDiv = document.querySelector(".bg-gradient-to-br");
            expect(gradientDiv).toBeInTheDocument();
        });
    });

    describe("Action Buttons", () => {
        beforeEach(() => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
        });

        it("hiển thị nút bỏ yêu thích", () => {
            render(<FavoriteConferences />);

            const heartButton = screen.getByTitle("Bỏ yêu thích");
            expect(heartButton).toBeInTheDocument();
        });

        it("hiển thị nút xem chi tiết", () => {
            render(<FavoriteConferences />);

            expect(screen.getByText("Xem chi tiết")).toBeInTheDocument();
        });

        it("disable nút bỏ yêu thích khi đang xóa", () => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
                deletingFromFavourite: true,
            }));

            render(<FavoriteConferences />);

            const heartButton = screen.getByTitle("Bỏ yêu thích");
            expect(heartButton).toBeDisabled();
        });
    });

    describe("Multiple Conferences", () => {
        it("hiển thị nhiều hội nghị", () => {
            const multipleConferences = [
                { ...mockConferenceData, conferenceId: "CONF001", conferenceName: "Hội nghị AI" },
                { ...mockConferenceData, conferenceId: "CONF002", conferenceName: "Hội nghị Blockchain" },
                { ...mockConferenceData, conferenceId: "CONF003", conferenceName: "Hội nghị IoT" },
            ];

            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: multipleConferences,
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Hội nghị AI")).toBeInTheDocument();
            expect(screen.getByText("Hội nghị Blockchain")).toBeInTheDocument();
            expect(screen.getByText("Hội nghị IoT")).toBeInTheDocument();
        });
    });

    describe("Conference Description", () => {
        it("hiển thị mô tả hội nghị khi có", () => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
            render(<FavoriteConferences />);

            expect(
                screen.getByText("Hội nghị về trí tuệ nhân tạo và machine learning")
            ).toBeInTheDocument();
        });

        it("không hiển thị mô tả khi không có", () => {
            const conferenceWithoutDescription = {
                ...mockConferenceData,
                conferenceDescription: undefined,
            };

            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [conferenceWithoutDescription],
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Hội nghị Công nghệ AI 2025")).toBeInTheDocument();
            expect(
                screen.queryByText("Hội nghị về trí tuệ nhân tạo và machine learning")
            ).not.toBeInTheDocument();
        });
    });

    describe("Available Slots", () => {
        it("hiển thị số chỗ còn lại khi có", () => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));

            render(<FavoriteConferences />);

            expect(screen.getByText("Còn lại: 150 chỗ")).toBeInTheDocument();
        });

        it("không hiển thị số chỗ khi không có thông tin", () => {
            const conferenceWithoutSlots = {
                ...mockConferenceData,
                availableSlot: undefined,
            };

            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [conferenceWithoutSlots],
            }));

            render(<FavoriteConferences />);

            expect(screen.queryByText(/Còn lại:/)).not.toBeInTheDocument();
        });
    });

    describe("Icons", () => {
        beforeEach(() => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
        });

        it("hiển thị icon Heart cho tiêu đề trang", () => {
            render(<FavoriteConferences />);

            const heartIcons = screen.getAllByTestId("heart-icon");
            expect(heartIcons.length).toBeGreaterThan(0);
        });

        it("hiển thị icon Calendar cho ngày", () => {
            render(<FavoriteConferences />);

            const calendarIcons = screen.getAllByTestId("calendar-icon");
            expect(calendarIcons.length).toBeGreaterThan(0);
        });

        it("hiển thị icon ExternalLink cho nút xem chi tiết", () => {
            render(<FavoriteConferences />);

            expect(screen.getByTestId("external-link-icon")).toBeInTheDocument();
        });
    });

    describe("Card Styling", () => {
        beforeEach(() => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
        });

        it("hiển thị card với background trắng", () => {
            render(<FavoriteConferences />);

            const card = document.querySelector(".bg-white");
            expect(card).toBeInTheDocument();
        });

        it("card có class hover:shadow-lg", () => {
            render(<FavoriteConferences />);

            const card = document.querySelector(".hover\\:shadow-lg");
            expect(card).toBeInTheDocument();
        });
    });

    describe("Responsive Layout", () => {
        beforeEach(() => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
        });

        it("hiển thị layout flex column và row", () => {
            render(<FavoriteConferences />);

            const flexElements = document.querySelectorAll(".flex");
            expect(flexElements.length).toBeGreaterThan(0);
        });

        it("có responsive classes cho mobile và desktop", () => {
            render(<FavoriteConferences />);

            const lgElements = document.querySelectorAll('[class*="lg:"]');
            expect(lgElements.length).toBeGreaterThan(0);

            const smElements = document.querySelectorAll('[class*="sm:"]');
            expect(smElements.length).toBeGreaterThan(0);
        });
    });

    describe("Text Content", () => {
        beforeEach(() => {
            require("@/redux/hooks/useConference").useConference = jest.fn(() => ({
                ...mockUseConference,
                lazyFavouriteConferences: [mockConferenceData],
            }));
        });

        it("text mô tả có class line-clamp-2", () => {
            render(<FavoriteConferences />);

            const description = screen.getByText(
                "Hội nghị về trí tuệ nhân tạo và machine learning"
            );
            expect(description).toHaveClass("line-clamp-2");
        });

        it("tiêu đề có font-bold và text lớn", () => {
            render(<FavoriteConferences />);

            const title = screen.getByText("Hội nghị Công nghệ AI 2025");
            expect(title).toHaveClass("font-bold");
        });
    });
});