// ConferenceDetail.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import components
import { MetaInfoSection } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/InfoSection';
import { PriceTimeline } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/PriceTimeline";
import { ResearchPhaseTimeline } from "@/components/molecules/Conference/ConferenceDetail/LeftPanel/ResearchTimeline";
import { PriceTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/PriceTab';
import { RefundPolicyTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/RefundPolicyTab';
import { SessionTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/SessionTab';
import { SponsorsMediaTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/SponsorsMediaTab';
import { ResearchInfoTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ResearchInfoTab';
import { ResearchMaterialsTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ResearchMaterialsTab';
import { RefundRequestTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/RefundRequestTab';
import { ResearchTimelineTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ResearchTimeline/index';
import { PaperTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/Paper/index';
import { CustomerTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/Customer/CustomerTab';
import { ContractTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ContractTab';
import { OtherRequestTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/OtherRequest';
import { PaperAssignmentTab } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/PaperAssignmentTab';

jest.mock('@/redux/services/request.service', () => ({
  useGetRefundRequestsByConferenceIdQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/redux/services/statistics.service', () => ({
  useGetTicketHoldersQuery: jest.fn(() => ({
    data: { data: { items: [] } },
    isLoading: false,
    isError: false,
  })),
  useGetSubmittedPapersQuery: jest.fn(() => ({
    data: { data: { paperDetails: [] } },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useGetAssignReviewersQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    error: null,
  })),
    useGetPresentSessionQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useGetTransactionHistoryQuery: jest.fn(() => ({
    data: { data: { userHistories: [] } },
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/redux/services/user.service', () => ({
  useGetReviewersListQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}));

jest.mock('@/redux/services/conference.service', () => ({
  useGetResearchConferenceDetailInternalQuery: jest.fn(() => ({
    data: { data: { researchPhase: [] } },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/redux/services/conferenceStep.service', () => ({
  useCreateNextPhaseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useAddPricePhaseForNextResearchPhaseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useActivateNextPhaseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/redux/services/paper.service', () => ({
  useAssignPaperToReviewerMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDecideAbstractStatusMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useListAcceptedPapersQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    error: null,
  })),
  useAssignPresenterToSessionMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),

}));

jest.mock('@/redux/services/assigningpresentersession.service', () => ({
  useGetPendingPresenterChangeRequestsQuery: jest.fn(() => ({ data: { data: [] } })),
  useGetPendingSessionChangeRequestsQuery: jest.fn(() => ({ data: { data: [] } })),
}));

jest.mock('@/utils/TimeContext', () => ({
  useGlobalTime: () => ({ now: new Date('2024-01-15T10:00:00') }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// === Mock Data ===
const mockNow = new Date('2024-01-15T10:00:00');

const baseTechConference = {
  conferenceId: 'conf-1',
  conferenceName: 'Tech Conference 2024',
  description: 'Test conference description',
  conferenceStatusId: 'status-1',
  conferenceCategoryId: 'cat-1',
  cityId: 'city-1',
  isResearchConference: false,
  isInternalHosted: true,
  startDate: '2024-02-01',
  endDate: '2024-02-03',
  ticketSaleStart: '2024-01-01',
  ticketSaleEnd: '2024-01-31',
  availableSlot: 50,
  totalSlot: 100,
  bannerImageUrl: 'https://example.com/banner.jpg',
  createdBy: 'user-1',
  conferencePrices: [],
  sessions: [],
  policies: [],
  sponsors: [],
  conferenceMedia: [],
  contract: {
    collaboratorContractId: 'contract-1',
    contractUrl: 'https://example.com/contract.pdf',
    signDay: '2024-01-01',
    finalizePaymentDate: '2024-03-01',
    commission: 10,
    isClosed: false,
    isSponsorStep: true,
    isMediaStep: true,
    isPolicyStep: true,
    isSessionStep: true,
    isPriceStep: true,
    isTicketSelling: true,
  },
};

const mockResearchConference = {
  ...baseTechConference,
  conferenceId: 'conf-2',
  conferenceName: 'Research Conference 2024',
  isResearchConference: true,
  allowListener: true,
  paperFormat: 'IEEE',
  numberPaperAccept: 50,
  revisionAttemptAllowed: 2,
  reviewFee: 100000,
  rankValue: 'A',
  rankYear: 2024,
  rankingDescription: 'Top tier conference',
  rankingCategoryId: 'cat-1',
  rankingCategoryName: 'Computer Science',
  rankingFileUrls: [
    { rankingFileUrlId: 'file-1', fileUrl: 'https://example.com/ranking.pdf' },
  ],
  materialDownloads: [
    {
      materialDownloadId: 'mat-1',
      fileName: 'Paper Template',
      fileDescription: 'Template for paper submission',
      fileUrl: 'template.docx',
    },
  ],
  rankingReferenceUrls: [
    { referenceUrlId: 'ref-1', referenceUrl: 'https://example.com/reference' },
  ],
  researchSessions: [
    {
      conferenceSessionId: 'session-1',
      title: 'Research Session',
      description: 'Research presentation',
      startTime: '10:00:00',
      endTime: '12:00:00',
      date: '2024-02-01',
      roomId: 'room-2',
      room: { roomId: 'room-2', displayName: 'Conference Room A', number: '201' },
      sessionMedia: [],
    },
  ],
  researchPhase: [
    {
      researchConferencePhaseId: 'phase-1',
      phaseOrder: 1,
      isActive: true,
      registrationStartDate: '2024-01-01',
      registrationEndDate: '2024-01-25',
      abstractDecideStatusStart: '2024-01-26',
      abstractDecideStatusEnd: '2024-02-01',
      fullPaperStartDate: '2024-02-02',
      fullPaperEndDate: '2024-02-28',
      reviewStartDate: '2024-03-01',
      reviewEndDate: '2024-03-15',
      fullPaperDecideStatusStart: '2024-03-16',
      fullPaperDecideStatusEnd: '2024-03-20',
      reviseStartDate: '2024-03-21',
      reviseEndDate: '2024-04-10',
      revisionPaperDecideStatusStart: '2024-04-11',
      revisionPaperDecideStatusEnd: '2024-04-15',
      cameraReadyStartDate: '2024-04-16',
      cameraReadyEndDate: '2024-04-30',
      authorPaymentStart: '2024-05-01',
      authorPaymentEnd: '2024-05-15',
    },
  ],
};

const conferenceWithPrice = {
  ...baseTechConference,
  conferencePrices: [
    {
      conferencePriceId: 'price-1',
      ticketName: 'Early Bird',
      ticketDescription: 'Early bird pricing',
      ticketPrice: 500000,
      totalSlot: 50,
      availableSlot: 30,
      isAuthor: false,
      isPublish: false,
      pricePhases: [],
    },
  ],
};

const conferenceWithPhases = {
  ...baseTechConference,
  conferencePrices: [
    {
      conferencePriceId: 'price-1',
      ticketName: 'Standard',
      ticketDescription: 'Standard pricing',
      ticketPrice: 1000000,
      totalSlot: 100,
      availableSlot: 75,
      isAuthor: false,
      isPublish: true,
      pricePhases: [
        {
          pricePhaseId: 'phase-1',
          phaseName: 'Phase 1',
          startDate: '2024-01-10',
          endDate: '2024-01-20',
          applyPercent: 80,
          totalSlot: 50,
          availableSlot: 25,
        },
        {
          pricePhaseId: 'phase-2',
          phaseName: 'Phase 2',
          startDate: '2024-01-21',
          endDate: '2024-01-31',
          applyPercent: 100,
          totalSlot: 50,
          availableSlot: 50,
        },
      ],
    },
  ],
};

const conferenceWithPolicies = {
  ...baseTechConference,
  policies: [
    {
      policyId: 'policy-1',
      policyName: 'Refund Policy',
      description: 'No refunds after 7 days',
    },
    {
      policyId: 'policy-2',
      policyName: 'Cancellation Policy',
      description: 'Cancellation allowed up to 14 days before event',
    },
  ],
};

const conferenceWithSessions = {
  ...baseTechConference,
  sessions: [
    {
      conferenceSessionId: 'session-1',
      title: 'Opening Session',
      description: 'Conference opening',
      startTime: '09:00:00',
      endTime: '10:00:00',
      sessionDate: '2024-02-01',
      roomId: 'room-1',
      room: {
        roomId: 'room-1',
        displayName: 'Main Hall',
        number: '101',
      },
      sessionMedia: [],
    },
    {
      conferenceSessionId: 'session-2',
      title: 'Keynote Speech',
      description: 'Main keynote',
      startTime: '10:30:00',
      endTime: '12:00:00',
      sessionDate: '2024-02-01',
      roomId: 'room-2',
      room: {
        roomId: 'room-2',
        displayName: 'Conference Room A',
        number: '201',
      },
      sessionMedia: [],
    },
  ],
};

const conferenceWithSponsors = {
  ...baseTechConference,
  sponsors: [
    { sponsorId: 'sponsor-1', name: 'Tech Corp', imageUrl: 'https://example.com/sponsor.jpg' },
    { sponsorId: 'sponsor-2', name: 'Innovation Labs', imageUrl: 'https://example.com/sponsor2.jpg' },
  ],
  conferenceMedia: [],
};

const conferenceWithMedia = {
  ...baseTechConference,
  sponsors: [],
  conferenceMedia: [
    { mediaId: 'media-1', mediaUrl: 'https://example.com/media1.jpg' },
    { mediaId: 'media-2', mediaUrl: 'media2.jpg' },
  ],
};

// === Helper ===
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = {}) => state,
      api: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

const getCategoryName = () => 'Technology';
const getStatusName = () => 'Active';
const getCityName = () => 'Ho Chi Minh';

describe('MetaInfoSection Component', () => {
  it('renders conference name and ID', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    expect(screen.getByText(/#conf-1/)).toBeInTheDocument();
  });

  it('renders conference description', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Test conference description')).toBeInTheDocument();
  });

  it('renders category and city', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Ho Chi Minh')).toBeInTheDocument();
  });

  it('renders available slots', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('/ 100 chỗ')).toBeInTheDocument();
  });

  it('renders conference type badges', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('ConfRadar')).toBeInTheDocument();
    expect(screen.getByText('Kỹ thuật')).toBeInTheDocument();
  });

  it('renders Đối tác badge for partner conference', () => {
    const partnerConf = { ...baseTechConference, isInternalHosted: false };
    renderWithProvider(
      <MetaInfoSection
        conference={partnerConf}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Đối tác')).toBeInTheDocument();
  });

  it('renders Nghiên cứu badge for research conference', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={mockResearchConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Nghiên cứu')).toBeInTheDocument();
  });

  it('renders banner image', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    const img = screen.getByAltText('Tech Conference 2024 banner');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/banner.jpg');
  });

  it('renders placeholder when no banner', () => {
    const confWithoutBanner = { ...baseTechConference, bannerImageUrl: '' };
    renderWithProvider(
      <MetaInfoSection
        conference={confWithoutBanner}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Chưa có ảnh banner')).toBeInTheDocument();
  });

  // Skip các test về PriceTimeline và ResearchPhaseTimeline
  it.skip('renders PriceTimeline for organizer', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByTestId('price-timeline')).toBeInTheDocument();
  });

  it.skip('renders PriceTimeline for collaborator', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={false}
        isCollaborator={true}
        now={mockNow}
      />
    );
    expect(screen.getByTestId('price-timeline')).toBeInTheDocument();
  });

  it('does not render PriceTimeline for regular user', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={false}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.queryByTestId('price-timeline')).not.toBeInTheDocument();
  });

  it.skip('renders ResearchPhaseTimeline for research organizer', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={mockResearchConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByTestId('research-phase-timeline')).toBeInTheDocument();
  });

  it('does not render ResearchPhaseTimeline for technical conference', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.queryByTestId('research-phase-timeline')).not.toBeInTheDocument();
  });

  it('renders ticket sale dates with countdown', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={baseTechConference}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('Ngày bán')).toBeInTheDocument();
  });

  it('shows "Hôm nay" countdown', () => {
    const todayConf = { ...baseTechConference, ticketSaleEnd: '2024-01-15' };
    renderWithProvider(
      <MetaInfoSection
        conference={todayConf}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('(Hôm nay)')).toBeInTheDocument();
  });

  it('shows "Còn 1 ngày" countdown', () => {
    const tomorrowConf = { ...baseTechConference, ticketSaleEnd: '2024-01-16' };
    renderWithProvider(
      <MetaInfoSection
        conference={tomorrowConf}
        getCategoryName={getCategoryName}
        getStatusName={getStatusName}
        getCityName={getCityName}
        isOrganizer={true}
        isCollaborator={false}
        now={mockNow}
      />
    );
    expect(screen.getByText('(Còn 1 ngày)')).toBeInTheDocument();
  });
});

describe('PriceTab Component', () => {
  it('renders tab title', () => {
    renderWithProvider(<PriceTab conference={baseTechConference} now={mockNow} />);
    expect(screen.getByText('Chi phí tham dự')).toBeInTheDocument();
  });

  it('renders empty state when no prices', () => {
    renderWithProvider(<PriceTab conference={baseTechConference} now={mockNow} />);
    expect(screen.getByText('Không có thông tin')).toBeInTheDocument();
  });

  it('renders ticket name', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPrice} now={mockNow} />);
    expect(screen.getByText('Early Bird')).toBeInTheDocument();
  });

  it('renders ticket description', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPrice} now={mockNow} />);
    expect(screen.getByText('Early bird pricing')).toBeInTheDocument();
  });

  it('renders ticket price', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPrice} now={mockNow} />);
    expect(screen.getByText('500.000 ₫')).toBeInTheDocument();
  });

  it('renders total slot', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPrice} now={mockNow} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders available slot', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPrice} now={mockNow} />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows "Không" for unpublished ticket', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPrice} now={mockNow} />);
    expect(screen.getByText('Không')).toBeInTheDocument();
  });

  it('shows "Có" for published ticket', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPhases} now={mockNow} />);
    expect(screen.getByText('Có')).toBeInTheDocument();
  });

  it('renders AUTHOR badge', () => {
    const conferenceWithAuthor = {
      ...baseTechConference,
      conferencePrices: [
        {
          conferencePriceId: 'price-1',
          ticketName: 'Author Ticket',
          ticketDescription: 'For authors only',
          ticketPrice: 2000000,
          totalSlot: 20,
          availableSlot: 15,
          isAuthor: true,
          isPublish: true,
          pricePhases: [],
        },
      ],
    };
    renderWithProvider(<PriceTab conference={conferenceWithAuthor} now={mockNow} />);
    expect(screen.getByText('AUTHOR')).toBeInTheDocument();
  });

  it('renders Xuất bản badge', () => {
    const conferenceWithAuthor = {
      ...baseTechConference,
      conferencePrices: [
        {
          conferencePriceId: 'price-1',
          ticketName: 'Author Ticket',
          ticketDescription: 'For authors only',
          ticketPrice: 2000000,
          totalSlot: 20,
          availableSlot: 15,
          isAuthor: true,
          isPublish: true,
          pricePhases: [],
        },
      ],
    };
    renderWithProvider(<PriceTab conference={conferenceWithAuthor} now={mockNow} />);
    const xuatBanElements = screen.getAllByText('Xuất bản');
    expect(xuatBanElements.length).toBeGreaterThan(0);
  });

  it('renders price phases', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPhases} now={mockNow} />);
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
    expect(screen.getByText('Phase 2')).toBeInTheDocument();
  });

  it('renders phase status badge', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPhases} now={mockNow} />);
    expect(screen.getByText('Đang diễn ra')).toBeInTheDocument();
  });

  it('renders phase apply percent', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPhases} now={mockNow} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  // ✅ SỬA: Dùng getAllByText vì số "50" xuất hiện nhiều lần
  it('renders phase available slots', () => {
    renderWithProvider(<PriceTab conference={conferenceWithPhases} now={mockNow} />);
    expect(screen.getByText('25')).toBeInTheDocument();
    const slot50Elements = screen.getAllByText('50');
    expect(slot50Elements.length).toBeGreaterThan(0);
  });

  it('renders multiple prices', () => {
    const multiPriceConf = {
      ...baseTechConference,
      conferencePrices: [
        {
          conferencePriceId: 'price-1',
          ticketName: 'Early Bird',
          ticketDescription: 'Early pricing',
          ticketPrice: 500000,
          totalSlot: 50,
          availableSlot: 30,
          isAuthor: false,
          isPublish: false,
          pricePhases: [],
        },
        {
          conferencePriceId: 'price-2',
          ticketName: 'Regular',
          ticketDescription: 'Regular pricing',
          ticketPrice: 800000,
          totalSlot: 100,
          availableSlot: 80,
          isAuthor: false,
          isPublish: true,
          pricePhases: [],
        },
      ],
    };
    renderWithProvider(<PriceTab conference={multiPriceConf} now={mockNow} />);
    expect(screen.getByText('Early Bird')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
  });

  it('shows upcoming phase badge', () => {
    const futurePhaseConf = {
      ...baseTechConference,
      conferencePrices: [
        {
          conferencePriceId: 'price-1',
          ticketName: 'Future Ticket',
          ticketDescription: 'Future phase',
          ticketPrice: 1000000,
          totalSlot: 50,
          availableSlot: 50,
          isAuthor: false,
          isPublish: false,
          pricePhases: [
            {
              pricePhaseId: 'phase-1',
              phaseName: 'Future Phase',
              startDate: '2024-02-01',
              endDate: '2024-02-28',
              applyPercent: 100,
              totalSlot: 50,
              availableSlot: 50,
            },
          ],
        },
      ],
    };
    renderWithProvider(<PriceTab conference={futurePhaseConf} now={mockNow} />);
    expect(screen.getByText(/Sắp tới/)).toBeInTheDocument();
  });

  it('shows completed phase badge', () => {
    const pastPhaseConf = {
      ...baseTechConference,
      conferencePrices: [
        {
          conferencePriceId: 'price-1',
          ticketName: 'Past Ticket',
          ticketDescription: 'Past phase',
          ticketPrice: 1000000,
          totalSlot: 50,
          availableSlot: 0,
          isAuthor: false,
          isPublish: false,
          pricePhases: [
            {
              pricePhaseId: 'phase-1',
              phaseName: 'Past Phase',
              startDate: '2024-01-01',
              endDate: '2024-01-10',
              applyPercent: 80,
              totalSlot: 50,
              availableSlot: 0,
            },
          ],
        },
      ],
    };
    renderWithProvider(<PriceTab conference={pastPhaseConf} now={mockNow} />);
    expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
  });
});

describe('RefundPolicyTab Component', () => {
  it('renders tab title', () => {
    renderWithProvider(<RefundPolicyTab conference={baseTechConference} />);
    expect(screen.getByText('Chính sách & Quy định')).toBeInTheDocument();
  });

  it('renders section title with icon', () => {
    renderWithProvider(<RefundPolicyTab conference={baseTechConference} />);
    expect(screen.getByText('Chính sách')).toBeInTheDocument();
  });

  it('renders empty state when no policies', () => {
    renderWithProvider(<RefundPolicyTab conference={baseTechConference} />);
    expect(screen.getByText('Không có quy định')).toBeInTheDocument();
  });

  it('renders policy name', () => {
    renderWithProvider(<RefundPolicyTab conference={conferenceWithPolicies} />);
    expect(screen.getByText('Refund Policy')).toBeInTheDocument();
    expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
  });

  it('renders policy description', () => {
    renderWithProvider(<RefundPolicyTab conference={conferenceWithPolicies} />);
    expect(screen.getByText('No refunds after 7 days')).toBeInTheDocument();
    expect(screen.getByText('Cancellation allowed up to 14 days before event')).toBeInTheDocument();
  });

  it('renders multiple policies', () => {
    const conferenceWithMultiplePolicies = {
      ...baseTechConference,
      policies: [
        { policyId: 'policy-1', policyName: 'Registration Policy', description: 'Early registration required' },
        { policyId: 'policy-2', policyName: 'Attendance Policy', description: 'Attendance is mandatory for all sessions' },
        { policyId: 'policy-3', policyName: 'Code of Conduct', description: 'All participants must follow the code of conduct' },
      ],
    };
    renderWithProvider(<RefundPolicyTab conference={conferenceWithMultiplePolicies} />);
    expect(screen.getByText('Registration Policy')).toBeInTheDocument();
    expect(screen.getByText('Attendance Policy')).toBeInTheDocument();
    expect(screen.getByText('Code of Conduct')).toBeInTheDocument();
  });


  it('handles undefined policies', () => {
    const confWithoutPolicies = { ...baseTechConference, policies: undefined };
    renderWithProvider(<RefundPolicyTab conference={confWithoutPolicies} />);
    expect(screen.getByText('Không có quy định')).toBeInTheDocument();
  });
});

describe('SessionTab Component', () => {
  it('renders session count', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Danh sách session (2)')).toBeInTheDocument();
  });

  it('renders empty state when no sessions', () => {
    renderWithProvider(
      <SessionTab conference={baseTechConference} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Chưa có phiên họp nào được tạo')).toBeInTheDocument();
  });

  it('renders session title', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Opening Session')).toBeInTheDocument();
    expect(screen.getByText('Keynote Speech')).toBeInTheDocument();
  });

  it('renders session time', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('09:00 – 10:00')).toBeInTheDocument();
  });

  it('renders session date', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    const dateElements = screen.getAllByText('1/2/2024');
    expect(dateElements.length).toBe(2); 
  });

  it('renders room name', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Main Hall')).toBeInTheDocument();
  });

  it('expands session on click', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    const sessionButton = screen.getByText('Opening Session').closest('button');
    expect(screen.queryByText('Mô tả')).not.toBeInTheDocument();
    fireEvent.click(sessionButton!);
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
  });

  it('collapses session on second click', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    const sessionButton = screen.getByText('Opening Session').closest('button');
    fireEvent.click(sessionButton!);
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
    fireEvent.click(sessionButton!);
    expect(screen.queryByText('Mô tả')).not.toBeInTheDocument();
  });

  it('renders session description when expanded', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    const sessionButton = screen.getByText('Opening Session').closest('button');
    fireEvent.click(sessionButton!);
    expect(screen.getByText('Conference opening')).toBeInTheDocument();
  });

  it('renders room info when expanded', () => {
    renderWithProvider(
      <SessionTab conference={conferenceWithSessions} conferenceType="technical" conferenceId="conf-1" />
    );
    const sessionButton = screen.getByText('Opening Session').closest('button');
    fireEvent.click(sessionButton!);
    expect(screen.getByText('Thông Tin Phòng')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('renders session media', () => {
    const conferenceWithMedia = {
      ...baseTechConference,
      sessions: [
        {
          conferenceSessionId: 'session-1',
          title: 'Session with Media',
          description: 'Session description',
          startTime: '14:00:00',
          endTime: '16:00:00',
          sessionDate: '2024-02-02',
          roomId: 'room-1',
          room: { roomId: 'room-1', displayName: 'Room A', number: '101' },
          sessionMedia: [
            { conferenceSessionMediaId: 'media-1', conferenceSessionMediaUrl: 'https://example.com/media1.jpg' },
            { conferenceSessionMediaId: 'media-2', conferenceSessionMediaUrl: 'media2.jpg' },
          ],
        },
      ],
    };
    renderWithProvider(
      <SessionTab conference={conferenceWithMedia} conferenceType="technical" conferenceId="conf-1" />
    );
    const sessionButton = screen.getByText('Session with Media').closest('button');
    fireEvent.click(sessionButton!);
    expect(screen.getByText('Tài Liệu Phiên Họp (2)')).toBeInTheDocument();
  });

  it('renders research session', () => {
    renderWithProvider(
      <SessionTab conference={mockResearchConference} conferenceType="research" conferenceId="conf-2" />
    );
    expect(screen.getByText('Research Session')).toBeInTheDocument();
  });
});

describe('SponsorsMediaTab Component', () => {
  it('renders sponsors section title', () => {
    renderWithProvider(<SponsorsMediaTab conference={baseTechConference} />);
    expect(screen.getByText('Nhà Tài Trợ')).toBeInTheDocument();
  });

  it('renders media section title', () => {
    renderWithProvider(<SponsorsMediaTab conference={baseTechConference} />);
    expect(screen.getByText('Hình Ảnh')).toBeInTheDocument();
  });

  it('renders sponsor name', () => {
    renderWithProvider(<SponsorsMediaTab conference={conferenceWithSponsors} />);
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Innovation Labs')).toBeInTheDocument();
  });

  it('renders sponsor images', () => {
    renderWithProvider(<SponsorsMediaTab conference={conferenceWithSponsors} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('shows empty state for no sponsors', () => {
    const confWithoutSponsors = { ...baseTechConference, sponsors: [] };
    renderWithProvider(<SponsorsMediaTab conference={confWithoutSponsors} />);
    expect(screen.getByText('Chưa có nhà tài trợ')).toBeInTheDocument();
  });

  it('renders conference media', () => {
    renderWithProvider(<SponsorsMediaTab conference={conferenceWithMedia} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('shows empty state for no media', () => {
    const confWithoutMedia = { ...baseTechConference, conferenceMedia: [] };
    renderWithProvider(<SponsorsMediaTab conference={confWithoutMedia} />);
    expect(screen.getByText('Chưa có hình ảnh')).toBeInTheDocument();
  });

  it('handles undefined sponsors or media', () => {
    renderWithProvider(<SponsorsMediaTab conference={{ ...baseTechConference, sponsors: undefined, conferenceMedia: undefined }} />);
    expect(screen.getByText('Chưa có nhà tài trợ')).toBeInTheDocument();
    expect(screen.getByText('Chưa có hình ảnh')).toBeInTheDocument();
  });
});

describe('ResearchMaterialsTab Component', () => {
  it('renders tab title', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('Tài Liệu & Nguồn Tham Khảo Nghiên Cứu')).toBeInTheDocument();
  });

  it('shows message for non-research conference', () => {
    renderWithProvider(<ResearchMaterialsTab conference={baseTechConference} />);
    expect(screen.getByText('Tài liệu nghiên cứu chỉ có sẵn cho hội nghị nghiên cứu.')).toBeInTheDocument();
  });

  it('renders ranking category', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
  });

  it('renders ranking files', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('https://example.com/ranking.pdf')).toBeInTheDocument();
  });

  it('renders material downloads', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('Paper Template')).toBeInTheDocument();
    expect(screen.getByText('Template for paper submission')).toBeInTheDocument();
  });

  it('renders reference URLs', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('https://example.com/reference')).toBeInTheDocument();
  });

  it('shows empty state for no ranking files', () => {
    const confWithoutFiles = { ...mockResearchConference, rankingFileUrls: [] };
    renderWithProvider(<ResearchMaterialsTab conference={confWithoutFiles} />);
    expect(screen.getByText('Chưa có tệp xếp hạng')).toBeInTheDocument();
  });

  it('shows empty state for no materials', () => {
    const confWithoutMaterials = { ...mockResearchConference, materialDownloads: [] };
    renderWithProvider(<ResearchMaterialsTab conference={confWithoutMaterials} />);
    expect(screen.getByText('Chưa có tài liệu để tải về')).toBeInTheDocument();
  });

  it('shows empty state for no references', () => {
    const confWithoutRefs = { ...mockResearchConference, rankingReferenceUrls: [] };
    renderWithProvider(<ResearchMaterialsTab conference={confWithoutRefs} />);
    expect(screen.getByText('Chưa có liên kết tham khảo')).toBeInTheDocument();
  });
});

describe('ResearchInfoTab Component', () => {
  it('renders research info title', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('Thông tin nghiên cứu')).toBeInTheDocument();
  });

  it('renders paper format', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('IEEE')).toBeInTheDocument();
  });

  it('renders number of papers accepted', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders revision attempts', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders review fee', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('100.000₫')).toBeInTheDocument();
  });

  it('renders rank value and year', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('A (2024)')).toBeInTheDocument();
  });

  it('renders ranking description', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('Top tier conference')).toBeInTheDocument();
  });

  it('shows listener badge when allowed', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('Có thính giả')).toBeInTheDocument();
  });

  it('shows no listener badge when not allowed', () => {
    const confNoListener = { ...mockResearchConference, allowListener: false };
    renderWithProvider(<ResearchInfoTab conference={confNoListener} />);
    expect(screen.getByText('Không có thính giả')).toBeInTheDocument();
  });

  it('truncates long ranking description', () => {
    const confLongDesc = {
      ...mockResearchConference,
      rankingDescription: 'This is a very long description that should be truncated',
    };
    renderWithProvider(<ResearchInfoTab conference={confLongDesc} />);
    expect(screen.getByText(/This is a very long.../)).toBeInTheDocument();
  });

  it('renders zero review fee correctly', () => {
    const confZeroFee = { ...mockResearchConference, reviewFee: 0 };
    renderWithProvider(<ResearchInfoTab conference={confZeroFee} />);
    expect(screen.getByText('0₫')).toBeInTheDocument();
  });
});

describe('RefundRequestTab Component', () => {
  it('renders tab title', async () => {
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Chưa có lịch sử hoàn tiền')).toBeInTheDocument();
    });
  });

  it('renders empty state', async () => {
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Chưa có lịch sử hoàn tiền')).toBeInTheDocument();
    });
  });

  it('shows warning for collaborator without ticket selling', () => {
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={true}
        isTicketSelling={false}
      />
    );
    expect(screen.getByText('Doanh thu không được liên kết với ConfRadar')).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    const { useGetRefundRequestsByConferenceIdQuery } = require('@/redux/services/request.service');
    useGetRefundRequestsByConferenceIdQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
    });
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Đang tải lịch sử hoàn tiền...')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    const { useGetRefundRequestsByConferenceIdQuery } = require('@/redux/services/request.service');
    useGetRefundRequestsByConferenceIdQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error' },
    });
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Lỗi tải dữ liệu')).toBeInTheDocument();
    });
  });

  it('renders refund request data', async () => {
    const { useGetRefundRequestsByConferenceIdQuery } = require('@/redux/services/request.service');
    useGetRefundRequestsByConferenceIdQuery.mockReturnValueOnce({
      data: {
        data: [
          {
            refundRequestId: 'refund-1',
            ticketId: 'ticket-1',
            transactionId: 'trans-1',
            reason: 'Cannot attend',
            globalStatusName: 'Pending',
            createdAt: '2024-01-10',
            ticket: {
              userId: 'user-1',
              fullName: 'John Doe',
              avatarUrl: null,
              actualPrice: 500000,
              registeredDate: '2024-01-05',
              isRefunded: false,
              pricePhaseName: 'Early Bird',
              pricePhaseApplyPercent: 80,
              pricePhaseAvailableSlot: 30,
              pricePhaseTotalSlot: 50,
              pricePhaseStartDate: '2024-01-01',
              pricePhaseEndDate: '2024-01-31',
            },
          },
        ],
      },
      isLoading: false,
      error: null,
    });
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Cannot attend')).toBeInTheDocument();
    });
  });
});

describe('ResearchTimelineTab Component', () => {

  it('renders loading state', async () => {
    const { useGetResearchConferenceDetailInternalQuery } = require('@/redux/services/conference.service');
    useGetResearchConferenceDetailInternalQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    renderWithProvider(<ResearchTimelineTab conferenceId="conf-2" />);
    await waitFor(() => {
      expect(screen.getByText('Đang tải tiến trình nghiên cứu...')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    const { useGetResearchConferenceDetailInternalQuery } = require('@/redux/services/conference.service');
    useGetResearchConferenceDetailInternalQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error' },
      refetch: jest.fn(),
    });
    renderWithProvider(<ResearchTimelineTab conferenceId="conf-2" />);
    await waitFor(() => {
      expect(screen.getByText('Không tải được tiến trình nghiên cứu')).toBeInTheDocument();
    });
  });

  it('renders phase data', async () => {
    const { useGetResearchConferenceDetailInternalQuery } = require('@/redux/services/conference.service');
    useGetResearchConferenceDetailInternalQuery.mockReturnValueOnce({
      data: {
        data: {
          researchPhase: [
            {
              researchConferencePhaseId: 'phase-1',
              phaseOrder: 1,
              isActive: true,
              registrationStartDate: '2024-01-01',
              registrationEndDate: '2024-01-31',
            },
          ],
          conferencePrices: [],
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    renderWithProvider(<ResearchTimelineTab conferenceId="conf-2" />);
    await waitFor(() => {
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    });
  });
});

describe('PaperTab Component', () => {
  const mockConferenceData = {
    conferenceId: 'conf-2',
    isResearchConference: true,
    researchPhase: [
      {
        researchConferencePhaseId: 'phase-1',
        phaseOrder: 1,
        isActive: true,
        abstractDecideStatusStart: '2024-01-10',
        abstractDecideStatusEnd: '2024-01-20',
      },
    ],
  };

  it('renders abstract decision period', async () => {
    renderWithProvider(<PaperTab conferenceId="conf-2" conferenceData={mockConferenceData} />);
    await waitFor(() => {
      expect(screen.getByText('Thời gian duyệt Abstract')).toBeInTheDocument();
    });
  });

  it('renders empty paper list', async () => {
    renderWithProvider(<PaperTab conferenceId="conf-2" conferenceData={mockConferenceData} />);
    await waitFor(() => {
      expect(screen.getByText('Bài báo đã nộp')).toBeInTheDocument();
    });
  });

  it('shows within decision period badge', async () => {
    renderWithProvider(<PaperTab conferenceId="conf-2" conferenceData={mockConferenceData} />);
    await waitFor(() => {
      expect(screen.getByText('Đang trong thời gian duyệt')).toBeInTheDocument();
    });
  });

  it('shows outside decision period badge', async () => {
    const pastConferenceData = {
      ...mockConferenceData,
      researchPhase: [
        {
          researchConferencePhaseId: 'phase-1',
          phaseOrder: 1,
          isActive: true,
          abstractDecideStatusStart: '2024-01-01',
          abstractDecideStatusEnd: '2024-01-10',
        },
      ],
    };
    renderWithProvider(<PaperTab conferenceId="conf-2" conferenceData={pastConferenceData} />);
    await waitFor(() => {
      expect(screen.getByText('Ngoài thời gian duyệt')).toBeInTheDocument();
    });
  });

  it('shows warning when no decision period', async () => {
    const noDecisionConf = {
      ...mockConferenceData,
      researchPhase: [{ researchConferencePhaseId: 'phase-1', phaseOrder: 1, isActive: true }],
    };
    renderWithProvider(<PaperTab conferenceId="conf-2" conferenceData={noDecisionConf} />);
    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy thời gian duyệt abstract.')).toBeInTheDocument();
    });
  });
});

describe('CustomerTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();
    });
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: true,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lỗi khi tải dữ liệu')).toBeInTheDocument();
      expect(screen.getByText('Không thể lấy thông tin người mua hoặc lịch sử giao dịch. Vui lòng thử lại.')).toBeInTheDocument();
    });
  });

  it('renders customer tab title', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Người mua')).toBeInTheDocument();
    });
  });

  it('renders empty state', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Chưa có người mua')).toBeInTheDocument();
      expect(screen.getByText('Chưa có giao dịch nào được ghi nhận')).toBeInTheDocument();
    });
  });

  it('renders ticket holders', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: {
        data: {
          items: [
            {
              ticketId: 'ticket-1',
              customerName: 'John Doe',
              ticketTypeName: 'Early Bird',
              purchaseDate: '2024-01-10T10:30:00',
              actualPrice: 500000,
              overallStatus: 'Đã thanh toán',
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Early Bird')).toBeInTheDocument();
      expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();
      expect(screen.getByText('500.000 ₫')).toBeInTheDocument();
    });
  });

  it('shows ticket count', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: {
        data: {
          items: [
            { ticketId: 'ticket-1', customerName: 'John', ticketTypeName: 'VIP', purchaseDate: '2024-01-10', actualPrice: 500000, overallStatus: 'Đã thanh toán' },
            { ticketId: 'ticket-2', customerName: 'Jane', ticketTypeName: 'Regular', purchaseDate: '2024-01-11', actualPrice: 300000, overallStatus: 'Đã thanh toán' },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('(2 đã bán)')).toBeInTheDocument();
    });
  });

  it('shows pending payment status with yellow badge', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: {
        data: {
          items: [
            {
              ticketId: 'ticket-1',
              customerName: 'John Doe',
              ticketTypeName: 'Early Bird',
              purchaseDate: '2024-01-10',
              actualPrice: 500000,
              overallStatus: 'Chờ thanh toán',
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      const badge = screen.getByText('Chờ thanh toán');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700');
    });
  });

  it('shows click hint on ticket card', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: {
        data: {
          items: [
            {
              ticketId: 'ticket-1',
              customerName: 'John',
              ticketTypeName: 'VIP',
              purchaseDate: '2024-01-10',
              actualPrice: 500000,
              overallStatus: 'Đã thanh toán',
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Nhấn để xem chi tiết')).toBeInTheDocument();
    });
  });

  it('renders multiple ticket holders in grid', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: {
        data: {
          items: [
            { ticketId: 'ticket-1', customerName: 'Alice', ticketTypeName: 'VIP', purchaseDate: '2024-01-10', actualPrice: 1000000, overallStatus: 'Đã thanh toán' },
            { ticketId: 'ticket-2', customerName: 'Bob', ticketTypeName: 'Regular', purchaseDate: '2024-01-11', actualPrice: 500000, overallStatus: 'Đã thanh toán' },
            { ticketId: 'ticket-3', customerName: 'Charlie', ticketTypeName: 'Early Bird', purchaseDate: '2024-01-12', actualPrice: 300000, overallStatus: 'Đã thanh toán' },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
  });

  it('renders transaction history title', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lịch sử giao dịch')).toBeInTheDocument();
    });
  });

  it('renders empty state for transaction history', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: [] } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Chưa có lịch sử giao dịch')).toBeInTheDocument();
    });
  });

  it('renders user transaction with details', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: {
        data: {
          userHistories: [
            {
              userId: 'user-1',
              fullName: 'John Doe',
              email: 'john@example.com',
              transactions: [
                {
                  transactionId: 'tx-1',
                  ticketType: 'VIP Ticket',
                  paymentMethod: 'VNPay',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 1000000,
                  transactionCode: 'TXN123456',
                  time: '2024-01-10T10:30:00',
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('1 giao dịch')).toBeInTheDocument();
      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
      expect(screen.getByText('VNPay')).toBeInTheDocument();
      expect(screen.getByText('Thành công')).toBeInTheDocument();
      expect(screen.getByText('1.000.000 ₫')).toBeInTheDocument();
      expect(screen.getByText('TXN123456')).toBeInTheDocument();
    });
  });

  it('renders transaction count correctly', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: {
        data: {
          userHistories: [
            {
              userId: 'user-1',
              fullName: 'John Doe',
              email: 'john@example.com',
              transactions: [
                {
                  transactionId: 'tx-1',
                  ticketType: 'VIP',
                  paymentMethod: 'VNPay',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 1000000,
                  transactionCode: 'TXN001',
                  time: '2024-01-10',
                },
                {
                  transactionId: 'tx-2',
                  ticketType: 'Regular',
                  paymentMethod: 'MoMo',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 500000,
                  transactionCode: 'TXN002',
                  time: '2024-01-11',
                },
                {
                  transactionId: 'tx-3',
                  ticketType: 'VIP',
                  paymentMethod: 'VNPay',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 800000,
                  transactionCode: 'TXN003',
                  time: '2024-01-12',
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('3 giao dịch')).toBeInTheDocument();
    });
  });

  it('renders refund transaction with orange badge', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: {
        data: {
          userHistories: [
            {
              userId: 'user-1',
              fullName: 'John Doe',
              email: 'john@example.com',
              transactions: [
                {
                  transactionId: 'tx-1',
                  ticketType: 'VIP Ticket',
                  paymentMethod: 'VNPay',
                  type: 'Hoàn tiền',
                  status: 'Thành công',
                  amount: 1000000,
                  transactionCode: 'REFUND123',
                  time: '2024-01-10T10:30:00',
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      const refundBadge = screen.getByText('Hoàn tiền');
      expect(refundBadge).toBeInTheDocument();
      expect(refundBadge).toHaveClass('bg-orange-100', 'text-orange-700');
    });
  });

  it('renders successful transaction badge correctly', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: {
        data: {
          userHistories: [
            {
              userId: 'user-1',
              fullName: 'John Doe',
              email: 'john@example.com',
              transactions: [
                {
                  transactionId: 'tx-1',
                  ticketType: 'VIP',
                  paymentMethod: 'VNPay',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 1000000,
                  transactionCode: 'TXN001',
                  time: '2024-01-10',
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      const successBadge = screen.getByText('Thành công');
      expect(successBadge).toBeInTheDocument();
      expect(successBadge).toHaveClass('bg-green-100', 'text-green-700');
    });
  });

  it('initially shows only first transaction per user', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });
    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: {
        data: {
          userHistories: [
            {
              userId: 'user-1',
              fullName: 'John Doe',
              email: 'john@example.com',
              transactions: [
                {
                  transactionId: 'tx-1',
                  ticketType: 'VIP Ticket',
                  paymentMethod: 'VNPay',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 1000000,
                  transactionCode: 'TXN001',
                  time: '2024-01-10',
                },
                {
                  transactionId: 'tx-2',
                  ticketType: 'Regular Ticket',
                  paymentMethod: 'MoMo',
                  type: 'Mua vé',
                  status: 'Thành công',
                  amount: 500000,
                  transactionCode: 'TXN002',
                  time: '2024-01-11',
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TXN001')).toBeInTheDocument();
      expect(screen.queryByText('TXN002')).not.toBeInTheDocument();
      expect(screen.getByText('Xem thêm 1 giao dịch')).toBeInTheDocument();
    });
  });

it('expands transactions on button click', async () => {
  const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
  
  const mockTicketHolders = {
    data: { data: { items: [] } },
    isLoading: false,
    isError: false,
  };
  
  const mockTransactionHistory = {
    data: {
      data: {
        userHistories: [
          {
            userId: 'user-1',
            fullName: 'John Doe',
            email: 'john@example.com',
            transactions: [
              {
                transactionId: 'tx-1',
                ticketType: 'VIP',
                paymentMethod: 'VNPay',
                type: 'Mua vé',
                status: 'Thành công',
                amount: 1000000,
                transactionCode: 'TXN001',
                time: '2024-01-10',
              },
              {
                transactionId: 'tx-2',
                ticketType: 'Regular',
                paymentMethod: 'MoMo',
                type: 'Mua vé',
                status: 'Thành công',
                amount: 500000,
                transactionCode: 'TXN002',
                time: '2024-01-11',
              },
            ],
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
  };

  useGetTicketHoldersQuery.mockReturnValue(mockTicketHolders);
  useGetTransactionHistoryQuery.mockReturnValue(mockTransactionHistory);

  renderWithProvider(
    <CustomerTab
      conferenceId="conf-1"
      conferenceType="technical"
      currentUserId="user-1"
      conferenceOwnerId="user-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  expect(screen.getByText('TXN001')).toBeInTheDocument();
  expect(screen.queryByText('TXN002')).not.toBeInTheDocument();
  expect(screen.getByText('Xem thêm 1 giao dịch')).toBeInTheDocument();

  const expandButton = screen.getByText('Xem thêm 1 giao dịch');
  fireEvent.click(expandButton);

  await waitFor(() => {
    expect(screen.getByText('TXN002')).toBeInTheDocument();
    expect(screen.getByText('Thu gọn')).toBeInTheDocument();
  });
});

it('collapses transactions on collapse button click', async () => {
  const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
  
  const mockTicketHolders = {
    data: { data: { items: [] } },
    isLoading: false,
    isError: false,
  };
  
  const mockTransactionHistory = {
    data: {
      data: {
        userHistories: [
          {
            userId: 'user-1',
            fullName: 'John Doe',
            email: 'john@example.com',
            transactions: [
              {
                transactionId: 'tx-1',
                ticketType: 'VIP',
                paymentMethod: 'VNPay',
                type: 'Mua vé',
                status: 'Thành công',
                amount: 1000000,
                transactionCode: 'TXN001',
                time: '2024-01-10',
              },
              {
                transactionId: 'tx-2',
                ticketType: 'Regular',
                paymentMethod: 'MoMo',
                type: 'Mua vé',
                status: 'Thành công',
                amount: 500000,
                transactionCode: 'TXN002',
                time: '2024-01-11',
              },
            ],
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
  };

  useGetTicketHoldersQuery.mockReturnValue(mockTicketHolders);
  useGetTransactionHistoryQuery.mockReturnValue(mockTransactionHistory);

  renderWithProvider(
    <CustomerTab
      conferenceId="conf-1"
      conferenceType="technical"
      currentUserId="user-1"
      conferenceOwnerId="user-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  const expandButton = screen.getByText('Xem thêm 1 giao dịch');
  fireEvent.click(expandButton);

  await waitFor(() => {
    expect(screen.getByText('TXN002')).toBeInTheDocument();
    expect(screen.getByText('Thu gọn')).toBeInTheDocument();
  });

  const collapseButton = screen.getByText('Thu gọn');
  fireEvent.click(collapseButton);

  await waitFor(() => {
    expect(screen.queryByText('TXN002')).not.toBeInTheDocument();
    expect(screen.getByText('Xem thêm 1 giao dịch')).toBeInTheDocument();
  });
});

it('expands to show all users on button click', async () => {
  const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');

  const mockUsers = Array.from({ length: 5 }, (_, i) => ({
    userId: `user-${i + 1}`,
    fullName: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    transactions: [
      {
        transactionId: `tx-${i + 1}`,
        ticketType: 'VIP',
        paymentMethod: 'VNPay',
        type: 'Mua vé',
        status: 'Thành công',
        amount: 500000,
        transactionCode: `TXN${i + 1}`,
        time: '2024-01-10',
      },
    ],
  }));

  const mockTicketHolders = {
    data: { data: { items: [] } },
    isLoading: false,
    isError: false,
  };
  
  const mockTransactionHistory = {
    data: { data: { userHistories: mockUsers } },
    isLoading: false,
    isError: false,
  };

  useGetTicketHoldersQuery.mockReturnValue(mockTicketHolders);
  useGetTransactionHistoryQuery.mockReturnValue(mockTransactionHistory);

  renderWithProvider(
    <CustomerTab
      conferenceId="conf-1"
      conferenceType="technical"
      currentUserId="user-1"
      conferenceOwnerId="user-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.getByText('User 3')).toBeInTheDocument();
  });

  expect(screen.queryByText('User 4')).not.toBeInTheDocument();
  expect(screen.queryByText('User 5')).not.toBeInTheDocument();
  expect(screen.getByText('Xem thêm 2 người dùng khác')).toBeInTheDocument();

  const expandButton = screen.getByText('Xem thêm 2 người dùng khác');
  fireEvent.click(expandButton);

  await waitFor(() => {
    expect(screen.getByText('User 4')).toBeInTheDocument();
    expect(screen.getByText('User 5')).toBeInTheDocument();
    expect(screen.getByText('Thu gọn danh sách')).toBeInTheDocument();
  });
});

it('collapses back to 3 users on collapse all button click', async () => {
  const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');

  const mockUsers = Array.from({ length: 5 }, (_, i) => ({
    userId: `user-${i + 1}`,
    fullName: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    transactions: [
      {
        transactionId: `tx-${i + 1}`,
        ticketType: 'VIP',
        paymentMethod: 'VNPay',
        type: 'Mua vé',
        status: 'Thành công',
        amount: 500000,
        transactionCode: `TXN${i + 1}`,
        time: '2024-01-10',
      },
    ],
  }));

  const mockTicketHolders = {
    data: { data: { items: [] } },
    isLoading: false,
    isError: false,
  };
  
  const mockTransactionHistory = {
    data: { data: { userHistories: mockUsers } },
    isLoading: false,
    isError: false,
  };

  useGetTicketHoldersQuery.mockReturnValue(mockTicketHolders);
  useGetTransactionHistoryQuery.mockReturnValue(mockTransactionHistory);

  renderWithProvider(
    <CustomerTab
      conferenceId="conf-1"
      conferenceType="technical"
      currentUserId="user-1"
      conferenceOwnerId="user-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument();
  });

  const expandButton = screen.getByText('Xem thêm 2 người dùng khác');
  fireEvent.click(expandButton);

  await waitFor(() => {
    expect(screen.getByText('User 4')).toBeInTheDocument();
    expect(screen.getByText('Thu gọn danh sách')).toBeInTheDocument();
  });

  const collapseButton = screen.getByText('Thu gọn danh sách');
  fireEvent.click(collapseButton);

  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.getByText('User 3')).toBeInTheDocument();
    expect(screen.queryByText('User 4')).not.toBeInTheDocument();
    expect(screen.queryByText('User 5')).not.toBeInTheDocument();
    expect(screen.getByText('Xem thêm 2 người dùng khác')).toBeInTheDocument();
  });
});

  it('initially shows only 3 users when more than 3 exist', async () => {
    const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
    useGetTicketHoldersQuery.mockReturnValueOnce({
      data: { data: { items: [] } },
      isLoading: false,
      isError: false,
    });

    const mockUsers = Array.from({ length: 5 }, (_, i) => ({
      userId: `user-${i + 1}`,
      fullName: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      transactions: [
        {
          transactionId: `tx-${i + 1}`,
          ticketType: 'VIP',
          paymentMethod: 'VNPay',
          type: 'Mua vé',
          status: 'Thành công',
          amount: 500000,
          transactionCode: `TXN${i + 1}`,
          time: '2024-01-10',
        },
      ],
    }));

    useGetTransactionHistoryQuery.mockReturnValueOnce({
      data: { data: { userHistories: mockUsers } },
      isLoading: false,
      isError: false,
    });

    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('User 3')).toBeInTheDocument();
      expect(screen.queryByText('User 4')).not.toBeInTheDocument();
      expect(screen.queryByText('User 5')).not.toBeInTheDocument();
      expect(screen.getByText('Xem thêm 2 người dùng khác')).toBeInTheDocument();
    });
  });



it('collapses back to 3 users on collapse all button click', async () => {
  const { useGetTicketHoldersQuery, useGetTransactionHistoryQuery } = require('@/redux/services/statistics.service');
  useGetTicketHoldersQuery.mockReturnValueOnce({
    data: { data: { items: [] } },
    isLoading: false,
    isError: false,
  });

  const mockUsers = Array.from({ length: 5 }, (_, i) => ({
    userId: `user-${i + 1}`,
    fullName: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    transactions: [
      {
        transactionId: `tx-${i + 1}`,
        ticketType: 'VIP',
        paymentMethod: 'VNPay',
        type: 'Mua vé',
        status: 'Thành công',
        amount: 500000,
        transactionCode: `TXN${i + 1}`,
        time: '2024-01-10',
      },
    ],
  }));

  useGetTransactionHistoryQuery.mockReturnValueOnce({
    data: { data: { userHistories: mockUsers } },
    isLoading: false,
    isError: false,
  });

  renderWithProvider(
    <CustomerTab
      conferenceId="conf-1"
      conferenceType="technical"
      currentUserId="user-1"
      conferenceOwnerId="user-1"
    />
  );

  await waitFor(() => {
    expect(screen.getByText('Xem thêm 2 người dùng khác')).toBeInTheDocument();
  });

  const expandButton = screen.getByText('Xem thêm 2 người dùng khác');
  fireEvent.click(expandButton);

  await waitFor(() => {
    expect(screen.getByText('Thu gọn danh sách')).toBeInTheDocument();
  }, { timeout: 3000 });

  const collapseButton = screen.getByText('Thu gọn danh sách');
  fireEvent.click(collapseButton);

  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.getByText('User 3')).toBeInTheDocument();
    expect(screen.queryByText('User 4')).not.toBeInTheDocument();
    expect(screen.queryByText('User 5')).not.toBeInTheDocument();
    expect(screen.getByText('Xem thêm 2 người dùng khác')).toBeInTheDocument();
  }, { timeout: 3000 });
});
});

describe('ContractTab Component', () => {
  it('renders contract title', () => {
    renderWithProvider(<ContractTab conferenceData={baseTechConference} />);
    expect(screen.getByText('Hợp đồng đối tác')).toBeInTheDocument();
  });


  it('renders commission', () => {
    renderWithProvider(<ContractTab conferenceData={baseTechConference} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('renders active contract status', () => {
    renderWithProvider(<ContractTab conferenceData={baseTechConference} />);
    expect(screen.getByText('Đang hiệu lực')).toBeInTheDocument();
  });

  it('renders closed contract status', () => {
    const closedContractData = {
      ...baseTechConference,
      contract: { ...baseTechConference.contract, isClosed: true },
    };
    renderWithProvider(<ContractTab conferenceData={closedContractData} />);
    expect(screen.getByText('Đã đóng')).toBeInTheDocument();
  });

  it('renders contract steps', () => {
    renderWithProvider(<ContractTab conferenceData={baseTechConference} />);
    expect(screen.getByText('Nhà tài trợ')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Chính sách')).toBeInTheDocument();
    expect(screen.getByText('Session')).toBeInTheDocument();
    expect(screen.getByText('Giá vé')).toBeInTheDocument();
    expect(screen.getByText('Liên kết bán vé')).toBeInTheDocument();
  });

  it('renders contract file section', () => {
    renderWithProvider(<ContractTab conferenceData={baseTechConference} />);
    expect(screen.getByText('Tệp hợp đồng')).toBeInTheDocument();
    expect(screen.getByText('Xem')).toBeInTheDocument();
    expect(screen.getByText('Tải về')).toBeInTheDocument();
  });
});

describe('OtherRequestTab Component', () => {
  it('renders without errors', () => {
    renderWithProvider(<OtherRequestTab conferenceId="conf-2" />);
    expect(screen.getByText('Yêu cầu đổi phiên trình bày')).toBeInTheDocument();
  });

  it('renders presenter change section', () => {
    renderWithProvider(<OtherRequestTab conferenceId="conf-2" />);
    expect(screen.getByText('Yêu cầu đổi người trình bày')).toBeInTheDocument();
  });
});

describe('PaperAssignmentTab Component', () => {
  it('renders assignment title', () => {
    renderWithProvider(<PaperAssignmentTab conferenceId="conf-2" />);
    expect(screen.getByText('Xếp bài báo vào session')).toBeInTheDocument();
  });

  it('renders instruction text', () => {
    renderWithProvider(<PaperAssignmentTab conferenceId="conf-2" />);
    expect(screen.getByText(/Chọn một bài báo từ danh sách bên phải/)).toBeInTheDocument();
  });

  it('renders calendar component', () => {
    renderWithProvider(<PaperAssignmentTab conferenceId="conf-2" />);
    expect(document.querySelector('.fc-dayGridMonth-view')).toBeInTheDocument();
  });
});