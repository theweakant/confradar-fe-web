import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Search, Calendar } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Tạo tài khoản",
      description: "Đăng ký miễn phí và tạo hồ sơ cá nhân",
      color: "text-primary",
    },
    {
      icon: Search,
      title: "Tìm & Chọn",
      description: "Duyệt hội thảo phù hợp với sở thích",
      color: "text-secondary",
    },
    {
      icon: Calendar,
      title: "Đăng ký & Tham gia",
      description: "Nhận vé điện tử và tham dự sự kiện",
      color: "text-accent",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Cách thức hoạt động</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chỉ với 3 bước đơn giản để tham gia hội thảo yêu thích
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="h-12 w-12 rounded-full bg-background border-4 border-primary flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{index + 1}</span>
                  </div>
                </div>
                <div
                  className={`mx-auto mb-4 h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mt-4`}
                >
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
