import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type {
  Room,
  RoomFormData,
  RoomOccupationSlot,
  RoomWithSessions,
  TimeSpan,
  AvailableRoom
} from "@/types/room.type";
import type { ApiResponse, ApiResponsePagination } from "@/types/api.type";

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: apiClient,
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    getAllRooms: builder.query<ApiResponse<Room[]>, void>({
      query: () => ({
        url: endpoint.ROOM.LIST,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<ApiResponse<string>, RoomFormData>({
      query: (body) => ({
        url: endpoint.ROOM.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<
      ApiResponse<string>,
      { id: string; data: RoomFormData }
    >({
      query: ({ id, data }) => ({
        url: `${endpoint.ROOM.UPDATE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Room"],
    }),

    deleteRoom: builder.mutation<ApiResponse<string>, string>({
      query: (id) => ({
        url: `${endpoint.ROOM.DELETE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),

    getRoomById: builder.query<ApiResponse<Room>, string>({
      query: (id) => ({
        url: `${endpoint.ROOM.DETAIL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),

    getRoomOccupationSlots: builder.query<
      ApiResponse<RoomOccupationSlot[]>,
      { roomId: string; startDate: string; endDate: string }
    >({
      query: ({ roomId, startDate, endDate }) => ({
        url: `${endpoint.ROOM.DETAIL}/${roomId}/session-between-2-dateonlys`,
        method: "GET",
        params: { startDate, endDate },
      }),
    }),

    checkRoomAvailability: builder.query<
      ApiResponse<boolean>,
      { roomId: string; date: string; startTime: string; endTime: string }
    >({
      query: ({ roomId, date, startTime, endTime }) => ({
        url: `${endpoint.ROOM.DETAIL}/${roomId}/occupation/check-if-room-is-available-in-a-date-between-2-timeonly`,
        method: "GET",
        params: { date, startTime, endTime },
      }),
    }),

    isRoomOccupiedAtTime: builder.query<
      ApiResponse<boolean>,
      { roomId: string; date: string; time: string }
    >({
      query: ({ roomId, date, time }) => ({
        url: `${endpoint.ROOM.DETAIL}/${roomId}/occupation/is-occupied-in-a-given-time`,
        method: "GET",
        params: { date, time },
      }),
    }),

    getSessionsInRoomOnDate: builder.query<
      ApiResponse<RoomOccupationSlot[]>,
      { roomId: string; date: string }
    >({
      query: ({ roomId, date }) => ({
        url: `${endpoint.ROOM.DETAIL}/${roomId}/sessions-on-date`,
        method: "GET",
        params: { date },
      }),
    }),

    getAvailableTimesInRoom: builder.query<
      ApiResponse<TimeSpan[]>,
      { roomId: string; date: string }
    >({
      query: ({ roomId, date }) => ({
        url: `${endpoint.ROOM.DETAIL}/${roomId}/available-times`,
        method: "GET",
        params: { date },
      }),
    }),

    getBusyTimesInRoom: builder.query<
      ApiResponse<TimeSpan[]>,
      { roomId: string; date: string }
    >({
      query: ({ roomId, date }) => ({
        url: `${endpoint.ROOM.DETAIL}/${roomId}/busy-time`,
        method: "GET",
        params: { date },
      }),
    }),

    getRoomsWithSessions: builder.query<
      ApiResponsePagination<RoomWithSessions>,
      {
        page?: number;
        pageSize?: number;
        destinationId?: string;
        searchKeyword?: string;
        date?: string;
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        destinationId,
        searchKeyword,
        date,
      }) => ({
        url: `${endpoint.ROOM.LIST}/rooms-with-sessions`,
        method: "GET",
        params: {
          page,
          pageSize,
          ...(destinationId && { destinationId }),
          ...(searchKeyword && { searchKeyword }),
          ...(date && { date }),
        },
      }),
      providesTags: ["Room"],
    }),

    getAvailableRoomsBetweenDates: builder.query<
      ApiResponse<AvailableRoom[]>,
      {
        startdate: string;
        endate: string;
        cityId?: string;
        destinationId?: string;
      }
    >({
      query: ({ startdate, endate, cityId, destinationId }) => ({
        url: endpoint.ROOM.AVAILABLE_ROOM,
        method: "GET",
        params: {
          startdate,
          endate,
          ...(cityId && { cityId }),
          ...(destinationId && { destinationId }),
        },
      }),
    }),

  }),
});

export const {
  useGetAllRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomByIdQuery,
  useGetRoomOccupationSlotsQuery,
  useCheckRoomAvailabilityQuery,
  useIsRoomOccupiedAtTimeQuery,
  useGetSessionsInRoomOnDateQuery,
  useGetAvailableTimesInRoomQuery,
  useGetBusyTimesInRoomQuery,
  useGetRoomsWithSessionsQuery,
  useLazyCheckRoomAvailabilityQuery,
  useLazyIsRoomOccupiedAtTimeQuery,

  useGetAvailableRoomsBetweenDatesQuery,
  useLazyGetAvailableRoomsBetweenDatesQuery,  
} = roomApi;
