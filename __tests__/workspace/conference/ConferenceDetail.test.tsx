import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import components
import { MetaInfoSection } from '@/components/molecules/Conference/ConferenceDetail/LeftPanel/InfoSection';
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

const mockNow = new Date('2024-01-15');

const mockTechConference = {
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
      pricePhases: [
        {
          pricePhaseId: 'phase-1',
          phaseName: 'Phase 1',
          startDate: '2024-01-10',
          endDate: '2024-01-20',
          applyPercent: 80,
          totalSlot: 25,
          availableSlot: 15,
        },
      ],
    },
  ],
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
  ],
  policies: [
    {
      policyId: 'policy-1',
      policyName: 'Refund Policy',
      description: 'No refunds after 7 days',
    },
  ],
  sponsors: [
    {
      sponsorId: 'sponsor-1',
      name: 'Tech Corp',
      imageUrl: 'https://example.com/sponsor.jpg',
    },
  ],
  conferenceMedia: [
    {
      mediaId: 'media-1',
      mediaUrl: 'https://example.com/media.jpg',
    },
  ],
  conferenceTimelines: [],
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
  ...mockTechConference,
  conferenceId: 'conf-2',
  conferenceName: 'Research Conference 2024',
  isResearchConference: true,
  allowListener: true,
  paperFormat: 'IEEE',
  numberPaperAccept: 50,
  revisionAttemptAllowed: 2,
  reviewFee: 100000,
  rankValue: 'A',
  rankYear: '2024',
  rankingDescription: 'Top tier conference',
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
      conferenceSessionId: 'session-2',
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
      registrationEndDate: '2024-01-31',
      abstractDecideStatusStart: '2024-02-01',
      abstractDecideStatusEnd: '2024-02-15',
      fullPaperStartDate: '2024-02-16',
      fullPaperEndDate: '2024-03-15',
      reviewStartDate: '2024-03-16',
      reviewEndDate: '2024-04-15',
      fullPaperDecideStatusStart: '2024-04-16',
      fullPaperDecideStatusEnd: '2024-04-30',
      reviseStartDate: '2024-05-01',
      reviseEndDate: '2024-05-31',
      revisionPaperDecideStatusStart: '2024-06-01',
      revisionPaperDecideStatusEnd: '2024-06-15',
      cameraReadyStartDate: '2024-06-16',
      cameraReadyEndDate: '2024-06-30',
      authorPaymentStart: '2024-07-01',
      authorPaymentEnd: '2024-07-15',
    },
  ],
};

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
    error: null,
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
}));

jest.mock('@/redux/services/user.service', () => ({
  useGetReviewersListQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}));

jest.mock('@/redux/services/conference.service', () => ({
  useGetResearchConferenceDetailInternalQuery: jest.fn(() => ({
    data: { data: mockResearchConference },
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
}));

jest.mock('@/redux/services/assigningpresentersession.service', () => ({
  useGetPendingPresenterChangeRequestsQuery: jest.fn(() => ({ data: { data: [] } })),
  useGetPendingSessionChangeRequestsQuery: jest.fn(() => ({ data: { data: [] } })),
}));

jest.mock('@/utils/TimeContext', () => ({
  useGlobalTime: () => ({ now: mockNow }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

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

const getCategoryName = (id: string) => 'Technology';
const getStatusName = (id: string) => 'Active';
const getCityName = (id: string) => 'Ho Chi Minh';

describe('MetaInfoSection Component', () => {
  it('renders conference name and id', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={mockTechConference}
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
        conference={mockTechConference}
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
        conference={mockTechConference}
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
        conference={mockTechConference}
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
        conference={mockTechConference}
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

  it('renders banner image', () => {
    renderWithProvider(
      <MetaInfoSection
        conference={mockTechConference}
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
  });
});

describe('PriceTab Component', () => {
  it('renders price tab title', () => {
    renderWithProvider(<PriceTab conference={mockTechConference} now={mockNow} />);
    expect(screen.getByText('Chi phí tham dự')).toBeInTheDocument();
  });

  it('renders ticket name and price', () => {
    renderWithProvider(<PriceTab conference={mockTechConference} now={mockNow} />);
    expect(screen.getByText('Early Bird')).toBeInTheDocument();
    expect(screen.getByText('500.000₫')).toBeInTheDocument();
  });

  it('renders ticket slots', () => {
    renderWithProvider(<PriceTab conference={mockTechConference} now={mockNow} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders price phases', () => {
    renderWithProvider(<PriceTab conference={mockTechConference} now={mockNow} />);
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('renders empty state when no prices', () => {
    const emptyConf = { ...mockTechConference, conferencePrices: [] };
    renderWithProvider(<PriceTab conference={emptyConf} now={mockNow} />);
    expect(screen.getByText('Không có thông tin')).toBeInTheDocument();
  });
});

describe('RefundPolicyTab Component', () => {
  it('renders tab title', () => {
    renderWithProvider(<RefundPolicyTab conference={mockTechConference} />);
    expect(screen.getByText('Chính sách & Quy định')).toBeInTheDocument();
  });

  it('renders policy name and description', () => {
    renderWithProvider(<RefundPolicyTab conference={mockTechConference} />);
    expect(screen.getByText('Refund Policy')).toBeInTheDocument();
    expect(screen.getByText('No refunds after 7 days')).toBeInTheDocument();
  });

  it('renders empty state when no policies', () => {
    const emptyConf = { ...mockTechConference, policies: [] };
    renderWithProvider(<RefundPolicyTab conference={emptyConf} />);
    expect(screen.getByText('Không có quy định')).toBeInTheDocument();
  });
});

describe('SessionTab Component', () => {
  it('renders session count', () => {
    renderWithProvider(
      <SessionTab conference={mockTechConference} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText(/Danh sách session \(1\)/)).toBeInTheDocument();
  });

  it('renders session title', () => {
    renderWithProvider(
      <SessionTab conference={mockTechConference} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Opening Session')).toBeInTheDocument();
  });

  it('renders session room', () => {
    renderWithProvider(
      <SessionTab conference={mockTechConference} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Main Hall')).toBeInTheDocument();
  });

  it('renders empty state when no sessions', () => {
    const emptyConf = { ...mockTechConference, sessions: [] };
    renderWithProvider(
      <SessionTab conference={emptyConf} conferenceType="technical" conferenceId="conf-1" />
    );
    expect(screen.getByText('Chưa có phiên họp nào được tạo')).toBeInTheDocument();
  });
});

describe('SponsorsMediaTab Component', () => {
  it('renders sponsors section title', () => {
    renderWithProvider(<SponsorsMediaTab conference={mockTechConference} />);
    expect(screen.getByText('Nhà Tài Trợ')).toBeInTheDocument();
  });

  it('renders sponsor name', () => {
    renderWithProvider(<SponsorsMediaTab conference={mockTechConference} />);
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('renders media section title', () => {
    renderWithProvider(<SponsorsMediaTab conference={mockTechConference} />);
    expect(screen.getByText('Hình Ảnh')).toBeInTheDocument();
  });

  it('renders empty state for sponsors', () => {
    const emptyConf = { ...mockTechConference, sponsors: [] };
    renderWithProvider(<SponsorsMediaTab conference={emptyConf} />);
    expect(screen.getByText('Chưa có nhà tài trợ')).toBeInTheDocument();
  });

  it('renders empty state for media', () => {
    const emptyConf = { ...mockTechConference, conferenceMedia: [] };
    renderWithProvider(<SponsorsMediaTab conference={emptyConf} />);
    expect(screen.getByText('Chưa có hình ảnh')).toBeInTheDocument();
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

  it('renders listener badge', () => {
    renderWithProvider(<ResearchInfoTab conference={mockResearchConference} />);
    expect(screen.getByText('Có thính giả')).toBeInTheDocument();
  });
});

describe('ResearchMaterialsTab Component', () => {
  it('renders tab title', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('Tài Liệu & Nguồn Tham Khảo Nghiên Cứu')).toBeInTheDocument();
  });

  it('renders ranking category', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
  });

  it('renders material download', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockResearchConference} />);
    expect(screen.getByText('Paper Template')).toBeInTheDocument();
  });

  it('renders empty states for non-research conference', () => {
    renderWithProvider(<ResearchMaterialsTab conference={mockTechConference} />);
    expect(screen.getByText('Tài liệu nghiên cứu chỉ có sẵn cho hội nghị nghiên cứu.')).toBeInTheDocument();
  });
});

describe('RefundRequestTab Component', () => {
  it('renders tab title', () => {
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    expect(screen.getByText('Lịch sử hoàn tiền')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    renderWithProvider(
      <RefundRequestTab
        conferenceId="conf-1"
        conferenceType="technical"
        isCollaborator={false}
        isTicketSelling={true}
      />
    );
    expect(screen.getByText('Chưa có lịch sử hoàn tiền')).toBeInTheDocument();
  });
});

describe('ResearchTimelineTab Component', () => {
  it('renders timeline title', () => {
    renderWithProvider(<ResearchTimelineTab conferenceId="conf-2" />);
    expect(screen.getByText('Timeline Nghiên cứu')).toBeInTheDocument();
  });

  it('renders phase number', () => {
    renderWithProvider(<ResearchTimelineTab conferenceId="conf-2" />);
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
  });

  it('renders active status', () => {
    renderWithProvider(<ResearchTimelineTab conferenceId="conf-2" />);
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
  });
});

describe('PaperTab Component', () => {
  it('renders abstract decision period', () => {
    renderWithProvider(
      <PaperTab conferenceId="conf-2" conferenceData={mockResearchConference} />
    );
    expect(screen.getByText('Thời gian duyệt Abstract')).toBeInTheDocument();
  });

  it('renders empty paper list', () => {
    renderWithProvider(
      <PaperTab conferenceId="conf-2" conferenceData={mockResearchConference} />
    );
    expect(screen.getByText('Danh sách bài báo')).toBeInTheDocument();
  });
});

describe('CustomerTab Component', () => {
  it('renders customer tab title', () => {
    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );
    expect(screen.getByText('Người mua')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    renderWithProvider(
      <CustomerTab
        conferenceId="conf-1"
        conferenceType="technical"
        currentUserId="user-1"
        conferenceOwnerId="user-1"
      />
    );
    expect(screen.getByText('Chưa có người mua')).toBeInTheDocument();
  });
});

describe('ContractTab Component', () => {
  it('renders contract title', () => {
    renderWithProvider(<ContractTab conferenceData={mockTechConference} />);
    expect(screen.getByText('Hợp đồng đối tác')).toBeInTheDocument();
  });

  it('renders commission', () => {
    renderWithProvider(<ContractTab conferenceData={mockTechConference} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('renders contract status', () => {
    renderWithProvider(<ContractTab conferenceData={mockTechConference} />);
    expect(screen.getByText('Đang hiệu lực')).toBeInTheDocument();
  });
});

describe('OtherRequestTab Component', () => {
  it('renders without errors', () => {
    renderWithProvider(<OtherRequestTab conferenceId="conf-2" />);
    expect(screen.getByText('Yêu cầu đổi Session')).toBeInTheDocument();
  });
});

describe('PaperAssignmentTab Component', () => {
  it('renders assignment title', () => {
    renderWithProvider(<PaperAssignmentTab conferenceId="conf-2" />);
    expect(screen.getByText('Xếp bài báo vào session')).toBeInTheDocument();
  });

  it('renders instruction text', () => {
    renderWithProvider(<PaperAssignmentTab conferenceId="conf-2" />);
    expect(
      screen.getByText(/Chọn một bài báo từ danh sách bên phải/)
    ).toBeInTheDocument();
  });
});