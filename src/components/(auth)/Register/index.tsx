"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Mail, Lock, Phone, Calendar, Users, Upload, X } from "lucide-react"
import { useRegisterMutation } from "@/redux/services/auth.service"
import { toast } from "sonner"

export default function Register() {
  const router = useRouter()
  const [registerUser] = useRegisterMutation()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    gender: "",
    birthday: "",
    bioDescription: "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB")
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    try {
      setIsLoading(true)

      const body = new FormData()
      body.append("fullName", formData.fullName)
      body.append("email", formData.email)
      body.append("password", formData.password)
      body.append("confirmPassword", formData.confirmPassword)
      body.append("phoneNumber", formData.phoneNumber)
      body.append("gender", formData.gender || "Other")
      body.append("birthday", formData.birthday || "2000-01-01")
      body.append("bioDescription", formData.bioDescription)
      
      // Append avatar file if exists
      if (avatarFile) {
        body.append("avatarFile", avatarFile)
      } else {
        body.append("avatarFile", "")
      }

      await registerUser(body).unwrap()

      toast.success("Đăng ký thành công. Vui lòng kiểm tra Mail của bạn!")
      router.push("/auth/login")
    } catch (error) {
      console.error("Register error:", error)
      toast.error("Đăng ký thất bại. Vui lòng thử lại!")
    } finally {
      setIsLoading(false)
    }
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
              {/* Avatar Upload */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Ảnh đại diện</Label>
                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <Input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <Label
                      htmlFor="avatarFile"
                      className="cursor-pointer inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {avatarPreview ? "Thay đổi ảnh" : "Chọn ảnh"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-medium">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ tên"
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">
                  Nhập lại mật khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Gender & Birthday */}
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
                      <SelectItem value="Male">Nam</SelectItem>
                      <SelectItem value="Female">Nữ</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="birthday" className="text-xs font-medium">
                    Ngày Sinh
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 pointer-events-none" />
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleInputChange("birthday", e.target.value)}
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

              {/* Submit button */}
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
        <Image
          src="/professional-conference-seminar-business-meeting-p.jpg"
          alt="Conference and seminar"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 text-balance">Kết Nối Với Các Chuyên Gia Hàng Đầu</h2>
          <p className="text-lg text-white/90 max-w-2xl text-pretty">
            Tham gia cộng đồng ConfRadar để khám phá và đăng ký các hội nghị, hội thảo chuyên nghiệp trong lĩnh vực của bạn.
          </p>
        </div>
      </div>
    </div>
  )
}