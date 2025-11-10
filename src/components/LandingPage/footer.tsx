"use client";

import type React from "react";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email đăng ký:", email);
    // TODO: Thêm logic gọi API lưu email đăng ký
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
            { label: "Hội thảo sắp diễn ra", href: "/events/upcoming" },
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
            { label: "Chuyên gia hàng đầu", href: "/speakers/experts" },
            { label: "Danh sách diễn giả", href: "/speakers/lineup" },
            { label: "Đăng ký trở thành diễn giả", href: "/speakers/apply" },
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
            { label: "Trung tâm hỗ trợ", href: "/support" },
            { label: "Hợp tác & Đối tác", href: "/partnership" },
            { label: "Báo chí & Truyền thông", href: "/press" },
          ],
        },
      ],
    },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section - Link Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16 pb-16 border-b border-white/10">
          {footerLinks.map((column) => (
            <div key={column.platform}>
              {/* Platform Header */}
              <a
                href={column.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xl font-bold mb-8 hover:text-orange-500 transition-colors group"
                aria-label={`Truy cập trang ${column.platform} của chúng tôi`}
              >
                {column.platform}
                <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Link Sections */}
              {column.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-xs font-semibold text-white/60 tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-white/80 hover:text-orange-500 transition-colors block"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Section - Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* Orange C Logo */}
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">C</span>
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

          {/* Right - Newsletter */}
          <div>
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© 2025 ConfRadar | Bản quyền thuộc về nhóm phát triển</p>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="hover:text-orange-500 transition-colors"
            >
              Chính sách bảo mật
            </a>
            <span>|</span>
            <a
              href="/terms"
              className="hover:text-orange-500 transition-colors"
            >
              Điều khoản sử dụng
            </a>
          </div>
          <p>Được phát triển bởi FA25SE045 - FPTU HCM</p>
        </div>
      </div>
    </footer>
  );
}
