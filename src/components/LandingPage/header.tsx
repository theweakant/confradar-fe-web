    "use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-foreground">ConfRadar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#events" className="text-muted-foreground hover:text-foreground transition-colors">
              Sự kiện
            </Link>
            <Link href="#organizers" className="text-muted-foreground hover:text-foreground transition-colors">
              Đội ngũ
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Chính sách
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Bắt đầu khám phá</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Tính năng
              </Link>
              <Link href="#events" className="text-muted-foreground hover:text-foreground transition-colors">
                Sự kiện
              </Link>
              <Link href="#organizers" className="text-muted-foreground hover:text-foreground transition-colors">
                Tổ chức
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Liên hệ
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full">Bắt đầu khám phá</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
