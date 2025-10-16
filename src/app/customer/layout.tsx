"use client";

import Header from "@/components/LandingPage/header";
import CustomerSidebar from "@/components/(user)/customer/CustomerSidebar";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState } from "react";

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

    if (protectedRoutes.includes(pathname) && !isAuthen) {
        redirect("/auth/login");
    }

    return (
        <div className="flex h-screen bg-customer-bg">
            {isAuthen && (
                <CustomerSidebar />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                {!isAuthen && (
                    <Header />
                )}

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}

export default CustomerLayout;