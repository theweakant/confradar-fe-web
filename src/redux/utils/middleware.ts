import { Middleware } from "@reduxjs/toolkit"
import { authApi } from "@/redux/services/auth.service"
// sau này thêm các service khác ở đây
// import { userApi } from "@/redux/services/user.service"
// import { courseApi } from "@/redux/services/course.service"

export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  // userApi.middleware,
  // courseApi.middleware,
]
