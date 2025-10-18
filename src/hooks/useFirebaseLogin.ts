import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "@/firebase/config"
import { useDispatch } from "react-redux"
import { useFirebaseLoginMutation } from "@/redux/services/auth.service"
import { setCredentials } from "@/redux/slices/auth.slice"
import { startLoading, stopLoading } from "@/redux/slices/auth.slice"

export const useFirebaseLogin = () => {
  const dispatch = useDispatch()
  const [firebaseLogin] = useFirebaseLoginMutation()

  const handleGoogleLogin = async () => {
    dispatch(startLoading())
    try {
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken() 
      const response = await firebaseLogin(token).unwrap()

      // Backend trả về { user, accessToken, refreshToken }
      dispatch(setCredentials(response))
      
      // Trả về format giống login thông thường
      return { success: true, user: response.user }
    } catch (err) {
      console.error("Firebase login failed:", err)
      return { success: false, user: null }
    } finally {
      dispatch(stopLoading())
    }
  }

  return { handleGoogleLogin }
}