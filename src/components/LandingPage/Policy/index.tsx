"use client"

import { useState } from "react"
import { FileText, Shield, RefreshCcw, BookOpen, ChevronRight } from "lucide-react"

const policies = [
  {
    id: "terms",
    icon: FileText,
    tag: "Điều khoản",
    title: "Điều khoản sử dụng",
    desc: "Quyền và nghĩa vụ khi sử dụng nền tảng ConfRadar.",
    content: [
      {
        heading: "1. Chấp nhận điều khoản",
        text: "Bằng việc sử dụng ConfRadar, bạn đồng ý tuân thủ các điều khoản được nêu trong tài liệu này.",
      },
      {
        heading: "2. Quyền và trách nhiệm",
        text: "Người dùng có trách nhiệm cung cấp thông tin chính xác khi đăng ký hội nghị.",
      },
      {
        heading: "3. Giới hạn sử dụng",
        text: "Nghiêm cấm sử dụng nền tảng cho mục đích bất hợp pháp hoặc gây hại.",
      },
    ],
  },
  {
    id: "privacy",
    icon: Shield,
    tag: "Bảo mật",
    title: "Chính sách bảo mật",
    desc: "Bảo vệ dữ liệu cá nhân và quyền riêng tư của bạn.",
    content: [
      {
        heading: "1. Thu thập dữ liệu",
        text: "Chúng tôi thu thập thông tin cần thiết để cung cấp dịch vụ tốt nhất cho bạn.",
      },
      {
        heading: "2. Bảo vệ thông tin",
        text: "Dữ liệu được mã hóa và lưu trữ an toàn theo tiêu chuẩn quốc tế.",
      },
      {
        heading: "3. Quyền riêng tư",
        text: "Bạn có quyền yêu cầu xóa hoặc chỉnh sửa thông tin cá nhân bất kỳ lúc nào.",
      },
    ],
  },
  {
    id: "refund",
    icon: RefreshCcw,
    tag: "Hoàn tiền",
    title: "Chính sách hoàn tiền",
    desc: "Điều kiện và quy trình hoàn tiền khi hủy đăng ký.",
    content: [
      {
        heading: "1. Điều kiện hoàn tiền",
        text: "Hoàn tiền theo % mà giai đoạn chi phí bạn đã mua.",
      },
      {
        heading: "2. Quy trình",
        text: "Có thể tự gửi yêu cầu về hệ thống sẽ được hoàn tiền ngay lập tức!",
      },
    ],
  },
  {
    id: "guidelines",
    icon: BookOpen,
    tag: "Quy định",
    title: "Quy định hội nghị",
    desc: "Quy tắc và chuẩn mực khi tham dự hội nghị.",
    content: [
      {
        heading: "1. Quy tắc tham dự",
        text: "Tham gia đúng giờ, tôn trọng diễn giả và người tham dự khác.",
      },
      {
        heading: "2. Ứng xử chuyên nghiệp",
        text: "Tuân thủ quy tắc ứng xử chuyên nghiệp trong suốt sự kiện.",
      },
    ],
  },
]

export default function Policy() {
  const [activePolicy, setActivePolicy] = useState<string | null>(null)

  const togglePolicy = (id: string) => {
    setActivePolicy(activePolicy === id ? null : id)
  }

  return (
    <section className="bg-[#0a0a0a] min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-6">
          <span>Chính sách</span>
        </div>

        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white/80">
            Chính sách & quy định chung            
            <br />
            <span className="italic font-light text-white">Áp dụng cho hệ thống</span>
          </h2>
          <div className="absolute top-0 right-0 md:right-20">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
              <path
                d="M12 2L12 22M2 12L22 12M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.id} className="border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => togglePolicy(policy.id)}
                className={`w-full py-6 px-6 transition-all ${
                  activePolicy === policy.id
                    ? "bg-gradient-to-r from-[#2a2040] via-[#3a2a50] to-[#2a3040]"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-6">
                  <span className="inline-block px-3 py-1 bg-white text-black text-xs font-medium rounded-full min-w-[80px] text-center">
                    {policy.tag}
                  </span>
                  <div className="flex-1 text-center">
                    <h3
                      className={`text-xl md:text-2xl font-medium mb-1 ${
                        activePolicy === policy.id ? "italic text-white/90" : "text-white"
                      }`}
                    >
                      {policy.title}
                    </h3>
                    <p className="text-white/50 text-sm">{policy.desc}</p>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      activePolicy === policy.id ? "rotate-90 text-white" : "text-white/40"
                    }`}
                  />
                </div>
              </button>

              {activePolicy === policy.id && (
                <div className="px-6 pb-6 bg-[#0a0a0a]">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mt-4">
                    <div className="flex items-center gap-4 mb-6">
                      <policy.icon className="w-6 h-6 text-white/70" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{policy.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {policy.content.map((section, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <h4 className="text-base font-semibold text-white mb-2">{section.heading}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}