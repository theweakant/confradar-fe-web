"use client"
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Sparkles, Calendar, Users, MapPin, TrendingUp } from "lucide-react"
import Image from "next/image"

const features = [
  "Nền tảng số hóa, lấy người dùng làm trung tâm",
  "Bảo mật dữ liệu và quyền riêng tư hàng đầu",
  "Hỗ trợ cá nhân hóa với tự động hóa thông minh",
  "Công cụ khám phá hội nghị, không chỉ là danh sách",
]

export default function AboutUs() {
  const router = useRouter()

  return (
    <section className="bg-[#0d1117] min-h-screen">
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] via-[#0d1117] to-[#1a1025] opacity-80" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-12">
                Khám phá ngay.
                <br />
                <span className="italic font-light text-white/90">Kết nối Tri thức.</span>
              </h1>

              <div className="relative h-[400px] md:h-[450px]">
                <div className="absolute top-0 left-0 rounded-2xl shadow-2xl w-40 h-40 overflow-hidden">
                  <Image
                    src="/images/LandingPage/img/fpt_test_conf.jpg"
                    alt="Hội nghị"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-avatar.png";
                    }}
                  />
                </div>

                <div className="absolute top-4 right-0 md:right-12 rounded-2xl shadow-2xl w-48 h-40 overflow-hidden">
                  <Image
                    src="/images/LandingPage/img/img_5.jpg"
                    alt="Hiệu suất"
                    width={192}
                    height={160}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-avatar.png";
                    }}
                  />
                </div>

                <div className="absolute top-32 left-20 rounded-2xl shadow-2xl w-44 h-40 overflow-hidden">
                  <Image
                    src="/images/LandingPage/img/img_2.jpg"
                    alt="Người dùng hoạt động"
                    width={176}
                    height={160}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-avatar.png";
                    }}
                  />
                </div>

                <div className="absolute bottom-20 left-0 rounded-2xl shadow-2xl w-36 h-40 overflow-hidden">
                  <Image
                    src="/images/LandingPage/img/img_0.jpeg"
                    alt="Tăng trưởng"
                    width={144}
                    height={160}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-avatar.png";
                    }}
                  />
                </div>

                <div className="absolute bottom-0 right-0 md:right-8 rounded-2xl shadow-2xl w-48 h-40 overflow-hidden">
                  <Image
                    src="/images/LandingPage/img/img_6.jpg"
                    alt="Hồ sơ người dùng"
                    width={192}
                    height={160}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-avatar.png";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="flex items-center justify-end gap-2 mb-8 text-white/60 text-sm">
                <span>Về chúng tôi</span>
              </div>

              <div className="flex items-start gap-4 mb-8">

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-full text-white text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    ConfRadar
                  </span>
                  <div className="w-10 h-10 flex items-center justify-center">
                  <Image
                    src="/ConfradarLogo_Light.png"
                    alt="ConfRadar Logo"
                    width={64}
                    height={64}
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-avatar.png";
                    }}
                  />
                  </div>
                </div>
              </div>

              <p className="text-white/70 leading-relaxed mb-8 max-w-md">
                Tại ConfRadar, chúng tôi định nghĩa lại việc khám phá hội nghị với công nghệ và sự chăm sóc cá nhân hóa.
                Chúng tôi tin rằng việc tìm kiếm hội nghị nên đơn giản và trao quyền, giúp cá nhân và tổ chức phát
                triển.
              </p>

              <div className="space-y-4 mb-10">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-white/10 group"
                  >
                    <span className="text-white/90 group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => router.push('/customer')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium transition-colors"
                >
                  Tìm hiểu thêm
                  <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}