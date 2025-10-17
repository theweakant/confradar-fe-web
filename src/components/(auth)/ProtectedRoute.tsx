'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/redux/hooks/useAuth'
import { getRouteByRole } from '@/utils/routeGuard'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]  // If not provided, any authenticated user can access
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
  
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Authenticated but wrong role -> redirect to their correct page
    if (!loading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        const correctRoute = getRouteByRole(user.role)
        router.push(correctRoute)
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}