"use client"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Mail, Lock, Phone, Calendar, Users } from "lucide-react"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
    birthDay: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold text-balance">Tham Gia Cộng Đồng ConfRadar</CardTitle>
            <p className="text-sm text-muted-foreground">Khám phá các hội nghị và hội thảo hàng đầu</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-medium">
                  Họ và Tên <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium">
                  Mật Khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tạo mật khẩu"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Gender and Birthday in one row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="gender" className="text-xs font-medium">
                    Giới Tính
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="birthDay" className="text-xs font-medium">
                    Ngày Sinh
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 pointer-events-none" />
                    <Input
                      id="birthDay"
                      type="date"
                      value={formData.birthDay}
                      onChange={(e) => handleInputChange("birthDay", e.target.value)}
                      disabled={isLoading}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-xs font-medium">
                  Số Điện Thoại
                </Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Số điện thoại"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold mt-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-9 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang Tạo Tài Khoản...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Đăng Ký
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold p-0 h-auto"
                  type="button"
                  variant="link"
                >
                  Đăng nhập
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Image (60%) */}
      <div className="hidden lg:block lg:w-3/5 relative bg-gradient-to-br from-blue-50 to-purple-50">
        <img
          src="/professional-conference-seminar-business-meeting-p.jpg"
          alt="Conference and seminar"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 text-balance">Kết Nối Với Các Chuyên Gia Hàng Đầu</h2>
          <p className="text-lg text-white/90 max-w-2xl text-pretty">
            Tham gia cộng đồng ConfRadar để khám phá và đăng ký các hội nghị, hội thảo chuyên nghiệp trong lĩnh vực của
            bạn.
          </p>
        </div>
      </div>
    </div>
  )
}
