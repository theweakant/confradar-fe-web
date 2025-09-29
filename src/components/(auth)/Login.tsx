"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Mail, Lock, UserCheck, Users, Building2, Shield, Handshake, GraduationCap } from "lucide-react"

export function Login() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; role?: string } = {}

    if (!email) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ"
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!role) {
      newErrors.role = "Vui lòng chọn vai trò"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const routes = {
      admin: "/workspace/admin",
      collaborator: "/workspace/collaborator",
      reviewer: "/workspace/reviewer",
      organizer: "/workspace/organizer",
      guest: "/workspace/guest",
    }

    router.push(routes[role as keyof typeof routes])
    setIsLoading(false)
  }

  const handleQuickLogin = async (roleValue: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const routes = {
      guest: "/workspace/guest",
      organizer: "/workspace/organizer",
      admin: "/workspace/admin",
      collaborator: "/workspace/collaborator",
      reviewer: "/workspace/reviewer",
    }

    router.push(routes[roleValue as keyof typeof routes])
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/workspace/collaborator")
    setIsLoading(false)
  }

  const getRoleIcon = (roleValue: string) => {
    const icons = {
      admin: "👑",
      collaborator: "👤",
      reviewer: "🎓",
      organizer: "📋",
      guest: "👋",
    }
    return icons[roleValue as keyof typeof icons] || "👤"
  }

  const quickLoginRoles = [
    { 
      value: "guest", 
      label: "Khách", 
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    { 
      value: "organizer", 
      label: "Tổ chức", 
      icon: Building2,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    { 
      value: "admin", 
      label: "Quản trị hệ thống", 
      icon: Shield,
      color: "bg-red-500 hover:bg-red-600"
    },
    { 
      value: "collaborator", 
      label: "Đối tác", 
      icon: Handshake,
      color: "bg-green-500 hover:bg-green-600"
    },
    { 
      value: "reviewer", 
      label: "Đánh giá viên", 
      icon: GraduationCap,
      color: "bg-orange-500 hover:bg-orange-600"
    },
  ]

  return (
    <div className="flex h-screen w-full">
      {/* Left image / illustration - 60% width */}
      <div className="hidden md:flex md:w-3/5 bg-gray-100 items-center justify-center relative overflow-hidden">
        <Image
          src="/images/login/login_conf.jpg"
          alt="Minh họa Hội nghị"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        <div className="relative z-10 text-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4">ConfRadar</h1>
          <p className="text-xl opacity-90">Khám Phá Các Hội Nghị Tuyệt Vời Trên Toàn Thế Giới</p>
        </div>
      </div>

      {/* Right form - 40% width */}
      <div className="flex w-full md:w-2/5 items-center justify-center bg-white px-4 py-8 overflow-y-auto relative">
        {/* Sign up link in top right corner */}
        <div className="absolute top-6 right-6">
          <p className="text-sm text-[#6B7280]">
            Chưa có tài khoản?{" "}
            <button 
              onClick={() => router.push("/auth/register")}
              className="text-[#3B82F6] hover:text-[#2563EB] font-medium"
              disabled={isLoading}
            >
              Đăng ký
            </button>
          </p>
        </div>

        <Card className="w-full max-w-md border-0 p-6">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#1F2937]">Chào Mừng Đến ConfRadar</CardTitle>
            <CardDescription className="text-[#6B7280]">Đăng nhập để khám phá các hội nghị tuyệt vời</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#374151] font-medium">
                  Địa Chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 ${
                      errors.email ? "border-[#EF4444]" : "border-[#E5E7EB]"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-[#EF4444] mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#374151] font-medium">
                  Mật Khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 h-12 ${
                      errors.password ? "border-[#EF4444]" : "border-[#E5E7EB]"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-sm text-[#EF4444] mt-1">{errors.password}</p>}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#374151] font-medium">
                  Chọn Vai Trò
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-[#6B7280] z-10" />
                  <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger
                      className={`pl-10 h-12 ${
                        errors.role ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                    >
                      <SelectValue placeholder="Chọn vai trò của bạn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest"><span className="mr-2">👋</span> Khách</SelectItem>
                      <SelectItem value="collaborator"><span className="mr-2">👤</span> Người dùng</SelectItem>
                      <SelectItem value="reviewer"><span className="mr-2">🎓</span> Người đánh giá</SelectItem>
                      <SelectItem value="organizer"><span className="mr-2">📋</span> Tổ chức</SelectItem>
                      <SelectItem value="admin"><span className="mr-2">👑</span> Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.role && <p className="text-sm text-[#EF4444] mt-1">{errors.role}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#1F2937] hover:bg-[#374151] text-white font-medium mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    {role && <span className="mr-2">{getRoleIcon(role)}</span>}
                    Đăng Nhập ConfRadar
                  </>
                )}
              </Button>
            </form>

            {/* Quick Login Buttons */}
            <div className="mt-6 space-y-3">
              <div className="text-center text-sm font-medium text-[#6B7280] mb-3">
                Hoặc đăng nhập nhanh với vai trò
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickLoginRoles.map((roleItem) => {
                  const IconComponent = roleItem.icon
                  return (
                    <Button
                      key={roleItem.value}
                      type="button"
                      onClick={() => handleQuickLogin(roleItem.value)}
                      className={`h-auto py-3 px-2 ${roleItem.color} text-white font-medium text-xs flex flex-col items-center gap-1`}
                      disabled={isLoading}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-center leading-tight">{roleItem.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#6B7280]">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-12 border-[#E5E7EB] hover:bg-[#F9FAFB]"
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập với Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}