"use client";

import React, { useState } from "react";
import {
  Compass,
  Menu,
  Settings,
  Bookmark,
  Ticket,
  UserCircle,
  Bell,
  LogOut,
  FileText,
  Heart,
  Flag,
  X,
  Wallet,
} from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/redux/hooks/useAuth";
import { getRouteByRole } from "@/constants/roles";
import { useReport } from "@/redux/hooks/useReport";
import { toast } from "sonner";
import { useTransaction } from "@/redux/hooks/useTransaction";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";

interface SidebarProps {
  className?: string;
}

const CustomerSidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const pathname = usePathname();

  const router = useRouter();
  const { user, signout } = useAuth();

  const { accessToken } = useSelector((state: RootState) => state.auth);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportSubject: '',
    reason: '',
    description: ''
  });
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  const { wallet, fetchOwnWallet, loading: walletLoading } = useTransaction();


  const { createReport, loading } = useReport();

  const handleOpenWallet = async () => {
    if (!accessToken) {
      toast.error('Vui lòng đăng nhập để xem ví');
      return;
    }

    setIsWalletDialogOpen(true);
    try {
      await fetchOwnWallet();
    } catch (error) {
      toast.error('Không thể tải thông tin ví');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createReport(reportForm);
      toast.success('Gửi báo cáo thành công!');
      setIsReportDialogOpen(false);
      setReportForm({ reportSubject: '', reason: '', description: '' });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi báo cáo');
    }
  };


  const menuItems = [
    {
      id: "discovery",
      label: "Khám phá",
      icon: Compass,
      href: "/customer/discovery",
    },
    {
      id: "ticket",
      label: "Vé tham dự hội nghị",
      icon: Ticket,
      href: "/customer/tickets",
    },
    // {
    //   id: "transaction",
    //   label: "Lịch sử giao dịch",
    //   icon: Ticket,
    //   href: "/customer/transaction-history",
    // },
    {
      id: "paper",
      label: "Bài báo của bạn",
      icon: FileText,
      href: "/customer/papers",
    },
    {
      id: "calendar",
      label: "Lịch hội nghị của bạn",
      icon: UserCircle,
      href: "/customer/conference-calendar",
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
      href: "/customer/notifications",
    },
    {
      id: "profile",
      label: "Trang cá nhân",
      icon: UserCircle,
      href: "/customer/profile",
    },
  ];

  const moreItems = [
    {
      id: "favoriteconferences",
      label: "Hội nghị yêu thích",
      icon: Heart,
      href: "/customer/favorite-conferences",
    },
    {
      id: "waitlist",
      label: "Danh sách chờ nộp bài báo",
      icon: Bookmark,
      href: "/customer/customer-waitlist",
    },
    {
      id: "wallet",
      label: "Ví của tôi",
      icon: Wallet,
      onClick: handleOpenWallet,
    },

    {
      id: "report",
      label: "Báo cáo vấn đề",
      icon: Flag,
      href: "/customer/report-manage",
    },
  ];

  const handleSignout = () => {
    signout();
    router.push("/");
  };

  return (
    <aside
      className={`bg-white text-gray-900 border-r border-gray-200 transition-all duration-300 flex flex-col ${isCollapsed ? "w-16" : "w-64"} ${className}`}
    >
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-200">
        {/* <div className="flex items-center space-x-3"> */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <Image
            src="/ConfradarLogo_Light.png"
            alt="ConfRadar Logo"
            width={isCollapsed ? 28 : 36}
            height={isCollapsed ? 28 : 36}
            className="object-contain"
          />
          {!isCollapsed && (
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent"
            >
              ConfRadar
            </Link>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              CR
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <nav className="py-4">
          <ul className="space-y-1">
            {Array.isArray(user?.role) &&
              user.role.length > 1 &&
              user.role.some(r => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "") === "externalreviewer") && (
                <div className="mt-4 px-4">
                  <button
                    onClick={() => {
                      const externalRole = user.role?.find(
                        r => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "") === "externalreviewer"
                      );
                      const redirectUrl = getRouteByRole(externalRole);
                      router.push(redirectUrl);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 my-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md transition-all duration-200"
                  >
                    <UserCircle size={20} />
                    <span>Chuyển sang vai trò Reviewer</span>
                  </button>
                </div>
              )}

            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive =
                pathname.startsWith(item.href) ||
                pathname.startsWith(item.href + "/");

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`
                    w-full flex items-center space-x-3 px-4 py-3 
                    hover:bg-gray-100 transition-colors duration-200
                    // ${isActive ? "bg-gray-100 border-r-2 border-purple-600" : ""}
                    ${isActive ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md rounded-lg" : ""}
                    ${isCollapsed ? "justify-center" : "justify-start"}
                  `}
                  >
                    <IconComponent
                      size={24}
                      className={`${isActive ? "text-white" : "text-gray-600"} hover:text-purple-600 transition-colors`}
                    />
                    {!isCollapsed && (
                      <span
                        className={`text-sm font-medium ${isActive ? "text-white font-semibold" : "text-gray-600"} hover:text-purple-600 transition-colors`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* More Menu */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className={`px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Xem thêm
              </span>
            </div>
            <ul className="space-y-1">
              {moreItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.href ? pathname.startsWith(item.href) : false;

                const content = (
                  <>
                    <IconComponent
                      size={24}
                      // className={`${isActive ? "text-purple-600" : "text-gray-500"} hover:text-purple-600 transition-colors`}
                      className={`${isActive ? "text-white" : "text-gray-600"} hover:text-purple-600 transition-colors`}

                    />
                    {!isCollapsed && (
                      <span
                        className={`text-sm font-medium ${isActive ? "text-white font-semibold" : "text-gray-600"} hover:text-purple-600 transition-colors`}
                      >
                        {item.label}
                      </span>
                    )}
                  </>
                );

                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors duration-200 ${isActive ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md rounded-lg" : ""} ${isCollapsed ? "justify-center" : "justify-start"}`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors duration-200 ${isCollapsed ? "justify-center" : "justify-start"}`}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Collapse Toggle */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
              w-full flex items-center space-x-3 px-4 py-3 
              hover:bg-gray-100 transition-colors duration-200
              ${isCollapsed ? "justify-center" : "justify-start"}
            `}
            >
              <Menu
                size={24}
                className="text-gray-500 hover:text-purple-600 transition-colors"
              />
              {!isCollapsed && (
                <span className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
                  Thu gọn
                </span>
              )}
            </button>
          </div>

          <Transition appear show={isReportDialogOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsReportDialogOpen(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                          Báo cáo vấn đề
                        </Dialog.Title>
                        <button
                          onClick={() => setIsReportDialogOpen(false)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <form onSubmit={handleSubmitReport} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={reportForm.reportSubject}
                            onChange={(e) => setReportForm({ ...reportForm, reportSubject: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Nhập tiêu đề báo cáo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={reportForm.reason}
                            onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Nhập lý do báo cáo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả chi tiết <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={reportForm.description}
                            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                            placeholder="Mô tả chi tiết vấn đề của bạn"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsReportDialogOpen(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                          </button>
                        </div>
                      </form>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

          <Transition appear show={isWalletDialogOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsWalletDialogOpen(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200">
                      <div className="flex justify-between items-center mb-6">
                        <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                          Ví của tôi
                        </Dialog.Title>
                        <button
                          onClick={() => setIsWalletDialogOpen(false)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {walletLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : wallet ? (
                        <div className="space-y-6">
                          {/* Số dư */}
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6">
                            <div className="text-white text-sm opacity-90 mb-1">Số dư khả dụng</div>
                            <div className="text-white text-3xl font-bold">
                              {formatCurrency(wallet.balance)}
                            </div>
                          </div>

                          {/* Lịch sử giao dịch */}
                          <div>
                            <h4 className="text-gray-900 font-medium mb-3">
                              Lịch sử giao dịch ({wallet.walletTransactions?.length || 0})
                            </h4>

                            {wallet.walletTransactions && wallet.walletTransactions.length > 0 ? (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {wallet.walletTransactions.map((transaction) => (
                                  <div
                                    key={transaction.walletTransactionId}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <div className="text-gray-900 font-medium mb-1">
                                          {transaction.description}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                          {formatDateTime(transaction.createdAt)}
                                        </div>
                                      </div>
                                      <div className={`text-lg font-semibold ${transaction.amount >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                        }`}>
                                        {transaction.amount >= 0
                                          ? '+'
                                          : '-'}
                                        {formatCurrency(Math.abs(transaction.amount))}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                                        {transaction.transactionType}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                Chưa có giao dịch nào
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Không thể tải thông tin ví
                        </div>
                      )}
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleSignout}
          className={`
            w-full flex items-center space-x-3 px-2 py-2 
            text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-all
            ${isCollapsed ? "justify-center" : "justify-start"}
          `}
        >
          <LogOut size={22} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Đăng xuất</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;

// "use client";

// import React, { useState } from "react";
// import {
//   Compass,
//   Menu,
//   Settings,
//   Bookmark,
//   Ticket,
//   UserCircle,
//   Bell,
//   LogOut,
//   FileText,
//   Heart,
//   Flag,
//   X,
//   Wallet,
// } from "lucide-react";
// import { Dialog, Transition } from '@headlessui/react';
// import { Fragment } from 'react';
// import { usePathname, useRouter } from "next/navigation";
// import Link from "next/link";
// import { useAuth } from "@/redux/hooks/useAuth";
// import { getRouteByRole } from "@/constants/roles";
// import { useReport } from "@/redux/hooks/useReport";
// import { toast } from "sonner";
// import { useTransaction } from "@/redux/hooks/useTransaction";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// interface SidebarProps {
//   className?: string;
// }

// const CustomerSidebar: React.FC<SidebarProps> = ({ className = "" }) => {
//   const pathname = usePathname();

//   const router = useRouter();
//   const { user, signout } = useAuth();

//   const { accessToken } = useSelector((state: RootState) => state.auth);

//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
//   const [reportForm, setReportForm] = useState({
//     reportSubject: '',
//     reason: '',
//     description: ''
//   });
//   const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

//   const { wallet, fetchOwnWallet, loading: walletLoading } = useTransaction();


//   const { createReport, loading } = useReport();
//   // const [activeItem, setActiveItem] = useState('home');

//   const handleOpenWallet = async () => {
//     if (!accessToken) {
//       toast.error('Vui lòng đăng nhập để xem ví');
//       return;
//     }

//     setIsWalletDialogOpen(true);
//     try {
//       await fetchOwnWallet();
//     } catch (error) {
//       toast.error('Không thể tải thông tin ví');
//     }
//   };

//   // Format tiền VND
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND'
//     }).format(amount);
//   };

//   // Format ngày giờ
//   const formatDateTime = (dateString: string) => {
//     return new Date(dateString).toLocaleString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handleSubmitReport = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await createReport(reportForm);
//       toast.success('Gửi báo cáo thành công!');
//       setIsReportDialogOpen(false);
//       setReportForm({ reportSubject: '', reason: '', description: '' });
//     } catch (error) {
//       toast.error('Có lỗi xảy ra khi gửi báo cáo');
//     }
//   };


//   const menuItems = [
//     // { id: '/', label: 'Trang chủ', icon: Home, href: '/customer' },
//     // { id: 'home', label: 'Trang chủ', icon: Home, href: '/customer/home' },
//     // { id: 'search', label: 'Tìm kiếm', icon: Search, href: '/customer/search' },
//     {
//       id: "discovery",
//       label: "Khám phá",
//       icon: Compass,
//       href: "/customer/discovery",
//     },
//     {
//       id: "ticket",
//       label: "Vé tham dự hội nghị",
//       icon: Ticket,
//       href: "/customer/tickets",
//     },
//     {
//       id: "transaction",
//       label: "Lịch sử giao dịch",
//       icon: Ticket,
//       href: "/customer/transaction-history",
//     },
//     {
//       id: "paper",
//       label: "Bài báo của bạn",
//       icon: FileText,
//       href: "/customer/papers",
//     },
//     {
//       id: "calendar",
//       label: "Lịch hội nghị của bạn",
//       icon: UserCircle,
//       href: "/customer/conference-calendar",
//     },
//     {
//       id: "notifications",
//       label: "Thông báo",
//       icon: Bell,
//       href: "/customer/notifications",
//     },
//     {
//       id: "profile",
//       label: "Trang cá nhân",
//       icon: UserCircle,
//       href: "/customer/profile",
//     },
//   ];

//   const moreItems = [
//     {
//       id: "favoriteconferences",
//       label: "Hội nghị yêu thích",
//       icon: Heart,
//       href: "/customer/favorite-conferences",
//     },
//     {
//       id: "waitlist",
//       label: "Danh sách chờ nộp bài báo",
//       icon: Bookmark,
//       href: "/customer/customer-waitlist",
//     },
//     // { id: 'history', label: 'Lịch sử', icon: Clock, href: '/customer/history' },
//     // {
//     //   id: "settings",
//     //   label: "Cài đặt",
//     //   icon: Settings,
//     //   href: "/customer/settings",
//     // },
//     {
//       id: "wallet",
//       label: "Ví của tôi",
//       icon: Wallet,
//       onClick: handleOpenWallet,
//     },

//     {
//       id: "report",
//       label: "Báo cáo vấn đề",
//       icon: Flag,
//       // onClick: () => setIsReportDialogOpen(true),
//       href: "/customer/report-manage",
//     },
//   ];

//   const handleSignout = () => {
//     signout();
//     router.push("/");
//   };

//   return (
//     <aside
//       className={`bg-black text-white border-r border-gray-800 transition-all duration-300 flex flex-col ${isCollapsed ? "w-16" : "w-64"} ${className}`}
//     >
//       {/* Header with Logo */}
//       <div className="p-4 border-b border-gray-800">
//         <div className="flex items-center space-x-3">
//           {!isCollapsed && (
//             // <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
//             <Link
//               href="/"
//               className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
//             >
//               ConfRadar
//             </Link>
//             // </div>
//           )}
//           {isCollapsed && (
//             <div className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
//               CR
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Navigation Menu */}
//       <div
//         className="flex-1 overflow-y-auto"
//         style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//       >
//         <nav className="py-4">
//           <ul className="space-y-1">
//             {Array.isArray(user?.role) &&
//               user.role.length > 1 &&
//               user.role.some(r => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "") === "externalreviewer") && (
//                 <div className="mt-4 px-4">
//                   <button
//                     onClick={() => {
//                       const externalRole = user.role?.find(
//                         r => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "") === "externalreviewer"
//                       );
//                       const redirectUrl = getRouteByRole(externalRole);
//                       router.push(redirectUrl);
//                     }}
//                     className="w-full flex items-center justify-center space-x-2 px-4 py-3 my-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg shadow-md transition-all duration-200"
//                   >
//                     <UserCircle size={20} />
//                     <span>Chuyển sang vai trò Reviewer</span>
//                   </button>
//                 </div>
//               )}

//             {menuItems.map((item) => {
//               const IconComponent = item.icon;
//               // const isActive = activeItem === item.id;
//               const isActive =
//                 pathname.startsWith(item.href) ||
//                 pathname.startsWith(item.href + "/");

//               return (
//                 <li key={item.id}>
//                   <Link
//                     href={item.href}
//                     className={`
//                     w-full flex items-center space-x-3 px-4 py-3
//                     hover:bg-gray-900 transition-colors duration-200
//                     ${isActive ? "bg-gray-900 border-r-2 border-white" : ""}
//                     ${isCollapsed ? "justify-center" : "justify-start"}
//                   `}
//                   >
//                     {/* <button
//                       // onClick={() => setActiveItem(item.id)}

//                     > */}
//                     <IconComponent
//                       size={24}
//                       className={`${isActive ? "text-white" : "text-gray-300"} hover:text-white transition-colors`}
//                     />
//                     {!isCollapsed && (
//                       <span
//                         className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-300"} hover:text-white transition-colors`}
//                       >
//                         {item.label}
//                       </span>
//                     )}
//                     {/* </button> */}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>

//           {/* More Menu */}
//           <div className="mt-8 pt-4 border-t border-gray-800">
//             <div className={`px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}>
//               <span className="text-xs text-gray-500 uppercase tracking-wider">
//                 Xem thêm
//               </span>
//             </div>
//             <ul className="space-y-1">
//               {moreItems.map((item) => {
//                 const IconComponent = item.icon;
//                 const isActive = item.href ? pathname.startsWith(item.href) : false;

//                 const content = (
//                   <>
//                     <IconComponent
//                       size={24}
//                       className={`${isActive ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
//                     />
//                     {!isCollapsed && (
//                       <span
//                         className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
//                       >
//                         {item.label}
//                       </span>
//                     )}
//                   </>
//                 );

//                 return (
//                   <li key={item.id}>
//                     {item.href ? (
//                       <Link
//                         href={item.href}
//                         className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-900 transition-colors duration-200 ${isActive ? "bg-gray-900 border-r-2 border-white" : ""} ${isCollapsed ? "justify-center" : "justify-start"}`}
//                       >
//                         {content}
//                       </Link>
//                     ) : (
//                       <button
//                         onClick={item.onClick}
//                         className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-900 transition-colors duration-200 ${isCollapsed ? "justify-center" : "justify-start"}`}
//                       >
//                         {content}
//                       </button>
//                     )}
//                   </li>
//                 );
//               })}
//               {/* {moreItems.map((item) => {
//                 const IconComponent = item.icon;
//                 // const isActive = activeItem === item.id;
//                 const isActive = pathname.startsWith(item.href);

//                 return (
//                   <li key={item.id}>
//                     <Link
//                       href={item.href}
//                       className={`
//                       w-full flex items-center space-x-3 px-4 py-3
//                       hover:bg-gray-900 transition-colors duration-200
//                       ${isActive ? "bg-gray-900 border-r-2 border-white" : ""}
//                       ${isCollapsed ? "justify-center" : "justify-start"}
//                     `}
//                     >
//                       <IconComponent
//                         size={24}
//                         className={`${isActive ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
//                       />
//                       {!isCollapsed && (
//                         <span
//                           className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
//                         >
//                           {item.label}
//                         </span>
//                       )}
//                     </Link>
//                   </li>
//                 );
//               })} */}
//             </ul>
//           </div>

//           {/* Collapse Toggle */}
//           <div className="mt-8 pt-4 border-t border-gray-800">
//             <button
//               onClick={() => setIsCollapsed(!isCollapsed)}
//               className={`
//               w-full flex items-center space-x-3 px-4 py-3
//               hover:bg-gray-900 transition-colors duration-200
//               ${isCollapsed ? "justify-center" : "justify-start"}
//             `}
//             >
//               <Menu
//                 size={24}
//                 className="text-gray-400 hover:text-white transition-colors"
//               />
//               {!isCollapsed && (
//                 <span className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
//                   Thu gọn
//                 </span>
//               )}
//             </button>
//           </div>

//           <Transition appear show={isReportDialogOpen} as={Fragment}>
//             <Dialog as="div" className="relative z-50" onClose={() => setIsReportDialogOpen(false)}>
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0"
//                 enterTo="opacity-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100"
//                 leaveTo="opacity-0"
//               >
//                 <div className="fixed inset-0 bg-black bg-opacity-75" />
//               </Transition.Child>

//               <div className="fixed inset-0 overflow-y-auto">
//                 <div className="flex min-h-full items-center justify-center p-4">
//                   <Transition.Child
//                     as={Fragment}
//                     enter="ease-out duration-300"
//                     enterFrom="opacity-0 scale-95"
//                     enterTo="opacity-100 scale-100"
//                     leave="ease-in duration-200"
//                     leaveFrom="opacity-100 scale-100"
//                     leaveTo="opacity-0 scale-95"
//                   >
//                     <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
//                       <div className="flex justify-between items-center mb-4">
//                         <Dialog.Title as="h3" className="text-lg font-medium text-white">
//                           Báo cáo vấn đề
//                         </Dialog.Title>
//                         <button
//                           onClick={() => setIsReportDialogOpen(false)}
//                           className="text-gray-400 hover:text-white transition-colors"
//                         >
//                           <X size={20} />
//                         </button>
//                       </div>

//                       <form onSubmit={handleSubmitReport} className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-300 mb-2">
//                             Tiêu đề <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             required
//                             value={reportForm.reportSubject}
//                             onChange={(e) => setReportForm({ ...reportForm, reportSubject: e.target.value })}
//                             className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
//                             placeholder="Nhập tiêu đề báo cáo"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-300 mb-2">
//                             Lý do <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             required
//                             value={reportForm.reason}
//                             onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
//                             className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
//                             placeholder="Nhập lý do báo cáo"
//                           />
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-300 mb-2">
//                             Mô tả chi tiết <span className="text-red-500">*</span>
//                           </label>
//                           <textarea
//                             required
//                             rows={4}
//                             value={reportForm.description}
//                             onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
//                             className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
//                             placeholder="Mô tả chi tiết vấn đề của bạn"
//                           />
//                         </div>

//                         <div className="flex gap-3 pt-2">
//                           <button
//                             type="button"
//                             onClick={() => setIsReportDialogOpen(false)}
//                             className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                           >
//                             Hủy
//                           </button>
//                           <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                           >
//                             {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
//                           </button>
//                         </div>
//                       </form>
//                     </Dialog.Panel>
//                   </Transition.Child>
//                 </div>
//               </div>
//             </Dialog>
//           </Transition>

//           <Transition appear show={isWalletDialogOpen} as={Fragment}>
//             <Dialog as="div" className="relative z-50" onClose={() => setIsWalletDialogOpen(false)}>
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0"
//                 enterTo="opacity-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100"
//                 leaveTo="opacity-0"
//               >
//                 <div className="fixed inset-0 bg-black bg-opacity-75" />
//               </Transition.Child>

//               <div className="fixed inset-0 overflow-y-auto">
//                 <div className="flex min-h-full items-center justify-center p-4">
//                   <Transition.Child
//                     as={Fragment}
//                     enter="ease-out duration-300"
//                     enterFrom="opacity-0 scale-95"
//                     enterTo="opacity-100 scale-100"
//                     leave="ease-in duration-200"
//                     leaveFrom="opacity-100 scale-100"
//                     leaveTo="opacity-0 scale-95"
//                   >
//                     <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
//                       <div className="flex justify-between items-center mb-6">
//                         <Dialog.Title as="h3" className="text-xl font-medium text-white">
//                           Ví của tôi
//                         </Dialog.Title>
//                         <button
//                           onClick={() => setIsWalletDialogOpen(false)}
//                           className="text-gray-400 hover:text-white transition-colors"
//                         >
//                           <X size={20} />
//                         </button>
//                       </div>

//                       {walletLoading ? (
//                         <div className="flex justify-center py-8">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
//                         </div>
//                       ) : wallet ? (
//                         <div className="space-y-6">
//                           {/* Số dư */}
//                           <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6">
//                             <div className="text-white text-sm opacity-90 mb-1">Số dư khả dụng</div>
//                             <div className="text-white text-3xl font-bold">
//                               {formatCurrency(wallet.balance)}
//                             </div>
//                           </div>

//                           {/* Lịch sử giao dịch */}
//                           <div>
//                             <h4 className="text-white font-medium mb-3">
//                               Lịch sử giao dịch ({wallet.walletTransactions?.length || 0})
//                             </h4>

//                             {wallet.walletTransactions && wallet.walletTransactions.length > 0 ? (
//                               <div className="space-y-2 max-h-96 overflow-y-auto">
//                                 {wallet.walletTransactions.map((transaction) => (
//                                   <div
//                                     key={transaction.walletTransactionId}
//                                     className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
//                                   >
//                                     <div className="flex justify-between items-start mb-2">
//                                       <div className="flex-1">
//                                         <div className="text-white font-medium mb-1">
//                                           {transaction.description}
//                                         </div>
//                                         <div className="text-gray-400 text-xs">
//                                           {formatDateTime(transaction.createdAt)}
//                                         </div>
//                                       </div>
//                                       <div className={`text-lg font-semibold ${transaction.amount >= 0
//                                         ? 'text-green-400'
//                                         : 'text-red-400'
//                                         }`}>
//                                         {transaction.amount >= 0
//                                           ? '+'
//                                           : '-'}
//                                         {formatCurrency(Math.abs(transaction.amount))}
//                                       </div>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                       <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
//                                         {transaction.transactionType}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <div className="text-center py-8 text-gray-400">
//                                 Chưa có giao dịch nào
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="text-center py-8 text-gray-400">
//                           Không thể tải thông tin ví
//                         </div>
//                       )}
//                     </Dialog.Panel>
//                   </Transition.Child>
//                 </div>
//               </div>
//             </Dialog>
//           </Transition>
//         </nav>
//       </div>

//       {/* Bottom User Profile */}
//       {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black">
//         <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
//           <div className="w-8 h-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center">
//             <User size={16} className="text-white" />
//           </div>
//           {!isCollapsed && (
//             <div className="flex-1 min-w-0">
//               <div className="text-sm font-medium text-white truncate">
//                 Customer User
//               </div>
//               <div className="text-xs text-gray-400 truncate">
//                 @customer
//               </div>
//             </div>
//           )}
//         </div>
//       </div> */}

//       <div className="border-t border-gray-800 p-4">
//         <button
//           onClick={handleSignout}
//           className={`
//             w-full flex items-center space-x-3 px-2 py-2
//             text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-all
//             ${isCollapsed ? "justify-center" : "justify-start"}
//           `}
//         >
//           <LogOut size={22} />
//           {!isCollapsed && (
//             <span className="text-sm font-medium">Đăng xuất</span>
//           )}
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default CustomerSidebar;
