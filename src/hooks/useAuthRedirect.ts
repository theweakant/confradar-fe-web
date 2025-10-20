import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { getRouteByRole } from "@/constants/roles"
import { RootState } from "@/redux/store"

export const useAuthRedirect = () => {
  const router = useRouter()
  const { role } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (role) {
      const route = getRouteByRole(role)
      router.push(route)
    }
  }, [role, router])
}