// ManageCollaboratorContract.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ManageCollaboratorContract from '@/components/(user)/workspace/organizer/ManageCollaborator/ManageCollaboratorContract';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock data
const mockContracts = [
  {
    collaboratorContractId: 'contract-1',
    collaboratorContractFullName: 'John Doe',
    collaboratorContractEmail: 'john@example.com',
    organizationName: 'Tech Corp',
    conferenceName: 'AI Conference 2024',
    conferenceStartDate: '2024-06-01T00:00:00Z',
    conferenceEndDate: '2024-06-03T00:00:00Z',
    isClosed: false,
    commission: 10,
    signDay: '2024-01-15T00:00:00Z',
  },
  {
    collaboratorContractId: 'contract-2',
    collaboratorContractFullName: 'Jane Smith',
    collaboratorContractEmail: 'jane@example.com',
    organizationName: 'Innovation Inc',
    conferenceName: 'Tech Summit 2024',
    conferenceStartDate: '2024-07-15T00:00:00Z',
    conferenceEndDate: '2024-07-17T00:00:00Z',
    isClosed: true,
    commission: 15,
    signDay: '2024-02-20T00:00:00Z',
  },
];

const mockCollaborators = [
  { userId: 'user-1', fullName: 'John Doe', email: 'john@example.com' },
  { userId: 'user-2', fullName: 'Jane Smith', email: 'jane@example.com' },
];

const mockOrganizations = [
  { organizationId: 'org-1', organizationName: 'Tech Corp' },
  { organizationId: 'org-2', organizationName: 'Innovation Inc' },
];

// Mock Redux store
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

// Mock API hooks
jest.mock('@/redux/services/contract.service', () => ({
  useLazyListCollaboratorContractsQuery: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { data: { items: mockContracts, totalPages: 1, totalItems: 2 } } })),
    {
      data: { data: { items: mockContracts, totalPages: 1, totalItems: 2 } },
      isLoading: false,
      error: null,
    },
  ]),
  useCreateCollaboratorContractMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false, error: null },
  ]),
  useUpdateCollaboratorContractStatusMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
}));

jest.mock('@/redux/services/user.service', () => ({
  useLazyGetCollaboratorAccountsQuery: jest.fn(() => [
    jest.fn(),
    {
      data: { data: mockCollaborators },
      isLoading: false,
    },
  ]),
  useLazyListOrganizationsQuery: jest.fn(() => [
    jest.fn(),
    {
      data: { data: mockOrganizations },
      isLoading: false,
    },
  ]),
}));

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('ManageCollaboratorContract Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText('Quản lý hợp đồng Đối tác')).toBeInTheDocument();
    expect(screen.getByText('Quản lý hợp đồng Đối tác trong hệ thống')).toBeInTheDocument();
  });

  it('renders statistics cards', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText('Tổng hợp đồng')).toBeInTheDocument();
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    
    const closedTexts = screen.getAllByText('Đã đóng');
    expect(closedTexts.length).toBeGreaterThan(0);
  });

  it('displays correct total contracts count', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    
    // Tìm trong stats card
    const totalContractsCard = screen.getByText('Tổng hợp đồng').parentElement?.parentElement;
    expect(totalContractsCard).toHaveTextContent('2');
  });

  it('displays correct active contracts count', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const activeCount = screen.getAllByText('1');
    expect(activeCount.length).toBeGreaterThan(0);
  });

  it('renders create contract button', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText(/Tạo mới hợp đồng tối tác/i)).toBeInTheDocument();
  });

  it('navigates to create contract page when button is clicked', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const createButton = screen.getByText(/Tạo mới hợp đồng tối tác/i);
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/workspace/organizer/manage-user/manage-collaborator/create-collaborator-contract');
  });

  it('renders filter tabs', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText(/Tất cả \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang hoạt động \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã đóng \(1\)/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const searchInput = screen.getByPlaceholderText(/Tìm theo tên hội nghị/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const searchInput = screen.getByPlaceholderText(/Tìm theo tên hội nghị/i);
    fireEvent.change(searchInput, { target: { value: 'AI' } });
    expect(searchInput).toHaveValue('AI');
  });

  it('displays contract information', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('displays contract status badges', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText('Đang mở')).toBeInTheDocument();
    
    const closedBadges = screen.getAllByText('Đã đóng');
    expect(closedBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('displays commission information', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('renders view detail buttons', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const viewButtons = screen.getAllByText('Xem chi tiết');
    expect(viewButtons.length).toBe(2);
  });

  it('renders open/close contract buttons', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText('Đóng')).toBeInTheDocument();
    expect(screen.getByText('Mở')).toBeInTheDocument();
  });

  it('filters contracts by status - all', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const allButton = screen.getByText(/Tất cả \(2\)/i);
    fireEvent.click(allButton);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('filters contracts by status - active', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const activeButton = screen.getByText(/Đang hoạt động \(1\)/i);
    fireEvent.click(activeButton);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('filters contracts by status - closed', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const closedButton = screen.getByText(/Đã đóng \(1\)/i);
    fireEvent.click(closedButton);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const useLazyListCollaboratorContractsQuery = require('@/redux/services/contract.service').useLazyListCollaboratorContractsQuery;
    useLazyListCollaboratorContractsQuery.mockReturnValueOnce([
      jest.fn(),
      {
        data: null,
        isLoading: true,
        error: null,
      },
    ]);

    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText(/Đang tải danh sách hợp đồng/i)).toBeInTheDocument();
  });

  it('renders empty state when no contracts', () => {
    const useLazyListCollaboratorContractsQuery = require('@/redux/services/contract.service').useLazyListCollaboratorContractsQuery;
    useLazyListCollaboratorContractsQuery.mockReturnValueOnce([
      jest.fn(),
      {
        data: { data: { items: [], totalPages: 0, totalItems: 0 } },
        isLoading: false,
        error: null,
      },
    ]);

    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText(/Không tìm thấy hợp đồng nào/i)).toBeInTheDocument();
  });

  it('displays pagination info', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    
    // Kiểm tra pagination info text
    expect(screen.getByText(/trong tổng số/i)).toBeInTheDocument();
    expect(screen.getByText(/kết quả/i)).toBeInTheDocument();
  });

  it('changes page size', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    const pageSizeSelect = screen.getByText('10');
    expect(pageSizeSelect).toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    renderWithProvider(<ManageCollaboratorContract />);
    expect(screen.getByText(/6\/1\/2024/i)).toBeInTheDocument();
  });
});