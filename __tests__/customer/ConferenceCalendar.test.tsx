import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ConferenceDetailForScheduleResponse, SessionDetailForScheduleResponse } from '@/types/conference.type';
import SessionsListDialog from '@/components/(user)/customer/conference-calendar/SessionsListDialog';
import ConferenceCard from '@/components/(user)/customer/conference-calendar/ConferenceCard';
import { store } from '@/redux/store';
import SessionDetailDialog from '@/components/(user)/customer/conference-calendar/SessionDetailDialog';
import ConferenceCalendar from '@/components/(user)/customer/conference-calendar/ConferenceCalendar';

// Mock helper
jest.mock('@/helper/conference', () => ({
    checkUserRole: jest.fn(() => ({
        isRootAuthor: false,
        isPresenter: false,
    })),
}));

const mockSessions: SessionDetailForScheduleResponse[] = [
    {
        conferenceSessionId: 'session-1',
        conferenceId: 'conf-1',
        title: 'Morning Keynote',
        description: 'Opening session',
        startTime: '2024-12-20T09:00:00Z',
        endTime: '2024-12-20T10:00:00Z',
        roomDisplayName: 'Main Hall',
        presenterAuthor: [],
    },
    {
        conferenceSessionId: 'session-2',
        conferenceId: 'conf-1',
        title: 'Afternoon Workshop',
        description: 'Hands-on session',
        startTime: '2024-12-20T14:00:00Z',
        endTime: '2024-12-20T16:00:00Z',
        roomDisplayName: 'Workshop Room',
        presenterAuthor: [],
    },
    {
        conferenceSessionId: 'session-3',
        conferenceId: 'conf-1',
        title: 'Next Day Session',
        description: 'Second day session',
        startTime: '2024-12-21T09:00:00Z',
        endTime: '2024-12-21T10:00:00Z',
        roomDisplayName: 'Conference Room B',
        presenterAuthor: [],
    },
];

const mockConference: ConferenceDetailForScheduleResponse = {
    conferenceId: 'conf-1',
    conferenceName: 'Tech Conference 2024',
    isResearchConference: false,
    sessions: mockSessions,
};

const createMockStore = () => {
    return configureStore({
        reducer: {
            auth: () => ({
                user: {
                    userId: 'user-1',
                    fullName: 'Test User',
                },
            }),
        },
    });
};

describe('SessionsListDialog Component', () => {
    const mockOnClose = jest.fn();
    const mockOnSessionSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders nothing when closed', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={false}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.queryByText('Tech Conference 2024')).not.toBeInTheDocument();
    });

    test('renders conference name when open', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    });

    test('renders session count', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('3 phiên họp')).toBeInTheDocument();
    });

    test('renders all session titles', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Morning Keynote')).toBeInTheDocument();
        expect(screen.getByText('Afternoon Workshop')).toBeInTheDocument();
        expect(screen.getByText('Next Day Session')).toBeInTheDocument();
    });

    test('renders session descriptions', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Opening session')).toBeInTheDocument();
        expect(screen.getByText('Hands-on session')).toBeInTheDocument();
        expect(screen.getByText('Second day session')).toBeInTheDocument();
    });

    test('renders room information', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Main Hall')).toBeInTheDocument();
        expect(screen.getByText('Workshop Room')).toBeInTheDocument();
        expect(screen.getByText('Conference Room B')).toBeInTheDocument();
    });

    test('groups sessions by date', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        // Check for date headers
        expect(screen.getByText('20/12/2024')).toBeInTheDocument();
        expect(screen.getByText('21/12/2024')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('calls onSessionSelect when session is clicked', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        const sessionCard = screen.getByText('Morning Keynote').closest('div');
        fireEvent.click(sessionCard!);

        expect(mockOnSessionSelect).toHaveBeenCalledWith(mockSessions[0]);
    });

    test('displays user role badges when user is root author', () => {
        const checkUserRole = require('@/helper/conference').checkUserRole;
        checkUserRole.mockReturnValue({ isRootAuthor: true, isPresenter: false });

        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getAllByText('👑 Tác giả gốc').length).toBeGreaterThan(0);
    });

    test('displays user role badges when user is presenter', () => {
        const checkUserRole = require('@/helper/conference').checkUserRole;
        checkUserRole.mockReturnValue({ isRootAuthor: false, isPresenter: true });

        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={mockConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getAllByText('🎤 Diễn giả').length).toBeGreaterThan(0);
    });

    test('renders empty state when no sessions', () => {
        const emptyConference = { ...mockConference, sessions: [] };
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={emptyConference}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Chưa có phiên họp nào được lên lịch')).toBeInTheDocument();
    });

    test('handles conference with null value', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={null}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Chi tiết phiên họp')).toBeInTheDocument();
        expect(screen.getByText('0 phiên họp')).toBeInTheDocument();
    });

    test('handles session without description', () => {
        const sessionWithoutDesc = {
            ...mockSessions[0],
            description: undefined,
        };
        const confWithModifiedSession = {
            ...mockConference,
            sessions: [sessionWithoutDesc],
        };
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionsListDialog
                    open={true}
                    conference={confWithModifiedSession as any}
                    onClose={mockOnClose}
                    onSessionSelect={mockOnSessionSelect}
                />
            </Provider>
        );

        expect(screen.getByText('Morning Keynote')).toBeInTheDocument();
        expect(screen.queryByText('Opening session')).not.toBeInTheDocument();
    });
});

// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import ConferenceCard from './ConferenceCard';
// import { ConferenceDetailForScheduleResponse } from '@/types/conference.type';

// Mock dialogs


jest.mock('@/redux/hooks/hooks', () => ({
    useAppSelector: jest.fn(() => null),
}));

const mockConferenceCard: ConferenceDetailForScheduleResponse = {
    conferenceId: 'conf-1',
    conferenceName: 'Tech Conference 2024',
    description: 'Annual technology conference',
    startDate: '2024-12-20T08:00:00Z',
    endDate: '2024-12-22T18:00:00Z',
    bannerImageUrl: 'https://example.com/banner.jpg',
    address: '123 Tech Street, Innovation City',
    totalSlot: 100,
    availableSlot: 45,
    conferenceCategoryName: 'Technology',
    isResearchConference: false,
    sessions: [
        {
            conferenceSessionId: 'session-1',
            title: 'Opening Keynote',
            startTime: '2024-12-20T09:00:00Z',
            endTime: '2024-12-20T10:00:00Z',
            presenterAuthor: [],
        },
        {
            conferenceSessionId: 'session-2',
            title: 'Panel Discussion',
            startTime: '2024-12-20T11:00:00Z',
            endTime: '2024-12-20T12:00:00Z',
            presenterAuthor: [],
        },
    ],
};

describe('ConferenceCard Component', () => {
    const mockOnConferenceClick = jest.fn();
    const mockOnSessionNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders conference name', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    });

    test('renders conference description', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('Annual technology conference')).toBeInTheDocument();
    });

    test('renders banner image when provided', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        const image = screen.getByAltText('Tech Conference 2024');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://example.com/banner.jpg');
    });

    test('renders formatted dates', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        // Dates are formatted to Vietnamese locale
        expect(
            screen.getByText(/20\/12\/2024\s*-\s*23\/12\/2024/)
        ).toBeInTheDocument();
    });

    test('renders address', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('123 Tech Street, Innovation City')).toBeInTheDocument();
    });

    test('renders slot information', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('45/100 slots')).toBeInTheDocument();
    });

    test('renders category badge', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    test('renders session count', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('2 phiên họp')).toBeInTheDocument();
    });

    test('renders "View Details" button when sessions exist', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        const viewButton = screen.getByRole('button', { name: /xem chi tiết/i });
        expect(viewButton).toBeInTheDocument();
    });

    test('does not render session section when no sessions', () => {
        const confWithoutSessions = { ...mockConference, sessions: [] };

        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={confWithoutSessions}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.queryByText(/phiên họp/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /xem chi tiết/i })).not.toBeInTheDocument();
    });

    test('calls onConferenceClick when card is clicked', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        const card = screen.getByText('Tech Conference 2024').closest('div');
        fireEvent.click(card!);

        expect(mockOnConferenceClick).toHaveBeenCalledWith(mockConferenceCard);
    });

    test('opens SessionsListDialog when "View Details" is clicked', () => {
        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>

        );

        const viewButton = screen.getByRole('button', { name: /xem chi tiết/i });
        fireEvent.click(viewButton);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('applies selected styling when conference is selected', () => {
        const { container } = render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    selectedConference="conf-1"
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        const card = container.querySelector(`#conference-${mockConference.conferenceId}`);
        expect(card).toHaveClass('border-blue-500', 'bg-gray-50');
    });

    test('applies default styling when conference is not selected', () => {
        const { container } = render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    selectedConference="other-conf"
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        const card = container.querySelector(`#conference-${mockConference.conferenceId}`);
        expect(card).toHaveClass('border-gray-200');
        expect(card).not.toHaveClass('border-blue-500');
    });

    test('renders all icons correctly', () => {
        const { container } = render(
            <Provider store={store}>
                <ConferenceCard
                    conf={mockConferenceCard}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        // Check for Clock, MapPin, Users, Tag, Eye icons by looking for SVGs
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThan(0);
    });

    test('handles conference without optional fields', () => {
        const minimalConf: ConferenceDetailForScheduleResponse = {
            conferenceId: 'conf-2',
            conferenceName: 'Minimal Conference',
            isResearchConference: false,
            sessions: [],
        };

        render(
            <Provider store={store}>
                <ConferenceCard
                    conf={minimalConf}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        expect(screen.getByText('Minimal Conference')).toBeInTheDocument();
        expect(screen.queryByText(/phiên họp/i)).not.toBeInTheDocument();
    });

    test('truncates long conference name with line-clamp-2', () => {
        const longNameConf = {
            ...mockConferenceCard,
            conferenceName: 'Very Long Conference Name That Should Be Truncated After Two Lines',
        };

        const { container } = render(
            <Provider store={store}>
                <ConferenceCard
                    conf={longNameConf}
                    onConferenceClick={mockOnConferenceClick}
                />
            </Provider>
        );

        const nameElement = screen.getByText(longNameConf.conferenceName);
        expect(nameElement).toHaveClass('line-clamp-2');
    });
});

// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import SessionDetailDialog from './SessionDetailDialog';
// import { SessionDetailForScheduleResponse } from '@/types/conference.type';

// Mock hooks
jest.mock('@/redux/hooks/useTicket', () => ({
    useTicket: () => ({
        fetchTicketsByConference: jest.fn().mockResolvedValue({
            data: {
                items: [{ ticketId: 'ticket-1', isRefunded: false }],
            },
        }),
        loadingByConference: false,
        ticketsByConferenceError: null,
    }),
}));

jest.mock('@/redux/hooks/useAssigningPresenterSession', () => ({
    usePresenter: () => ({
        changeSession: jest.fn(),
        changePresenter: jest.fn(),
        loading: false,
        changeSessionError: null,
        changePresenterError: null,
    }),
}));

jest.mock('@/helper/conference', () => ({
    checkUserRole: jest.fn(() => ({
        isRootAuthor: false,
        isPresenter: false,
    })),
}));

const mockSessionDetailDialog: SessionDetailForScheduleResponse = {
    conferenceSessionId: 'session-1',
    conferenceId: 'conf-1',
    title: 'Opening Keynote',
    description: 'Welcome to the conference',
    startTime: '2024-12-20T09:00:00Z',
    endTime: '2024-12-20T10:00:00Z',
    roomDisplayName: 'Main Hall',
    roomNumber: 'A101',
    destinationName: 'Tech Center',
    destinationStreet: '123 Tech Street',
    destinationDistrict: 'Innovation District',
    cityName: 'Tech City',
    presenterAuthor: [
        {
            conferenceSessionId: 'session-1',
            paperId: 'paper-1',
            paperTitle: 'AI in Modern World',
            paperDescription: 'Research on AI',
            paperPhaseName: 'Accepted',
            paperAuthor: [
                {
                    userId: 'user-1',
                    fullName: 'John Doe',
                    avatarUrl: 'https://example.com/avatar1.jpg',
                    isRootAuthor: true,
                    isPresenter: true,
                    paperId: 'paper-1',
                },
                {
                    userId: 'user-2',
                    fullName: 'Jane Smith',
                    avatarUrl: null,
                    isRootAuthor: false,
                    isPresenter: false,
                    paperId: 'paper-1',
                },
            ],
        },
    ],
};

const createMockStoreDetailDialog = (userOverride = {}) => {
    return configureStore({
        reducer: {
            auth: () => ({
                user: {
                    userId: 'user-1',
                    fullName: 'Test User',
                    ...userOverride,
                },
            }),
        },
    });
};

describe('SessionDetailDialog Component', () => {
    const mockOnClose = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders nothing when closed', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={false}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.queryByText('Opening Keynote')).not.toBeInTheDocument();
    });

    test('renders session title when open', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Opening Keynote')).toBeInTheDocument();
    });

    test('renders session description', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Welcome to the conference')).toBeInTheDocument();
    });

    test('renders start and end times', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText(/Thời gian bắt đầu/)).toBeInTheDocument();
        expect(screen.getByText(/Thời gian kết thúc/)).toBeInTheDocument();
    });

    test('renders room information', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Phòng họp')).toBeInTheDocument();
        expect(screen.getByText('Main Hall')).toBeInTheDocument();
    });

    test('renders destination information', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Tech Center')).toBeInTheDocument();
        expect(screen.getByText(/123 Tech Street/)).toBeInTheDocument();
    });

    test('renders paper information', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('AI in Modern World')).toBeInTheDocument();
        expect(screen.getByText('Research on AI')).toBeInTheDocument();
        expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    test('renders author information', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('renders author badges correctly', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Tác giả chính')).toBeInTheDocument();
        expect(screen.getByText('Đồng tác giả')).toBeInTheDocument();
        expect(screen.getByText('Diễn giả cho bài báo này')).toBeInTheDocument();
    });

    test('renders author avatar when provided', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
    });

    test('calls onClose when close button is clicked', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        const closeButtons = screen.getAllByRole('button', { name: /đóng/i });
        fireEvent.click(closeButtons[0]);

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('renders back button when onBack prop is provided', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                    onBack={mockOnBack}
                />
            </Provider>
        );

        expect(screen.getByRole('button', { name: /quay lại/i })).toBeInTheDocument();
    });

    test('calls onBack when back button is clicked', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                    onBack={mockOnBack}
                />
            </Provider>
        );

        const backButton = screen.getByRole('button', { name: /quay lại/i });
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalled();
    });

    test('displays user role badges when user is root author', () => {
        const checkUserRole = require('@/helper/conference').checkUserRole;
        checkUserRole.mockReturnValue({ isRootAuthor: true, isPresenter: false });

        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Bạn là Tác giả gốc')).toBeInTheDocument();
    });

    test('displays user role badges when user is presenter', () => {
        const checkUserRole = require('@/helper/conference').checkUserRole;
        checkUserRole.mockReturnValue({ isRootAuthor: false, isPresenter: true });

        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={mockSessionDetailDialog}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Bạn là Diễn giả')).toBeInTheDocument();
    });

    test('handles session without optional fields', () => {
        const minimalSession: SessionDetailForScheduleResponse = {
            conferenceSessionId: 'session-2',
            conferenceId: 'conf-1',
            title: 'Minimal Session',
            presenterAuthor: [],
        };

        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={minimalSession}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Minimal Session')).toBeInTheDocument();
        expect(screen.queryByText(/Mô tả/)).not.toBeInTheDocument();
    });

    test('renders fallback title when session title is missing', () => {
        const sessionWithoutTitle = { ...mockSessionDetailDialog, title: undefined };
        const store = createMockStore();

        render(
            <Provider store={store}>
                <SessionDetailDialog
                    open={true}
                    session={sessionWithoutTitle as any}
                    sessionForChange={[]}
                    onClose={mockOnClose}
                />
            </Provider>
        );

        expect(screen.getByText('Chi tiết phiên họp')).toBeInTheDocument();
    });
});

// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import ConferenceCalendar from './ConferenceCalendar';

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => {
    return jest.fn(({ events }) => (
        <div data-testid="mock-calendar">
            {events?.map((event: any) => (
                <div key={event.id} data-testid={`calendar-event-${event.id}`}>
                    {event.title}
                </div>
            ))}
        </div>
    ));
});

// Mock các plugins
jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/timegrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));

// Mock components
// jest.mock('./ConferenceCard', () => {
//     return jest.fn(({ conf, onConferenceClick }) => (
//         <div
//             data-testid={`conference-card-${conf.conferenceId}`}
//             onClick={() => onConferenceClick(conf)}
//         >
//             <h3>{conf.conferenceName}</h3>
//             <p>{conf.description}</p>
//         </div>
//     ));
// });

// jest.mock('./SessionDetailDialog', () => {
//     return jest.fn(({ open, session, onClose }) => (
//         open ? (
//             <div data-testid="session-detail-dialog">
//                 <h2>{session?.title}</h2>
//                 <button onClick={onClose}>Close</button>
//             </div>
//         ) : null
//     ));
// });

// Mock hooks
const mockFetchOwnConferencesForSchedule = jest.fn();
jest.mock('@/redux/hooks/useConference', () => ({
    useConference: () => ({
        lazyOwnConferencesForSchedule: mockConferences,
        fetchOwnConferencesForSchedule: mockFetchOwnConferencesForSchedule,
        ownConferencesForScheduleLoading: false,
        ownConferencesForScheduleError: null,
    }),
}));

// Mock data
const mockConferences = [
    {
        conferenceId: 'conf-1',
        conferenceName: 'Tech Conference 2024',
        description: 'Annual tech conference',
        startDate: '2024-12-20T08:00:00Z',
        endDate: '2024-12-22T18:00:00Z',
        isResearchConference: false,
        conferenceCategoryName: 'Technology',
        sessions: [
            {
                conferenceSessionId: 'session-1',
                title: 'Opening Keynote',
                startTime: '2024-12-20T09:00:00Z',
                endTime: '2024-12-20T10:00:00Z',
                presenterAuthor: [],
            },
        ],
    },
    {
        conferenceId: 'conf-2',
        conferenceName: 'Research Symposium 2024',
        description: 'Research conference',
        startDate: '2024-12-25T08:00:00Z',
        endDate: '2024-12-27T18:00:00Z',
        isResearchConference: true,
        conferenceCategoryName: 'Research',
        sessions: [],
    },
];

// Mock store
const createMockStoreCalendar = () => {
    return configureStore({
        reducer: {
            auth: () => ({
                user: {
                    userId: 'user-1',
                    fullName: 'Test User',
                },
            }),
        },
    });
};

describe('ConferenceCalendar Component', () => {
    let store: any;

    beforeEach(() => {
        store = createMockStoreCalendar();
        jest.clearAllMocks();
    });

    test('renders main title and description', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        expect(screen.getByText('Lịch Hội nghị & Hội thảo')).toBeInTheDocument();
        expect(screen.getByText('Theo dõi và quản lý các sự kiện sắp tới')).toBeInTheDocument();
    });

    test('renders calendar component', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    });

    test('renders conference list header', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        expect(screen.getByText('Danh sách Hội nghị')).toBeInTheDocument();
    });

    test('renders tab buttons (Technical and Research)', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        const technicalTab = screen.getByRole('button', { name: /technical/i });
        const researchTab = screen.getByRole('button', { name: /research/i });

        expect(technicalTab).toBeInTheDocument();
        expect(researchTab).toBeInTheDocument();
    });

    test('Technical tab is active by default', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        const technicalTab = screen.getByRole('button', { name: /technical/i });
        expect(technicalTab).toHaveClass('bg-blue-600', 'text-white');
    });

    test('switches between tabs', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        const technicalTab = screen.getByRole('button', { name: /technical/i });
        const researchTab = screen.getByRole('button', { name: /research/i });

        // Click Research tab
        fireEvent.click(researchTab);
        expect(researchTab).toHaveClass('bg-blue-600', 'text-white');
        expect(technicalTab).toHaveClass('bg-gray-200');

        // Click Technical tab
        fireEvent.click(technicalTab);
        expect(technicalTab).toHaveClass('bg-blue-600', 'text-white');
        expect(researchTab).toHaveClass('bg-gray-200');
    });

    test('renders search input', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm hội nghị...');
        expect(searchInput).toBeInTheDocument();
    });

    test('updates search query on input', () => {
        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm hội nghị...') as HTMLInputElement;

        fireEvent.change(searchInput, { target: { value: 'Tech' } });
        expect(searchInput.value).toBe('Tech');
    });

    test('shows "no conferences" message when list is empty', () => {
        // Mock empty conferences
        jest.spyOn(require('@/redux/hooks/useConference'), 'useConference').mockReturnValue({
            lazyOwnConferencesForSchedule: [],
            fetchOwnConferencesForSchedule: jest.fn(),
            ownConferencesForScheduleLoading: false,
            ownConferencesForScheduleError: null,
        });

        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        expect(screen.getByText('Không tìm thấy hội nghị nào')).toBeInTheDocument();
    });

    test('renders loading state', () => {
        jest.spyOn(require('@/redux/hooks/useConference'), 'useConference').mockReturnValue({
            lazyOwnConferencesForSchedule: null,
            fetchOwnConferencesForSchedule: jest.fn(),
            ownConferencesForScheduleLoading: true,
            ownConferencesForScheduleError: null,
        });

        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        expect(screen.getByText('Đang tải lịch hội nghị...')).toBeInTheDocument();
    });

    test('renders error state', () => {
        jest.spyOn(require('@/redux/hooks/useConference'), 'useConference').mockReturnValue({
            lazyOwnConferencesForSchedule: null,
            fetchOwnConferencesForSchedule: jest.fn(),
            ownConferencesForScheduleLoading: false,
            ownConferencesForScheduleError: 'Error loading data',
        });

        render(
            <Provider store={store}>
                <ConferenceCalendar />
            </Provider>
        );

        expect(screen.getByText('Có lỗi xảy ra khi tải dữ liệu')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
    });
});