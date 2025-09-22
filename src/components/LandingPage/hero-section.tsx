import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Khám phá & Đăng ký Hội thảo
            <br />
            <span className="text-accent">Công nghệ và Nghiên cứu</span>
            <br />
            dễ dàng
          </h1>

          <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto text-pretty">
            Kết nối tri thức - Mở rộng cơ hội - Phát triển sự nghiệp
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Tìm hội thảo theo chủ đề, địa điểm..."
                className="pl-12 py-4 text-lg bg-background/95 backdrop-blur"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">Tìm kiếm</Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/tech-conferences">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg">
                💻 Tìm Hội thảo Công nghệ
              </Button>
            </Link>
            <Link href="/research-conferences">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg bg-transparent"
              >
                🎓 Tìm Hội nghị Nghiên cứu
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/abstract-tech-conference-networking-pattern.jpg')] opacity-10"></div>
    </section>
  )
}
