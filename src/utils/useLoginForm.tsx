import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/redux/hooks/useAuth"
import { validateLoginForm } from "@/helper/validation"
// import { getRouteByRole } from "@/utils/routeGuard"
import type { LoginFormData, FormErrors } from "@/types/auth.type"

export const useLoginForm = () => {
  const router = useRouter()
  const { login, loading } = useAuth()
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateLoginForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      // ✅ USE YOUR EXISTING useAuth login method
      const success = await login({
        email: formData.email,
        password: formData.password,
      })
      
      if (success) {
        // ✅ Get user from Redux state after successful login
        // Note: You might need to pass user from login response
        // For now, redirect to default workspace
        router.push("/workspace")
        
        // TODO: When BE returns role, update to:
        // const redirectUrl = getRouteByRole(user.role)
        // router.push(redirectUrl)
      } else {
        setErrors({ 
          email: "Email hoặc mật khẩu không đúng" 
        })
      }
      
    } catch (error) {
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : (error as { data?: { message?: string }; message?: string })?.data?.message ||
            (error as { data?: { message?: string }; message?: string })?.message ||
            "Đăng nhập thất bại"
      
      setErrors({ email: errorMessage })
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'orcid') => {
    console.log(`${provider} login - will implement later`)
  }

  return {
    formData,
    errors,
    isLoading: loading,
    handleInputChange,
    handleLogin,
    handleSocialLogin,
  }
}