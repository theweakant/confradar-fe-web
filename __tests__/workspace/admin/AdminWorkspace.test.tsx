import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import '@testing-library/jest-dom';
import ManageCategory from '@/components/(user)/workspace/admin/ManageCategory/ManageCategory';
import ManageReport from '@/components/(user)/workspace/admin/ManageReport/ManageReport';
import ManageRoom from '@/components/(user)/workspace/admin/ManageRoom/ManageRoom';
import ManageSystemLogs from '@/components/(user)/workspace/admin/SystemLogs/ManageSystemLogs';
import { CategoryDetail } from '@/components/(user)/workspace/admin/ManageCategory/CategoryDetail/index';
import { CategoryForm } from '@/components/(user)/workspace/admin/ManageCategory/CategoryForm/index';
import { DestinationDetail } from '@/components/(user)/workspace/admin/ManageRoom/DestinationDetail';
import { DestinationForm } from '@/components/(user)/workspace/admin/ManageRoom/DestinationForm/index';
import { RoomDetail } from '@/components/(user)/workspace/admin/ManageRoom/RoomDetail/index';

jest.mock('@/redux/services/category.service', () => ({
  useGetAllCategoriesQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    refetch: jest.fn(),
  })),
  useCreateCategoryMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ message: 'Success' }) })),
    { isLoading: false }
  ]),
  useUpdateCategoryMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ message: 'Success' }) })),
    { isLoading: false }
  ]),
  useDeleteCategoryMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ unwrap: () => Promise.resolve({ message: 'Success' }) })),
    { isLoading: false }
  ]),
}));

jest.mock('@/redux/hooks/useReport', () => ({
  useReport: jest.fn(() => ({
    getUnresolvedReportsLazy: jest.fn(() => Promise.resolve({ data: [] })),
    sendReportResponse: jest.fn(() => Promise.resolve({})),
    loading: false,
  })),
}));

jest.mock('@/redux/services/room.service', () => ({
  useGetAllRoomsQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    refetch: jest.fn(),
  })),
  useCreateRoomMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      unwrap: () => Promise.resolve({ message: 'Thêm phòng mới thành công!' }) 
    })),
    { isLoading: false }
  ]),
  useUpdateRoomMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      unwrap: () => Promise.resolve({ message: 'Cập nhật thông tin phòng thành công!' }) 
    })),
    { isLoading: false }
  ]),
  useDeleteRoomMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      unwrap: () => Promise.resolve({ message: 'Xóa phòng thành công!' }) 
    })),
    { isLoading: false }
  ]),
  useGetRoomOccupationSlotsQuery: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/redux/services/destination.service', () => ({
  useGetAllDestinationsQuery: jest.fn(() => ({ 
    data: { data: [] }, 
    isLoading: false,
    refetch: jest.fn(),
  })),
  useCreateDestinationMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      unwrap: () => Promise.resolve({ message: 'Thêm địa điểm mới thành công!' }) 
    })),
    { isLoading: false }
  ]),
  useUpdateDestinationMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      unwrap: () => Promise.resolve({ message: 'Cập nhật thông tin địa điểm thành công!' }) 
    })),
    { isLoading: false }
  ]),
}));

jest.mock('@/redux/services/city.service', () => ({
  useGetAllCitiesQuery: jest.fn(() => ({
    data: { data: [{ cityId: 'city-1', cityName: 'Hồ Chí Minh' }] },
    isLoading: false,
  })),
}));

jest.mock('@/redux/services/auditlog.service', () => ({
  useLazyGetAuditLogsQuery: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      data: { data: [] },
      unwrap: () => Promise.resolve({ data: [] })
    })), 
    { isLoading: false }
  ]),
  useLazyGetAuditLogCategoriesQuery: jest.fn(() => [
    jest.fn(() => Promise.resolve({ 
      data: { data: [] },
      unwrap: () => Promise.resolve({ data: [] })
    })), 
    { isLoading: false }
  ]),
}));

jest.mock('@/redux/hooks/destination/useDestinationForm', () => ({
  useDestinationForm: jest.fn(() => ({
    formData: {
      name: '',
      cityId: '',
      district: '',
      street: '',
    },
    errors: {},
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    validateForm: jest.fn(() => true),
    resetForm: jest.fn(),
  })),
}));

jest.mock('@/components/ui/button', () => ({ 
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button> 
}));

jest.mock('@/components/ui/badge', () => ({ 
  Badge: ({ children, className }: any) => <span className={className}>{children}</span> 
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/select', () => {
  const MockSelect = ({ children }: any) => <div>{children}</div>;
  return {
    Select: MockSelect,
    SelectTrigger: MockSelect,
    SelectContent: MockSelect,
    SelectItem: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => <span>Chọn</span>,
  };
});

jest.mock('@/components/ui/input', () => ({ 
  Input: ({ ...props }: any) => <input {...props} /> 
}));

jest.mock('@/components/molecules/FormInput', () => ({
  FormInput: ({ label, error, value, onChange, onBlur, placeholder }: any) => {
    const id = label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={id}>{label}</label>}
        <input 
          id={id}
          value={value} 
          onChange={(e) => onChange?.(e.target.value)} 
          onBlur={onBlur} 
          placeholder={placeholder} 
        />
        {error && <p data-testid="form-error">{error}</p>}
      </div>
    );
  },
}));

jest.mock('@/components/molecules/SearchFilter', () => ({ 
  SearchFilter: () => <div data-testid="search-filter">SearchFilter</div> 
}));

jest.mock('@/components/atoms/StatusBadge', () => ({ 
  StatusBadge: ({ status }: any) => <span>[Badge] {status}</span> 
}));

jest.mock('@/components/molecules/Modal', () => ({ 
  Modal: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null 
}));

jest.mock('@/components/(user)/workspace/admin/ManageRoom/DestinationDetail', () => ({
  DestinationDetail: ({ destination, onClose }: any) => (
    <div>
      <div>{destination.name}</div>
      <div>{destination.cityName}</div>
      <div>{destination.district}</div>
      <div>{destination.street}</div>
      <button onClick={onClose}>Đóng</button>
    </div>
  ),
}));

jest.mock('@/components/(user)/workspace/admin/ManageRoom/RoomTable/index', () => ({
  RoomTable: () => <div data-testid="room-table">Room Table</div>
}));

jest.mock('@/components/(user)/workspace/admin/ManageRoom/DestinationTable', () => ({
  __esModule: true,
  default: () => <div data-testid="destination-table">Destination Table</div>
}));

jest.mock('@fullcalendar/react', () => ({ 
  default: () => <div data-testid="fullcalendar-mock">Lịch sử sử dụng (mock)</div> 
}));

jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/timegrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/utils/validationRoomRules', () => ({
  validationDestinationRules: {
    name: [{ validate: (v: string) => !!v, message: 'Required' }],
    cityId: [{ validate: (v: string) => !!v, message: 'Required' }],
    district: [{ validate: (v: string) => !!v, message: 'Required' }],
    street: [{ validate: (v: string) => !!v, message: 'Required' }],
  },
}));

jest.mock('@/helper/format', () => ({ 
  formatDate: (d: string) => '01/01/2025' 
}));

jest.mock('lucide-react', () => {
  const icons = [
    'FolderOpen', 'FileText', 'Plus', 'Home', 'MapPin', 'Building', 'Tag', 
    'Calendar', 'Clock', 'Search', 'User', 'Activity', 'ChevronLeft', 
    'ChevronRight', 'AlertTriangle', 'XCircle', 'CheckCircle'
  ];
  const mock: Record<string, any> = {};
  icons.forEach(name => {
    mock[name] = () => <svg data-icon={name.toLowerCase()} />;
  });
  return mock;
});

describe('CategoryDetail', () => {
  it('renders category name and ID', () => {
    render(
      <CategoryDetail 
        category={{ conferenceCategoryId: 'cat-1', conferenceCategoryName: 'AI' }} 
        onClose={jest.fn()} 
      />
    );
    
    const aiTexts = screen.getAllByText('AI');
    expect(aiTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('cat-1')).toBeInTheDocument();
  });
});

describe('CategoryForm', () => {
  it('renders input and buttons', () => {
    render(<CategoryForm onSave={jest.fn()} onCancel={jest.fn()} />);
    
    expect(screen.getByText('Tên danh mục')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/VD:/)).toBeInTheDocument();
    expect(screen.getByText('Thêm mới')).toBeInTheDocument();
    expect(screen.getByText('Hủy')).toBeInTheDocument();
  });

  it('shows "Cập nhật" when editing', () => {
    render(
      <CategoryForm 
        category={{ conferenceCategoryId: 'cat-1', conferenceCategoryName: 'AI' }} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    expect(screen.getByText('Cập nhật')).toBeInTheDocument();
  });
});

describe('DestinationDetail', () => {
  it('renders destination info', () => {
    const dest = {
      destinationId: 'dest-1',
      name: 'Trung tâm Hội nghị',
      cityId: 'city-1',
      cityName: 'Hồ Chí Minh',
      district: 'Quận 1',
      street: 'Lê Lợi',
    };
    render(<DestinationDetail destination={dest} onClose={jest.fn()} />);
    expect(screen.getByText('Trung tâm Hội nghị')).toBeInTheDocument();
    expect(screen.getByText('Hồ Chí Minh')).toBeInTheDocument();
    expect(screen.getByText('Quận 1')).toBeInTheDocument();
    expect(screen.getByText('Lê Lợi')).toBeInTheDocument();
  });
});

describe('DestinationForm', () => {
  it('renders form fields', () => {
    render(<DestinationForm onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText('Tên địa điểm')).toBeInTheDocument();
    expect(screen.getByText('Thành phố')).toBeInTheDocument();
    expect(screen.getByText('Quận / Huyện')).toBeInTheDocument();
    expect(screen.getByText('Đường')).toBeInTheDocument();
    expect(screen.getByText('Thêm mới')).toBeInTheDocument();
  });

  it('shows "Cập nhật" when editing', () => {
    const dest = {
      destinationId: 'dest-1',
      name: 'New Place',
      cityId: 'city-1',
      cityName: 'Hồ Chí Minh',
      district: 'Q1',
      street: 'ABC',
    };
    render(<DestinationForm destination={dest} onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText('Cập nhật')).toBeInTheDocument();
  });
});

describe('RoomDetail', () => {
  it('renders room info tab by default', () => {
    const room = {
      roomId: 'room-1',
      displayName: 'Phòng A101',
      number: 'A101',
      destinationId: 'dest-1',
    };
    render(<RoomDetail room={room} onClose={jest.fn()} />);
    
    const roomNames = screen.getAllByText('Phòng A101');
    expect(roomNames.length).toBeGreaterThan(0);
    expect(screen.getByText('A101')).toBeInTheDocument();
    expect(screen.getByText('Thông tin phòng')).toBeInTheDocument();
  });

  it('renders session tab content when switched', async () => {
    const user = userEvent.setup();
    const room = {
      roomId: 'room-1',
      displayName: 'Phòng A101',
      number: 'A101',
      destinationId: 'dest-1',
    };
    
    render(<RoomDetail room={room} onClose={jest.fn()} />);
    
    const sessionTab = screen.getByText('Lịch sử sử dụng');
    
    await act(async () => {
      await user.click(sessionTab);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Tìm kiếm lịch sử sử dụng phòng')).toBeInTheDocument();
    });
    
    const fromDateLabel = screen.getByText('Từ ngày');
    const toDateLabel = screen.getByText('Đến ngày');
    expect(fromDateLabel).toBeInTheDocument();
    expect(toDateLabel).toBeInTheDocument();
  });
});

describe('ManageCategory', () => {
  it('renders header and button', () => {
    render(<ManageCategory />);
    expect(screen.getByText('Quản lý Danh mục')).toBeInTheDocument();
    expect(screen.getByText('Thêm danh mục mới')).toBeInTheDocument();
  });
});

describe('ManageReport', () => {
  it('renders header and stats', async () => {
    render(<ManageReport />);
    expect(screen.getByText('Quản lý Báo cáo')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Tổng báo cáo')).toBeInTheDocument();
    });
  });
});

describe('ManageRoom', () => {
  it('renders room management UI', () => {
    render(<ManageRoom />);
    expect(screen.getByText('Quản lý Phòng & Địa điểm')).toBeInTheDocument();
    expect(screen.getByText('Phòng (0)')).toBeInTheDocument();
  });
});

describe('ManageSystemLogs', () => {
  it('renders logs page', async () => {
    render(<ManageSystemLogs />);
    expect(screen.getByText('Quản lý System Logs')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Tổng logs')).toBeInTheDocument();
    });
  });
});