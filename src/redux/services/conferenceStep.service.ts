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
//   ConferenceBasicResponse,

//   Ticket,
//   Phase,
//   Session,
//   Speaker,
//   Policy,
//   Media, 
//   Sponsor,

// } from "@/types/conference.type";

// export const conferenceStepApi = createApi({
//   reducerPath: "conferenceStepApi",
//   baseQuery: apiClient,
//   tagTypes: ["ConferenceStep"],

//   endpoints: (builder) => ({
//     //Step 1: Create Basic Info
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

//     // UPDATE Basic Info
//     updateBasicConference: builder.mutation<
//       ApiResponse<{ conferenceId: string }>,
//       { conferenceId: string; data: ConferenceBasicForm }
//     >({
//       query: ({ conferenceId, data }) => {
//         const formData = new FormData();
//         formData.append("conferenceName", data.conferenceName);
//         formData.append("startDate", data.startDate);
//         formData.append("endDate", data.endDate);
//         formData.append("isInternalHosted", String(data.isInternalHosted));
//         formData.append("isResearchConference", String(data.isResearchConference));
//         formData.append("categoryName", data.categoryName);

//         if (data.description) formData.append("description", data.description);
//         if (data.capacity) formData.append("capacity", String(data.capacity));
//         if (data.address) formData.append("address", data.address);
//         if (data.bannerImageFile)
//           formData.append("bannerImageFile", data.bannerImageFile);

//         return {
//           url: endpoint.CONFERENCE_STEP.UPDATE_BASIC(conferenceId),
//           method: "PUT",
//           body: formData,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     // Step 2: Create Price
//     createConferencePrice: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferencePriceData }
//     >({
//       query: ({ conferenceId, data }) => {
//         return {
//           url: endpoint.CONFERENCE_STEP.CREATE_PRICE(conferenceId),
//           method: "POST",
//           body: data,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Update Price
//     updateConferencePrice: builder.mutation<
//       ApiResponse<Price>,
//       { priceId: string; data: Omit<Price, "priceId" | "currentPhase"> }
//     >({
//       query: ({ priceId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.UPDATE_PRICE(priceId),
//         method: "PUT",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     // Step 3: Create Sessions
//     createConferenceSessions: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferenceSessionData }
//     >({
//       query: ({ conferenceId, data }) => {

//         return {
//           url: endpoint.CONFERENCE_STEP.CREATE_SESSION(conferenceId),
//           method: "POST",
//           body: data,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Update Sessions
//     updateConferenceSession: builder.mutation<
//       ApiResponse<Session>, 
//       { sessionId: string; data: Omit<Session, "sessionId" | "conferenceId" | "room" | "speaker"> }
//     >({
//       query: ({ sessionId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.UPDATE_SESSION(sessionId),
//         method: "PUT",
//         body: data, 
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),


//     //Update Speaker
//     updateConferenceSpeaker: builder.mutation<
//       ApiResponse<Speaker>,
//       { sessionId: string; data: Speaker }
//     >({
//       query: ({ sessionId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.UPDATE_SPEAKER(sessionId),
//         method: "PUT",
//         body: data,
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),



//     //Create Policies
//     createConferencePolicies: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferencePolicyData }
//     >({
//       query: ({ conferenceId, data }) => {


//         return {
//           url: endpoint.CONFERENCE_STEP.CREATE_POLICY(conferenceId),
//           method: "POST",
//           body: data,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Update Policies
//     updateConferencePolicy: builder.mutation<
//       ApiResponse<Policy>,
//       { policyId: string; data: Omit<Policy, "policyId"> }
//     >({
//       query: ({ policyId, data }) => ({
//         url: endpoint.CONFERENCE_STEP.UPDATE_POLICY(policyId),
//         method: "PUT",
//         body: data, 
//       }),
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Create Media
//     createConferenceMedia: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferenceMediaData }
//     >({
//       query: ({ conferenceId, data }) => {


//         return {
//           url: endpoint.CONFERENCE_STEP.CREATE_MEDIA(conferenceId),
//           method: "POST",
//           body: data,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Update Media
//     updateConferenceMedia: builder.mutation<
//       ApiResponse<{
//         mediaId: string;
//         mediaUrl: string;
//         mediaTypeId: string;
//       }>,
//       { mediaId: string; mediaFile: File }
//     >({
//       query: ({ mediaId, mediaFile }) => {
//         const formData = new FormData();
//         formData.append("mediaFile", mediaFile);

//         return {
//           url: endpoint.CONFERENCE_STEP.UPDATE_MEDIA(mediaId),
//           method: "PUT",
//           body: formData,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),


//     //Create Sponsors
//     createConferenceSponsors: builder.mutation<
//       ApiResponse<string>,
//       { conferenceId: string; data: ConferenceSponsorData }
//     >({
//       query: ({ conferenceId, data }) => {
//         return {
//           url: endpoint.CONFERENCE_STEP.CREATE_SPONSOR(conferenceId),
//           method: "POST",
//           body: data,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),

//     //Update Sponsors
//     updateConferenceSponsor: builder.mutation<
//       ApiResponse<{
//         sponsorId: string;
//         name: string;
//         imageUrl: string;
//       }>,
//       { sponsorId: string; name: string; imageFile: File }
//     >({
//       query: ({ sponsorId, name, imageFile }) => {
//         const formData = new FormData();
//         formData.append("name", name);
//         formData.append("imageFile", imageFile);

//         return {
//           url: endpoint.CONFERENCE_STEP.UPDATE_SPONSOR(sponsorId),
//           method: "PUT",
//           body: formData,
//         };
//       },
//       invalidatesTags: ["ConferenceStep"],
//     }),


//     //GET
//     //GET BASIC
//     getBasicStepById: builder.query<ApiResponse<ConferenceBasicResponse>, string>({
//       query: (conferenceId) => ({
//         url: endpoint.CONFERENCE_STEP.GET_BASIC(conferenceId),
//         method: "GET",
//       }),
//       providesTags: ["ConferenceStep"],
//     }),

//   }),
// });

// export const {
//   useCreateBasicConferenceMutation,
//   useUpdateBasicConferenceMutation,
//   useCreateConferencePriceMutation,
//   useUpdateConferencePriceMutation,
//   useCreateConferenceSessionsMutation,
//   useUpdateConferenceSessionMutation,
//   useUpdateConferenceSpeakerMutation,
//   useCreateConferencePoliciesMutation,
//   useUpdateConferencePolicyMutation,
//   useCreateConferenceMediaMutation,
//   useUpdateConferenceMediaMutation,
//   useCreateConferenceSponsorsMutation,
//   useUpdateConferenceSponsorMutation,

//   useGetBasicStepByIdQuery
// } = conferenceStepApi;


// conferenceStepApi.ts
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
  ConferenceBasicResponse,
  Ticket,
  Phase,
  Session,
  Speaker,
  Policy,
  Media,
  Sponsor,
} from "@/types/conference.type";

export const conferenceStepApi = createApi({
  reducerPath: "conferenceStepApi",
  baseQuery: apiClient,
  tagTypes: ["ConferenceStep"],

  endpoints: (builder) => ({
    // Step 1: Create Basic Info
    createBasicConference: builder.mutation<
      ApiResponse<{ conferenceId: string }>,
      ConferenceBasicForm
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("conferenceName", body.conferenceName);
        formData.append("startDate", body.startDate);
        formData.append("endDate", body.endDate);
        formData.append("totalSlot", String(body.totalSlot));
        formData.append("isInternalHosted", String(body.isInternalHosted));
        formData.append("isResearchConference", String(body.isResearchConference));
        formData.append("conferenceCategoryId", body.conferenceCategoryId);
        formData.append("cityId", body.cityId);
        formData.append("ticketSaleStart", body.ticketSaleStart);
        formData.append("ticketSaleEnd", body.ticketSaleEnd);

        if (body.description) formData.append("description", body.description);
        if (body.address) formData.append("address", body.address);
        if (body.bannerImageFile)
          formData.append("bannerImageFile", body.bannerImageFile);
        if (body.createdby) formData.append("createdby", body.createdby);
        if (body.targetAudienceTechnicalConference)
          formData.append("targetAudienceTechnicalConference", body.targetAudienceTechnicalConference);

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_BASIC,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // UPDATE Basic Info
    updateBasicConference: builder.mutation<
      ApiResponse<{ conferenceId: string }>,
      { conferenceId: string; data: ConferenceBasicForm }
    >({
      query: ({ conferenceId, data }) => {
        const formData = new FormData();
        formData.append("conferenceName", data.conferenceName);
        formData.append("startDate", data.startDate);
        formData.append("endDate", data.endDate);
        formData.append("totalSlot", String(data.totalSlot));
        formData.append("isInternalHosted", String(data.isInternalHosted));
        formData.append("isResearchConference", String(data.isResearchConference));
        formData.append("conferenceCategoryId", data.conferenceCategoryId);
        formData.append("cityId", data.cityId);
        formData.append("ticketSaleStart", data.ticketSaleStart);
        formData.append("ticketSaleEnd", data.ticketSaleEnd);

        if (data.description) formData.append("description", data.description);
        if (data.address) formData.append("address", data.address);
        if (data.bannerImageFile)
          formData.append("bannerImageFile", data.bannerImageFile);
        if (data.createdby) formData.append("createdby", data.createdby);
        if (data.targetAudienceTechnicalConference)
          formData.append("targetAudienceTechnicalConference", data.targetAudienceTechnicalConference);

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

    // Update Price (Ticket)
    updateConferencePrice: builder.mutation<
      ApiResponse<Ticket>,
      { ticketId: string; data: Omit<Ticket, "ticketId"> }
    >({
      query: ({ ticketId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_PRICE(ticketId),
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

    // Update Sessions
    updateConferenceSession: builder.mutation<
      ApiResponse<Session>,
      { sessionId: string; data: Omit<Session, "sessionId" | "speaker" | "sessionMedias"> }
    >({
      query: ({ sessionId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_SESSION(sessionId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // Update Speaker
    updateConferenceSpeaker: builder.mutation<
      ApiResponse<Speaker>,
      { speakerId: string; data: Omit<Speaker, "speakerId"> }
    >({
      query: ({ speakerId, data }) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        if (data.image) formData.append("image", data.image);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_SPEAKER(speakerId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // Create Policies
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

    // Update Policies
    updateConferencePolicy: builder.mutation<
      ApiResponse<Policy>,
      { policyId: string; data: Omit<Policy, "policyId"> }
    >({
      query: ({ policyId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_POLICY(policyId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // Create Media
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

    // Update Media
    updateConferenceMedia: builder.mutation<
      ApiResponse<Media>,
      { mediaId: string; mediaFile?: File; mediaUrl?: string }
    >({
      query: ({ mediaId, mediaFile, mediaUrl }) => {
        const formData = new FormData();
        if (mediaFile) formData.append("mediaFile", mediaFile);
        if (mediaUrl) formData.append("mediaUrl", mediaUrl);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_MEDIA(mediaId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // Create Sponsors
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

    // Update Sponsors
    updateConferenceSponsor: builder.mutation<
      ApiResponse<Sponsor>,
      { sponsorId: string; name: string; imageFile?: File }
    >({
      query: ({ sponsorId, name, imageFile }) => {
        const formData = new FormData();
        formData.append("name", name);
        if (imageFile) formData.append("imageFile", imageFile);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_SPONSOR(sponsorId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // GET BASIC
    getBasicStepById: builder.query<ApiResponse<ConferenceBasicResponse>, string>({
      query: (conferenceId) => ({
        url: endpoint.CONFERENCE_STEP.GET_BASIC(conferenceId),
        method: "GET",
      }),
      providesTags: ["ConferenceStep"],
    }),
  }),
});

export const {
  useCreateBasicConferenceMutation,
  useUpdateBasicConferenceMutation,
  useCreateConferencePriceMutation,
  useUpdateConferencePriceMutation,
  useCreateConferenceSessionsMutation,
  useUpdateConferenceSessionMutation,
  useUpdateConferenceSpeakerMutation,
  useCreateConferencePoliciesMutation,
  useUpdateConferencePolicyMutation,
  useCreateConferenceMediaMutation,
  useUpdateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useUpdateConferenceSponsorMutation,
  useGetBasicStepByIdQuery,
} = conferenceStepApi;