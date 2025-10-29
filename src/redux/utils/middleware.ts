import { Middleware } from "@reduxjs/toolkit"
import { authApi } from "@/redux/services/auth.service"
import { destinationApi } from "@/redux/services/destination.service"
import { roomApi } from "@/redux/services/room.service"
import { conferenceApi } from "@/redux/services/conference.service"
import { conferenceStepApi } from "@/redux/services/conferenceStep.service"
import { categoryApi } from "@/redux/services/category.service"
import { transactionApi } from "../services/transaction.service"
import { ticketApi } from "../services/ticket.service"
import { cityApi } from "../services/city.service"
import {userApi}  from "../services/user.service"
import { paperApi } from "../services/paper.service"



export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  destinationApi.middleware,
  roomApi.middleware,
  categoryApi.middleware,
  conferenceApi.middleware,
  conferenceStepApi.middleware,
  transactionApi.middleware,
  ticketApi.middleware,
  cityApi.middleware,
  userApi.middleware,
  paperApi.middleware,


]
