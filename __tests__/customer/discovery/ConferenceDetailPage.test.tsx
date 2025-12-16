// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
        return <img {...props} />;
    },
}));

// ConferenceDescriptionCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConferenceDescriptionCard from '@/components/(user)/customer/discovery/conference-detail/ConferenceHeader/ConferenceDescriptionCard';
import { ResearchConferenceDetailResponse, TechnicalConferenceDetailResponse, ConferencePriceResponse } from '@/types/conference.type';
import { PaymentMethod } from '@/types/transaction.type';
import ConferenceTitleCard from '@/components/(user)/customer/discovery/conference-detail/ConferenceHeader/ConferenceTitleCard';
import ConferenceSubscribeCard from '@/components/(user)/customer/discovery/conference-detail/ConferenceHeader/ConferenceSubscribeCard';
import PaymentMethodSelector from '@/components/(user)/customer/discovery/conference-detail/ConferenceHeader/PaymentMethodSelector';
import WaitlistSection from '@/components/(user)/customer/discovery/conference-detail/ConferenceHeader/WaitlistSection';
import PolicyTab from '@/components/(user)/customer/discovery/conference-detail/PolicyTab';
import InformationTab from '@/components/(user)/customer/discovery/conference-detail/InformationTab';
import SessionsTab from '@/components/(user)/customer/discovery/conference-detail/SessionsTab';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import ConferencePriceTab from '@/components/(user)/customer/discovery/conference-detail/ConferencePriceTab';
import ResearchTimelineTab from '@/components/(user)/customer/discovery/conference-detail/ResearchTimelineTab';
import ResearchDocumentsTab from '@/components/(user)/customer/discovery/conference-detail/ResearchDocumentsTab';

describe('ConferenceDescriptionCard', () => {
    const mockConference: ResearchConferenceDetailResponse = {
        description: 'Test conference description',
        policies: [
            {
                policyId: '1',
                policyName: 'Cancellation Policy',
                description: 'Full refund within 7 days'
            },
            {
                policyId: '2',
                policyName: 'Code of Conduct',
                description: 'Be respectful to others'
            },
        ],
        submittedPaper: undefined,
    };

    it('should render conference description', () => {
        render(<ConferenceDescriptionCard conference={mockConference} />);
        expect(screen.getByText('Test conference description')).toBeInTheDocument();
    });

    it('should render policies section when policies exist', () => {
        render(<ConferenceDescriptionCard conference={mockConference} />);
        expect(screen.getByText('Chính sách:')).toBeInTheDocument();
    });

    it('should render all policy items', () => {
        render(<ConferenceDescriptionCard conference={mockConference} />);
        expect(screen.getByText('Cancellation Policy:')).toBeInTheDocument();
        expect(screen.getByText('Full refund within 7 days')).toBeInTheDocument();
        expect(screen.getByText('Code of Conduct:')).toBeInTheDocument();
        expect(screen.getByText('Be respectful to others')).toBeInTheDocument();
    });

    it('should not render policies section when policies array is empty', () => {
        const conferenceNoPolicies = { ...mockConference, policies: [] };
        render(<ConferenceDescriptionCard conference={conferenceNoPolicies} />);
        expect(screen.queryByText('Chính sách:')).not.toBeInTheDocument();
    });

    it('should apply research styles when isResearch is true', () => {
        const { container } = render(
            <ConferenceDescriptionCard conference={mockConference} isResearch={true} />
        );
        const cardElement = container.firstChild as HTMLElement;
        expect(cardElement).toHaveClass('bg-white', 'rounded-xl', 'shadow-md', 'p-6');
    });

    it('should apply technical styles when isResearch is false', () => {
        const { container } = render(
            <ConferenceDescriptionCard conference={mockConference} isResearch={false} />
        );
        const cardElement = container.firstChild as HTMLElement;
        expect(cardElement).toHaveClass('mt-4', 'bg-white', 'rounded-xl', 'shadow-md');
    });
});

// ConferenceTitleCard.test.tsx
describe('ConferenceTitleCard', () => {
    const mockFormatDate = jest.fn((date) => '01/01/2024');
    const mockOnFavoriteToggle = jest.fn();
    const mockOnTabChange = jest.fn();

    const mockTechnicalConference: Partial<TechnicalConferenceDetailResponse> = {
        conferenceId: '1',
        conferenceName: 'Tech Conference 2024',
        startDate: '2024-01-01',
        address: '123 Main St, City',
        totalSlot: 100,
        statusName: 'Ready',
        isResearchConference: false,
    };

    const mockResearchConference: Partial<TechnicalConferenceDetailResponse> = {
        ...mockTechnicalConference,
        conferenceName: 'Research Conference 2024',
        isResearchConference: true,
        statusName: 'Ready',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render conference name', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    });

    it('should render conference address', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        expect(screen.getByText('123 Main St, City')).toBeInTheDocument();
    });

    it('should render status badge for Ready status', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        expect(screen.getByText('Đang diễn ra')).toBeInTheDocument();
    });

    it('should render type badge for technical conference', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        expect(screen.getByText('Hội thảo công nghệ')).toBeInTheDocument();
    });

    it('should render type badge for research conference', () => {
        render(
            <ConferenceTitleCard
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
                isResearch={true}
            />
        );
        expect(screen.getByText('Hội nghị nghiên cứu')).toBeInTheDocument();
    });

    it('should render favorite button when accessToken exists', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        const favoriteButton = screen.getByRole('button', { name: /thêm vào yêu thích/i });
        expect(favoriteButton).toBeInTheDocument();
    });

    it('should not render favorite button when accessToken is null', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken={null}
                showSubscribeCard={true}
            />
        );
        const favoriteButton = screen.queryByRole('button', { name: /thêm vào yêu thích/i });
        expect(favoriteButton).not.toBeInTheDocument();
    });

    it('should call onFavoriteToggle when favorite button is clicked', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        const favoriteButton = screen.getByRole('button', { name: /thêm vào yêu thích/i });
        fireEvent.click(favoriteButton);
        expect(mockOnFavoriteToggle).toHaveBeenCalledTimes(1);
    });

    it('should disable favorite button when isTogglingFavorite is true', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={true}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        const favoriteButton = screen.getByRole('button', { name: /thêm vào yêu thích/i });
        expect(favoriteButton).toBeDisabled();
    });

    it('should render tab navigation for research conference', () => {
        render(
            <ConferenceTitleCard
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
                isResearch={true}
                activeTab="info"
                onTabChange={mockOnTabChange}
            />
        );
        expect(screen.getByText('Thông tin & Hình ảnh về hội nghị')).toBeInTheDocument();
    });

    it('should call onTabChange when tab is clicked', () => {
        render(
            <ConferenceTitleCard
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
                isResearch={true}
                activeTab="info"
                onTabChange={mockOnTabChange}
            />
        );
        const sessionsTab = screen.getByText('Lịch trình Sessions');
        fireEvent.click(sessionsTab);
        expect(mockOnTabChange).toHaveBeenCalledWith('sessions');
    });

    it('should render warning message when showSubscribeCard is false', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={false}
            />
        );
        expect(screen.getByText(/Đây là hội thảo của bên đối tác/)).toBeInTheDocument();
    });

    it('should render total slot when available', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        expect(screen.getByText(/Số người tham dự tối đa: 100 người/)).toBeInTheDocument();
    });

    it('should call formatDate with start date', () => {
        render(
            <ConferenceTitleCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                isFavorite={false}
                onFavoriteToggle={mockOnFavoriteToggle}
                isTogglingFavorite={false}
                accessToken="token123"
                showSubscribeCard={true}
            />
        );
        expect(mockFormatDate).toHaveBeenCalledWith('2024-01-01');
    });
});

// ConferenceSubscribeCard.test.tsx
// Mock TimeContext
jest.mock('@/utils/TimeContext', () => ({
    useGlobalTime: () => ({
        now: new Date('2024-01-15'),
        useFakeTime: false,
    }),
}));

describe('ConferenceSubscribeCard', () => {
    const mockFormatDate = jest.fn((date) => '01/01/2024');
    const mockOnOpenDialog = jest.fn();

    const mockTechnicalConference: Partial<TechnicalConferenceDetailResponse> = {
        conferenceId: '1',
        conferenceName: 'Tech Conference',
        isResearchConference: false,
        conferencePrices: [
            {
                conferencePriceId: '1',
                ticketName: 'Early Bird',
                ticketPrice: 100000,
                isAuthor: false,
                availableSlot: 50,
                totalSlot: 100,
                pricePhases: [
                    {
                        pricePhaseId: '1',
                        phaseName: 'Phase 1',
                        startDate: '2024-01-01',
                        endDate: '2024-01-31',
                        availableSlot: 50,
                        totalSlot: 100,
                        applyPercent: 100,
                    },
                ],
            },
        ],
    };

    const mockPurchasedTicketInfo = {
        ticket: {
            conferencePriceId: '1',
            ticketName: 'Early Bird',
            ticketPrice: 100000,
        } as ConferencePriceResponse,
        phase: {
            pricePhaseId: '1',
            phaseName: 'Phase 1',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render subscribe heading for technical conference', () => {
        render(
            <ConferenceSubscribeCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={null}
            />
        );
        expect(screen.getByText('Mua vé ngay')).toBeInTheDocument();
    });

    it('should render subscribe heading for research conference', () => {
        const researchConference = {
            ...mockTechnicalConference,
            isResearchConference: true,
        };
        render(
            <ConferenceSubscribeCard
                conference={researchConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={null}
                isResearch={true}
            />
        );
        expect(screen.getByText('Đăng ký tham dự tại đây')).toBeInTheDocument();
    });

    it('should render buy ticket button for technical conference', () => {
        render(
            <ConferenceSubscribeCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={null}
            />
        );
        expect(screen.getByText('Mua vé')).toBeInTheDocument();
    });

    it('should call onOpenDialog when buy button is clicked', () => {
        render(
            <ConferenceSubscribeCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={null}
            />
        );
        const buyButton = screen.getByText('Mua vé');
        fireEvent.click(buyButton);
        expect(mockOnOpenDialog).toHaveBeenCalledWith('listener');
    });

    it('should render purchased ticket info when ticket is purchased', () => {
        render(
            <ConferenceSubscribeCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={mockPurchasedTicketInfo}
            />
        );
        expect(screen.getByText('Bạn đã mua vé thành công!')).toBeInTheDocument();
        expect(screen.getByText('Early Bird')).toBeInTheDocument();
    });

    it('should render disabled button when ticket is purchased', () => {
        render(
            <ConferenceSubscribeCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={mockPurchasedTicketInfo}
            />
        );
        const disabledButton = screen.getByText('Đã sở hữu vé');
        expect(disabledButton).toBeDisabled();
    });

    it('should render success icon when ticket is purchased', () => {
        const { container } = render(
            <ConferenceSubscribeCard
                conference={mockTechnicalConference as any}
                formatDate={mockFormatDate}
                onOpenDialog={mockOnOpenDialog}
                purchasedTicketInfo={mockPurchasedTicketInfo}
            />
        );
        const successIcon = container.querySelector('svg');
        expect(successIcon).toBeInTheDocument();
    });
});

// PaymentMethodSelector.test.tsx
describe('PaymentMethodSelector', () => {
    const mockOnSelectPaymentMethod = jest.fn();
    const mockOnTogglePaymentMethods = jest.fn();

    const mockPaymentMethods: PaymentMethod[] = [
        {
            paymentMethodId: '1',
            methodName: 'VNPay',
            methodDescription: 'Thanh toán qua VNPay',
        },
        {
            paymentMethodId: '2',
            methodName: 'MoMo',
            methodDescription: 'Thanh toán qua MoMo',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render payment method selector button', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={false}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        expect(screen.getByText(/Phương Thức Thanh toán/)).toBeInTheDocument();
    });

    it('should show required asterisk when no method selected', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={false}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display selected payment method name', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod="1"
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={false}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        expect(screen.getByText('VNPay')).toBeInTheDocument();
    });

    it('should toggle dropdown when button is clicked', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={false}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(mockOnTogglePaymentMethods).toHaveBeenCalledWith(true);
    });

    it('should render payment methods list when dropdown is open', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={true}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        expect(screen.getByText('VNPay')).toBeInTheDocument();
        expect(screen.getByText('MoMo')).toBeInTheDocument();
    });

    it('should call onSelectPaymentMethod when method is clicked', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={true}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        const vnpayButton = screen.getByText('VNPay').closest('button');
        if (vnpayButton) fireEvent.click(vnpayButton);
        expect(mockOnSelectPaymentMethod).toHaveBeenCalledWith('1');
    });

    it('should show loading state when loading', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={true}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={true}
            />
        );
        expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('should render payment method description', () => {
        render(
            <PaymentMethodSelector
                selectedPaymentMethod={null}
                onSelectPaymentMethod={mockOnSelectPaymentMethod}
                showPaymentMethods={true}
                onTogglePaymentMethods={mockOnTogglePaymentMethods}
                paymentMethods={mockPaymentMethods}
                paymentMethodsLoading={false}
            />
        );
        expect(screen.getByText('Thanh toán qua VNPay')).toBeInTheDocument();
    });
});

// WaitlistSection.test.tsx
describe('WaitlistSection', () => {
    const mockOnAddToWaitlist = jest.fn();

    beforeEach(() => {
        mockOnAddToWaitlist.mockClear();
    });

    it('should not render when allAuthorTicketsSoldOut is false', () => {
        const { container } = render(
            <WaitlistSection
                allAuthorTicketsSoldOut={false}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={false}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render when allAuthorTicketsSoldOut is true', () => {
        render(
            <WaitlistSection
                allAuthorTicketsSoldOut={true}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={false}
            />
        );
        expect(screen.getByText(/Loại vé cho tác giả hiện đang hết/)).toBeInTheDocument();
    });

    it('should render waitlist button', () => {
        render(
            <WaitlistSection
                allAuthorTicketsSoldOut={true}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={false}
            />
        );
        expect(screen.getByText('Thêm vào danh sách chờ')).toBeInTheDocument();
    });

    it('should call onAddToWaitlist when button is clicked', () => {
        render(
            <WaitlistSection
                allAuthorTicketsSoldOut={true}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={false}
            />
        );

        const button = screen.getByText('Thêm vào danh sách chờ');
        fireEvent.click(button);

        expect(mockOnAddToWaitlist).toHaveBeenCalledWith('123');
        expect(mockOnAddToWaitlist).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when loading is true', () => {
        render(
            <WaitlistSection
                allAuthorTicketsSoldOut={true}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={true}
            />
        );

        expect(screen.getByText('Đang xử lý...')).toBeInTheDocument();
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('should render warning icon', () => {
        const { container } = render(
            <WaitlistSection
                allAuthorTicketsSoldOut={true}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={false}
            />
        );

        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
        const { container } = render(
            <WaitlistSection
                allAuthorTicketsSoldOut={true}
                conferenceId="123"
                onAddToWaitlist={mockOnAddToWaitlist}
                loading={false}
            />
        );

        const section = container.firstChild as HTMLElement;
        expect(section).toHaveClass('mt-4', 'p-4', 'bg-orange-50', 'border-2', 'border-orange-200', 'rounded-xl');
    });
});

// PolicyTab.test.tsx
describe('PolicyTab', () => {
    const mockConferenceWithPolicies = {
        policies: [
            {
                policyId: '1',
                policyName: 'Cancellation Policy',
                description: 'Full refund within 7 days'
            },
            {
                policyId: '2',
                policyName: 'Code of Conduct',
                description: 'Be respectful to others'
            }
        ],
        refundPolicies: []
    };

    const mockConferenceNoPolicies = {
        policies: [],
        refundPolicies: []
    };

    it('should render main heading', () => {
        render(<PolicyTab conference={mockConferenceWithPolicies} />);
        expect(screen.getByText('Chính sách')).toBeInTheDocument();
    });

    it('should render policies section heading', () => {
        render(<PolicyTab conference={mockConferenceWithPolicies} />);
        expect(screen.getByText('Chính sách & Quy định')).toBeInTheDocument();
    });

    it('should render all policy items when policies exist', () => {
        render(<PolicyTab conference={mockConferenceWithPolicies} />);

        expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
        expect(screen.getByText('Full refund within 7 days')).toBeInTheDocument();
        expect(screen.getByText('Code of Conduct')).toBeInTheDocument();
        expect(screen.getByText('Be respectful to others')).toBeInTheDocument();
    });

    it('should render empty state when no policies exist', () => {
        render(<PolicyTab conference={mockConferenceNoPolicies} />);

        expect(screen.getByText('Chưa có thông tin về chính sách và quy định')).toBeInTheDocument();
        expect(screen.getByText('Thông tin chính sách sẽ được cập nhật sớm')).toBeInTheDocument();
    });

    it('should render important notice section', () => {
        render(<PolicyTab conference={mockConferenceWithPolicies} />);

        expect(screen.getByText('Lưu ý quan trọng')).toBeInTheDocument();
        expect(screen.getByText(/Vui lòng đọc kỹ các chính sách/)).toBeInTheDocument();
    });

    it('should render Shield icons', () => {
        const { container } = render(<PolicyTab conference={mockConferenceWithPolicies} />);

        // Should have Shield icons for section heading and notice
        const icons = container.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThan(0);
    });

    it('should render FileText icons for each policy', () => {
        const { container } = render(<PolicyTab conference={mockConferenceWithPolicies} />);

        // Each policy card should have a FileText icon
        const policyCards = container.querySelectorAll('.bg-gray-50.rounded-lg');
        expect(policyCards.length).toBe(2);
    });

    it('should apply correct styling to policy cards', () => {
        const { container } = render(<PolicyTab conference={mockConferenceWithPolicies} />);

        const policyCard = container.querySelector('.bg-gray-50.rounded-lg.p-6.border.border-gray-200');
        expect(policyCard).toBeInTheDocument();
    });

    it('should display policy name or fallback text', () => {
        const conferenceWithUnnamedPolicy = {
            policies: [
                {
                    policyId: '1',
                    policyName: '',
                    description: 'Test description'
                }
            ],
            refundPolicies: []
        };

        render(<PolicyTab conference={conferenceWithUnnamedPolicy} />);
        expect(screen.getByText('Chính sách chưa đặt tên')).toBeInTheDocument();
    });

    it('should display policy description or fallback text', () => {
        const conferenceWithNoDescription = {
            policies: [
                {
                    policyId: '1',
                    policyName: 'Test Policy',
                    description: ''
                }
            ],
            refundPolicies: []
        };

        render(<PolicyTab conference={conferenceWithNoDescription} />);
        expect(screen.getByText('Chưa có mô tả cho chính sách này')).toBeInTheDocument();
    });

    it('should render yellow notice box with proper styling', () => {
        const { container } = render(<PolicyTab conference={mockConferenceWithPolicies} />);

        const noticeBox = container.querySelector('.bg-yellow-50.border.border-yellow-200.rounded-lg.p-4');
        expect(noticeBox).toBeInTheDocument();
    });
});

// ==================== InformationTab Tests ====================
describe('InformationTab', () => {
    const mockSetSelectedImage = jest.fn();

    const mockTechnicalConference: Partial<TechnicalConferenceDetailResponse> = {
        conferenceId: '1',
        conferenceName: 'Tech Conference 2024',
        description: 'A great tech conference',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        totalSlot: 100,
        availableSlot: 50,
        address: '123 Tech Street',
        createdAt: '2023-12-01',
        ticketSaleStart: '2023-12-15',
        ticketSaleEnd: '2023-12-31',
        isInternalHosted: true,
        isResearchConference: false,
        cityName: 'Ho Chi Minh',
        categoryName: 'Technology',
        statusName: 'Ready',
        targetAudience: 'Developers and Tech Enthusiasts',
        conferenceMedia: [
            {
                mediaId: '1',
                mediaUrl: '/images/conf1.jpg',
            },
            {
                mediaId: '2',
                mediaUrl: '/images/conf2.jpg',
            },
        ],
        sponsors: [],
    };

    const mockResearchConference: Partial<ResearchConferenceDetailResponse> = {
        ...mockTechnicalConference,
        isResearchConference: true,
        paperFormat: 'IEEE Format',
        numberPaperAccept: 50,
        revisionAttemptAllowed: 3,
        allowListener: true,
        rankValue: 'A*',
        rankYear: 2024,
        rankingCategoryName: 'Computer Science',
        rankingDescription: 'Top tier conference in CS',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render basic conference information', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Thông tin chi tiết')).toBeInTheDocument();
        expect(screen.getByText('Thông tin cơ bản')).toBeInTheDocument();
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
        expect(screen.getByText('A great tech conference')).toBeInTheDocument();
    });

    it('should render all basic information fields for technical conference', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Tên hội thảo:')).toBeInTheDocument();
        expect(screen.getByText('Ngày diễn ra:')).toBeInTheDocument();
        expect(screen.getByText('Ngày kết thúc:')).toBeInTheDocument();
        expect(screen.getByText('Tổng số người tham dự tối đa:')).toBeInTheDocument();
        expect(screen.getByText('Số lượng chỗ còn lại:')).toBeInTheDocument();
        expect(screen.getByText('Địa chỉ:')).toBeInTheDocument();
        expect(screen.getByText('123 Tech Street')).toBeInTheDocument();
    });

    it('should render technical conference specific section', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Thông tin chi tiết về hội thảo')).toBeInTheDocument();
        expect(screen.getByText('Đối tượng hội thảo muốn hướng tới:')).toBeInTheDocument();
        expect(screen.getByText('Developers and Tech Enthusiasts')).toBeInTheDocument();
    });

    it('should render conference media section when media exists', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Hình ảnh về hội thảo')).toBeInTheDocument();
        const images = screen.getAllByAltText('Conference media');
        expect(images).toHaveLength(2);
    });

    it('should call setSelectedImage when media is clicked', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        const images = screen.getAllByAltText('Conference media');
        fireEvent.click(images[0]);
        expect(mockSetSelectedImage).toHaveBeenCalledWith('/images/conf1.jpg');
    });

    it('should render empty state when no media exists', () => {
        const conferenceNoMedia = { ...mockTechnicalConference, conferenceMedia: [] };
        render(
            <InformationTab
                conference={conferenceNoMedia as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Chưa có hình ảnh hoặc media cho hội nghị này')).toBeInTheDocument();
    });

    it('should render research conference specific details', () => {
        render(
            <InformationTab
                conference={mockResearchConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Tên hội nghị:')).toBeInTheDocument();
    });

    it('should render conference type correctly', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText('Hội Thảo Công nghệ')).toBeInTheDocument();
    });

    it('should render internal hosted status', () => {
        render(
            <InformationTab
                conference={mockTechnicalConference as any}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText(/Có, đây là hội thảo được tổ chức bỏi Confradar/)).toBeInTheDocument();
    });
});

describe('SessionsTab', () => {
    const mockFormatDate = jest.fn((date) => '01/01/2024');
    const mockFormatTime = jest.fn((time) => '09:00');
    const mockFormatDateTime = jest.fn((dateTime) => '01/01/2024 09:00');
    const mockSetSelectedImage = jest.fn();

    const mockConferenceWithSessions: Partial<TechnicalConferenceDetailResponse> = {
        conferenceId: '1',
        isResearchConference: false,
        bannerImageUrl: '/banner.jpg',
        sessions: [
            {
                conferenceSessionId: 's1',
                title: 'Opening Keynote',
                description: 'Welcome speech',
                startTime: '2024-01-01T09:00:00',
                endTime: '2024-01-01T10:00:00',
                sessionDate: '2024-01-01',
                room: {
                    roomId: 'r1',
                    number: '101',
                    displayName: 'Main Hall',
                },
                speakers: [
                    {
                        speakerId: 'sp1',
                        name: 'John Doe',
                        description: 'Tech Expert',
                        image: '/speaker.jpg',
                    },
                ],
                sessionMedia: [],
                feedback: [],
            },
        ],
    };

    const mockConferenceNoSessions: Partial<TechnicalConferenceDetailResponse> = {
        ...mockConferenceWithSessions,
        sessions: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render sessions tab heading', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(screen.getByText('Lịch trình Sessions')).toBeInTheDocument();
    });

    it('should render session title and description', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(screen.getByText('Opening Keynote')).toBeInTheDocument();
        expect(screen.getByText('Welcome speech')).toBeInTheDocument();
    });

    it('should render session time and date', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(mockFormatDate).toHaveBeenCalled();
    });

    it('should render room information', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(screen.getByText('Main Hall')).toBeInTheDocument();
    });

    it('should render speaker information', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(screen.getByText('Diễn giả:')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Tech Expert')).toBeInTheDocument();
    });

    it('should render feedback button', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(screen.getByText(/Xem\s*&\s*Thêm đánh giá/i)).toBeInTheDocument();
    });

    it('should render empty state when no sessions', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceNoSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        expect(screen.getByText('Chưa có thông tin về sessions')).toBeInTheDocument();
    });

    it('should render session banner image', () => {
        render(
            <Provider store={store}>
                <SessionsTab
                    conference={mockConferenceWithSessions as any}
                    formatDate={mockFormatDate}
                    formatTime={mockFormatTime}
                    formatDateTime={mockFormatDateTime}
                    setSelectedImage={mockSetSelectedImage}
                />
            </Provider>
        );

        const bannerImage = screen.getByAltText('Opening Keynote');
        expect(bannerImage).toBeInTheDocument();
    });
});

describe('ConferencePriceTab', () => {
    const mockFormatDate = jest.fn((date) => '01/01/2024');
    const mockFormatTime = jest.fn((time) => '09:00');

    const mockConferenceWithPrices: Partial<TechnicalConferenceDetailResponse> = {
        conferenceId: '1',
        isResearchConference: false,
        conferencePrices: [
            {
                conferencePriceId: 'p1',
                ticketName: 'Early Bird',
                ticketPrice: 100000,
                isAuthor: false,
                availableSlot: 50,
                totalSlot: 100,
                pricePhases: [
                    {
                        pricePhaseId: 'ph1',
                        phaseName: 'Phase 1',
                        startDate: '2024-01-01',
                        endDate: '2024-01-31',
                        availableSlot: 50,
                        totalSlot: 100,
                        applyPercent: 100,
                    },
                ],
            },
            {
                conferencePriceId: 'p2',
                ticketName: 'Regular',
                ticketPrice: 150000,
                isAuthor: false,
                availableSlot: 100,
                totalSlot: 200,
                pricePhases: [],
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render price tab heading', () => {
        render(
            <ConferencePriceTab
                conference={mockConferenceWithPrices as any}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
            />
        );

        expect(screen.getByText('Các loại vé')).toBeInTheDocument();
    });

    it('should render all ticket types', () => {
        render(
            <ConferencePriceTab
                conference={mockConferenceWithPrices as any}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
            />
        );

        expect(screen.getByText('Early Bird')).toBeInTheDocument();
        expect(screen.getByText('Regular')).toBeInTheDocument();
    });

    it('should render ticket prices formatted correctly', () => {
        render(
            <ConferencePriceTab
                conference={mockConferenceWithPrices as any}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
            />
        );

        expect(screen.getAllByText(/100\.000₫/).length).toBeGreaterThan(0);
        expect(screen.getByText(/150\.000₫/)).toBeInTheDocument();
    });

    it('should render available slots information', () => {
        render(
            <ConferencePriceTab
                conference={mockConferenceWithPrices as any}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
            />
        );
    });

    it('should render price phases when available', () => {
        render(
            <ConferencePriceTab
                conference={mockConferenceWithPrices as any}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
            />
        );

        expect(screen.getByText('Phase 1')).toBeInTheDocument();
    });
});

// ==================== ResearchTimelineTab Tests ====================
describe('ResearchTimelineTab', () => {
    const mockFormatDate = jest.fn((date) => '01/01/2024');

    const mockResearchConference: Partial<ResearchConferenceDetailResponse> = {
        conferenceId: '1',
        researchPhase: [
            {
                researchConferencePhaseId: 'phase1',
                phaseOrder: 1,
                isActive: true,
                registrationStartDate: '2024-01-01',
                registrationEndDate: '2024-01-31',
                fullPaperStartDate: '2024-02-01',
                fullPaperEndDate: '2024-02-28',
                reviseStartDate: '2024-03-01',
                reviseEndDate: '2024-03-31',
                cameraReadyStartDate: '2024-04-01',
                cameraReadyEndDate: '2024-04-30',
                revisionRoundDeadlines: [
                    {
                        revisionRoundDeadlineId: 'rd1',
                        roundNumber: 1,
                        startSubmissionDate: '2024-03-01',
                        endSubmissionDate: '2024-03-15',
                    },
                ],
            },
        ],
    };

    const mockConferenceNoPhases: Partial<ResearchConferenceDetailResponse> = {
        ...mockResearchConference,
        researchPhase: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render timeline heading', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Timeline nộp bài báo')).toBeInTheDocument();
    });

    it('should render phase tabs', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Phase 1')).toBeInTheDocument();
    });

    it('should render active status badge', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    });

    it('should render registration section', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Đăng ký & Nộp bản tóm tắt (Abstract)')).toBeInTheDocument();
        expect(screen.getByText('Thời gian đăng ký với tư cách tác giả')).toBeInTheDocument();
    });

    it('should render full paper section', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Nộp bài báo bản đầy đủ (Full Paper)')).toBeInTheDocument();
    });

    it('should render revision section', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Vòng Final Review (Các vòng chỉnh sửa bài bóa)')).toBeInTheDocument();
    });

    it('should render camera ready section', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Bản cuối cùng (Camera Ready)')).toBeInTheDocument();
    });

    it('should render revision rounds', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Vòng 1')).toBeInTheDocument();
    });

    it('should render empty state when no phases', () => {
        render(
            <ResearchTimelineTab
                conference={mockConferenceNoPhases as any}
                formatDate={mockFormatDate}
            />
        );

        expect(screen.getByText('Chưa có thông tin timeline')).toBeInTheDocument();
    });

    it('should call formatDate for all date fields', () => {
        render(
            <ResearchTimelineTab
                conference={mockResearchConference as any}
                formatDate={mockFormatDate}
            />
        );

        expect(mockFormatDate).toHaveBeenCalled();
    });
});

// ==================== ResearchDocumentsTab Tests ====================
describe('ResearchDocumentsTab', () => {
    const mockConferenceWithDocuments: Partial<ResearchConferenceDetailResponse> = {
        conferenceId: '1',
        materialDownloads: [
            {
                materialDownloadId: 'm1',
                fileName: 'Submission Guide',
                fileDescription: 'How to submit your paper',
                fileUrl: '/files/guide.pdf',
            },
        ],
        rankingFileUrls: [
            {
                rankingFileUrlId: 'rf1',
                fileUrl: '/files/ranking.pdf',
            },
        ],
        rankingReferenceUrls: [
            {
                referenceUrlId: 'ru1',
                referenceUrl: 'https://example.com/ranking',
            },
        ],
    };

    const mockConferenceNoDocuments: Partial<ResearchConferenceDetailResponse> = {
        ...mockConferenceWithDocuments,
        materialDownloads: [],
        rankingFileUrls: [],
        rankingReferenceUrls: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render documents heading', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('Tài liệu & Hướng dẫn')).toBeInTheDocument();
    });

    it('should render author note section', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('📝 Hướng dẫn dành cho tác giả (Paper Submission)')).toBeInTheDocument();
    });

    it('should render material downloads section', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('Tài liệu hướng dẫn nộp bài báo')).toBeInTheDocument();
        expect(screen.getByText('Submission Guide')).toBeInTheDocument();
        expect(screen.getByText('How to submit your paper')).toBeInTheDocument();
    });

    it('should render ranking documents section', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('Tài liệu minh chứng xếp hạng hội nghị')).toBeInTheDocument();
    });

    it('should render ranking reference URLs section', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('Liên kết xác thực xếp hạng hội nghị')).toBeInTheDocument();
        expect(screen.getByText('https://example.com/ranking')).toBeInTheDocument();
    });

    it('should render download buttons', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('Tải xuống tài liệu')).toBeInTheDocument();
    });

    it('should render empty state when no documents', () => {
        render(<ResearchDocumentsTab conference={mockConferenceNoDocuments as any} />);

        expect(screen.getByText('Chưa có tài liệu nào được tải lên')).toBeInTheDocument();
    });

    it('should render file description when available', () => {
        render(<ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />);

        expect(screen.getByText('How to submit your paper')).toBeInTheDocument();
    });

    it('should render proper links for external URLs', () => {
        const { container } = render(
            <ResearchDocumentsTab conference={mockConferenceWithDocuments as any} />
        );

        const links = container.querySelectorAll('a[target="_blank"]');
        expect(links.length).toBeGreaterThan(0);
    });
});