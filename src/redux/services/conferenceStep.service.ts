// // conferenceStepApi.ts
// import { createApi } from "@reduxjs/toolkit/query/react";
// import { apiClient } from "../api/apiClient";
// import { endpoint } from "../api/endpoint";
// import type { ApiResponse } from "@/types/api.type";
// import type {
//   ConferenceBasicForm,
//   ConferencePriceData,
//   ConferenceSessionData,
//   ConferencePolicyData,
//   ConferenceMediaData,
//   ConferenceSponsorData,
// } from "@/types/conference.type";

// export const conferenceStepApi = createApi({
//   reducerPath: "conferenceStepApi",
//   baseQuery: apiClient,
//   tagTypes: ["ConferenceStep"],

//   endpoints: (builder) => ({
//     // 🧱 Step 1: Create Basic Info
//     createBasicConference: builder.mutation<
//       ApiResponse<{ conferenceId: string }>,
//       ConferenceBasicForm
//     >({
//       query: (body) => {
//         const formData = new FormData();
//         formData.append("conferenceName", body.conferenceName);
//         formData.append("startDate", body.startDate);
//         formData.append("endDate", body.endDate);
//         formData.append("isInternalHosted", String(body.isInternalHosted));
//         formData.append("isResearchConference", String(body.isResearchConference));
//         formData.append("categoryName", body.categoryName);

//         if (body.description) formData.append("description", body.description);
//         if (body.capacity) formData.append("capacity", String(body.capacity));
//         if (body.address) formData.append("address", body.address);
//         if (body.bannerImageFile)
//           formData.append("bannerImageFile", body.bannerImageFile);

//         return {
//           url: endpoint.CONFERENCE_STEP.CREATE_BASIC,
//           method: "POST",
//           body: formData,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Step 2: Create Price
//     createConferencePrice: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferencePriceData }
//     >({
//       query: ({ conferenceId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.CREATE_PRICE(conferenceId),
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Step 3: Create Sessions
//     createConferenceSessions: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferenceSessionData }
//     >({
//       query: ({ conferenceId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.CREATE_SESSION(conferenceId),
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Step 4: Create Policies
//     createConferencePolicies: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferencePolicyData }
//     >({
//       query: ({ conferenceId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.CREATE_POLICY(conferenceId),
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Step 5: Create Media
//     createConferenceMedia: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferenceMediaData }
//     >({
//       query: ({ conferenceId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.CREATE_MEDIA(conferenceId),
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Step 6: Create Sponsors
//     createConferenceSponsors: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferenceSponsorData }
//     >({
//       query: ({ conferenceId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.CREATE_SPONSOR(conferenceId),
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),
//   }),
// });

// export const {
//   useCreateBasicConferenceMutation,
//   useCreateConferencePriceMutation,
//   useCreateConferenceSessionsMutation,
//   useCreateConferencePoliciesMutation,
//   useCreateConferenceMediaMutation,
//   useCreateConferenceSponsorsMutation,
// } = conferenceStepApi;

// conferenceStepApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type {
  ConferenceBasicForm,
  ConferencePriceData,
  ConferenceSessionData,
  ConferencePolicyData,
  ConferenceMediaData,
  ConferenceSponsorData,
} from "@/types/conference.type";

export const conferenceStepApi = createApi({
  reducerPath: "conferenceStepApi",
  baseQuery: apiClient,
  tagTypes: ["ConferenceStep"],

  endpoints: (builder) => ({
    // 🧱 Step 1: Create Basic Info
    createBasicConference: builder.mutation<
      ApiResponse<{ conferenceId: string }>,
      ConferenceBasicForm
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("conferenceName", body.conferenceName);
        formData.append("startDate", body.startDate);
        formData.append("endDate", body.endDate);
        formData.append("isInternalHosted", String(body.isInternalHosted));
        formData.append("isResearchConference", String(body.isResearchConference));
        formData.append("categoryName", body.categoryName);

        if (body.description) formData.append("description", body.description);
        if (body.capacity) formData.append("capacity", String(body.capacity));
        if (body.address) formData.append("address", body.address);
        if (body.bannerImageFile)
          formData.append("bannerImageFile", body.bannerImageFile);

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_BASIC,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // ✅ NEW: Update Basic Info
    updateBasicConference: builder.mutation<
      ApiResponse<{ conferenceId: string }>,
      { conferenceId: string; data: ConferenceBasicForm }
    >({
      query: ({ conferenceId, data }) => {
        const formData = new FormData();
        formData.append("conferenceName", data.conferenceName);
        formData.append("startDate", data.startDate);
        formData.append("endDate", data.endDate);
        formData.append("isInternalHosted", String(data.isInternalHosted));
        formData.append("isResearchConference", String(data.isResearchConference));
        formData.append("categoryName", data.categoryName);

        if (data.description) formData.append("description", data.description);
        if (data.capacity) formData.append("capacity", String(data.capacity));
        if (data.address) formData.append("address", data.address);
        if (data.bannerImageFile)
          formData.append("bannerImageFile", data.bannerImageFile);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_BASIC(conferenceId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // Step 2: Create Price
    createConferencePrice: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferencePriceData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_PRICE(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // ✅ NEW: Update Price
    updateConferencePrice: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferencePriceData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_PRICE(conferenceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // Step 3: Create Sessions
    createConferenceSessions: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceSessionData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_SESSION(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // ✅ NEW: Update Sessions
    updateConferenceSessions: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceSessionData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_SESSION(conferenceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // Step 4: Create Policies
    createConferencePolicies: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferencePolicyData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_POLICY(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // ✅ NEW: Update Policies
    updateConferencePolicies: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferencePolicyData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_POLICY(conferenceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // Step 5: Create Media
    createConferenceMedia: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceMediaData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_MEDIA(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // ✅ NEW: Update Media
    updateConferenceMedia: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceMediaData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_MEDIA(conferenceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // Step 6: Create Sponsors
    createConferenceSponsors: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceSponsorData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_SPONSOR(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // ✅ NEW: Update Sponsors
    updateConferenceSponsors: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceSponsorData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_SPONSOR(conferenceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),
  }),
});

export const {
  useCreateBasicConferenceMutation,
  useUpdateBasicConferenceMutation, // ✅ Export
  useCreateConferencePriceMutation,
  useUpdateConferencePriceMutation, // ✅ Export
  useCreateConferenceSessionsMutation,
  useUpdateConferenceSessionsMutation, // ✅ Export
  useCreateConferencePoliciesMutation,
  useUpdateConferencePoliciesMutation, // ✅ Export
  useCreateConferenceMediaMutation,
  useUpdateConferenceMediaMutation, // ✅ Export
  useCreateConferenceSponsorsMutation,
  useUpdateConferenceSponsorsMutation, // ✅ Export
} = conferenceStepApi;
