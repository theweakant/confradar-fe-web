// conferenceStepApi.ts

interface CreatePriceApiResponse {
  conferencePriceWithPhasesResponses: ConferencePriceResponse[];
}

import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../api/apiClient";
import { endpoint } from "../api/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type {
  ConferenceBasicForm,
  ConferencePriceData,
  ConferenceSessionData,
  ConferenceResearchSessionData,
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
  ConferenceRefundPolicyData,
  UpdateResearchPhaseRequest,
  ConferencePriceResponse,
  ResearchSession
} from "@/types/conference.type";

export const conferenceStepApi = createApi({
  reducerPath: "conferenceStepApi",
  baseQuery: apiClient,
  tagTypes: ["ConferenceStep"],

  endpoints: (builder) => ({
    //CREATE BASIC (TECH)
    createBasicConference: builder.mutation<
      // ApiResponse<{ conferenceId: string }>,
      ApiResponse<ConferenceBasicResponse>,
      ConferenceBasicForm
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("conferenceName", body.conferenceName);
        formData.append("startDate", body.startDate);
        formData.append("endDate", body.endDate);
        formData.append("totalSlot", String(body.totalSlot));
        formData.append("isInternalHosted", String(body.isInternalHosted));
        formData.append(
          "isResearchConference",
          String(body.isResearchConference),
        );
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
          formData.append(
            "targetAudienceTechnicalConference",
            body.targetAudienceTechnicalConference,
          );
        if (body.contractURL instanceof File) {
          formData.append("contractURL", body.contractURL);
        }
        if (body.commission !== undefined && body.commission !== null)

          formData.append("commission", String(body.commission));
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

        // Required fields (the API docs mark these as required or have no indication of optional)
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
        if (data.bannerImageFile) formData.append("bannerImageFile", data.bannerImageFile);
        if (data.contractURL) formData.append("contractURL", data.contractURL);
        if (data.commission !== undefined) formData.append("commission", String(data.commission));
        if (data.targetAudienceTechnicalConference) { formData.append("targetAudienceTechnicalConference", data.targetAudienceTechnicalConference); }
        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_BASIC(conferenceId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    //CREATE PRICE (SHARED)
    createConferencePrice: builder.mutation<
      ApiResponse<CreatePriceApiResponse>,
      { conferenceId: string; data: ConferencePriceData }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_PRICE(conferenceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    createPhaseForPrice: builder.mutation<
      ApiResponse<unknown>,
      { conferencePriceId: string; data: { pricePhases: Phase[] } }
    >({
      query: ({ conferencePriceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_PHASE_FOR_PRICE(conferencePriceId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    //UPDATE PRICE TICKET (SHARED)
    updateConferencePrice: builder.mutation<
      ApiResponse<{ priceId: string }>,
      {
        priceId: string;
        data: {
          ticketPrice: number;
          ticketName: string;
          ticketDescription: string;
          totalSlot: number;
        };
      }
    >({
      query: ({ priceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_PRICE(priceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // UPDATE PRICE PHASE
    updateConferencePricePhase: builder.mutation<
      ApiResponse<unknown>,
      {
        pricePhaseId: string;
        data: {
          phaseName?: string;
          applyPercent?: number;
          startDate?: string;
          endDate?: string;
          totalSlot?: number;
          forWaitlist?: boolean;
        };
      }
    >({
      query: ({ pricePhaseId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_PHASE(pricePhaseId),
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
          formData.append(
            `sessions[${index}].description`,
            session.description,
          );
          formData.append(`sessions[${index}].startTime`, session.startTime);
          formData.append(`sessions[${index}].endTime`, session.endTime);
          formData.append(`sessions[${index}].date`, session.date);
          formData.append(`sessions[${index}].roomId`, session.roomId);

          // Speaker
          session.speaker?.forEach((sp, spIndex) => {
            formData.append(
              `sessions[${index}].speaker[${spIndex}].name`,
              sp.name,
            );
            formData.append(
              `sessions[${index}].speaker[${spIndex}].description`,
              sp.description,
            );
            if (sp.image instanceof File) {
              formData.append(
                `sessions[${index}].speaker[${spIndex}].image`,
                sp.image,
              );
            } else if (sp.imageUrl) {
              formData.append(
                `sessions[${index}].speaker[${spIndex}].imageUrl`,
                sp.imageUrl,
              );
            }
          });

          // Session medias
          session.sessionMedias?.forEach((media, mediaIndex) => {
            if (media.mediaFile instanceof File) {
              formData.append(
                `sessions[${index}].sessionMedias[${mediaIndex}].mediaFile`,
                media.mediaFile,
              );
            } else if (media.mediaUrl) {
              formData.append(
                `sessions[${index}].sessionMedias[${mediaIndex}].mediaUrl`,
                media.mediaUrl,
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
      {
        sessionId: string;
        data: {
          title: string;
          description: string;
          startTime: string;
          endTime: string;
          date: string;
          roomId: string;
        };
      }
    >({
      query: ({ sessionId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_SESSION(sessionId),
        method: "PUT",
        body:  data ,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    //UPDATE SPEAKER
    updateSessionSpeaker: builder.mutation<
      ApiResponse<Speaker>,
      {
        sessionId: string;
        data: {
          name: string;
          description: string;
          image?: File;
        };
      }
    >({
      query: ({ sessionId, data }) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        if (data.image) formData.append("image", data.image);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_SPEAKER(sessionId),
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
      ApiResponse<{ policyId: string }>,
      {
        policyId: string;
        data: {
          policyName: string;
          description: string;
        };
      }
    >({
      query: ({ policyId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_POLICY(policyId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    //UPDATE REFUND POLICY
    updateConferenceRefundPolicy: builder.mutation<
      ApiResponse<{ refundPolicyId: string }>,
      {
        refundPolicyId: string;
        data: {
          percentRefund: number;
          refundDeadline: string;
          refundOrder: number;
        };
      }
    >({
      query: ({ refundPolicyId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_REFUND_POLICY(refundPolicyId),
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
      query: ({ conferenceId, data }) => {
        const formData = new FormData();

        data.media.forEach((item, index) => {
          formData.append(`media[${index}].mediaFile`, item.mediaFile as File);
          formData.append(`media[${index}].mediaUrl`, item.mediaUrl || "");
        });

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_MEDIA(conferenceId),
          method: "POST",
          body: formData,
        };
      },
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
      query: ({ conferenceId, data }) => {
        const formData = new FormData();

        data.sponsors.forEach((item, index) => {
          formData.append(`Sponsors[${index}].Name`, item.name);
          if (item.imageFile instanceof File) {
            formData.append(`Sponsors[${index}].ImageFile`, item.imageFile);
          }
          if (item.imageUrl) {
            formData.append(`Sponsors[${index}].ImageUrl`, item.imageUrl);
          }
        });

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_SPONSOR(conferenceId),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    //UPDATE SPONSOR
    updateConferenceSponsor: builder.mutation<
      ApiResponse<Sponsor>,
      { sponsorId: string; name?: string; imageFile?: File; imageUrl?: string }
    >({
      query: ({ sponsorId, name, imageFile, imageUrl }) => {
        const formData = new FormData();

        if (name) formData.append("name", name);
        if (imageFile) formData.append("imageFile", imageFile);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_SPONSOR(sponsorId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    // GET BASIC
    getBasicStepById: builder.query<
      ApiResponse<ConferenceBasicResponse>,
      string
    >({
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
        formData.append(
          "isResearchConference",
          String(body.isResearchConference),
        );
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
      { conferenceId: string; data: ResearchPhase[] }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_PHASE(conferenceId),
        method: "POST",
        body: { phases: data },
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    //CREATE SESSION
    createResearchSessions: builder.mutation<
      ApiResponse<string>,
      { conferenceId: string; data: ConferenceResearchSessionData }
    >({
      query: ({ conferenceId, data }) => {


        data.sessions.forEach((session, idx) => {
          console.log(`Session ${idx}:`, {
            title: session.title,
            mediaCount: session.sessionMedias?.length,
            mediaFiles: session.sessionMedias?.map(m => ({
              isFile: m.mediaFile instanceof File,
              fileName: m.mediaFile instanceof File ? m.mediaFile.name : 'NOT A FILE',
              type: typeof m.mediaFile
            }))
          });
        });


        const formData = new FormData();

        const formatTime = (datetime: string): string => {
          const date = new Date(datetime);
          return date.toTimeString().split(" ")[0];
        };

        const formatDate = (datetime: string): string => {
          const date = new Date(datetime);
          return date.toISOString().split("T")[0];
        };

        data.sessions.forEach((session, index) => {
          formData.append(`sessions[${index}].title`, session.title);
          formData.append(`sessions[${index}].description`, session.description || "");

          formData.append(`sessions[${index}].startTime`, formatTime(session.startTime));
          formData.append(`sessions[${index}].endTime`, formatTime(session.endTime));
          formData.append(`sessions[${index}].date`, formatDate(session.date || session.startTime));

          formData.append(`sessions[${index}].roomId`, session.roomId);

          if (session.sessionMedias && session.sessionMedias.length > 0) {
            session.sessionMedias.forEach((media, mediaIndex) => {
              if (media.mediaFile && media.mediaFile instanceof File) {
                formData.append(
                  `sessions[${index}].SessionMedias[${mediaIndex}].MediaFile`,
                  media.mediaFile
                );
              }

              formData.append(
                `sessions[${index}].SessionMedias[${mediaIndex}].MediaUrl`,
                (typeof media.mediaFile === "string" && media.mediaFile) || media.mediaUrl || ""
              );
            });
          }
        });
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
          url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_RANKING_FILE(
            conferenceId,
          ),
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
        url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_RANKING_REFERENCE(
          conferenceId,
        ),
        method: "POST",
        body: { referenceUrl },
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    createResearchMaterial: builder.mutation<
      ApiResponse<string>,
      {
        conferenceId: string;
        fileName: string;
        fileDescription?: string;
        file?: File;
      }
    >({
      query: ({ conferenceId, fileName, fileDescription, file }) => {
        const formData = new FormData();
        formData.append("fileName", fileName);
        if (fileDescription)
          formData.append("fileDescription", fileDescription);
        if (file) formData.append("file", file);

        return {
          url: endpoint.CONFERENCE_STEP.CREATE_RESEARCH_MATERIAL(conferenceId),
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    createRevisionRoundDeadline: builder.mutation<
      ApiResponse<{ success: boolean }>,
      {
        researchConferencePhaseId: string;
        data: {
          startSubmissionDate: string;
          endSubmissionDate: string;
        };
      }
    >({
      query: ({ researchConferencePhaseId, data }) => ({
        url: endpoint.CONFERENCE_STEP.CREATE_REVISION_ROUND_DEADLINE(researchConferencePhaseId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // DELETE PRICE
    deleteConferencePrice: builder.mutation<
      ApiResponse<null>,
      string // priceId
    >({
      query: (priceId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_PRICE(priceId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // DELETE SESSION
    deleteConferenceSession: builder.mutation<
      ApiResponse<null>,
      string // sessionId
    >({
      query: (sessionId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_SESSION(sessionId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // DELETE POLICY
    deleteConferencePolicy: builder.mutation<
      ApiResponse<null>,
      string // policyId
    >({
      query: (policyId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_POLICY(policyId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // DELETE MEDIA
    deleteConferenceMedia: builder.mutation<
      ApiResponse<null>,
      string // mediaId
    >({
      query: (mediaId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_MEDIA(mediaId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    // DELETE SPONSOR
    deleteConferenceSponsor: builder.mutation<
      ApiResponse<null>,
      string // sponsorId
    >({
      query: (sponsorId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_SPONSOR(sponsorId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    //PUT
    updateResearchBasic: builder.mutation<
      ApiResponse<{ conferenceId: string }>,
      { conferenceId: string; data: ConferenceBasicForm }
    >({
      query: ({ conferenceId, data }) => {
        const formData = new FormData();

        // Required fields
        formData.append("conferenceName", data.conferenceName);
        formData.append("startDate", data.startDate);
        formData.append("endDate", data.endDate);
        formData.append("totalSlot", String(data.totalSlot));

        formData.append("conferenceCategoryId", data.conferenceCategoryId);
        formData.append("cityId", data.cityId);
        formData.append("ticketSaleStart", data.ticketSaleStart);
        formData.append("ticketSaleEnd", data.ticketSaleEnd);

        if (data.description) formData.append("description", data.description);
        if (data.address) formData.append("address", data.address);
        if (data.bannerImageFile)
          formData.append("bannerImageFile", data.bannerImageFile);

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_DRAFT_RESEARCH_BASIC(conferenceId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    updateResearchDetail: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { conferenceId: string; data: ResearchDetail }
    >({
      query: ({ conferenceId, data }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_RESEARCH_DETAIL(conferenceId),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    updateResearchPhase: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { researchPhaseId: string; data: UpdateResearchPhaseRequest }
    >({
      query: ({ researchPhaseId, data }) => {
        const {
          registrationStartDate, registrationEndDate, fullPaperStartDate, fullPaperEndDate, reviewStartDate, reviewEndDate,
          reviseStartDate, reviseEndDate, cameraReadyStartDate, cameraReadyEndDate, isWaitlist, isActive
        } = data;

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_RESEARCH_PHASE(researchPhaseId),
          method: "PUT",
          body: {
            registrationStartDate, registrationEndDate, fullPaperStartDate, fullPaperEndDate, reviewStartDate, reviewEndDate,
            reviseStartDate, reviseEndDate, cameraReadyStartDate, cameraReadyEndDate, isWaitlist, isActive,
          },
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    updateResearchMaterial: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { materialId: string; fileDescription?: string; file?: File | null }
    >({
      query: ({ materialId, fileDescription, file }) => {
        const formData = new FormData();

        if (fileDescription !== undefined) {
          formData.append("fileDescription", fileDescription);
        }

        if (file) {
          formData.append("file", file);
        }

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_RESEARCH_MATERIAL(materialId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    updateResearchRankingFile: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { rankingFileId: string; fileUrl?: string; file?: File | null }
    >({
      query: ({ rankingFileId, fileUrl, file }) => {
        const formData = new FormData();

        if (fileUrl !== undefined) {
          formData.append("fileUrl", fileUrl);
        }

        if (file) {
          formData.append("file", file);
        }

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_RESEARCH_RANKING_FILE(rankingFileId),
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    updateResearchSession: builder.mutation<
      ApiResponse<Session>,
      { sessionId: string; data: ResearchSession }
    >({
      query: ({ sessionId, data }) => {
        const { title, description, startTime, endTime, date, roomId } = data;

        return {
          url: endpoint.CONFERENCE_STEP.UPDATE_RESEARCH_SESSION(sessionId),
          method: "PUT",
          body: { title, description, startTime, endTime, date, roomId },
        };
      },
      invalidatesTags: ["ConferenceStep"],
    }),

    updateResearchRankingReference: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { referenceId: string; referenceUrl: string }
    >({
      query: ({ referenceId, referenceUrl }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_RESEARCH_RANKING_REFERENCE(referenceId),
        method: "PUT",
        body: { referenceUrl },
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    updateRevisionRoundDeadline: builder.mutation<
      ApiResponse<{ success: boolean }>,
      {
        deadlineId: string;
        startSubmissionDate: string;
        endSubmissionDate: string;
      }
    >({
      query: ({ deadlineId, startSubmissionDate, endSubmissionDate }) => ({
        url: endpoint.CONFERENCE_STEP.UPDATE_REVISION_ROUND_DEADLINE(deadlineId),
        method: "PUT",
        body: {
          startSubmissionDate,
          endSubmissionDate,
        },
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    //DELETE
    deleteConferencePricePhase: builder.mutation<
      ApiResponse<null>,
      string // pricePhaseId
    >({
      query: (pricePhaseId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_PRICE_PHASE(pricePhaseId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    deleteRefundPolicy: builder.mutation<
      ApiResponse<null>,
      string // refundPolicyId
    >({
      query: (refundPolicyId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_REFUND_POLICY(refundPolicyId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    deleteResearchMaterial: builder.mutation<ApiResponse<null>, string>({
      query: (materialId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_RESEARCH_MATERIAL(materialId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    deleteResearchRankingFile: builder.mutation<ApiResponse<null>, string>({
      query: (fileId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_RESEARCH_RANKING_FILE(fileId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    deleteResearchSession: builder.mutation<ApiResponse<null>, string>({
      query: (sessionId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_RESEARCH_SESSION(sessionId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    deleteResearchRankingReference: builder.mutation<ApiResponse<null>, string>({
      query: (referenceId) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_RESEARCH_RANKING_REFERENCE(referenceId),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    deleteRevisionRoundDeadline: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: endpoint.CONFERENCE_STEP.DELETE_REVISION_ROUND_DEADLINE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["ConferenceStep"],
    }),

    addPricePhaseForWaitlist: builder.mutation<
      ApiResponse<unknown>,
      { conferencePriceId: string; data: { pricePhases: Phase[] } }
    >({
      query: ({ conferencePriceId, data }) => ({
        url: `${endpoint.CONFERENCE_STEP.ADD_PRICE_PHASE_WAITLIST}?conferencePriceId=${conferencePriceId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ConferenceStep"],
    }),
    //GET
    getResearchSessions: builder.query<
      ApiResponse<Session[]>,
      string // conferenceId
    >({
      query: (conferenceId) => ({
        url: endpoint.CONFERENCE_STEP.GET_RESEARCH_SESSIONS(conferenceId),
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
  useCreateConferencePoliciesMutation,
  useUpdateConferencePolicyMutation,
  useCreateRefundPoliciesMutation,
  useUpdateConferenceRefundPolicyMutation,
  useCreateConferenceMediaMutation,
  useUpdateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useUpdateConferenceSponsorMutation,
  useGetBasicStepByIdQuery,

  //GET
  useGetResearchSessionsQuery,

  //CREATE
  useCreatePhaseForPriceMutation,

  //UPDATE TECH
  useUpdateSessionSpeakerMutation,
  useUpdateConferencePricePhaseMutation,

  //RESEARCH
  useCreateBasicResearchConferenceMutation,
  useCreateResearchDetailMutation,
  useCreateResearchPhaseMutation,
  useCreateResearchSessionsMutation,
  useCreateResearchRankingFileMutation,
  useCreateResearchRankingReferenceMutation,
  useCreateResearchMaterialMutation,
  useCreateRevisionRoundDeadlineMutation,

  //UPDATE RESEARCH
  useUpdateResearchBasicMutation,
  useUpdateResearchDetailMutation,
  useUpdateResearchPhaseMutation,
  useUpdateResearchMaterialMutation,
  useUpdateResearchRankingFileMutation,
  useUpdateResearchSessionMutation,
  useUpdateResearchRankingReferenceMutation,
  useUpdateRevisionRoundDeadlineMutation,


  //DELETE
  useDeleteConferencePriceMutation,
  useDeleteConferencePricePhaseMutation,
  useDeleteConferenceSessionMutation,
  useDeleteRefundPolicyMutation,
  useDeleteConferencePolicyMutation,
  useDeleteConferenceMediaMutation,
  useDeleteConferenceSponsorMutation,

  useDeleteResearchMaterialMutation,
  useDeleteResearchRankingFileMutation,
  useDeleteResearchSessionMutation,
  useDeleteResearchRankingReferenceMutation,
  useDeleteRevisionRoundDeadlineMutation,

  useAddPricePhaseForWaitlistMutation,
} = conferenceStepApi;
