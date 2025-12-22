"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const faqItems = [
  {
    question: "CONFRADAR là gì và nó hoạt động như thế nào?",
    answer:
      "CONFRADAR là nền tảng tìm kiếm và quản lý hội nghị học thuật hàng đầu. Chúng tôi sử dụng AI để tổng hợp thông tin từ hàng nghìn nguồn, giúp bạn dễ dàng tìm kiếm, theo dõi và đăng ký tham gia các hội nghị phù hợp với lĩnh vực nghiên cứu của mình.",
  },
  {
    question: "Làm thế nào để tìm kiếm hội nghị phù hợp với lĩnh vực của tôi?",
    answer:
      "Bạn có thể sử dụng bộ lọc thông minh của chúng tôi để tìm kiếm theo lĩnh vực, thời gian, địa điểm, hoặc từ khóa. Hệ thống AI cũng sẽ gợi ý các hội nghị phù hợp dựa trên lịch sử tìm kiếm và sở thích của bạn.",
  },
  {
    question: "Tính năng thông báo và nhắc nhở hoạt động ra sao?",
    answer:
      "CONFRADAR gửi thông báo tự động về deadline nộp bài, ngày diễn ra hội nghị, và các cập nhật quan trọng. Bạn có thể tùy chỉnh tần suất và loại thông báo trong phần cài đặt tài khoản.",
  },
  {
    question: "Dữ liệu hội nghị được cập nhật thường xuyên như thế nào?",
    answer:
      "Chúng tôi cập nhật dữ liệu hàng ngày từ các nguồn chính thức. Đội ngũ của chúng tôi cũng xác minh thông tin để đảm bảo độ chính xác cao nhất cho người dùng.",
  },
  {
    question: "CONFRADAR có hỗ trợ nhiều ngôn ngữ không?",
    answer:
      "Có, CONFRADAR hỗ trợ đa ngôn ngữ bao gồm Tiếng Việt, Tiếng Anh và nhiều ngôn ngữ khác. Bạn có thể thay đổi ngôn ngữ hiển thị trong phần cài đặt.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative bg-[#0a0a0a] py-20 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Decorative asterisks */}
      <div className="absolute top-20 right-20 text-[#5b8def] text-4xl font-light select-none">✳</div>
      <div className="absolute bottom-32 left-20 text-[#ff6b35] text-4xl font-light select-none">✳</div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-40 right-0 w-72 h-72 bg-[#5b8def]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side - Section label */}
          <div className="lg:col-span-1">
            <p className="text-sm text-gray-500">
              03 / <span className="text-white">(FAQ&apos;s)</span>
            </p>
          </div>

          {/* Right side - Content */}
          <div className="lg:col-span-11">
            {/* Heading */}
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                Giải đáp thắc mắc
                <br />
                <span className="italic font-serif text-gray-300">Câu hỏi thường gặp</span>
              </h2>
            </div>

            {/* FAQ Items */}
            <div className="space-y-0">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-white/10">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full py-6 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
                  >
                    <span className="text-lg md:text-xl text-white pr-8">{item.question}</span>
                    <span className="flex-shrink-0 text-gray-400">
                      {openIndex === index ? (
                        <Minus className="w-5 h-5 text-[#ff6b35]" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="pb-6 pr-12">
                      <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}