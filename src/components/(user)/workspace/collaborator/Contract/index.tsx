import React from 'react';

// ============= INTERFACES =============
interface PartnerContract {
  id: number;
  contractCode: string;
  conferenceName: string;
  startDate: string;
  endDate: string;
  commissionRate: number;
  totalRevenue: number;
  commission: number;
  status: 'Active' | 'Expired' | 'Pending';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
}

interface PartnerContractsProps {
  contracts?: PartnerContract[];
}

// ============= MOCK DATA =============
const mockContracts: PartnerContract[] = [
  { 
    id: 1, 
    contractCode: 'CT-2024-001',
    conferenceName: 'AI & Machine Learning Conference',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    commissionRate: 15,
    totalRevenue: 450000000,
    commission: 67500000,
    status: 'Active',
    paymentStatus: 'Paid'
  },
  { 
    id: 2, 
    contractCode: 'CT-2024-002',
    conferenceName: 'Cloud Computing Summit',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    commissionRate: 12,
    totalRevenue: 320000000,
    commission: 38400000,
    status: 'Active',
    paymentStatus: 'Pending'
  },
  { 
    id: 3, 
    contractCode: 'CT-2024-003',
    conferenceName: 'DevOps Best Practices',
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    commissionRate: 18,
    totalRevenue: 280000000,
    commission: 50400000,
    status: 'Active',
    paymentStatus: 'Paid'
  },
  { 
    id: 4, 
    contractCode: 'CT-2023-015',
    conferenceName: 'Blockchain Summit 2023',
    startDate: '2023-09-01',
    endDate: '2024-08-31',
    commissionRate: 10,
    totalRevenue: 150000000,
    commission: 15000000,
    status: 'Expired',
    paymentStatus: 'Paid'
  },
  { 
    id: 5, 
    contractCode: 'CT-2024-004',
    conferenceName: 'Cybersecurity & Privacy Conference',
    startDate: '2024-08-01',
    endDate: '2025-07-31',
    commissionRate: 20,
    totalRevenue: 550000000,
    commission: 110000000,
    status: 'Active',
    paymentStatus: 'Pending'
  },
];

// ============= INTERNAL COMPONENT =============
const PartnerContractsView: React.FC<PartnerContractsProps> = ({ contracts = mockContracts }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Expired': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Đang hoạt động';
      case 'Expired': return 'Hết hạn';
      case 'Pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'Paid': return 'Đã thanh toán';
      case 'Pending': return 'Chờ thanh toán';
      case 'Overdue': return 'Quá hạn';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalCommission = contracts
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + c.commission, 0);

  const activeContracts = contracts.filter(c => c.status === 'Active').length;
  const pendingPayments = contracts.filter(c => c.paymentStatus === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hợp Đồng Đối Tác ConfRadar</h1>
          <p className="text-gray-600">Quản lý hợp đồng hợp tác và hoa hồng của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium opacity-90">Tổng Hoa Hồng</h3>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalCommission)}</div>
            <div className="text-xs opacity-75">Từ {activeContracts} hợp đồng đang hoạt động</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-600">Hợp Đồng Hoạt Động</h3>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-900">{activeContracts}</div>
            <div className="text-xs text-emerald-600">Đang hợp tác</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-600">Chờ Thanh Toán</h3>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg">⏳</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-900">{pendingPayments}</div>
            <div className="text-xs text-orange-600">Cần xử lý</div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Danh Sách Hợp Đồng</h3>
              <p className="text-sm text-gray-500 mt-1">Tổng cộng {contracts.length} hợp đồng</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-xl transition-colors flex items-center gap-2">
              <span className="text-lg">+</span>
              Tạo hợp đồng mới
            </button>
          </div>

          <div className="space-y-4">
            {contracts.map((contract) => (
              <div 
                key={contract.id} 
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-emerald-200 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{contract.conferenceName}</h4>
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>📄</span>
                      Mã HĐ: <span className="font-mono font-medium">{contract.contractCode}</span>
                    </p>
                  </div>
                  <span className={`text-sm px-4 py-2 rounded-full font-medium ${getPaymentStatusColor(contract.paymentStatus)}`}>
                    {getPaymentStatusText(contract.paymentStatus)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span>📅</span>
                      Thời gian hợp đồng
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(contract.startDate)}
                    </p>
                    <p className="text-xs text-gray-500">đến {formatDate(contract.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span>📊</span>
                      Tỷ lệ hoa hồng
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">{contract.commissionRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span>💵</span>
                      Doanh thu
                    </p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(contract.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span>💎</span>
                      Hoa hồng
                    </p>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(contract.commission)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <span>👁️</span>
                    Xem chi tiết
                  </button>
                  {contract.paymentStatus === 'Pending' && (
                    <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2">
                      <span>💳</span>
                      Yêu cầu thanh toán
                    </button>
                  )}
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span>📥</span>
                    Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Lưu ý về hoa hồng</h4>
              <p className="text-sm text-blue-700">
                Hoa hồng sẽ được tính dựa trên doanh thu thực tế từ các đăng ký tham gia hội nghị. 
                Thanh toán được thực hiện vào cuối mỗi tháng cho các hợp đồng đang hoạt động.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= DEFAULT EXPORT =============
export default function PartnerContracts() {
  return <PartnerContractsView contracts={mockContracts} />;
}

// ============= NAMED EXPORTS FOR FLEXIBILITY =============
export { PartnerContractsView };
export type { PartnerContract, PartnerContractsProps };