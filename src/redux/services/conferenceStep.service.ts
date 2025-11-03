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

  ResearchDetail,
  ResearchPhase,
  ConferenceRefundPolicyData

} from "@/types/conference.type";

export const conferenceStepApi = createApi({
  reducerPath: "conferenceStepApi",
  baseQuery: apiClient,
  tagTypes: ["ConferenceStep"],

  endpoints: (builder) => ({
    //CREATE BASIC (TECH)
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

    // UPDATE BASIC 
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

    //CREATE PRICE (TECH)
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

    //UPDATE PRICE TICKET (TECH)
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

    //CREATE SESSION
    createConferenceSessions: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceSessionData }
    >({
      query: ({ conferenceId, data }) => {
        const formData = new FormData();

        // Lặp qua từng session
        data.sessions.forEach((session, index) => {
          formData.append(`sessions[${index}].title`, session.title);
          formData.append(`sessions[${index}].description`, session.description);
          formData.append(`sessions[${index}].startTime`, session.startTime);
          formData.append(`sessions[${index}].endTime`, session.endTime);
          formData.append(`sessions[${index}].date`, session.date);
          formData.append(`sessions[${index}].roomId`, session.roomId);

          // Speaker
          session.speaker?.forEach((sp, spIndex) => {
            formData.append(
              `sessions[${index}].speaker[${spIndex}].name`,
              sp.name
            );
            formData.append(
              `sessions[${index}].speaker[${spIndex}].description`,
              sp.description
            );
            if (sp.image instanceof File) {
              formData.append(
                `sessions[${index}].speaker[${spIndex}].image`,
                sp.image
              );
            } else if (sp.imageUrl) {
              formData.append(
                `sessions[${index}].speaker[${spIndex}].imageUrl`,
                sp.imageUrl
              );
            }
          });

          // Session medias
          session.sessionMedias?.forEach((media, mediaIndex) => {
            if (media.mediaFile instanceof File) {
              formData.append(
                `sessions[${index}].sessionMedias[${mediaIndex}].mediaFile`,
                media.mediaFile
              );
            } else if (media.mediaUrl) {
              formData.append(
                `sessions[${index}].sessionMedias[${mediaIndex}].mediaUrl`,
                media.mediaUrl
              );
            }
          });
        });

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_SESSION(conferenceId),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),


    //UPDATE SESSION
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

    //UPDATE SPEAKER
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

    //CREATE POLICY
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

    //CREATE REFUND POLICY
    createRefundPolicies: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceRefundPolicyData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_REFUND_POLICY(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),    

    //UPDATE POLICY
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

    //CREATE MEDIA
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

    //UPDATE MEDIA 
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

    //CREATE SPONSOR
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

    //UPDATE SPONSOR
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


    //RESEARCH
    //CREATE BASIC
    createBasicResearchConference: builder.mutation<
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

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_BASIC,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    //CREATE DETAIL
    createResearchDetail: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ResearchDetail }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_DETAIL(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),
    
    //CREATE PHASE
    createResearchPhase: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ResearchPhase }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_PHASE(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }), 
    
    //CREATE SESSION
    createResearchSessions: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceSessionData }
    >({
      query: ({ conferenceId, data }) => {
        const formData = new FormData();
        formData.append("sessions", JSON.stringify(data.sessions));

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_SESSION(conferenceId),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),    

    createResearchRankingFile: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; fileUrl: string; file?: File }
    >({
      query: ({ conferenceId, fileUrl, file }) => {
        const formData = new FormData();
        formData.append("fileUrl", fileUrl);
        if (file) formData.append("file", file);

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_RANKING_FILE(conferenceId),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),  
    
    createResearchRankingReference: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; referenceUrl: string }
    >({
      query: ({ conferenceId, referenceUrl }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_RANKING_REFERENCE(conferenceId),
        method: "POST",
        body: { referenceUrl }, 
      }),
      invalidatesTags: ["ConferenceStep"],
    }),    

    createResearchMaterial: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; fileName: string; fileDescription?: string; file?: File }
    >({
      query: ({ conferenceId, fileName, fileDescription, file }) => {
        const formData = new FormData();
        formData.append("fileName", fileName);
        if (fileDescription) formData.append("fileDescription", fileDescription);
        if (file) formData.append("file", file);

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_MATERIAL(conferenceId),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
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
  useCreateRefundPoliciesMutation,
  useUpdateConferencePolicyMutation,
  useCreateConferenceMediaMutation,
  useUpdateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useUpdateConferenceSponsorMutation,
  useGetBasicStepByIdQuery,

  //RESEARCH
  useCreateBasicResearchConferenceMutation,
  useCreateResearchDetailMutation,
  useCreateResearchPhaseMutation,
  useCreateResearchSessionsMutation,
  useCreateResearchRankingFileMutation,
  useCreateResearchRankingReferenceMutation,
  useCreateResearchMaterialMutation





} = conferenceStepApi;