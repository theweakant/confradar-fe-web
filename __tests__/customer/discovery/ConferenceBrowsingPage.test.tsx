// ConferenceBanner.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConferenceBanner from '@/components/(user)/customer/discovery/ConferenceBanner';

describe('ConferenceBanner Component', () => {
    it('renders main title and subtitle', () => {
        render(<ConferenceBanner />);

        expect(screen.getByText('KHÁM PHÁ CONFRADAR')).toBeInTheDocument();
        expect(screen.getByText('NÂNG TẦM KIẾN THỨC!')).toBeInTheDocument();
    });

    it('renders description text', () => {
        render(<ConferenceBanner />);

        expect(screen.getByText(/Tham gia các hội thảo & hội nghị hàng đầu/i)).toBeInTheDocument();
    });

    it('renders all three filter buttons', () => {
        render(<ConferenceBanner />);

        expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hội thảo Công nghệ' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hội nghị Nghiên cứu' })).toBeInTheDocument();
    });

    it('changes active filter when button is clicked', () => {
        render(<ConferenceBanner />);

        const technicalButton = screen.getByRole('button', { name: 'Hội thảo Công nghệ' });
        const allButton = screen.getByRole('button', { name: 'Tất cả' });

        // Initially "Tất cả" should be active
        expect(allButton).toHaveClass('bg-white', 'text-gray-900');

        // Click technical button
        fireEvent.click(technicalButton);

        // Technical button should now be active
        expect(technicalButton).toHaveClass('bg-white', 'text-gray-900');
    });

    it('calls onFilterChange callback when filter is changed', () => {
        const mockOnFilterChange = jest.fn();
        render(<ConferenceBanner onFilterChange={mockOnFilterChange} />);

        const researchButton = screen.getByRole('button', { name: 'Hội nghị Nghiên cứu' });
        fireEvent.click(researchButton);

        expect(mockOnFilterChange).toHaveBeenCalledWith('research');
    });

    it('applies custom className', () => {
        const { container } = render(<ConferenceBanner className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });
});

// =====================================================
// ConferenceCard.test.tsx
import ConferenceCard from '@/components/(user)/customer/discovery/conference-browser/ConferenceCard';

// jest.mock('next/image', () => ({
//     __esModule: true,
//     default: (props: any) => <img {...props} alt={props.alt} />,
// }));

const mockConference: ConferenceResponse = {
    conferenceId: '1',
    conferenceName: 'AI Conference 2024',
    description: 'Leading AI conference in Vietnam',
    startDate: '2024-12-20T00:00:00Z',
    endDate: '2024-12-22T00:00:00Z',
    address: 'Hanoi Convention Center',
    totalSlot: 500,
    isResearchConference: false,
    bannerImageUrl: '/test-banner.jpg',
    conferencePrices: [
        {
            conferencePriceId: 'price-1',
            ticketPrice: 1000000,
            ticketName: 'Standard Ticket',
            ticketDescription: 'Full access',
            totalSlot: 100,
            availableSlot: 50,
            isAuthor: false,
        },
    ],
    //   conferencePrices: [
    //     { currentPrice: 1000000, originalPrice: 1500000 },
    //   ],
};

const mockGetMinPrice = jest.fn(() => 1000000);
const mockGetMaxPrice = jest.fn(() => 1500000);
const mockFormatDate = jest.fn((date) => '20/12/2024');
const mockOnCardClick = jest.fn();

jest.mock("next/image", () => {
    return {
        __esModule: true,
        default: (props: any) => {
            const { src, alt, className } = props;
            return <img src={src} alt={alt} className={className} />;
        },
    };
});

describe('ConferenceCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders conference name', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText('AI Conference 2024')).toBeInTheDocument();
    });

    it('renders conference description', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText('Leading AI conference in Vietnam')).toBeInTheDocument();
    });

    it('renders conference address', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText('Hanoi Convention Center')).toBeInTheDocument();
    });

    it('renders total slots', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('displays conference type correctly', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText('Công nghệ')).toBeInTheDocument();
    });

    it('displays research conference type', () => {
        const researchConf = { ...mockConference, isResearchConference: true };

        render(
            <ConferenceCard
                conference={researchConf}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText('Nghiên cứu')).toBeInTheDocument();
    });

    it('displays price range when min and max differ', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={() => 1000000}
                getMaxPrice={() => 1500000}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText(/1\,000\,000đ - 1\,500\,000đ/)).toBeInTheDocument();
    });

    it('displays single price when min equals max', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={() => 1000000}
                getMaxPrice={() => 1000000}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        // expect(screen.getByText(/Giá: 1\.000\.000đ/)).toBeInTheDocument();
        expect(screen.getByText(/Giá: 1,000,000đ/)).toBeInTheDocument();
    });

    it('displays "Chưa cập nhật" when price is null', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={() => null}
                getMaxPrice={() => null}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        expect(screen.getByText(/Chưa cập nhật/)).toBeInTheDocument();
    });

    it('calls onCardClick when card is clicked', () => {
        const { container } = render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        const card = container.firstChild as HTMLElement;
        fireEvent.click(card);

        expect(mockOnCardClick).toHaveBeenCalledWith(mockConference);
    });

    it('renders banner image with correct src', () => {
        render(
            <ConferenceCard
                conference={mockConference}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        const image = screen.getByAltText('AI Conference 2024');
        expect(image).toHaveAttribute('src', '/test-banner.jpg');
    });

    it('renders default image when bannerImageUrl is null', () => {
        const confWithoutImage = { ...mockConference, bannerImageUrl: undefined };

        render(
            <ConferenceCard
                conference={confWithoutImage}
                getMinPrice={mockGetMinPrice}
                getMaxPrice={mockGetMaxPrice}
                formatDate={mockFormatDate}
                onCardClick={mockOnCardClick}
            />
        );

        const image = screen.getByAltText('AI Conference 2024');
        expect(image).toHaveAttribute('src', '/images/customer_route/confbannerbg2.jpg');
    });
});

// =====================================================
// ConferenceList.test.tsx
import ConferenceList from '@/components/(user)/customer/discovery/conference-browser/ConferenceList';

const mockConferences = [
    {
        conferenceId: '1',
        conferenceName: 'Conference 1',
        description: 'Description 1',
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-22T00:00:00Z',
        address: 'Address 1',
        totalSlot: 100,
        isResearchConference: false,
        bannerImageUrl: '/banner1.jpg',
        conferencePrices: [],
    },
    {
        conferenceId: '2',
        conferenceName: 'Conference 2',
        description: 'Description 2',
        startDate: '2024-12-25T00:00:00Z',
        endDate: '2024-12-27T00:00:00Z',
        address: 'Address 2',
        totalSlot: 200,
        isResearchConference: true,
        bannerImageUrl: '/banner2.jpg',
        conferencePrices: [],
    },
];

describe('ConferenceList Component', () => {
    it('renders all conferences in the list', () => {
        render(
            <ConferenceList
                paginatedConferences={mockConferences}
                getMinPrice={jest.fn(() => null)}
                getMaxPrice={jest.fn(() => null)}
                formatDate={jest.fn((date) => '20/12/2024')}
                onCardClick={jest.fn()}
            />
        );

        expect(screen.getByText('Conference 1')).toBeInTheDocument();
        expect(screen.getByText('Conference 2')).toBeInTheDocument();
    });

    it('renders empty list when no conferences', () => {
        const { container } = render(
            <ConferenceList
                paginatedConferences={[]}
                getMinPrice={jest.fn(() => null)}
                getMaxPrice={jest.fn(() => null)}
                formatDate={jest.fn()}
                onCardClick={jest.fn()}
            />
        );

        const grid = container.querySelector('.grid');
        expect(grid?.children.length).toBe(0);
    });

    it('uses correct grid layout classes', () => {
        const { container } = render(
            <ConferenceList
                paginatedConferences={mockConferences}
                getMinPrice={jest.fn(() => null)}
                getMaxPrice={jest.fn(() => null)}
                formatDate={jest.fn()}
                onCardClick={jest.fn()}
            />
        );

        const grid = container.firstChild;
        expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    });
});

// =====================================================
// DropdownSelect.test.tsx
import DropdownSelect from '@/components/(user)/customer/discovery/conference-browser/DropdownSelect';

const mockOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'tech', label: 'Công nghệ' },
    { value: 'research', label: 'Nghiên cứu' },
];

describe('DropdownSelect Component', () => {
    it('renders with placeholder when no value selected', () => {
        render(
            <DropdownSelect
                value=""
                options={mockOptions}
                onChange={jest.fn()}
                placeholder="Chọn loại"
            />
        );

        expect(screen.getByText('Chọn loại')).toBeInTheDocument();
    });

    it('renders selected option label', () => {
        render(
            <DropdownSelect
                value="tech"
                options={mockOptions}
                onChange={jest.fn()}
                placeholder="Chọn loại"
            />
        );

        expect(screen.getByText('Công nghệ')).toBeInTheDocument();
    });

    it('toggles dropdown when button is clicked', () => {
        render(
            <DropdownSelect
                value="all"
                options={mockOptions}
                onChange={jest.fn()}
                placeholder="Chọn loại"
            />
        );

        const button = screen.getByRole('button');

        // Dropdown should be closed initially
        expect(screen.queryByText('Nghiên cứu')).not.toBeInTheDocument();

        // Click to open
        fireEvent.click(button);
        expect(screen.getByText('Nghiên cứu')).toBeInTheDocument();

        // Click again to close
        fireEvent.click(button);
        expect(screen.queryByText('Nghiên cứu')).not.toBeInTheDocument();
    });

    it('calls onChange when option is selected', () => {
        const mockOnChange = jest.fn();
        render(
            <DropdownSelect
                value="all"
                options={mockOptions}
                onChange={mockOnChange}
                placeholder="Chọn loại"
            />
        );

        // Open dropdown
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Select option
        const techOption = screen.getByText('Công nghệ');
        fireEvent.click(techOption);

        expect(mockOnChange).toHaveBeenCalledWith('tech');
    });

    it('closes dropdown after selecting an option', () => {
        render(
            <DropdownSelect
                value="all"
                options={mockOptions}
                onChange={jest.fn()}
                placeholder="Chọn loại"
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const techOption = screen.getByText('Công nghệ');
        fireEvent.click(techOption);

        // Dropdown should be closed
        expect(screen.queryByText('Nghiên cứu')).not.toBeInTheDocument();
    });

    it('renders ChevronDown icon with rotation', () => {
        const { container } = render(
            <DropdownSelect
                value="all"
                options={mockOptions}
                onChange={jest.fn()}
                placeholder="Chọn loại"
            />
        );

        const button = screen.getByRole('button');
        const icon = container.querySelector('svg');

        // Initially not rotated
        expect(icon).not.toHaveClass('rotate-180');

        // Click to open
        fireEvent.click(button);
        expect(icon).toHaveClass('rotate-180');
    });

    it('highlights selected option in dropdown', () => {
        render(
            <DropdownSelect
                value="tech"
                options={mockOptions}
                onChange={jest.fn()}
                placeholder="Chọn loại"
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const techButton = screen.getAllByText('Công nghệ')[1]; // Second one is in dropdown
        expect(techButton).toHaveClass('bg-gray-100');
    });
});

// =====================================================
// Pagination.test.tsx
import Pagination from '@/components/(user)/customer/discovery/conference-browser/Pagination';
import { ConferenceResponse } from '@/types/conference.type';

describe('Pagination Component', () => {
    it('does not render when totalPages is 1 or less', () => {
        const { container } = render(
            <Pagination
                currentPage={1}
                totalPages={1}
                totalCount={10}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders pagination when totalPages > 1', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        expect(screen.getByText('Trước')).toBeInTheDocument();
        expect(screen.getByText('Sau')).toBeInTheDocument();
    });

    it('renders page number buttons', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('disables "Trước" button on first page', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        const prevButton = screen.getByText('Trước').closest('button');
        expect(prevButton).toBeDisabled();
    });

    it('disables "Sau" button on last page', () => {
        render(
            <Pagination
                currentPage={5}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        const nextButton = screen.getByText('Sau').closest('button');
        expect(nextButton).toBeDisabled();
    });

    it('highlights current page button', () => {
        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        const currentPageButton = screen.getByText('3').closest('button');
        expect(currentPageButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('calls setCurrentPage when page number is clicked', () => {
        const mockSetCurrentPage = jest.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={mockSetCurrentPage}
            />
        );

        const page2Button = screen.getByText('2').closest('button');
        if (page2Button) {
            fireEvent.click(page2Button);
            expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
        }
    });

    it('calls setCurrentPage with prev page when "Trước" is clicked', () => {
        const mockSetCurrentPage = jest.fn((fn) => fn(3));
        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={mockSetCurrentPage}
            />
        );

        const prevButton = screen.getByText('Trước').closest('button');
        if (prevButton) {
            fireEvent.click(prevButton);
            expect(mockSetCurrentPage).toHaveBeenCalled();
        }
    });

    it('calls setCurrentPage with next page when "Sau" is clicked', () => {
        const mockSetCurrentPage = jest.fn((fn) => fn(2));
        render(
            <Pagination
                currentPage={2}
                totalPages={5}
                totalCount={50}
                pageSize={10}
                setCurrentPage={mockSetCurrentPage}
            />
        );

        const nextButton = screen.getByText('Sau').closest('button');
        if (nextButton) {
            fireEvent.click(nextButton);
            expect(mockSetCurrentPage).toHaveBeenCalled();
        }
    });

    it('renders maximum 5 page buttons', () => {
        render(
            <Pagination
                currentPage={5}
                totalPages={10}
                totalCount={100}
                pageSize={10}
                setCurrentPage={jest.fn()}
            />
        );

        const pageButtons = screen.getAllByRole('button').filter(btn =>
            !btn.textContent?.includes('Trước') && !btn.textContent?.includes('Sau')
        );

        expect(pageButtons.length).toBeLessThanOrEqual(5);
    });
});