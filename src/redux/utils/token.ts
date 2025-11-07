// redux/utils/token.ts
import { ROLES } from "@/constants/roles"
import { jwtDecode } from "jwt-decode"


const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

interface DecodedToken {
  email: string
  sub: string
  exp: number
  iss: string
  aud: string
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[]
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch (error) {
    console.error("Invalid token:", error)
    return null
  }
}

// export const getRoleFromToken = (token: string): string | null => {
//   const decoded = decodeToken(token)
//   if (!decoded) return null
//   return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
// }

export const getRolesFromToken = (token: string): string[] => {
  const decoded = decodeToken(token)
  if (!decoded) return []

  const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

  if (Array.isArray(roles)) return roles
  if (typeof roles === "string") return [roles]
  return []
}

export const getCustomerRole = (token: string): string | null => {
  const roles = getRolesFromToken(token)

  const normalizedRoles = roles.map(r => r.toLowerCase().replace(/\s+/g, ""))
  const hasCustomer = normalizedRoles.includes(ROLES.CUSTOMER)

  if (!hasCustomer) return null

  const originalRole = roles.find(
    r => r.toLowerCase().replace(/\s+/g, "") === ROLES.CUSTOMER
  )

  return originalRole || null
}


export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch {
    return true
  }
}
