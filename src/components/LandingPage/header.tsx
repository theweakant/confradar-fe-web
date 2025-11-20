"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "@/redux/hooks/hooks";
import { RootState } from "@/redux/store";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const accessToken = useAppSelector(
    (state: RootState) => state.auth.accessToken,
  );

  return (
    <header className="bg-black sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-base text-white uppercase tracking-wide">
              ConfRadar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/customer"
              className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
            >
              Discovery
            </Link>
            <Link
              href="#speakers"
              className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
            >
              Về chúng tôi
            </Link>
            <Link
              href="#networking"
              className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
            >
              Chính sách
            </Link>
            <Link
              href="#contact"
              className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
            >
              Liên hệ
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            {accessToken ? (
              <Link href="/customer">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black uppercase tracking-wide bg-transparent"
                >
                  {"Profile"}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black uppercase tracking-wide bg-transparent"
                >
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>
          {/* <div className="hidden md:flex items-center">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black uppercase tracking-wide bg-transparent"
              >
                Đăng nhập
              </Button>
            </Link>
          </div> */}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#events"
                className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                Events
              </Link>
              <Link
                href="#speakers"
                className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                Speakers
              </Link>
              <Link
                href="#networking"
                className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                Networking
              </Link>
              <Link
                href="#contact"
                className="text-white hover:text-orange-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                Contact Us
              </Link>
              <div className="pt-4">
                <Link href="/save-spot">
                  <Button
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white hover:text-black uppercase tracking-wide bg-transparent"
                  >
                    Save My Spot
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
