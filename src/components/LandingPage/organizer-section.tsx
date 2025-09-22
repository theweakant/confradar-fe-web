import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Users, CreditCard, Mail } from "lucide-react"

export default function OrganizersSection() {
  const benefits = [
    {
      icon: Target,
      title: "Quản lý sự kiện chuyên nghiệp",
      description: "Dashboard toàn diện để quản lý mọi khía cạnh của sự kiện",
    },
    {
      icon: Users,
      title: "Dashboard theo dõi đăng ký",
      description: "Theo dõi real-time số lượng đăng ký và thông tin người tham gia",
    },
    {
      icon: CreditCard,
      title: "Tích hợp thanh toán Việt Nam",
      description: "Hỗ trợ VNPay, Momo và các phương thức thanh toán phổ biến",
    },
    {
      icon: Mail,
      title: "Hệ thống review tự động",
      description: "Quản lý submission và review process cho hội nghị nghiên cứu",
    },
  ]

  return (
    <section id="organizers" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Bạn là Ban tổ chức?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tạo và quản lý sự kiện của bạn với các công cụ chuyên nghiệp
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">Sẵn sàng tạo sự kiện đầu tiên?</h3>
            <p className="text-lg mb-6 text-primary-foreground/90">
              Tham gia cùng hàng trăm tổ chức đã tin tưởng ConfRadar
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Tạo sự kiện ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
