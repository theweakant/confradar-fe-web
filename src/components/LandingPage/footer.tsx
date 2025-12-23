"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email đăng ký:", email);
    setEmail("");
  };

  const footerLinks = [
    {
      platform: "YouTube",
      href: "https://youtube.com",
      sections: [
        {
          title: "SỰ KIỆN",
          links: [
            { label: "Hội thảo sắp diễn ra", href: "/customer/discovery" },
            { label: "Sự kiện nổi bật", href: "/events/past" },
            { label: "Lịch hội thảo", href: "/events/calendar" },
          ],
        },
      ],
    },
    {
      platform: "X",
      href: "https://x.com",
      sections: [
        {
          title: "DIỄN GIẢ",
          links: [
            { label: "Về chúng tôi", href: "/about-us" },
            // { label: "Danh sách diễn giả", href: "/speakers/lineup" },
            // { label: "Đăng ký trở thành diễn giả", href: "/speakers/apply" },
          ],
        },
      ],
    },
    {
      platform: "LinkedIn",
      href: "https://linkedin.com",
      sections: [
        {
          title: "CỘNG ĐỒNG",
          links: [
            { label: "Tham gia cộng đồng", href: "/community/join" },
            { label: "Nhóm & Câu lạc bộ", href: "/community/meetups" },
            { label: "Kết nối chuyên môn 1-1", href: "/community/matching" },
          ],
        },
      ],
    },
    {
      platform: "Facebook",
      href: "https://facebook.com",
      sections: [
        {
          title: "HỖ TRỢ",
          links: [
            { label: "Trung tâm hỗ trợ", href: "/faq" },
            { label: "Chính sách", href: "/policy" },
          ],
        },
      ],
    },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16 pb-16 border-b border-white/10">
          {footerLinks.map((column) => (
            <div key={column.platform}>
              <Link
                href={column.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xl font-bold mb-8 hover:text-orange-500 transition-colors group"
                aria-label={`Truy cập trang ${column.platform} của chúng tôi`}
              >
                {column.platform}
                <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              {column.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-xs font-semibold text-white/60 tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/80 hover:text-orange-500 transition-colors block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <Image
                  src="/ConfradarLogo_Light.png"
                  alt="ConfRadar Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold">ConfRadar</h2>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              ConfRadar là ứng dụng hỗ trợ tìm kiếm và đăng ký tham dự các Hội
              thảo Công nghệ & Nghiên cứu. Kết nối với chuyên gia hàng đầu, khám
              phá xu hướng mới nhất và mở rộng mạng lưới học thuật & nghề nghiệp
              của bạn.
            </p>
          </div>

          {/* <div>
            <h2 className="text-2xl font-bold mb-6">Đăng ký nhận bản tin</h2>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-orange-500 focus:ring-orange-500"
                aria-label="Địa chỉ email để nhận bản tin"
              />
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 uppercase tracking-wide"
              >
                Đăng ký
              </Button>
            </form>
          </div> */}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© 2025 ConfRadar | Mentor: Trần Thị Như Quỳnh</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-orange-500 transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <span>|</span>
            <Link
              href="#terms"
              className="hover:text-orange-500 transition-colors"
            >
              Điều khoản sử dụng
            </Link>
          </div>
          <p>Được phát triển bởi FA25SE045 - FPTU HCM</p>
        </div>
      </div>
    </footer>
  );
}
