// ManageUser.test.tsx
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ManageCustomer from '@/components/(user)/workspace/organizer/ManageCustomer/ManageCustomer';
import ManageExternalReviewer from '@/components/(user)/workspace/organizer/ManageExternalReviewer/ManageExternalReviewer';
import ManageLocalReviewer from '@/components/(user)/workspace/organizer/ManageLocalReviewer/ManageLocalReviewer';

const mockCustomers = [
  {
    userId: 'user-1',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    isActive: true,
    phoneNumber: '0123456789',
    avatarUrl: '/avatar1.jpg',
  },
  {
    userId: 'user-2',
    fullName: 'Trần Thị B',
    email: 'tranthib@example.com',
    isActive: false,
    phoneNumber: '0987654321',
    avatarUrl: null,
  },
];

const mockExternalReviewers = [
  {
    userId: 'reviewer-1',
    fullName: 'Phạm Văn C',
    email: 'phamvanc@example.com',
    isActive: true,
    phoneNumber: '0111222333',
    avatarUrl: '/reviewer1.jpg',
  },
  {
    userId: 'reviewer-2',
    fullName: 'Lê Thị D',
    email: 'lethid@example.com',
    isActive: false,
    phoneNumber: '0444555666',
    avatarUrl: null,
  },
];

const mockLocalReviewers = [
  {
    userId: 'local-1',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    isActive: true,
    phoneNumber: '0777888999',
    avatarUrl: '/local1.jpg',
  },
];

const mockUsersData = {
  data: [
    { roleName: 'Customer', users: mockCustomers },
    { roleName: 'External Reviewer', users: mockExternalReviewers },
    { roleName: 'Local Reviewer', users: mockLocalReviewers },
  ],
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: { email: 'organizer@example.com' } }) => state,
      api: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

jest.mock('@/redux/services/user.service', () => ({
  useGetUsersListQuery: jest.fn(() => ({
    data: mockUsersData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useGetProfileByIdQuery: jest.fn(() => ({ data: { data: mockCustomers[0] }, isLoading: false })),
  useSuspendAccountMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useActivateAccountMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateCollaboratorMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
  useSuspendExternalReviewerMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useActivateExternalReviewerMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateLocalReviewerAccountMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
}));

jest.mock('@/redux/services/contract.service', () => ({
  useCreateReviewContractForNewUserMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
  useCreateReviewContractMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
  useGetUsersForReviewerContractQuery: jest.fn(() => ({ data: null })),
  useGetResearchConferencesForOrganizerQuery: jest.fn(() => ({ data: null, isLoading: false })),
}));

jest.mock('@/redux/services/conference.service', () => ({
  useGetResearchConferencesForOrganizerQuery: jest.fn(() => ({ data: null, isLoading: false })),
}));

jest.mock('@/redux/services/city.service', () => ({
  useGetAllCitiesQuery: jest.fn(() => ({ data: null })),
}));

jest.mock('@/redux/services/status.service', () => ({
  useGetAllConferenceStatusesQuery: jest.fn(() => ({ data: null })),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('ManageCustomer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<ManageCustomer />);
    expect(screen.getByText('Quản lý Khách hàng')).toBeInTheDocument();
    expect(screen.getByText(/Quản lý tài khoản khách hàng trong hệ thống/i)).toBeInTheDocument();
  });

  it('renders search bar', () => {
    renderWithProvider(<ManageCustomer />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, email/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search bar', () => {
    renderWithProvider(<ManageCustomer />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, email/i);
    fireEvent.change(searchInput, { target: { value: 'Nguyễn' } });
    expect(searchInput).toHaveValue('Nguyễn');
  });

  it('renders filter tabs', () => {
    renderWithProvider(<ManageCustomer />);
    expect(screen.getByText(/Tất cả \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang hoạt động \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tạm ngưng \(1\)/i)).toBeInTheDocument();
  });

  it('changes filter when tab is clicked', () => {
    renderWithProvider(<ManageCustomer />);
    const activeTab = screen.getByText(/Đang hoạt động \(1\)/i);
    fireEvent.click(activeTab);
    expect(activeTab).toHaveClass('bg-green-600');
  });

  it('renders statistics cards', () => {
    renderWithProvider(<ManageCustomer />);
    expect(screen.getByText('Tổng số Khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();

    const suspendedLabels = screen.getAllByText('Tạm ngưng');
    const isStatsLabel = suspendedLabels.some(el =>
      el.classList.contains('text-gray-600') && el.classList.contains('text-sm')
    );
    expect(isStatsLabel).toBe(true);
  });

  it('displays correct customer count', () => {
    renderWithProvider(<ManageCustomer />);
    const totalLabel = screen.getByText('Tổng số Khách hàng');
    const totalCard = totalLabel.closest('div')!;
    expect(within(totalCard).getByText('2')).toBeInTheDocument();
  });

  it('displays correct active count', () => {
    renderWithProvider(<ManageCustomer />);
    const activeLabel = screen.getByText('Đang hoạt động');
    const activeCard = activeLabel.closest('div')!;
    expect(within(activeCard).getByText('1')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageCustomer />);
    expect(screen.getByText(/Đang tải danh sách khách hàng/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error' },
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageCustomer />);
    expect(screen.getByText(/Không thể tải danh sách khách hàng/i)).toBeInTheDocument();
    expect(screen.getByText('Thử lại')).toBeInTheDocument();
  });

  it('renders pagination when more than 10 items', () => {
    const largeCustomerList = Array.from({ length: 15 }, (_, i) => ({
      userId: `user-${i}`,
      fullName: `User ${i}`,
      email: `user${i}@example.com`,
      isActive: true,
      phoneNumber: '0123456789',
      avatarUrl: null,
    }));

    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: {
        data: [{ roleName: 'Customer', users: largeCustomerList }],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageCustomer />);
    expect(screen.getByText('Trước')).toBeInTheDocument();
    expect(screen.getByText('Sau')).toBeInTheDocument();
  });
});

describe('ManageExternalReviewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText('Quản lý Người đánh giá thuê theo hợp đồng')).toBeInTheDocument();
    expect(screen.getByText(/Quản lý tài khoản người đánh giá theo hợp đồng/i)).toBeInTheDocument();
  });

  it('renders add external reviewer button', () => {
    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText(/Thêm người đánh giá theo hợp đồng/i)).toBeInTheDocument();
  });

  it('renders create contract button', () => {
    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText('Tạo hợp đồng')).toBeInTheDocument();
  });

  it('renders search bar', () => {
    renderWithProvider(<ManageExternalReviewer />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, email/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders filter tabs', () => {
    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText(/Tất cả \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang hoạt động \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tạm ngưng \(1\)/i)).toBeInTheDocument();
  });

  it('renders statistics cards', () => {
    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText('Tổng số người đánh giá theo hợp đồng')).toBeInTheDocument();
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();

    const suspendedLabels = screen.getAllByText('Tạm ngưng');
    const isStatsLabel = suspendedLabels.some(el =>
      el.classList.contains('text-gray-600') && el.classList.contains('text-sm')
    );
    expect(isStatsLabel).toBe(true);
  });

  it('displays correct reviewer count', () => {
    renderWithProvider(<ManageExternalReviewer />);
    const totalLabel = screen.getByText('Tổng số người đánh giá theo hợp đồng');
    const totalCard = totalLabel.closest('div')!;
    expect(within(totalCard).getByText('2')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText(/Đang tải danh sách người đánh giá theo hợp đồng/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error' },
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageExternalReviewer />);
    expect(screen.getByText(/Không thể tải danh sách người đánh giá theo hợp đồng/i)).toBeInTheDocument();
  });

  it('changes filter when tab is clicked', () => {
    renderWithProvider(<ManageExternalReviewer />);
    const activeTab = screen.getByText(/Đang hoạt động \(1\)/i);
    fireEvent.click(activeTab);
    expect(activeTab).toHaveClass('bg-green-600');
  });

  it('allows typing in search bar', () => {
    renderWithProvider(<ManageExternalReviewer />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, email/i);
    fireEvent.change(searchInput, { target: { value: 'Phạm' } });
    expect(searchInput).toHaveValue('Phạm');
  });
});

describe('ManageLocalReviewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText('Người đánh giá nội bộ của tổ chức')).toBeInTheDocument();
    expect(screen.getByText(/Quản lý tài khoản người đánh giá nội bộ hệ thống/i)).toBeInTheDocument();
  });

  it('renders add local reviewer button', () => {
    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText(/Thêm người đánh giá nội bộ/i)).toBeInTheDocument();
  });

  it('renders search bar', () => {
    renderWithProvider(<ManageLocalReviewer />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, email/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search bar', () => {
    renderWithProvider(<ManageLocalReviewer />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên, email/i);
    fireEvent.change(searchInput, { target: { value: 'Hoàng' } });
    expect(searchInput).toHaveValue('Hoàng');
  });

  it('renders filter tabs', () => {
    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText(/Tất cả \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang hoạt động \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tạm ngưng \(0\)/i)).toBeInTheDocument();
  });

  it('changes filter when tab is clicked', () => {
    renderWithProvider(<ManageLocalReviewer />);
    const activeTab = screen.getByText(/Đang hoạt động \(1\)/i);
    fireEvent.click(activeTab);
    expect(activeTab).toHaveClass('bg-green-600');
  });

  it('renders statistics cards', () => {
    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText('Tổng số người đánh giá nội bộ')).toBeInTheDocument();
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();

    const suspendedLabels = screen.getAllByText('Tạm ngưng');
    const isStatsLabel = suspendedLabels.some(el =>
      el.classList.contains('text-gray-600') && el.classList.contains('text-sm')
    );
    expect(isStatsLabel).toBe(true);
  });

  it('displays correct reviewer count', () => {
    renderWithProvider(<ManageLocalReviewer />);
    const totalLabel = screen.getByText('Tổng số người đánh giá nội bộ');
    const totalCard = totalLabel.closest('div')!;
    expect(within(totalCard).getByText('1')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText(/Đang tải danh sách người đánh giá nội bộ/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error' },
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText(/Không thể tải danh sách người đánh giá nội bộ/i)).toBeInTheDocument();
  });

  it('renders pagination when more than 10 items', () => {
    const largeReviewerList = Array.from({ length: 15 }, (_, i) => ({
      userId: `local-${i}`,
      fullName: `Reviewer ${i}`,
      email: `reviewer${i}@example.com`,
      isActive: true,
      phoneNumber: '0123456789',
      avatarUrl: null,
    }));

    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: {
        data: [{ roleName: 'Local Reviewer', users: largeReviewerList }],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageLocalReviewer />);
    expect(screen.getByText('Trước')).toBeInTheDocument();
    expect(screen.getByText('Sau')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    const largeReviewerList = Array.from({ length: 15 }, (_, i) => ({
      userId: `local-${i}`,
      fullName: `Reviewer ${i}`,
      email: `reviewer${i}@example.com`,
      isActive: true,
      phoneNumber: '0123456789',
      avatarUrl: null,
    }));

    const useGetUsersListQuery = require('@/redux/services/user.service').useGetUsersListQuery;
    useGetUsersListQuery.mockReturnValueOnce({
      data: {
        data: [{ roleName: 'Local Reviewer', users: largeReviewerList }],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<ManageLocalReviewer />);
    const prevButton = screen.getByText('Trước').closest('button');
    expect(prevButton).toBeDisabled();
  });
});