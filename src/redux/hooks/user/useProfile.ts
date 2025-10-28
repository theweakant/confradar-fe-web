// redux/hooks/useProfile.ts
import { useAuth } from "@/redux/hooks/useAuth"
import { useGetProfileByIdQuery } from "@/redux/services/user.service"

export const useProfile = () => {
  const { user } = useAuth()
  const userId = user?.userId || null

  
  const { data, error, isLoading, refetch } = useGetProfileByIdQuery(userId!, {
    skip: !userId, 
  })

  return {
    profile: data?.data || null,
    isLoading,
    error,
    refetch,
  }
}
