"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useGetGeneralFaqsQuery } from "@/redux/services/auditlog.service";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { data, isLoading, isError } = useGetGeneralFaqsQuery();
  const faqItems = data?.data || [];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-[#0a0a0a] w-full min-h-screen py-20 overflow-hidden m-0 p-0">
      <div className="absolute top-40 right-0 w-72 h-72 bg-[#5b8def]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="mb-8">
          <p className="text-sm text-gray-500">
            <span className="text-white">FAQ&apos;s</span>
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
            Giải đáp thắc mắc
            <br />
            <span className="italic font-serif text-gray-300">Câu hỏi thường gặp</span>
          </h2>
        </div>

        <div className="space-y-0">
          {isError ? (
            <div className="py-6">
              <p className="text-gray-400">Không thể tải câu hỏi thường gặp. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            faqItems.map((item, index) => (
              <div key={item.generalFaqid || index} className="border-b border-white/10">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-6 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-lg md:text-xl text-white pr-8">{item.name}</span>
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
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}