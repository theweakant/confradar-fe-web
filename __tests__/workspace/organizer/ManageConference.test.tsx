import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ManageConference from '@/components/(user)/workspace/organizer/ManageConference/index';
import PendingConference from '@/components/(user)/workspace/organizer/ManageConference/PendingConference/index';
import ExternalConference from '@/components/(user)/workspace/organizer/ManageConference/ExternalConference/index1';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

const mockTechConferences = [
  {
    conferenceId: 'tech-1',
    conferenceName: 'AI Tech Summit 2024',
    description: 'Leading AI conference',
    isResearchConference: false,
    conferenceCategoryId: 'cat-1',
    conferenceStatusId: 'status-1',
    cityId: 'city-1',
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-06-03T00:00:00Z',
    address: 'Ho Chi Minh City',
    createdBy: 'organizer-1',
  },
  {
    conferenceId: 'tech-2',
    conferenceName: 'Web Dev Conference 2024',
    description: 'Web development conference',
    isResearchConference: false,
    conferenceCategoryId: 'cat-2',
    conferenceStatusId: 'status-2',
    cityId: 'city-2',
    startDate: '2024-07-15T00:00:00Z',
    endDate: '2024-07-17T00:00:00Z',
    address: 'Hanoi',
    createdBy: 'organizer-1',
  },
];

const mockResearchConferences = [
  {
    conferenceId: 'research-1',
    conferenceName: 'ML Research Conference 2024',
    description: 'Machine learning research',
    isResearchConference: true,
    conferenceCategoryId: 'cat-3',
    conferenceStatusId: 'status-1',
    cityId: 'city-1',
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-08-03T00:00:00Z',
    address: 'Da Nang',
    createdBy: 'organizer-1',
  },
];

const mockPendingConferences = [
  {
    conferenceId: 'pending-1',
    conferenceName: 'Blockchain Summit 2024',
    description: 'Blockchain technology conference',
    conferenceCategoryId: 'cat-4',
    address: 'Ho Chi Minh City',
    startDate: '2024-09-01T00:00:00Z',
    endDate: '2024-09-03T00:00:00Z',
    totalSlot: 500,
    availableSlot: 500,
    createdBy: 'organizer-2',
    createdAt: '2024-01-15T00:00:00Z',
    bannerImageUrl: '/banner.jpg',
  },
  {
    conferenceId: 'pending-2',
    conferenceName: 'IoT Conference 2024',
    description: 'Internet of Things conference',
    conferenceCategoryId: 'cat-5',
    address: 'Hanoi',
    startDate: '2024-10-01T00:00:00Z',
    endDate: '2024-10-03T00:00:00Z',
    totalSlot: 300,
    createdBy: 'organizer-3',
    createdAt: '2024-02-20T00:00:00Z',
  },
];

const mockExternalConferences = [
  {
    conferenceId: 'external-1',
    conferenceName: 'Data Science Summit 2024',
    description: 'Data science conference',
    isResearchConference: false,
    conferenceCategoryId: 'cat-1',
    conferenceStatusId: 'status-preparing',
    cityId: 'city-1',
    startDate: '2024-11-01T00:00:00Z',
    endDate: '2024-11-03T00:00:00Z',
    address: 'Ho Chi Minh City',
    createdBy: 'collaborator-1',
    userNameCreator: 'John Doe',
  },
];

const mockCategories = [
  { conferenceCategoryId: 'cat-1', conferenceCategoryName: 'Artificial Intelligence' },
  { conferenceCategoryId: 'cat-2', conferenceCategoryName: 'Web Development' },
  { conferenceCategoryId: 'cat-3', conferenceCategoryName: 'Machine Learning' },
];

const mockCities = [
  { cityId: 'city-1', cityName: 'Ho Chi Minh City' },
  { cityId: 'city-2', cityName: 'Hanoi' },
];

const mockStatuses = [
  { conferenceStatusId: 'status-1', conferenceStatusName: 'Preparing' },
  { conferenceStatusId: 'status-2', conferenceStatusName: 'Ready' },
  { conferenceStatusId: 'status-preparing', conferenceStatusName: 'Preparing' },
];

const mockCollaborators = [
  { userId: 'collab-1', fullName: 'John Doe', email: 'john@example.com' },
];

const mockOrganizations = [
  { organizationId: 'org-1', organizationName: 'Tech Corp' },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: { userId: 'organizer-1' } }) => state,
      api: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

jest.mock('@/redux/services/conference.service', () => ({
  useGetTechnicalConferencesByOrganizerQuery: jest.fn(() => ({
    data: { data: { items: mockTechConferences, totalPages: 1 } },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
  useGetResearchConferencesForOrganizerQuery: jest.fn(() => ({
    data: { data: { items: mockResearchConferences, totalPages: 1 } },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
  useLazyGetPendingConferencesQuery: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      data: { data: { items: mockPendingConferences, totalPages: 1 } } 
    })),
    {
      data: { data: { items: mockPendingConferences, totalPages: 1 } },
      isLoading: false,
      isFetching: false,
    },
  ]),
  useApproveConferenceMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { message: 'Success' } })),
    { isLoading: false },
  ]),
  useGetTechnicalConferencesByCollaboratorNoDraftQuery: jest.fn(() => ({
    data: { data: { items: mockExternalConferences, totalPages: 1 } },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/redux/services/category.service', () => ({
  useGetAllCategoriesQuery: jest.fn(() => ({
    data: { data: mockCategories },
    isLoading: false,
  })),
}));

jest.mock('@/redux/services/city.service', () => ({
  useGetAllCitiesQuery: jest.fn(() => ({
    data: { data: mockCities },
    isLoading: false,
  })),
}));

jest.mock('@/redux/services/status.service', () => ({
  useGetAllConferenceStatusesQuery: jest.fn(() => ({
    data: { data: mockStatuses },
    isLoading: false,
  })),
}));

jest.mock('@/redux/services/user.service', () => ({
  useLazyGetCollaboratorAccountsQuery: jest.fn(() => [
    jest.fn(),
    { data: { data: mockCollaborators }, isLoading: false },
  ]),
  useLazyListOrganizationsQuery: jest.fn(() => [
    jest.fn(),
    { data: { data: mockOrganizations }, isLoading: false },
  ]),
}));

jest.mock('@/redux/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { userId: 'organizer-1' },
  })),
}));

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('ManageConference Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<ManageConference />);
    expect(screen.getByText('Quản lý hội thảo & hội nghị - ConfRadar')).toBeInTheDocument();
    expect(screen.getByText('Quản lý các hội thảo và hội nghị do bạn tổ chức trên ConfRadar')).toBeInTheDocument();
  });

  it('renders create conference button', () => {
    renderWithProvider(<ManageConference />);
    expect(screen.getByText('Thêm mới')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    renderWithProvider(<ManageConference />);
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Research')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProvider(<ManageConference />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, mô tả, địa chỉ/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    renderWithProvider(<ManageConference />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, mô tả, địa chỉ/i);
    fireEvent.change(searchInput, { target: { value: 'AI' } });
    expect(searchInput).toHaveValue('AI');
  });

  it('displays technical conferences by default', () => {
    renderWithProvider(<ManageConference />);
    expect(screen.getByText('AI Tech Summit 2024')).toBeInTheDocument();
    expect(screen.getByText('Web Dev Conference 2024')).toBeInTheDocument();
  });

  it('switches to research tab when clicked', () => {
    renderWithProvider(<ManageConference />);
    const researchTab = screen.getByText('Research');
    fireEvent.click(researchTab);
    
    expect(screen.getByText('ML Research Conference 2024')).toBeInTheDocument();
  });

  it('opens create modal when create button is clicked', () => {
    renderWithProvider(<ManageConference />);
    const createButton = screen.getByText('Thêm mới');
    fireEvent.click(createButton);

    expect(screen.getByText('Chọn loại hội thảo/ hội nghị bạn muốn tạo')).toBeInTheDocument();
  });

  it('navigates to create tech conference page when selected', () => {
    renderWithProvider(<ManageConference />);
    const createButton = screen.getByText('Thêm mới');
    fireEvent.click(createButton);

    const techButton = screen.getByText('Tech Conference');
    fireEvent.click(techButton);

    expect(mockPush).toHaveBeenCalledWith('/workspace/organizer/manage-conference/create-tech-conference');
  });

  it('navigates to create research conference page when selected', () => {
    renderWithProvider(<ManageConference />);
    const createButton = screen.getByText('Thêm mới');
    fireEvent.click(createButton);

    const researchButton = screen.getByText('Research Conference');
    fireEvent.click(researchButton);

    expect(mockPush).toHaveBeenCalledWith('/workspace/organizer/manage-conference/create-research-conference');
  });

  it('renders loading state', () => {
    const useGetTechnicalConferencesByOrganizerQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByOrganizerQuery;
    useGetTechnicalConferencesByOrganizerQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageConference />);
    expect(screen.getByText(/Đang tải dữ liệu/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetTechnicalConferencesByOrganizerQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByOrganizerQuery;
    useGetTechnicalConferencesByOrganizerQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageConference />);
    expect(screen.getByText(/Không thể tải dữ liệu/i)).toBeInTheDocument();
    expect(screen.getByText('Thử lại')).toBeInTheDocument();
  });
});

describe('PendingConference Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<PendingConference />);
    expect(screen.getByText('Hội thảo chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('Danh sách các hội thảo đang chờ phê duyệt từ ban tổ chức')).toBeInTheDocument();
  });

  it('renders back button', () => {
    renderWithProvider(<PendingConference />);
    expect(screen.getByText('Quay lại')).toBeInTheDocument();
  });

  it('displays pending conferences', () => {
    renderWithProvider(<PendingConference />);
    expect(screen.getByText('Blockchain Summit 2024')).toBeInTheDocument();
    expect(screen.getByText('IoT Conference 2024')).toBeInTheDocument();
  });

  it('displays conference descriptions', () => {
    renderWithProvider(<PendingConference />);
    expect(screen.getByText('Blockchain technology conference')).toBeInTheDocument();
    expect(screen.getByText('Internet of Things conference')).toBeInTheDocument();
  });

  it('displays conference creator', () => {
    renderWithProvider(<PendingConference />);
    expect(screen.getByText(/Người tạo: organizer-2/i)).toBeInTheDocument();
  });

  it('displays conference addresses', () => {
    renderWithProvider(<PendingConference />);
    const addresses = screen.getAllByText(/Ho Chi Minh City/i);
    expect(addresses.length).toBeGreaterThan(0);
  });

  it('displays total slots', () => {
    renderWithProvider(<PendingConference />);
    expect(screen.getByText(/Số người tham dự: 500 người/i)).toBeInTheDocument();
  });

  it('displays pending status badge', () => {
    renderWithProvider(<PendingConference />);
    const badges = screen.getAllByText('Chờ phê duyệt');
    expect(badges.length).toBe(2);
  });

  it('renders approve and reject buttons', () => {
    renderWithProvider(<PendingConference />);
    const approveButtons = screen.getAllByText('Phê duyệt');
    const rejectButtons = screen.getAllByText('Từ chối');
    
    expect(approveButtons.length).toBe(2);
    expect(rejectButtons.length).toBe(2);
  });

  it('opens approve dialog when approve button is clicked', async () => {
    renderWithProvider(<PendingConference />);
    const approveButtons = screen.getAllByText('Phê duyệt');
    
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Phê duyệt hội thảo')).toBeInTheDocument();
    });
  });

  it('opens reject dialog when reject button is clicked', async () => {
    renderWithProvider(<PendingConference />);
    const rejectButtons = screen.getAllByText('Từ chối');
    
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Từ chối hội thảo')).toBeInTheDocument();
    });
  });

  it('displays reason textarea in dialog', async () => {
    renderWithProvider(<PendingConference />);
    const approveButtons = screen.getAllByText('Phê duyệt');
    
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập lý do...')).toBeInTheDocument();
    });
  });

  it('renders loading state', () => {
    const useLazyGetPendingConferencesQuery = require('@/redux/services/conference.service').useLazyGetPendingConferencesQuery;
    useLazyGetPendingConferencesQuery.mockReturnValueOnce([
      jest.fn(),
      {
        data: null,
        isLoading: true,
        isFetching: false,
      },
    ]);

    renderWithProvider(<PendingConference />);
    expect(screen.getByText(/Đang tải/i)).toBeInTheDocument();
  });

  it('renders empty state when no pending conferences', () => {
    const useLazyGetPendingConferencesQuery = require('@/redux/services/conference.service').useLazyGetPendingConferencesQuery;
    useLazyGetPendingConferencesQuery.mockReturnValueOnce([
      jest.fn(),
      {
        data: { data: { items: [], totalPages: 0 } },
        isLoading: false,
        isFetching: false,
      },
    ]);

    renderWithProvider(<PendingConference />);
    expect(screen.getByText('Không có hội thảo chờ duyệt')).toBeInTheDocument();
  });

  it('renders pagination when multiple pages exist', () => {
    const useLazyGetPendingConferencesQuery = require('@/redux/services/conference.service').useLazyGetPendingConferencesQuery;
    useLazyGetPendingConferencesQuery.mockReturnValueOnce([
      jest.fn(),
      {
        data: { data: { items: mockPendingConferences, totalPages: 3 } },
        isLoading: false,
        isFetching: false,
      },
    ]);

    renderWithProvider(<PendingConference />);
    expect(screen.getByText(/Trang 1 \/ 3/i)).toBeInTheDocument();
  });

  it('navigates to conference detail when card is clicked', () => {
    renderWithProvider(<PendingConference />);
    const conferenceCard = screen.getByText('Blockchain Summit 2024').closest('div');
    
    if (conferenceCard) {
      fireEvent.click(conferenceCard);
      expect(mockPush).toHaveBeenCalled();
    }
  });
});

describe('ExternalConference Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<ExternalConference />);
    expect(screen.getByText('Hội thảo của Đối tác')).toBeInTheDocument();
  });

  it('renders main tab navigation', () => {
    renderWithProvider(<ExternalConference />);
    expect(screen.getByText('Đã được duyệt')).toBeInTheDocument();
    expect(screen.getByText('Đang chờ duyệt')).toBeInTheDocument();
  });

  it('renders sub tab navigation for approved conferences', () => {
    renderWithProvider(<ExternalConference />);
    const ongoingTexts = screen.getAllByText('Đang diễn ra');
    expect(ongoingTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Đã kết thúc')).toBeInTheDocument();
    expect(screen.getByText('Đã từ chối')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProvider(<ExternalConference />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm hội thảo đối tác/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    renderWithProvider(<ExternalConference />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm hội thảo đối tác/i);
    fireEvent.change(searchInput, { target: { value: 'Data' } });
    expect(searchInput).toHaveValue('Data');
  });

  it('renders filter button', () => {
    renderWithProvider(<ExternalConference />);
    expect(screen.getByText('Bộ lọc')).toBeInTheDocument();
  });

  it('opens filter modal when filter button is clicked', async () => {
    renderWithProvider(<ExternalConference />);
    const filterButton = screen.getByText('Bộ lọc');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Bộ lọc tìm kiếm')).toBeInTheDocument();
    });
  });

  it('displays filter options in modal', async () => {
    renderWithProvider(<ExternalConference />);
    const filterButton = screen.getByText('Bộ lọc');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Đối tác')).toBeInTheDocument();
      const orgTexts = screen.getAllByText('Tổ chức');
      expect(orgTexts.length).toBeGreaterThan(0);      
      expect(screen.getByText('Danh mục')).toBeInTheDocument();
    });
  });

  it('renders statistics cards', () => {
    renderWithProvider(<ExternalConference />);
    const ongoingTexts = screen.getAllByText('Đang diễn ra');
    expect(ongoingTexts.length).toBeGreaterThan(0);    
    expect(screen.getByText('Đối tác hoạt động')).toBeInTheDocument();
  });

  it('displays external conferences', () => {
    renderWithProvider(<ExternalConference />);
    expect(screen.getByText('Data Science Summit 2024')).toBeInTheDocument();
  });

  it('switches to pending tab when clicked', () => {
    renderWithProvider(<ExternalConference />);
    const pendingTab = screen.getByText('Đang chờ duyệt');
    fireEvent.click(pendingTab);

    expect(pendingTab).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const useGetTechnicalConferencesByCollaboratorNoDraftQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByCollaboratorNoDraftQuery;
    useGetTechnicalConferencesByCollaboratorNoDraftQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProvider(<ExternalConference />);
    expect(screen.getByText(/Đang tải dữ liệu/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetTechnicalConferencesByCollaboratorNoDraftQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByCollaboratorNoDraftQuery;
    useGetTechnicalConferencesByCollaboratorNoDraftQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    renderWithProvider(<ExternalConference />);
    expect(screen.getByText(/Không thể tải hội thảo đã duyệt/i)).toBeInTheDocument();
  });

  it('renders empty state when no conferences', () => {
    const useGetTechnicalConferencesByCollaboratorNoDraftQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByCollaboratorNoDraftQuery;
    useGetTechnicalConferencesByCollaboratorNoDraftQuery.mockReturnValueOnce({
      data: { data: { items: [], totalPages: 0 } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProvider(<ExternalConference />);
    expect(screen.getByText('Không có hội thảo nào trong mục này')).toBeInTheDocument();
  });

  it('displays active filter count badge', async () => {
    renderWithProvider(<ExternalConference />);
    const filterButton = screen.getByText('Bộ lọc');
    fireEvent.click(filterButton);

    await waitFor(() => {
      const applyButton = screen.getByText('Áp dụng');
      fireEvent.click(applyButton);
    });
  });

  it('clears all filters when clear button is clicked', () => {
    renderWithProvider(<ExternalConference />);
    expect(screen.getByText('Bộ lọc')).toBeInTheDocument();
  });

  it('switches between sub tabs', () => {
    renderWithProvider(<ExternalConference />);
    
    const completedTab = screen.getByText('Đã kết thúc');
    fireEvent.click(completedTab);
    
    expect(completedTab).toBeInTheDocument();
  });

  it('renders pagination when multiple pages exist', () => {
    const useGetTechnicalConferencesByCollaboratorNoDraftQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByCollaboratorNoDraftQuery;
    useGetTechnicalConferencesByCollaboratorNoDraftQuery.mockReturnValueOnce({
      data: { data: { items: mockExternalConferences, totalPages: 3 } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProvider(<ExternalConference />);
    expect(screen.getByText(/Trang 1 \/ 3/i)).toBeInTheDocument();
  });
});