"use client"
import { useRouter } from "next/navigation"
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, User, Mail, Lock, Phone, Calendar, Eye, EyeOff, CheckCircle, AlertCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationState {
  isValid: boolean
  message: string
  type: "success" | "error" | "warning" | "info"
}

interface FormErrors {
  fullName: ValidationState
  email: ValidationState
  password: ValidationState
  rePassword: ValidationState
  phoneNumber: ValidationState
}

const validateEmail = (email: string): ValidationState => {
  if (!email) return { isValid: false, message: "", type: "error" }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Vui lòng nhập địa chỉ email hợp lệ", type: "error" }
  }
  return { isValid: true, message: "Email hợp lệ!", type: "success" }
}

const validatePassword = (password: string): ValidationState => {
  if (!password) return { isValid: false, message: "", type: "error" }
  if (password.length < 8) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 8 ký tự", type: "error" }
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Cần có chữ hoa, chữ thường và số", type: "warning" }
  }
  return { isValid: true, message: "Mật khẩu mạnh!", type: "success" }
}

const validateName = (name: string): ValidationState => {
  if (!name) return { isValid: false, message: "Họ và tên là bắt buộc", type: "error" }
  if (name.length < 2) {
    return { isValid: false, message: "Tên phải có ít nhất 2 ký tự", type: "error" }
  }
  return { isValid: true, message: "", type: "success" }
}

const validatePhone = (phone: string): ValidationState => {
  if (!phone) return { isValid: true, message: "", type: "success" } // Optional field
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
    return { isValid: false, message: "Vui lòng nhập số điện thoại hợp lệ", type: "error" }
  }
  return { isValid: true, message: "", type: "success" }
}

export function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    rePassword: "",
    phoneNumber: "",
    gender: "",
    birthDay: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({
    fullName: { isValid: true, message: "", type: "success" },
    email: { isValid: true, message: "", type: "success" },
    password: { isValid: true, message: "", type: "success" },
    rePassword: { isValid: true, message: "", type: "success" },
    phoneNumber: { isValid: true, message: "", type: "success" },
  })
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    const newErrors = { ...errors }

    if (touchedFields.has("fullName")) {
      newErrors.fullName = validateName(formData.fullName)
    }
    if (touchedFields.has("email")) {
      newErrors.email = validateEmail(formData.email)
    }
    if (touchedFields.has("password")) {
      newErrors.password = validatePassword(formData.password)
    }
    if (touchedFields.has("rePassword")) {
      if (!formData.rePassword) {
        newErrors.rePassword = { isValid: false, message: "", type: "error" }
      } else if (formData.password !== formData.rePassword) {
        newErrors.rePassword = { isValid: false, message: "Mật khẩu không khớp", type: "error" }
      } else {
        newErrors.rePassword = { isValid: true, message: "Mật khẩu khớp!", type: "success" }
      }
    }
    if (touchedFields.has("phoneNumber")) {
      newErrors.phoneNumber = validatePhone(formData.phoneNumber)
    }

    setErrors(newErrors)
  }, [formData, touchedFields])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouchedFields((prev) => new Set(prev).add(field))
  }

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field))
  }

  const isFormValid = () => {
    return (
      Object.values(errors).every((error) => error.isValid) &&
      formData.fullName &&
      formData.email &&
      formData.password &&
      formData.rePassword
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched for validation
    setTouchedFields(new Set(["fullName", "email", "password", "rePassword", "phoneNumber"]))

    if (!isFormValid()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    router.push("/auth/login")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-tech-blue/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-research-purple/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-0 bg-card/95 backdrop-blur-sm animate-slide-in-up relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-card-foreground text-balance">
            Tham Gia Cộng Đồng ConfRadar
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1">
                Họ và Tên <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 h-11 transition-all duration-200",
                    touchedFields.has("fullName") &&
                      !errors.fullName.isValid &&
                      "border-destructive focus-visible:ring-destructive",
                    touchedFields.has("fullName") &&
                      errors.fullName.isValid &&
                      formData.fullName &&
                      "border-success focus-visible:ring-success",
                  )}
                  aria-describedby={
                    touchedFields.has("fullName") && errors.fullName.message ? "fullName-error" : undefined
                  }
                />
                {touchedFields.has("fullName") && errors.fullName.isValid && formData.fullName && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success w-4 h-4" />
                )}
              </div>
              {touchedFields.has("fullName") && errors.fullName.message && (
                <p
                  id="fullName-error"
                  className={cn(
                    "text-xs flex items-center gap-1",
                    errors.fullName.type === "error" && "text-destructive",
                    errors.fullName.type === "success" && "text-success",
                  )}
                >
                  {errors.fullName.type === "error" && <AlertCircle className="w-3 h-3" />}
                  {errors.fullName.type === "success" && <CheckCircle className="w-3 h-3" />}
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                Địa Chỉ Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={isLoading}
                  className={cn(
                    "pl-10 h-11 transition-all duration-200",
                    touchedFields.has("email") &&
                      !errors.email.isValid &&
                      "border-destructive focus-visible:ring-destructive",
                    touchedFields.has("email") &&
                      errors.email.isValid &&
                      formData.email &&
                      "border-success focus-visible:ring-success",
                  )}
                  aria-describedby={touchedFields.has("email") && errors.email.message ? "email-error" : undefined}
                />
                {touchedFields.has("email") && errors.email.isValid && formData.email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success w-4 h-4" />
                )}
              </div>
              {touchedFields.has("email") && errors.email.message && (
                <p
                  id="email-error"
                  className={cn(
                    "text-xs flex items-center gap-1",
                    errors.email.type === "error" && "text-destructive",
                    errors.email.type === "success" && "text-success",
                  )}
                >
                  {errors.email.type === "error" && <AlertCircle className="w-3 h-3" />}
                  {errors.email.type === "success" && <CheckCircle className="w-3 h-3" />}
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-1">
                  Mật Khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-10 h-11 transition-all duration-200",
                      touchedFields.has("password") &&
                        !errors.password.isValid &&
                        "border-destructive focus-visible:ring-destructive",
                      touchedFields.has("password") &&
                        errors.password.isValid &&
                        formData.password &&
                        "border-success focus-visible:ring-success",
                    )}
                    aria-describedby={
                      touchedFields.has("password") && errors.password.message ? "password-error" : "password-help"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p id="password-help" className="text-xs text-muted-foreground">
                  Ít nhất 8 ký tự có chữ hoa, chữ thường và số
                </p>
                {touchedFields.has("password") && errors.password.message && (
                  <p
                    id="password-error"
                    className={cn(
                      "text-xs flex items-center gap-1",
                      errors.password.type === "error" && "text-destructive",
                      errors.password.type === "warning" && "text-warning",
                      errors.password.type === "success" && "text-success",
                    )}
                  >
                    {errors.password.type === "error" && <AlertCircle className="w-3 h-3" />}
                    {errors.password.type === "success" && <CheckCircle className="w-3 h-3" />}
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="rePassword" className="text-sm font-medium flex items-center gap-1">
                  Xác Nhận Mật Khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="rePassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    value={formData.rePassword}
                    onChange={(e) => handleInputChange("rePassword", e.target.value)}
                    onBlur={() => handleBlur("rePassword")}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-10 h-11 transition-all duration-200",
                      touchedFields.has("rePassword") &&
                        !errors.rePassword.isValid &&
                        "border-destructive focus-visible:ring-destructive",
                      touchedFields.has("rePassword") &&
                        errors.rePassword.isValid &&
                        formData.rePassword &&
                        "border-success focus-visible:ring-success",
                    )}
                    aria-describedby={
                      touchedFields.has("rePassword") && errors.rePassword.message ? "rePassword-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touchedFields.has("rePassword") && errors.rePassword.message && (
                  <p
                    id="rePassword-error"
                    className={cn(
                      "text-xs flex items-center gap-1",
                      errors.rePassword.type === "error" && "text-destructive",
                      errors.rePassword.type === "success" && "text-success",
                    )}
                  >
                    {errors.rePassword.type === "error" && <AlertCircle className="w-3 h-3" />}
                    {errors.rePassword.type === "success" && <CheckCircle className="w-3 h-3" />}
                    {errors.rePassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                Thông Tin Tùy Chọn
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Số Điện Thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Số điện thoại của bạn"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      onBlur={() => handleBlur("phoneNumber")}
                      disabled={isLoading}
                      className={cn(
                        "pl-10 h-11 transition-all duration-200",
                        touchedFields.has("phoneNumber") &&
                          !errors.phoneNumber.isValid &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      aria-describedby={
                        touchedFields.has("phoneNumber") && errors.phoneNumber.message ? "phone-error" : undefined
                      }
                    />
                  </div>
                  {touchedFields.has("phoneNumber") && errors.phoneNumber.message && (
                    <p id="phone-error" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Giới Tính
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                      <SelectItem value="prefer-not-to-say">Không muốn trả lời</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Birthday */}
              <div className="space-y-2">
                <Label htmlFor="birthDay" className="text-sm font-medium">
                  Ngày Sinh
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="birthDay"
                    type="date"
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange("birthDay", e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full font-semibold text-base mt-8 transition-all duration-300",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "text-white hover:shadow-lg hover:scale-[1.02]",
                isFormValid() && !isLoading && "shadow-md",
              )}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang Tạo Tài Khoản...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-5 w-5" />
                  Tham Gia ConfRadar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Button
                onClick={() => router.push("/auth/login")}
                className="text-tech-blue hover:text-tech-blue/80 font-semibold p-0 h-auto"
                type="button"
                variant="link"
              >
                Đăng nhập tại đây
              </Button>
            </p>
            <p className="text-xs text-muted-foreground mt-3 text-pretty">
              Bằng cách tạo tài khoản, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}