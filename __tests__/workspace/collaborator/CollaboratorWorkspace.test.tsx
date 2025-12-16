import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ConferenceManagementTabs from '@/components/(user)/workspace/collaborator/ManageConference/ManageConference';
import CollaboratorContractsList from '@/components/(user)/workspace/collaborator/Contract/index';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, className } = props;
    return <img src={src} alt={alt} className={className} />;
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockConferences = [
  {
    conferenceId: '1',
    conferenceName: 'AI Conference 2024',
    description: 'Leading AI conference',
    startDate: '2024-12-20T00:00:00Z',
    endDate: '2024-12-22T00:00:00Z',
    address: 'Hanoi',
    totalSlot: 500,
    conferenceStatusId: 'status-1',
    conferenceCategoryId: 'cat-1',
    bannerImageUrl: '/banner.jpg',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    conferenceId: '2',
    conferenceName: 'Tech Summit 2024',
    description: 'Tech conference',
    startDate: '2024-12-25T00:00:00Z',
    endDate: '2024-12-27T00:00:00Z',
    address: 'HCMC',
    totalSlot: 300,
    conferenceStatusId: 'status-2',
    conferenceCategoryId: 'cat-2',
    bannerImageUrl: null,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

const mockStatuses = [
  { conferenceStatusId: 'status-1', conferenceStatusName: 'pending' },
  { conferenceStatusId: 'status-2', conferenceStatusName: 'preparing' },
  { conferenceStatusId: 'status-3', conferenceStatusName: 'completed' },
  { conferenceStatusId: 'status-4', conferenceStatusName: 'rejected' },
];

const mockCategories = [
  { conferenceCategoryId: 'cat-1', conferenceCategoryName: 'AI & ML' },
  { conferenceCategoryId: 'cat-2', conferenceCategoryName: 'Web Development' },
];

const mockCities = [
  { cityId: 'city-1', cityName: 'Hà Nội' },
  { cityId: 'city-2', cityName: 'TP.HCM' },
];

const mockContracts = [
  {
    collaboratorContractId: 'contract-1',
    conferenceName: 'Tech Conference 2024',
    conferenceCreatedByName: 'John Doe',
    conferenceCreatedByEmail: 'john@example.com',
    conferenceCreatedByAvatarUrl: '/avatar1.jpg',
    isTicketSelling: true,
    commission: 15,
    signDay: '2024-01-15T00:00:00Z',
    finalizePaymentDate: '2024-06-15T00:00:00Z',
    contractUrl: 'https://example.com/contract1.pdf',
    bannerImageUrl: '/banner1.jpg',
    isSponsorStep: true,
    isMediaStep: true,
    isPolicyStep: false,
    isSessionStep: true,
    isPriceStep: true,
  },
  {
    collaboratorContractId: 'contract-2',
    conferenceName: 'AI Summit 2024',
    conferenceCreatedByName: 'Jane Smith',
    conferenceCreatedByEmail: 'jane@example.com',
    conferenceCreatedByAvatarUrl: null,
    isTicketSelling: false,
    commission: 10,
    signDay: '2024-02-20T00:00:00Z',
    finalizePaymentDate: '2024-07-20T00:00:00Z',
    contractUrl: null,
    bannerImageUrl: null,
    isSponsorStep: false,
    isMediaStep: false,
    isPolicyStep: false,
    isSessionStep: false,
    isPriceStep: false,
  },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: { email: 'test@example.com' } }) => state,
      api: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

jest.mock('@/redux/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
  }),
}));

jest.mock('@/redux/services/conference.service', () => ({
  useGetTechnicalConferencesByCollaboratorNoDraftQuery: jest.fn(() => ({
    data: { data: { items: mockConferences, totalCount: 2 } },
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  })),
  useGetTechnicalConferencesByCollaboratorOnlyDraftQuery: jest.fn(() => ({
    data: { data: { items: [], totalCount: 0 } },
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/redux/services/status.service', () => ({
  useGetAllConferenceStatusesQuery: jest.fn(() => ({
    data: { data: mockStatuses },
  })),
}));

jest.mock('@/redux/services/city.service', () => ({
  useGetAllCitiesQuery: jest.fn(() => ({
    data: { data: mockCities },
  })),
}));

jest.mock('@/redux/services/category.service', () => ({
  useGetAllCategoriesQuery: jest.fn(() => ({
    data: { data: mockCategories },
  })),
}));

jest.mock('@/redux/services/contract.service', () => ({
  useGetOwnCollaboratorContractsQuery: jest.fn(() => ({
    data: { data: mockContracts },
    isLoading: false,
    error: null,
  })),
}));

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('ConferenceManagementTabs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome message with user email', () => {
    renderWithProvider(<ConferenceManagementTabs />);
    expect(screen.getByText(/Chào, test@example.com!/i)).toBeInTheDocument();
  });

  it('renders main heading', () => {
    renderWithProvider(<ConferenceManagementTabs />);
    expect(screen.getByText(/Quản lý thông tin các hội thảo công nghệ/i)).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const tabs = screen.getAllByRole('button').filter((btn) =>
      ['Chờ duyệt', 'Đang diễn ra', 'Đã kết thúc', 'Bản nháp', 'Bị từ chối'].some((text) =>
        btn.textContent?.includes(text)
      )
    );

    expect(tabs.length).toBeGreaterThanOrEqual(5);
    expect(screen.getAllByText('Chờ duyệt').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đang diễn ra').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đã kết thúc').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bản nháp').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bị từ chối').length).toBeGreaterThan(0);
  });

  it('renders search input', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội thảo/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội thảo/i);
    fireEvent.change(searchInput, { target: { value: 'AI Conference' } });

    expect(searchInput).toHaveValue('AI Conference');
  });

  it('renders sort select with default value', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('Mới nhất')).toBeInTheDocument();
  });

  it('renders filter button', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('Lọc thêm')).toBeInTheDocument();
  });

  it('changes active tab when tab button is clicked', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const ongoingTab = screen.getByText('Đang diễn ra');
    fireEvent.click(ongoingTab);

    expect(screen.getByText(/Các hội thảo đang trong giai đoạn chuẩn bị/i)).toBeInTheDocument();
  });

  it('renders conference table headers', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('Ảnh')).toBeInTheDocument();
    expect(screen.getByText('Tên hội thảo')).toBeInTheDocument();
    expect(screen.getByText('Bắt đầu')).toBeInTheDocument();
    expect(screen.getByText('Tổng chỗ')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Thao tác')).toBeInTheDocument();
  });

  it('renders conference data in table', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('AI Conference 2024')).toBeInTheDocument();
  });

  it('renders conference image when available', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const image = screen.getByAltText('AI Conference 2024');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/banner.jpg');
  });

  it('renders empty state when no conferences', () => {
    const useGetTechnicalConferencesByCollaboratorNoDraftQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByCollaboratorNoDraftQuery;

    useGetTechnicalConferencesByCollaboratorNoDraftQuery.mockReturnValueOnce({
      data: { data: { items: [], totalCount: 0 } },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ConferenceManagementTabs />);

    const draftTab = screen.getByText('Bản nháp');
    fireEvent.click(draftTab);

    expect(screen.getByText(/Không có hội thảo nào/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const useGetTechnicalConferencesByCollaboratorNoDraftQuery = require('@/redux/services/conference.service').useGetTechnicalConferencesByCollaboratorNoDraftQuery;

    useGetTechnicalConferencesByCollaboratorNoDraftQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText(/Đang tải dữ liệu/i)).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('Trước')).toBeInTheDocument();
    expect(screen.getByText('Tiếp')).toBeInTheDocument();
    expect(screen.getByText(/Trang 1/i)).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const prevButton = screen.getByText('Trước').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('renders statistics cards', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getAllByText('Chờ duyệt').length).toBeGreaterThan(0);
    expect(screen.getByText('Sắp diễn ra')).toBeInTheDocument();
  });

  it('opens filter popover when button clicked', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const filterButton = screen.getByText('Lọc thêm');
    fireEvent.click(filterButton);

    expect(screen.getByText('Bộ lọc')).toBeInTheDocument();
    expect(screen.getByText('Danh mục')).toBeInTheDocument();
    expect(screen.getByText('Thành phố')).toBeInTheDocument();
  });

  it('renders conference status badge', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders total slot with Users icon', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('renders action dropdown button', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const dropdownTriggers = screen.getAllByRole('button');
    const moreButtons = dropdownTriggers.filter((btn) => btn.classList.contains('p-0'));

    expect(moreButtons.length).toBeGreaterThan(0);
  });

  it('displays tab description based on active tab', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText(/Các hội thảo đang chờ Ban tổ chức duyệt/i)).toBeInTheDocument();

    const rejectedTab = screen.getByText('Bị từ chối');
    fireEvent.click(rejectedTab);

    expect(screen.getByText(/Các hội thảo đã bị Ban tổ chức từ chối/i)).toBeInTheDocument();
  });

  it('renders tab count badges', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    const badges = screen.getAllByText(/^\d+$/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('formats date correctly in table', () => {
    renderWithProvider(<ConferenceManagementTabs />);

    expect(screen.getByText(/20\/12\/2024|12\/20\/2024/i)).toBeInTheDocument();
  });
});

describe('CollaboratorContractsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title with user email', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/Danh sách hợp đồng của đối tác/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders page description', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/Các hợp đồng đã được kí kết với ConfRadar/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
    fireEvent.change(searchInput, { target: { value: 'Tech' } });
    expect(searchInput).toHaveValue('Tech');
  });

  it('renders filter select', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('Tất cả')).toBeInTheDocument();
  });

  it('renders all stat cards', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('Tổng hợp đồng')).toBeInTheDocument();
    expect(screen.getAllByText('Liên kết bán vé').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Không bán vé').length).toBeGreaterThan(0);
    expect(screen.getByText('Hoa hồng trung bình')).toBeInTheDocument();
  });

  it('displays correct contract count', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays correct selling contracts count', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const statCards = screen.getAllByText('1');
    expect(statCards.length).toBeGreaterThan(0);
  });

  it('displays average commission', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/13%/i)).toBeInTheDocument();
  });

  it('renders contract name', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    expect(screen.getByText('AI Summit 2024')).toBeInTheDocument();
  });

  it('renders contract creator name', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders contract creator email', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays ticket selling status badge', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getAllByText('Liên kết bán vé').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Không bán vé').length).toBeGreaterThan(0);
  });

  it('displays commission percentage', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('displays formatted sign day', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
  });

  it('displays formatted payment date', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/15\/06\/2024/i)).toBeInTheDocument();
  });

  it('renders download link when contract URL exists', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const downloadLinks = document.querySelectorAll('a[href*="contract1.pdf"]');
    expect(downloadLinks.length).toBeGreaterThan(0);
  });

  it('renders step status section', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const sections = screen.getAllByText(/Các thông tin được ConfRadar liên kết/i);
    expect(sections.length).toBeGreaterThan(0);
  });

  it('displays all step labels', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const sponsorSteps = screen.getAllByText('Nhà tài trợ');
    const mediaSteps = screen.getAllByText('Media');
    const policySteps = screen.getAllByText('Chính sách');
    const sessionSteps = screen.getAllByText('Session');
    const priceSteps = screen.getAllByText('Giá vé');

    expect(sponsorSteps.length).toBeGreaterThan(0);
    expect(mediaSteps.length).toBeGreaterThan(0);
    expect(policySteps.length).toBeGreaterThan(0);
    expect(sessionSteps.length).toBeGreaterThan(0);
    expect(priceSteps.length).toBeGreaterThan(0);
  });

  it('renders loading state', () => {
    const useGetOwnCollaboratorContractsQuery = require('@/redux/services/contract.service').useGetOwnCollaboratorContractsQuery;
    useGetOwnCollaboratorContractsQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/Đang tải hợp đồng/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetOwnCollaboratorContractsQuery = require('@/redux/services/contract.service').useGetOwnCollaboratorContractsQuery;
    useGetOwnCollaboratorContractsQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error loading contracts' },
    });

    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/Không thể tải dữ liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng thử lại sau/i)).toBeInTheDocument();
  });

  it('renders empty state when no contracts', () => {
    const useGetOwnCollaboratorContractsQuery = require('@/redux/services/contract.service').useGetOwnCollaboratorContractsQuery;
    useGetOwnCollaboratorContractsQuery.mockReturnValueOnce({
      data: { data: [] },
      isLoading: false,
      error: null,
    });

    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText(/Không tìm thấy hợp đồng/i)).toBeInTheDocument();
    expect(screen.getByText(/Bạn chưa có hợp đồng nào/i)).toBeInTheDocument();
  });

  it('filters contracts by search term', () => {
    renderWithProvider(<CollaboratorContractsList />);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
    fireEvent.change(searchInput, { target: { value: 'Tech' } });

    expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    expect(screen.queryByText('AI Summit 2024')).not.toBeInTheDocument();
  });

  it('renders banner image when available', () => {
    renderWithProvider(<CollaboratorContractsList />);
    const images = document.querySelectorAll('img[alt="Tech Conference 2024"]');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders avatar component', () => {
    renderWithProvider(<CollaboratorContractsList />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});