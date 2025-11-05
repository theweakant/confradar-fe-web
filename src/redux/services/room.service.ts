import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { Room, RoomFormData } from "@/types/room.type";
import type { ApiResponse } from "@/types/api.type";

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

    updateRoom: builder.mutation<ApiResponse<string>, { id: string; data: RoomFormData }>({
      query: ({ id, data }) => ({
        url: `${endpoint.ROOM.UPDATE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Room"],
    }),

    // deleteRoom: builder.mutation<ApiResponse<string>, string>({
    //   query: (id) => ({
    //     url: `${endpoint.ROOM.DELETE}/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Room"],
    // }),
  }),
});

export const {
  useGetAllRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  // useDeleteRoomMutation,
} = roomApi;
