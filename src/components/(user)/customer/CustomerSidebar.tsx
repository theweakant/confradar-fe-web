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
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/redux/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

const CustomerSidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const pathname = usePathname();

  const router = useRouter();
  const { signout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  // const [activeItem, setActiveItem] = useState('home');

  const menuItems = [
    // { id: '/', label: 'Trang chủ', icon: Home, href: '/customer' },
    // { id: 'home', label: 'Trang chủ', icon: Home, href: '/customer/home' },
    // { id: 'search', label: 'Tìm kiếm', icon: Search, href: '/customer/search' },
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
    {
      id: "transaction",
      label: "Lịch sử giao dịch",
      icon: Ticket,
      href: "/customer/transaction-history",
    },
    {
      id: "paper",
      label: "Bài báo của bạn",
      icon: FileText,
      href: "/customer/papers",
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
    // { id: 'history', label: 'Lịch sử', icon: Clock, href: '/customer/history' },
    {
      id: "settings",
      label: "Cài đặt",
      icon: Settings,
      href: "/customer/settings",
    },
  ];

  const handleSignout = () => {
    signout();
    router.push("/");
  };

  return (
    <aside
      className={`bg-black text-white border-r border-gray-800 transition-all duration-300 flex flex-col ${isCollapsed ? "w-16" : "w-64"} ${className}`}
    >
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          {!isCollapsed && (
            // <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
            >
              ConfRadar
            </Link>
            // </div>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
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
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              // const isActive = activeItem === item.id;
              const isActive =
                pathname.startsWith(item.href) ||
                pathname.startsWith(item.href + "/");

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`
                    w-full flex items-center space-x-3 px-4 py-3 
                    hover:bg-gray-900 transition-colors duration-200
                    ${isActive ? "bg-gray-900 border-r-2 border-white" : ""}
                    ${isCollapsed ? "justify-center" : "justify-start"}
                  `}
                  >
                    {/* <button
                      // onClick={() => setActiveItem(item.id)}

                    > */}
                    <IconComponent
                      size={24}
                      className={`${isActive ? "text-white" : "text-gray-300"} hover:text-white transition-colors`}
                    />
                    {!isCollapsed && (
                      <span
                        className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-300"} hover:text-white transition-colors`}
                      >
                        {item.label}
                      </span>
                    )}
                    {/* </button> */}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* More Menu */}
          <div className="mt-8 pt-4 border-t border-gray-800">
            <div className={`px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Xem thêm
              </span>
            </div>
            <ul className="space-y-1">
              {moreItems.map((item) => {
                const IconComponent = item.icon;
                // const isActive = activeItem === item.id;
                const isActive = pathname.startsWith(item.href);

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`
                      w-full flex items-center space-x-3 px-4 py-3 
                      hover:bg-gray-900 transition-colors duration-200
                      ${isActive ? "bg-gray-900 border-r-2 border-white" : ""}
                      ${isCollapsed ? "justify-center" : "justify-start"}
                    `}
                    >
                      {/* <button
                      // onClick={() => setActiveItem(item.id)}
                      className={`
                      w-full flex items-center space-x-3 px-4 py-3 
                      hover:bg-gray-900 transition-colors duration-200
                      ${isActive ? 'bg-gray-900 border-r-2 border-white' : ''}
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                    `}
                    > */}
                      <IconComponent
                        size={24}
                        className={`${isActive ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
                      />
                      {!isCollapsed && (
                        <span
                          className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
                        >
                          {item.label}
                        </span>
                      )}
                      {/* </button> */}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Collapse Toggle */}
          <div className="mt-8 pt-4 border-t border-gray-800">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
              w-full flex items-center space-x-3 px-4 py-3 
              hover:bg-gray-900 transition-colors duration-200
              ${isCollapsed ? "justify-center" : "justify-start"}
            `}
            >
              <Menu
                size={24}
                className="text-gray-400 hover:text-white transition-colors"
              />
              {!isCollapsed && (
                <span className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Thu gọn
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom User Profile */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                Customer User
              </div>
              <div className="text-xs text-gray-400 truncate">
                @customer
              </div>
            </div>
          )}
        </div>
      </div> */}

      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleSignout}
          className={`
            w-full flex items-center space-x-3 px-2 py-2 
            text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-all
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
