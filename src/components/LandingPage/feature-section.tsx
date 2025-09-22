import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Laptop, GraduationCap, QrCode, Calendar, Globe } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Vì sao chọn ConfRadar?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Platform đầu tiên tại Việt Nam phân biệt rõ ràng giữa hội thảo công nghệ và nghiên cứu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Tech Conferences */}
          <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Laptop className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-accent">Hội thảo Công nghệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Tìm kiếm sự kiện công nghệ dễ dàng</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Đăng ký nhanh chóng</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Vé điện tử với QR code</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Nhắc nhở lịch trình tự động</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Cập nhật xu hướng công nghệ mới</span>
              </div>
            </CardContent>
          </Card>

          {/* Research Conferences */}
          <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl text-secondary">Hội nghị Nghiên cứu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Hồ sơ học thuật chuyên nghiệp</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Nộp bài và theo dõi phản biện</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Kết nối với ORCID, Scopus, Scholar</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Quản lý submission timeline</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span>Tìm kiếm theo ranking và scope</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Vé điện tử QR</h3>
            <p className="text-muted-foreground text-sm">Check-in nhanh chóng với mã QR</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Quản lý lịch trình</h3>
            <p className="text-muted-foreground text-sm">Đồng bộ với Google Calendar</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Kết nối quốc tế</h3>
            <p className="text-muted-foreground text-sm">Tích hợp với các platform học thuật</p>
          </div>
        </div>
      </div>
    </section>
  )
}
