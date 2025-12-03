// import { signInWithPopup } from "firebase/auth"
// import { auth, provider } from "@/firebase/config"
// import { useDispatch } from "react-redux"
// import { useFirebaseLoginMutation } from "@/redux/services/auth.service"
// import { setCredentials } from "@/redux/slices/auth.slice"
// import { startLoading, stopLoading } from "@/redux/slices/auth.slice"

// export const useFirebaseLogin = () => {
//   const dispatch = useDispatch()
//   const [firebaseLogin] = useFirebaseLoginMutation()

//   const handleGoogleLogin = async () => {
//     dispatch(startLoading())
//     try {
//       const result = await signInWithPopup(auth, provider)
//       const token = await result.user.getIdToken()
//       const response = await firebaseLogin(token).unwrap()

//       // Backend trả về { user, accessToken, refreshToken }
//       dispatch(setCredentials(response))

//       // Trả về format giống login thông thường
//       return { success: true, user: response.user }
//     } catch (err) {
//       console.error("Firebase login failed:", err)
//       return { success: false, user: null }
//     } finally {
//       dispatch(stopLoading())
//     }
//   }

//   return { handleGoogleLogin }
// }

//src\hooks\useFirebaseLogin.ts

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase/config";
import { useDispatch } from "react-redux";
import { useFirebaseLoginMutation } from "@/redux/services/auth.service";
import {
  setCredentials,
  startLoading,
  stopLoading,
} from "@/redux/slices/auth.slice";
import {
  decodeToken,
  getCustomerRole,
  getRolesFromToken,
} from "@/redux/utils/token";

type FirebaseLoginPayload = {
  firebaseWebFcmToken?: string | null;
  firebaseMobileFcmToken?: string | null;
};

export const useFirebaseLogin = () => {
  const dispatch = useDispatch();
  const [firebaseLogin] = useFirebaseLoginMutation();

  const handleGoogleLogin = async (payload: FirebaseLoginPayload = {}) => {
    dispatch(startLoading());
    try {
      // 1️⃣ Login Google popup
      const result = await signInWithPopup(auth, provider);
      const firebaseToken = await result.user.getIdToken();

      // 2️⃣ Gọi BE để nhận accessToken, refreshToken
      const res = await firebaseLogin({
        token: firebaseToken,
        ...(payload.firebaseWebFcmToken && {
          firebaseWebFcmToken: payload.firebaseWebFcmToken,
        }),
        ...(payload.firebaseMobileFcmToken && {
          firebaseMobileFcmToken: payload.firebaseMobileFcmToken,
        }),
      }).unwrap();
      const { accessToken, refreshToken } = res.data || {};

      if (!accessToken) throw new Error("Access token missing");

      // 3️⃣ FE decode token giống login thường
      const decoded = decodeToken(accessToken);
      // const rawRole = getRolesFromToken(accessToken);
      const role = getRolesFromToken(accessToken);
      const email = decoded?.email || result.user.email || "";
      const userId = decoded?.sub || "";

      // let role: string | null = null;

      // const customerRole = getCustomerRole(accessToken);
      // role = customerRole || (rawRole.length > 0 ? rawRole[0] : null);
      // if (Array.isArray(rawRole)) {
      //   role = getCustomerRole(accessToken)
      // } else if (typeof rawRole === "string") {
      //   role = rawRole
      // }

      const userInfo = { userId, email, role };

      // 4️⃣ Lưu Redux format y như login thường
      dispatch(setCredentials({ user: userInfo, accessToken, refreshToken }));

      return { success: true, user: userInfo };
    } catch (err) {
      console.error("Firebase login failed:", err);
      return { success: false, user: null };
    } finally {
      dispatch(stopLoading());
    }
  };

  return { handleGoogleLogin };
};
