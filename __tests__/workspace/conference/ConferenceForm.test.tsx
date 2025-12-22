import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ResearchConferenceStepForm from '@/components/molecules/Conference/ConferenceForm/research/index';
import { ResearchBasicInfoForm } from '@/components/molecules/Conference/ConferenceStep/forms/research/ResearchBasicInfoForm';
import { ResearchDetailForm } from '@/components/molecules/Conference/ConferenceStep/forms/research/ResearchDetailForm';
import { ResearchPhaseForm } from '@/components/molecules/Conference/ConferenceStep/forms/research/ResearchPhaseForm';
import { ResearchPriceForm } from '@/components/molecules/Conference/ConferenceStep/forms/research/ResearchPriceForm';
import { PolicyForm } from '@/components/molecules/Conference/ConferenceStep/forms/PolicyForm';
import { MaterialsForm } from '@/components/molecules/Conference/ConferenceStep/forms/research/MaterialsForm';
import { MediaForm } from '@/components/molecules/Conference/ConferenceStep/forms/MediaForm';
import { SponsorForm } from '@/components/molecules/Conference/ConferenceStep/forms/SponsorForm';
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
  })),
}));
const mockApi = {
  reducerPath: 'conferenceApi',
  reducer: (state: any = {}) => state,
  middleware: (store: any) => (next: any) => (action: any) => next(action),
  util: {
    resetApiState: jest.fn(),
  },
  endpoints: {},
};
const mockDestinationApi = {
  reducerPath: 'destinationApi',
  reducer: (state: any = {}) => state,
  middleware: (store: any) => (next: any) => (action: any) => next(action),
  util: { resetApiState: jest.fn() },
  endpoints: {},
};
const createMockStore = (currentStep = 1) => {
  return configureStore({
    reducer: {
      conferenceStep: (state: any = {
        currentStep,
        activeStep: currentStep,
        completedSteps: [],
        stepsWithData: [],
        dirtySteps: [],
        mode: 'create',
        conferenceId: null,
        maxStep: 9,
        visibleSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }) => state,
      [mockApi.reducerPath]: mockApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
    .concat(mockApi.middleware)
    .concat(mockDestinationApi.middleware),
  });
};
jest.mock('@/redux/services/category.service', () => ({
  useGetAllCategoriesQuery: jest.fn(() => ({
    data: { data: [
      { conferenceCategoryId: 'cat-1', conferenceCategoryName: 'AI Research' },
      { conferenceCategoryId: 'cat-2', conferenceCategoryName: 'Machine Learning' }
    ]},
    isLoading: false,
  })),
  useGetAllRankingCategoriesQuery: jest.fn(() => ({
    data: { data: [
      { rankId: 'rank-1', rankName: 'Core' },
      { rankId: 'rank-2', rankName: 'IF' }
    ]},
    isLoading: false,
  })),
}));
jest.mock('@/redux/services/conference.service', () => ({
  useGetResearchConferenceDetailInternalQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  })),
}));
jest.mock('@/redux/services/room.service', () => ({
  useGetAllRoomsQuery: jest.fn(() => ({
    data: { 
      data: [
        { 
          roomId: 'room-1', 
          number: '101', 
          displayName: 'Hall A' 
        }
      ] 
    },
    isLoading: false,
  })),
  useGetAvailableRoomsBetweenDatesQuery: jest.fn(() => ({
    data: { 
      data: [
        {
          roomId: 'room-1',
          roomNumber: '101',
          roomDisplayName: 'Hall A',
          date: '2025-03-01',
          availableTimeSpans: [
            {
              startTime: '09:00:00',
              endTime: '12:00:00',
            },
          ],
        },
      ],
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useGetAvailableTimesInRoomQuery: jest.fn(() => ({
    data: {
      data: [
        { startTime: '09:00:00', endTime: '10:00:00' },
        { startTime: '10:00:00', endTime: '11:00:00' },
        { startTime: '11:00:00', endTime: '12:00:00' },
        { startTime: '13:00:00', endTime: '14:00:00' },
        { startTime: '14:00:00', endTime: '15:00:00' },
      ],
    },
    isLoading: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
  })),
  useGetSessionsInRoomOnDateQuery: jest.fn(() => ({
    data: {
      data: [
        {
          sessionId: 'session-1',
          sessionName: 'Opening Ceremony',
          startTime: '09:00:00',
          endTime: '10:00:00',
          roomId: 'room-1',
          date: '2025-03-01',
        },
      ],
    },
    isLoading: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
  })),
}));
jest.mock('@/redux/services/city.service', () => ({
  useGetAllCitiesQuery: jest.fn(() => ({
    data: { data: [
      { cityId: 'city-1', cityName: 'Ho Chi Minh City' },
      { cityId: 'city-2', cityName: 'Hanoi' }
    ]},
    isLoading: false,
  })),
}));
jest.mock('@/redux/services/status.service', () => ({
  useGetAllConferenceStatusesQuery: jest.fn(() => ({
    data: { data: [{ conferenceStatusId: 'status-1', conferenceStatusName: 'Draft' }] },
  })),
}));
jest.mock('@/redux/services/destination.service', () => ({
  useGetAllDestinationsQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}));
const renderWithProvider = (component: React.ReactElement, currentStep = 1) => {
  const store = createMockStore(currentStep);
  return render(<Provider store={store}>{component}</Provider>);
};
describe('ResearchConferenceStepForm - Step 1: Basic Info', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders step 1 section', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Tên hội nghị nghiên cứu')).toBeInTheDocument();
  });
  it('renders conference name input', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Tên hội nghị nghiên cứu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/International Conference/i)).toBeInTheDocument();
  });
  it('allows typing in conference name', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    const input = screen.getByPlaceholderText(/International Conference/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'AI Conference 2025' } });
    expect(input.value).toBe('AI Conference 2025');
  });
  it('renders description textarea', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mô tả chi tiết/i)).toBeInTheDocument();
  });
  it('renders start date picker', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Ngày bắt đầu hội nghị')).toBeInTheDocument();
  });
  it('renders date range inputs', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    const labels = screen.getAllByText('Số ngày diễn ra');
    expect(labels.length).toBe(2);
  });
  it('renders end date display', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Ngày kết thúc hội nghị')).toBeInTheDocument();
  });
  it('renders ticket sale start date', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Ngày bắt đầu đăng kí cho thính giả')).toBeInTheDocument();
  });
  it('renders ticket sale duration input', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    const labels = screen.getAllByText('Số ngày diễn ra');
    expect(labels.length).toBeGreaterThan(0);
  });
  it('renders total slot input', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Tổng số người tham dự')).toBeInTheDocument();
  });
  it('renders category dropdown', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Danh mục')).toBeInTheDocument();
  });
  it('renders city dropdown', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Thành phố')).toBeInTheDocument();
  });
  it('renders address input', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText('Địa chỉ')).toBeInTheDocument();
  });
  it('renders banner image upload section', () => {
    const { container } = render(
        <Provider store={createMockStore()}>
        <ResearchConferenceStepForm mode="create" />
        </Provider>
    );
    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
  });
  it('renders research timeline info note', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByText(/Hội nghị nghiên cứu yêu cầu thiết lập Timeline/i)).toBeInTheDocument();
  });
  it('renders save button', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />);
    expect(screen.getByRole('button', { name: /Lưu/i })).toBeInTheDocument();
  });
});
describe('ResearchConferenceStepForm - Step 2: Research Detail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders paper format dropdown', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [{ value: 'rank-1', label: 'Core' }],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText('Định dạng bài báo')).toBeInTheDocument();
  });
  it('renders number paper accept input', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText('Số bài báo chấp nhận')).toBeInTheDocument();
  });
  it('renders revision attempt input', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText('Số lần chỉnh sửa cho phép')).toBeInTheDocument();
  });
  it('renders submit paper fee input', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText(/Phí nộp bài báo/i)).toBeInTheDocument();
  });
  it('renders ranking category dropdown', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [{ value: 'rank-1', label: 'Core' }],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText('Loại xếp hạng')).toBeInTheDocument();
  });
  it('renders rank year input', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText('Năm xếp hạng')).toBeInTheDocument();
  });
  it('renders ranking description textarea', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText('Mô tả xếp hạng')).toBeInTheDocument();
  });
  it('renders allow listener checkbox', () => {
    const mockProps = {
      formData: {
        paperFormat: '',
        numberPaperAccept: 0,
        revisionAttemptAllowed: 0,
        submitPaperFee: 0,
        rankingCategoryId: '',
        rankValue: '',
        rankYear: new Date().getFullYear(),
        rankingDescription: '',
        allowListener: false,
      },
      onChange: jest.fn(),
      rankingOptions: [],
      isRankingLoading: false,
      totalSlot: 100,
    };
    render(<ResearchDetailForm {...mockProps} />);
    expect(screen.getByText(/Cho phép người nghe/i)).toBeInTheDocument();
  });
});
describe('ResearchConferenceStepForm - Step 3: Research Phase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders phase management buttons', () => {
    const mockProps = {
      phases: [],
      onPhasesChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      eventStartDate: '2025-03-01',
      eventEndDate: '2025-03-03',
      revisionAttemptAllowed: 2,
    };
    render(<ResearchPhaseForm {...mockProps} />);
    expect(screen.getByText(/Thêm giai đoạn/i)).toBeInTheDocument();
  });
  it('renders registration phase section', () => {
    const mockProps = {
      phases: [{
        registrationStartDate: '',
        registrationEndDate: '',
        registrationDuration: 1,
        fullPaperStartDate: '',
        fullPaperEndDate: '',
        fullPaperDuration: 1,
        reviewStartDate: '',
        reviewEndDate: '',
        reviewDuration: 1,
        reviseStartDate: '',
        reviseEndDate: '',
        reviseDuration: 1,
        cameraReadyStartDate: '',
        cameraReadyEndDate: '',
        cameraReadyDuration: 1,
        abstractDecideStatusStart: '',
        abstractDecideStatusEnd: '',
        abstractDecideStatusDuration: 1,
        fullPaperDecideStatusStart: '',
        fullPaperDecideStatusEnd: '',
        fullPaperDecideStatusDuration: 1,
        revisionPaperDecideStatusStart: '',
        revisionPaperDecideStatusEnd: '',
        revisionPaperDecideStatusDuration: 1,
        authorPaymentStart: '',
        authorPaymentEnd: '',
        authorPaymentDuration: 1,
        revisionRoundDeadlines: [],
      }],
      onPhasesChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      eventStartDate: '2025-03-01',
      eventEndDate: '2025-03-03',
      revisionAttemptAllowed: 2,
    };
    render(<ResearchPhaseForm {...mockProps} />);
    expect(screen.getByText(/Đăng ký tham dự/i)).toBeInTheDocument();
  });
  it('renders full paper phase section', () => {
    const mockProps = {
      phases: [{
        registrationStartDate: '',
        registrationEndDate: '',
        registrationDuration: 1,
        fullPaperStartDate: '',
        fullPaperEndDate: '',
        fullPaperDuration: 1,
        reviewStartDate: '',
        reviewEndDate: '',
        reviewDuration: 1,
        reviseStartDate: '',
        reviseEndDate: '',
        reviseDuration: 1,
        cameraReadyStartDate: '',
        cameraReadyEndDate: '',
        cameraReadyDuration: 1,
        abstractDecideStatusStart: '',
        abstractDecideStatusEnd: '',
        abstractDecideStatusDuration: 1,
        fullPaperDecideStatusStart: '',
        fullPaperDecideStatusEnd: '',
        fullPaperDecideStatusDuration: 1,
        revisionPaperDecideStatusStart: '',
        revisionPaperDecideStatusEnd: '',
        revisionPaperDecideStatusDuration: 1,
        authorPaymentStart: '',
        authorPaymentEnd: '',
        authorPaymentDuration: 1,
        revisionRoundDeadlines: [],
      }],
      onPhasesChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      eventStartDate: '2025-03-01',
      eventEndDate: '2025-03-03',
      revisionAttemptAllowed: 2,
    };
    render(<ResearchPhaseForm {...mockProps} />);
    expect(screen.getByText(/Nộp Full Paper/i)).toBeInTheDocument();
  });
  it('renders review phase section', () => {
    const mockProps = {
      phases: [{
        registrationStartDate: '',
        registrationEndDate: '',
        registrationDuration: 1,
        fullPaperStartDate: '',
        fullPaperEndDate: '',
        fullPaperDuration: 1,
        reviewStartDate: '',
        reviewEndDate: '',
        reviewDuration: 1,
        reviseStartDate: '',
        reviseEndDate: '',
        reviseDuration: 1,
        cameraReadyStartDate: '',
        cameraReadyEndDate: '',
        cameraReadyDuration: 1,
        abstractDecideStatusStart: '',
        abstractDecideStatusEnd: '',
        abstractDecideStatusDuration: 1,
        fullPaperDecideStatusStart: '',
        fullPaperDecideStatusEnd: '',
        fullPaperDecideStatusDuration: 1,
        revisionPaperDecideStatusStart: '',
        revisionPaperDecideStatusEnd: '',
        revisionPaperDecideStatusDuration: 1,
        authorPaymentStart: '',
        authorPaymentEnd: '',
        authorPaymentDuration: 1,
        revisionRoundDeadlines: [],
      }],
      onPhasesChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      eventStartDate: '2025-03-01',
      eventEndDate: '2025-03-03',
      revisionAttemptAllowed: 2,
    };
    render(<ResearchPhaseForm {...mockProps} />);
    expect(screen.getByText(/Reviewer đánh giá/i)).toBeInTheDocument();
  });
  it('renders camera ready phase section', () => {
    const mockProps = {
      phases: [{
        registrationStartDate: '',
        registrationEndDate: '',
        registrationDuration: 1,
        fullPaperStartDate: '',
        fullPaperEndDate: '',
        fullPaperDuration: 1,
        reviewStartDate: '',
        reviewEndDate: '',
        reviewDuration: 1,
        reviseStartDate: '',
        reviseEndDate: '',
        reviseDuration: 1,
        cameraReadyStartDate: '',
        cameraReadyEndDate: '',
        cameraReadyDuration: 1,
        abstractDecideStatusStart: '',
        abstractDecideStatusEnd: '',
        abstractDecideStatusDuration: 1,
        fullPaperDecideStatusStart: '',
        fullPaperDecideStatusEnd: '',
        fullPaperDecideStatusDuration: 1,
        revisionPaperDecideStatusStart: '',
        revisionPaperDecideStatusEnd: '',
        revisionPaperDecideStatusDuration: 1,
        authorPaymentStart: '',
        authorPaymentEnd: '',
        authorPaymentDuration: 1,
        revisionRoundDeadlines: [],
      }],
      onPhasesChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      eventStartDate: '2025-03-01',
      eventEndDate: '2025-03-03',
      revisionAttemptAllowed: 2,
    };
    render(<ResearchPhaseForm {...mockProps} />);
    expect(screen.getByText(/Nộp Camera Ready/i)).toBeInTheDocument();
  });
  it('renders reset button', () => {
    const mockProps = {
      phases: [],
      onPhasesChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      eventStartDate: '2025-03-01',
      eventEndDate: '2025-03-03',
      revisionAttemptAllowed: 2,
    };
    render(<ResearchPhaseForm {...mockProps} />);
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});
describe('ResearchConferenceStepForm - Step 4: Price/Ticket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders ticket list section', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText(/Danh sách đã tạo/i)).toBeInTheDocument();
  });
  it('renders add ticket form section', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText(/Thêm mới/i)).toBeInTheDocument();
  });
  it('renders ticket name input', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText('Loại phí tham dự')).toBeInTheDocument();
  });
  it('renders ticket description textarea', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
  });
  it('renders author checkbox when listener allowed', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText(/Dành cho tác giả/i)).toBeInTheDocument();
  });
  it('renders publish checkbox when author selected', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    const authorCheckbox = screen.getByLabelText(/Dành cho tác giả/i);
    fireEvent.click(authorCheckbox);
    expect(screen.getByText(/Xuất bản bài báo/i)).toBeInTheDocument();
  });
  it('renders ticket price input', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText(/Chi phí thính giả/i)).toBeInTheDocument();
  });
  it('renders total slot input', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText(/Số lượng cho người nghe/i)).toBeInTheDocument();
  });
  it('renders add button', () => {
    const mockProps = {
      tickets: [],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByRole('button', { name: /Thêm/i })).toBeInTheDocument();
  });
  it('displays existing tickets', () => {
    const mockProps = {
      tickets: [
        {
          ticketId: 'ticket-1',
          ticketName: 'Listener Ticket',
          ticketPrice: 100000,
          ticketDescription: 'For listeners',
          isAuthor: false,
          isPublish: false,
          totalSlot: 30,
          phases: [],
        },
      ],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText('Listener Ticket')).toBeInTheDocument();
  });
  it('renders edit and delete buttons for tickets', () => {
    const mockProps = {
      tickets: [
        {
          ticketId: 'ticket-1',
          ticketName: 'Author Ticket',
          ticketPrice: 500000,
          ticketDescription: 'For authors',
          isAuthor: true,
          isPublish: false,
          totalSlot: 20,
          phases: [],
        },
      ],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByRole('button', { name: /Sửa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa/i })).toBeInTheDocument();
  });
  it('shows validation warning when invalid config', () => {
    const mockProps = {
      tickets: [
        {
          ticketId: 'ticket-1',
          ticketName: 'Author Only',
          ticketPrice: 500000,
          ticketDescription: 'Author ticket',
          isAuthor: true,
          isPublish: false,
          totalSlot: 20,
          phases: [],
        },
      ],
      onTicketsChange: jest.fn(),
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
      researchPhases: [],
      maxTotalSlot: 100,
      allowListener: true,
      numberPaperAccept: 50,
      submitPaperFee: 500000,
    };
    render(<ResearchPriceForm {...mockProps} />);
    expect(screen.getByText(/Cảnh báo/i)).toBeInTheDocument();
  });
});
describe('ResearchConferenceStepForm - Step 5: Sessions (Calendar)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders step 5 title', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />, 5);
    expect(screen.getByRole('heading', { name: /Session \(Tùy chọn\)/i })).toBeInTheDocument();
  });
  it('shows warning when no conference dates', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />, 5);
    expect(screen.getByText(/Thiếu thông tin ngày tổ chức/i)).toBeInTheDocument();
  });
  it('shows warning when no conference ID in create mode', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />, 5);
    expect(screen.getByText(/Chưa có Conference ID/i)).toBeInTheDocument();
  });
  it('renders add session button', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />, 5);
    expect(screen.getByText(/Thêm session/i)).toBeInTheDocument();
  });
  it('renders unassigned sessions list section', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />, 5);
    const addButton = screen.getByText(/Thêm session/i);
    expect(addButton).toBeInTheDocument();
  });
  it('renders navigation buttons for step 5', () => {
    renderWithProvider(<ResearchConferenceStepForm mode="create" />, 5);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
describe('ResearchConferenceStepForm - Step 6: Policies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders policy form section title', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Chính sách chung (Tùy chọn)')).toBeInTheDocument();
  });
  it('renders empty state when no policies', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText(/Chưa có chính sách nào/i)).toBeInTheDocument();
    expect(screen.getByText(/Bạn có thể bỏ qua hoặc thêm chính sách mới/i)).toBeInTheDocument();
  });
  it('renders add policy form section', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Thêm chính sách chung')).toBeInTheDocument();
  });
  it('renders policy name input', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Tên chính sách')).toBeInTheDocument();
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
  });
  it('renders policy description textarea', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeInTheDocument();
  });
  it('renders add policy button', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('button', { name: 'Thêm chính sách' })).toBeInTheDocument();
  });
  it('displays existing policy with name and description', () => {
    const mockProps = {
      policies: [
        {
          policyId: 'policy-1',
          policyName: 'Chính sách bình duyệt khoa học',
          description: 'Bài báo Computer Vision được phản biện theo quy trình ẩn danh kép bởi các chuyên gia trong lĩnh vực.',
        },
      ],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Chính sách bình duyệt khoa học')).toBeInTheDocument();
    expect(screen.getByText(/Bài báo Computer Vision được phản biện/i)).toBeInTheDocument();
  });
  it('renders edit and delete buttons for each policy', () => {
    const mockProps = {
      policies: [
        {
          policyId: 'policy-1',
          policyName: 'Chính sách đạo đức dữ liệu hình ảnh',
          description: 'Nghiên cứu phải đảm bảo quyền riêng tư, nguồn dữ liệu hợp pháp và không vi phạm đạo đức AI.',
        },
      ],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('button', { name: 'Sửa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument();
  });
  it('allows typing in policy name input', () => {
    const mockProps = {
      policies: [],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Chính sách trình bày' } });
    expect(input.value).toBe('Chính sách trình bày');
  });
  it('displays multiple policies in grid layout', () => {
    const mockProps = {
      policies: [
        {
          policyId: 'policy-1',
          policyName: 'Chính sách bình duyệt khoa học',
          description: 'Bài báo Computer Vision được phản biện theo quy trình ẩn danh kép bởi các chuyên gia trong lĩnh vực.',
        },
        {
          policyId: 'policy-2',
          policyName: 'Chính sách đạo đức dữ liệu hình ảnh',
          description: 'Nghiên cứu phải đảm bảo quyền riêng tư, nguồn dữ liệu hợp pháp và không vi phạm đạo đức AI.',
        },
        {
          policyId: 'policy-3',
          policyName: 'Chính sách trình bày',
          description: 'Ít nhất một tác giả phải trình bày trực tiếp hoặc trực tuyến để bài báo được xuất bản.',
        },
      ],
      onPoliciesChange: jest.fn(),
      eventStartDate: '2025-03-01',
      ticketSaleStart: '2025-01-01',
      ticketSaleEnd: '2025-01-31',
    };
    render(
      <Provider store={createMockStore()}>
        <PolicyForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Chính sách bình duyệt khoa học')).toBeInTheDocument();
    expect(screen.getByText('Chính sách đạo đức dữ liệu hình ảnh')).toBeInTheDocument();
    expect(screen.getByText('Chính sách trình bày')).toBeInTheDocument();
    expect(screen.getByText(/Bài báo Computer Vision được phản biện/i)).toBeInTheDocument();
    expect(screen.getByText(/Nghiên cứu phải đảm bảo quyền riêng tư/i)).toBeInTheDocument();
    expect(screen.getByText(/Ít nhất một tác giả phải trình bày/i)).toBeInTheDocument();
    const editButtons = screen.getAllByRole('button', { name: 'Sửa' });
    const deleteButtons = screen.getAllByRole('button', { name: 'Xóa' });
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });
});
describe('ResearchConferenceStepForm - Step 7: Materials & Ranking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders research materials section', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText(/Tài liệu nghiên cứu/i)).toBeInTheDocument();
  });
  it('renders ranking files section', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText(/File xếp hạng/i)).toBeInTheDocument();
  });
  it('renders ranking references section', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText(/Tham khảo xếp hạng/i)).toBeInTheDocument();
  });
  it('renders add material form inputs', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText('Tên file')).toBeInTheDocument();
  });
  it('renders material description textarea', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    const descriptions = screen.getAllByText('Mô tả');
    expect(descriptions.length).toBeGreaterThan(0);
  });
  it('renders file upload input for materials', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText(/File \*/i)).toBeInTheDocument();
  });
  it('renders add material button', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByRole('button', { name: /Thêm tài liệu/i })).toBeInTheDocument();
  });
  it('displays existing materials', () => {
    const mockProps = {
      materials: [
        {
          materialId: 'mat-1',
          fileName: 'Paper Template.docx',
          fileDescription: 'Use this template',
          fileUrl: 'http://example.com/template.docx',
        },
      ],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText('Paper Template.docx')).toBeInTheDocument();
    expect(screen.getByText('Use this template')).toBeInTheDocument();
  });
  it('renders delete button for materials', () => {
    const mockProps = {
      materials: [
        {
          materialId: 'mat-1',
          fileName: 'Guidelines.pdf',
          fileDescription: 'Submission guidelines',
          fileUrl: 'http://example.com/guide.pdf',
        },
      ],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByRole('button', { name: /Xóa/i })).toBeInTheDocument();
  });
  it('renders add ranking file button', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByRole('button', { name: /Thêm file/i })).toBeInTheDocument();
  });
  it('displays existing ranking files', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [
        {
          rankingFileId: 'rf-1',
          fileUrl: 'http://ranking.com/file.pdf',
        },
      ],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText(/ranking.com\/file.pdf/i)).toBeInTheDocument();
  });
  it('renders add ranking reference input', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText('URL')).toBeInTheDocument();
  });
  it('renders add URL button', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByRole('button', { name: /Thêm URL/i })).toBeInTheDocument();
  });
  it('displays existing ranking references', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [
        {
          rankingReferenceId: 'rr-1',
          referenceUrl: 'https://core.edu.au/rankings',
        },
      ],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText('https://core.edu.au/rankings')).toBeInTheDocument();
  });
  it('renders tip note for ranking references', () => {
    const mockProps = {
      materials: [],
      rankingFiles: [],
      rankingReferences: [],
      onMaterialsChange: jest.fn(),
      onRankingFilesChange: jest.fn(),
      onRankingReferencesChange: jest.fn(),
    };
    render(<MaterialsForm {...mockProps} />);
    expect(screen.getByText(/Tip:/i)).toBeInTheDocument();
  });
});
describe('ResearchConferenceStepForm - Step 8: Media', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'mocked-url');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('renders empty state when no media', () => {
    const mockProps = {
      mediaList: [],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText(/Chưa có media nào/i)).toBeInTheDocument();
    expect(screen.getByText(/Bạn có thể bỏ qua hoặc thêm mới/i)).toBeInTheDocument();
  });
  it('renders add media form section', () => {
    const mockProps = {
      mediaList: [],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('heading', { name: /Thêm media/i })).toBeInTheDocument();
  });
  it('renders image upload component', () => {
    const mockProps = {
      mediaList: [],
      onMediaListChange: jest.fn(),
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });
  it('renders add media button', () => {
    const mockProps = {
      mediaList: [],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('button', { name: /Thêm media/i })).toBeInTheDocument();
  });
  it('displays existing media items', () => {
    const mockFile = new File(['content'], 'conference-photo.jpg', { type: 'image/jpeg' });
    const mockProps = {
      mediaList: [
        {
          mediaId: 'media-1',
          mediaFile: mockFile,
        },
      ],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('alt', 'Media Preview');
  });
  it('renders delete button for media items', () => {
    const mockFile = new File(['content'], 'video.mp4', { type: 'video/mp4' });
    const mockProps = {
      mediaList: [
        {
          mediaId: 'media-1',
          mediaFile: mockFile,
        },
      ],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });
  it('renders media preview image', () => {
    const mockFile = new File(['content'], 'preview.jpg', { type: 'image/jpeg' });
    const mockProps = {
      mediaList: [
        {
          mediaId: 'media-1',
          mediaFile: mockFile,
        },
      ],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', 'mocked-url');
  });
  it('renders media with URL string', () => {
    const mockProps = {
      mediaList: [
        {
          mediaId: 'media-1',
          mediaFile: 'https://example.com/image.jpg',
        },
      ],
      onMediaListChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <MediaForm {...mockProps} />
      </Provider>
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
});
describe('ResearchConferenceStepForm - Step 9: Sponsors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'mocked-logo-url');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('renders empty state when no sponsors', () => {
    const mockProps = {
      sponsors: [],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText(/Chưa có nhà tài trợ nào/i)).toBeInTheDocument();
  });
  it('renders add sponsor form section', () => {
    const mockProps = {
      sponsors: [],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('heading', { name: /Thêm nhà tài trợ/i })).toBeInTheDocument();
  });
  it('renders sponsor name input', () => {
    const mockProps = {
      sponsors: [],
      onSponsorsChange: jest.fn(),
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Tên nhà tài trợ')).toBeInTheDocument();
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
  });
  it('renders sponsor logo upload', () => {
    const mockProps = {
      sponsors: [],
      onSponsorsChange: jest.fn(),
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    const uploadSections = screen.getAllByText(/Thêm nhà tài trợ/i);
    expect(uploadSections.length).toBeGreaterThan(0);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });
  it('renders add sponsor button', () => {
    const mockProps = {
      sponsors: [],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('button', { name: /Thêm nhà tài trợ/i })).toBeInTheDocument();
  });
  it('displays existing sponsors', () => {
    const mockFile = new File(['logo'], 'sponsor-logo.png', { type: 'image/png' });
    const mockProps = {
      sponsors: [
        {
          sponsorId: 'sponsor-1',
          name: 'Tech Corp',
          imageFile: mockFile,
        },
      ],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });
  it('renders edit and delete buttons for sponsors', () => {
    const mockFile = new File(['logo'], 'logo.png', { type: 'image/png' });
    const mockProps = {
      sponsors: [
        {
          sponsorId: 'sponsor-1',
          name: 'ABC Company',
          imageFile: mockFile,
        },
      ],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByRole('button', { name: /Sửa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa/i })).toBeInTheDocument();
  });
  it('renders sponsor logo preview', () => {
    const mockFile = new File(['logo'], 'company-logo.png', { type: 'image/png' });
    const mockProps = {
      sponsors: [
        {
          sponsorId: 'sponsor-1',
          name: 'Sponsor Inc',
          imageFile: mockFile,
        },
      ],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', 'mocked-logo-url');
  });
  it('renders sponsor with URL string image', () => {
    const mockProps = {
      sponsors: [
        {
          sponsorId: 'sponsor-1',
          name: 'Digital Corp',
          imageFile: 'https://example.com/logo.png',
        },
      ],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('Digital Corp')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/logo.png');
  });
  it('allows typing in sponsor name input', () => {
    const mockProps = {
      sponsors: [],
      onSponsorsChange: jest.fn(),
    };
    const { container } = render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'New Sponsor' } });
    expect(input.value).toBe('New Sponsor');
  });
  it('renders no image placeholder when no logo', () => {
    const mockProps = {
      sponsors: [
        {
          sponsorId: 'sponsor-1',
          name: 'No Logo Company',
          imageFile: null,
        },
      ],
      onSponsorsChange: jest.fn(),
    };
    render(
      <Provider store={createMockStore()}>
        <SponsorForm {...mockProps} />
      </Provider>
    );
    expect(screen.getByText('No Logo Company')).toBeInTheDocument();
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });
});