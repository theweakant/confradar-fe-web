import { Middleware } from "@reduxjs/toolkit"
import { authApi } from "@/redux/services/auth.service"
import { destinationApi } from "@/redux/services/destination.service"
import { roomApi } from "@/redux/services/room.service"
import { conferenceApi } from "@/redux/services/conference.service"
import { conferenceStepApi } from "@/redux/services/conferenceStep.service"
import { categoryApi } from "@/redux/services/category.service"



export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  destinationApi.middleware,
  roomApi.middleware,
  categoryApi.middleware,
  conferenceApi.middleware,
  conferenceStepApi.middleware,
  
  
]
