"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock, Users, Building2, Shield, Handshake, GraduationCap } from "lucide-react"

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
    setRole(roleValue) // Set the role when quick login is used
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

  const handleOrcidLogin = async () => {
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
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      value: "organizer",
      label: "Tổ chức",
      icon: Building2,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      value: "admin",
      label: "Quản trị hệ thống",
      icon: Shield,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      value: "collaborator",
      label: "Đối tác",
      icon: Handshake,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      value: "reviewer",
      label: "Đánh giá viên",
      icon: GraduationCap,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ]

  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:flex md:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center relative overflow-hidden">
        <Image
          src="/images/login/login_conf.jpg"
          alt="Minh họa Hội nghị"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>

        <div className="relative z-10 text-center text-white px-8 max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">ConfRadar</h1>
          <p className="text-2xl font-light opacity-90 leading-relaxed">
            Khám Phá Các Hội Nghị Tuyệt Vời Trên Toàn Thế Giới
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Kết nối chuyên gia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Chia sẻ kiến thức</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Phát triển nghề nghiệp</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-2/5 items-center justify-center bg-white px-6 py-8 overflow-y-auto relative">
        {/* Sign up link in top right corner */}
        <div className="absolute top-8 right-8">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => router.push("/auth/register")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              disabled={isLoading}
            >
              Đăng ký
            </button>
          </p>
        </div>

        <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader className="space-y-2 pb-8 pt-16">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Đăng nhập vào{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600">ConfRadar</span>
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 200 60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="100"
                  cy="30"
                  rx="95"
                  ry="25"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  transform="rotate(-2 100 30)"
                />
              </svg>
            </span>
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Từ sáng tạo đến tri thức – Gói trọn trong ConfRadar.
          </CardDescription>
        </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mật Khẩu
                  </Label>
                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-colors mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    {role && <span className="mr-2">{getRoleIcon(role)}</span>}
                    Đăng Nhập
                  </>
                )}
              </Button>
            </form>

            {/* Quick Login Buttons */}
            <div className="space-y-4 pt-2">
              <div className="text-center text-sm font-medium text-gray-500">Hoặc đăng nhập nhanh với vai trò</div>
              <div className="flex items-center justify-center gap-3">
                {quickLoginRoles.map((roleItem) => {
                  const IconComponent = roleItem.icon
                  return (
                    <button
                      key={roleItem.value}
                      type="button"
                      onClick={() => handleQuickLogin(roleItem.value)}
                      className={`w-12 h-12 rounded-full ${roleItem.color} text-white flex items-center justify-center shadow-sm transition-all hover:shadow-md hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isLoading}
                      title={roleItem.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Social Login Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500 font-medium">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Login Buttons - Ngang hàng */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="h-12 border-gray-300 hover:bg-gray-50 font-medium text-gray-700 shadow-sm transition-colors bg-transparent"
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="truncate">Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleOrcidLogin}
                className="h-12 border-gray-300 hover:bg-gray-50 font-medium text-gray-700 shadow-sm transition-colors bg-transparent"
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="#A6CE39"/>
                  <path d="M8.5 7.5h1.5v9H8.5v-9z" fill="white"/>
                  <circle cx="9.25" cy="5.75" r="1" fill="white"/>
                  <path d="M12.5 10.5h2.8c1.4 0 2.2.9 2.2 2.1v.3c0 1.2-.8 2.1-2.2 2.1h-1.3v1.5h-1.5v-6zm1.5 3.2h1.2c.5 0 .8-.3.8-.8v-.2c0-.5-.3-.8-.8-.8h-1.2v1.8z" fill="white"/>
                </svg>
                <span className="truncate">ORCID</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}