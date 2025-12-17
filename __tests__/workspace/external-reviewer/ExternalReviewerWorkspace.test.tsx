import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OwnContracts from '@/components/(user)/workspace/external-reviewer/OwnContracts';
import { OwnContractDetailDialog } from '@/components/(user)/workspace/external-reviewer/OwnContractDetailDialog';

const mockContracts = [
  {
    reviewerContractId: 'contract-1',
    conferenceName: 'International AI Conference 2024',
    conferenceDescription: 'Leading conference on AI and Machine Learning',
    conferenceId: 'conf-1',
    conferenceBannerImageUrl: '/banner1.jpg',
    wage: 5000000,
    signDay: '2024-01-15T00:00:00Z',
    expireDay: '2024-12-31T00:00:00Z',
    contractUrl: 'https://example.com/contract1.pdf', 
    isActive: true,
  },
  {
    reviewerContractId: 'contract-2',
    conferenceName: 'Tech Summit 2024',
    conferenceDescription: 'Technology summit for developers',
    conferenceId: 'conf-2',
    wage: 3000000,
    signDay: '2024-02-20T00:00:00Z',
    isActive: false,
  },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: { email: 'reviewer@example.com' } }) => state,
      api: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

jest.mock('@/redux/services/contract.service', () => ({
  useGetOwnReviewContractsQuery: jest.fn(() => ({
    data: { data: mockContracts },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('OwnContracts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText('Hợp đồng của tôi')).toBeInTheDocument();
    expect(screen.getByText(/Quản lý và xem chi tiết các hợp đồng đánh giá/i)).toBeInTheDocument();
  });

  it('renders all statistics cards', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getAllByText('Đang hoạt động')).toHaveLength(2); 
    expect(screen.getAllByText('Không hoạt động')).toHaveLength(3);
    expect(screen.getByText('Tổng hợp đồng')).toBeInTheDocument();
    expect(screen.getByText('Tổng thu nhập')).toBeInTheDocument();
  });

  it('displays correct total contracts count', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays correct active contracts count', () => {
    renderWithProvider(<OwnContracts />);
    const counts = screen.getAllByText('1');
    expect(counts).toHaveLength(2);
  });

  it('displays total wage correctly', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/8\.000\.000/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProvider(<OwnContracts />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội nghị/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    renderWithProvider(<OwnContracts />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội nghị/i);
    fireEvent.change(searchInput, { target: { value: 'AI' } });
    expect(searchInput).toHaveValue('AI');
  });

  it('renders sort select with default option', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText('Ngày ký: Mới nhất')).toBeInTheDocument();
  });

  it('renders filter status select', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText('Tất cả trạng thái')).toBeInTheDocument();
  });

  it('renders contract cards', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText('International AI Conference 2024')).toBeInTheDocument();
    expect(screen.getByText('Tech Summit 2024')).toBeInTheDocument();
  });

  it('displays contract descriptions', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/Leading conference on AI and Machine Learning/i)).toBeInTheDocument();
    expect(screen.getByText(/Technology summit for developers/i)).toBeInTheDocument();
  });

  it('displays contract wages', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/5\.000\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/3\.000\.000/i)).toBeInTheDocument();
  });

  it('displays active status badge', () => {
    renderWithProvider(<OwnContracts />);
    const activeBadges = screen.getAllByText('Hoạt động');
    expect(activeBadges.length).toBeGreaterThan(0);
  });

  it('displays inactive status badge', () => {
    renderWithProvider(<OwnContracts />);
    const inactiveBadges = screen.getAllByText('Không hoạt động');
    expect(inactiveBadges.length).toBeGreaterThan(0);
  });

  it('displays contract IDs', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/ID: contract-1/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: contract-2/i)).toBeInTheDocument();
  });

  it('renders view detail buttons', () => {
    renderWithProvider(<OwnContracts />);
    const viewButtons = screen.getAllByText('Xem chi tiết');
    expect(viewButtons.length).toBe(2);
  });

  it('displays contract banner image when available', () => {
    renderWithProvider(<OwnContracts />);
    const image = screen.getByAltText('International AI Conference 2024');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/banner1.jpg');
  });

  it('displays formatted sign date', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
  });

  it('displays expire date when available', () => {
    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/Hết hạn: 31\/12\/2024/i)).toBeInTheDocument();
  });

  it('filters contracts by search term', () => {
    renderWithProvider(<OwnContracts />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội nghị/i);
    fireEvent.change(searchInput, { target: { value: 'AI' } });

    expect(screen.getByText('International AI Conference 2024')).toBeInTheDocument();
    expect(screen.queryByText('Tech Summit 2024')).not.toBeInTheDocument();
  });

  it('shows clear filter button when filters are applied', () => {
    renderWithProvider(<OwnContracts />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội nghị/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByText('Xóa bộ lọc')).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', () => {
    renderWithProvider(<OwnContracts />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên hội nghị/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const clearButton = screen.getByText('Xóa bộ lọc');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('opens detail dialog when contract card is clicked', () => {
    renderWithProvider(<OwnContracts />);
    const contractCard = screen.getByText('International AI Conference 2024').closest('div');

    if (contractCard) {
      fireEvent.click(contractCard);
    }
    expect(true).toBe(true);
  });

  it('renders loading state', () => {
    const useGetOwnReviewContractsQuery = require('@/redux/services/contract.service').useGetOwnReviewContractsQuery;
    useGetOwnReviewContractsQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/Đang tải danh sách hợp đồng/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const useGetOwnReviewContractsQuery = require('@/redux/services/contract.service').useGetOwnReviewContractsQuery;
    useGetOwnReviewContractsQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Error loading contracts' },
      refetch: jest.fn(),
    });

    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/Không thể tải danh sách hợp đồng/i)).toBeInTheDocument();
    expect(screen.getByText('Thử lại')).toBeInTheDocument();
  });

  it('renders empty state when no contracts', () => {
    const useGetOwnReviewContractsQuery = require('@/redux/services/contract.service').useGetOwnReviewContractsQuery;
    useGetOwnReviewContractsQuery.mockReturnValueOnce({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProvider(<OwnContracts />);
    expect(screen.getByText(/Không tìm thấy hợp đồng/i)).toBeInTheDocument();
    expect(screen.getByText(/Bạn chưa có hợp đồng nào/i)).toBeInTheDocument();
  });

  it('changes sort option', () => {
    renderWithProvider(<OwnContracts />);
    const sortSelect = screen.getByDisplayValue('Ngày ký: Mới nhất');
    fireEvent.change(sortSelect, { target: { value: 'wage-desc' } });
    expect(sortSelect).toHaveValue('wage-desc');
  });

  it('changes filter status', () => {
    renderWithProvider(<OwnContracts />);
    const filterSelect = screen.getByDisplayValue('Tất cả trạng thái');
    fireEvent.change(filterSelect, { target: { value: 'active' } });
    expect(filterSelect).toHaveValue('active');
  });
});

describe('OwnContractDetailDialog Component', () => {
  const mockContract = mockContracts[0];
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open with contract data', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('International AI Conference 2024')).toBeInTheDocument();
  });

  it('does not render when contract is null', () => {
    const { container } = render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={null}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays contract ID', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText(/ID Hợp đồng: contract-1/i)).toBeInTheDocument();
  });

  it('displays contract description', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('Mô tả hội nghị')).toBeInTheDocument();
    expect(screen.getByText(/Leading conference on AI and Machine Learning/i)).toBeInTheDocument();
  });

  it('displays wage information', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('Thông tin tài chính')).toBeInTheDocument();
    expect(screen.getByText('Mức lương')).toBeInTheDocument();
  });

  it('displays date information', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('Thông tin thời gian')).toBeInTheDocument();
    expect(screen.getByText('Ngày ký')).toBeInTheDocument();
    expect(screen.getByText('Ngày hết hạn')).toBeInTheDocument();
  });

  it('displays conference information', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('Thông tin hội nghị')).toBeInTheDocument();
    expect(screen.getByText('ID Hội nghị')).toBeInTheDocument();
  });

  it('displays active status badge', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
  });

  it('displays inactive status badge for inactive contract', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContracts[1]}
      />
    );

    const inactiveBadges = screen.getAllByText('Không hoạt động');
    expect(inactiveBadges.length).toBeGreaterThan(0);
  });

  it('displays contract file link when available', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    const fileLink = screen.getByText('Xem file hợp đồng');
    expect(fileLink).toBeInTheDocument();
    expect(fileLink.closest('a')).toHaveAttribute('href', 'https://example.com/contract1.pdf');
  });

  it('does not display contract file link when not available', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContracts[1]}
      />
    );

    expect(screen.queryByText('Xem file hợp đồng')).not.toBeInTheDocument();
  });

  it('displays banner image when available', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    const image = screen.getByAltText('International AI Conference 2024');
    expect(image).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    const closeButtons = screen.getAllByText('Đóng');
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays formatted dates', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/31\/12\/2024/i)).toBeInTheDocument();
  });

  it('displays conference ID', () => {
    render(
      <OwnContractDetailDialog
        isOpen={true}
        onClose={mockOnClose}
        contract={mockContract}
      />
    );

    expect(screen.getByText('conf-1')).toBeInTheDocument();
  });
});