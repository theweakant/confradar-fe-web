"use client";

import Header from "@/components/LandingPage/header";
import CustomerSidebar from "@/components/(user)/customer/CustomerSidebar";
import { redirect, usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import LoadingUI from "@/components/utility/Loading";
import RouteGuard from "@/utils/routeGuard";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const protectedRoutes = [
  "/customer/home",
  "/customer/search",
  "/customer/conferences",
  "/customer/messages",
  "/customer/notifications",
  "/customer/create",
  "/customer/profile",
  "/customer/bookmarks",
  "/customer/history",
  "/customer/settings",
];

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isAuthen, setIsAuthen] = useState(true);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  if (protectedRoutes.includes(pathname) && !isAuthen) {
    redirect("/auth/login");
  }

  return (
    <RouteGuard
      allowedRoles={[
        "Customer",
      ]}
    >
      <div className="flex h-screen bg-customer-bg">
        {accessToken && <CustomerSidebar />}

        <div className="flex-1 flex flex-col overflow-hidden">
          {!accessToken && <Header />}
          <Suspense fallback={<LoadingUI />}>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </Suspense>
        </div>
      </div>
    </RouteGuard>
  );
};

export default CustomerLayout;
