import { HoverRevealSquare } from "@/components/molecules/LandingPage/HoverRevealSquare";

export default function WhatWeOffer() {
  return (
    <section className="min-h-screen bg-black text-white py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/60 mb-4">
            CONFRADAR MANG ĐẾN
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight">
            HỘI NGHỊ DÀNH CHO AI?
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Đối tác tổ chức */}
          <HoverRevealSquare
            title="Đối tác"
            hoverInfo={[
              "Tổ chức sự kiện",
              "Quản lý nội dung",
              "Kết nối cộng đồng",
              "Xây dựng thương hiệu",
            ]}
            detailNumber="1"
            detailTitle="Đối tác tổ chức"
            detailDescription="Dành cho các tổ chức, ban tổ chức hội nghị muốn tiếp cận rộng rãi và quản lý sự kiện hiệu quả."
          />

          {/* Tác giả / Diễn giả */}
          <HoverRevealSquare
            title="Tác giả"
            hoverInfo={[
              "Gửi bài nghiên cứu",
              "Chia sẻ kiến thức",
              "Xây dựng uy tín",
              "Kết nối chuyên gia",
            ]}
            detailNumber="2"
            detailTitle="Tác giả / Diễn giả"
            detailDescription="Dành cho các nhà nghiên cứu, diễn giả muốn trình bày công trình và mở rộng tầm ảnh hưởng."
          />

          {/* Người tham dự */}
          <HoverRevealSquare
            title="Người dự"
            hoverInfo={[
              "Khám phá hội nghị",
              "Học hỏi xu hướng",
              "Networking",
              "Phát triển nghề nghiệp",
            ]}
            detailNumber="3"
            detailTitle="Người tham dự"
            detailDescription="Dành cho những ai muốn cập nhật kiến thức mới nhất và kết nối với cộng đồng chuyên môn."
          />

          {/* Phản biện */}
          <HoverRevealSquare
            title="Phản biện"
            hoverInfo={[
              "Đánh giá bài viết",
              "Đảm bảo chất lượng",
              "Góp ý xây dựng",
              "Nâng cao chuẩn mực",
            ]}
            detailNumber="4"
            detailTitle="Phản biện"
            detailDescription="Dành cho các chuyên gia đánh giá và đảm bảo chất lượng nội dung học thuật của hội nghị."
          />
        </div>
      </div>
    </section>
  );
}
