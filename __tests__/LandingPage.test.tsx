/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "@/components/LandingPage/LandingPage";
import Header from "@/components/LandingPage/header";

// ======= Mock Redux hook =======
jest.mock("@/redux/hooks/hooks", () => ({
    useAppSelector: jest.fn(),
}));
import { useAppSelector } from "@/redux/hooks/hooks";
const mockedUseAppSelector = useAppSelector as jest.Mock;

// ======= Mock child components =======
jest.mock("@/components/LandingPage/hero-section", () => ({
    __esModule: true,
    default: () => <div>HeroSection</div>,
}));
jest.mock("@/components/LandingPage/feature-section", () => ({
    __esModule: true,
    default: () => <div>FeaturesSection</div>,
}));
jest.mock("@/components/LandingPage/what-we-offer", () => ({
    __esModule: true,
    default: () => <div>WhatWeOffer</div>,
}));
jest.mock("@/components/LandingPage/upcoming-conferences", () => ({
    __esModule: true,
    default: () => <div>UpcomingConferences</div>,
}));
jest.mock("@/components/LandingPage/trust-section", () => ({
    __esModule: true,
    default: () => <div>TrustedByCollaborator</div>,
}));
jest.mock("@/components/LandingPage/explore-section", () => ({
    __esModule: true,
    default: () => <div>ExploreConferences</div>,
}));
jest.mock("@/components/LandingPage/footer", () => ({
    __esModule: true,
    default: () => <footer>Footer</footer>,
}));

// jest.mock("@/components/LandingPage/hero-section", () => ({
//     __esModule: true,
//     default: "HeroSection",
// }));
// jest.mock("@/components/LandingPage/feature-section", () => ({
//     __esModule: true,
//     default: "FeaturesSection",
// }));
// jest.mock("@/components/LandingPage/what-we-offer", () => ({
//     __esModule: true,
//     default: "WhatWeOffer",
// }));
// jest.mock("@/components/LandingPage/upcoming-conferences", () => ({
//     __esModule: true,
//     default: "UpcomingConferences",
// }));
// jest.mock("@/components/LandingPage/trust-section", () => ({
//     __esModule: true,
//     default: "TrustedByCollaborator",
// }));
// jest.mock("@/components/LandingPage/explore-section", () => ({
//     __esModule: true,
//     default: "ExploreConferences",
// }));
// jest.mock("@/components/LandingPage/footer", () => ({
//     __esModule: true,
//     default: "Footer",
// }));

// ======= Test LandingPage =======
describe("LandingPage component", () => {
    beforeEach(() => {
        mockedUseAppSelector.mockReturnValue(null); // mặc định không login
    });

    it("renders Header, main sections, and Footer", () => {
        render(<LandingPage />);
        // Header
        expect(screen.getByText(/ConfRadar/i)).toBeInTheDocument();
        // Hero + Feature + WhatWeOffer + Upcoming + Trusted + Explore
        expect(screen.getByText("HeroSection")).toBeInTheDocument();
        expect(screen.getByText("FeaturesSection")).toBeInTheDocument();
        expect(screen.getByText("WhatWeOffer")).toBeInTheDocument();
        expect(screen.getByText("UpcomingConferences")).toBeInTheDocument();
        expect(screen.getByText("TrustedByCollaborator")).toBeInTheDocument();
        expect(screen.getByText("ExploreConferences")).toBeInTheDocument();
        // Footer
        expect(screen.getByText("Footer")).toBeInTheDocument();
    });
});

// ======= Test Header =======
describe("Header component", () => {
    it("renders 'Đăng nhập' button when no accessToken", () => {
        mockedUseAppSelector.mockReturnValue(null);
        render(<Header />);
        expect(screen.getByText("Đăng nhập")).toBeInTheDocument();
    });

    it("renders 'Profile' button when accessToken exists", () => {
        // mockedUseAppSelector.mockReturnValue("FAKE_TOKEN");
        mockedUseAppSelector.mockReturnValue({
            accessToken: "FAKE_TOKEN",
            user: { role: ["customer"] },
        });
        render(<Header />);
        expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    it("toggles mobile menu when menu button clicked", () => {
        mockedUseAppSelector.mockReturnValue(null);
        render(<Header />);

        const menuButton = screen.getByLabelText("Open menu"); // <- target đúng
        fireEvent.click(menuButton);

        expect(screen.getByText("Events")).toBeInTheDocument(); // menu mở

        fireEvent.click(menuButton);
        expect(screen.queryByText("Events")).not.toBeInTheDocument(); // menu đóng
    });
});
