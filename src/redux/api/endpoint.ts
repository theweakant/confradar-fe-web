// redux/api/endpoint.ts
export const endpoint = {
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    REFRESH: "/Auth/refresh-token",
    GOOGLE: "/Auth/firebase-login",
    FORGET_PASSWORD: "/Auth/forget-password",
    VERIFY_FORGET_PASSWORD: "/Auth/verify-forget-password",

    //user
    PROFILE: "/Auth/view-profile-by-id",
    USERS_LIST:"/Auth/list-users",
    CREATE_COLLABORATOR:"/Auth/create-collaborator-account",

    SUSPEND: (userId: string) => `/Auth/suspend-account?userId=${userId}`,
    ACTIVATE:(userId: string) => `/Auth/activate-account?userId=${userId}`, 
  },
  DESTINATION: {
    LIST: "/Destination",
    CREATE: "/Destination",
    UPDATE: "/Destination",
    DELETE: "/Destination",
  },

  ROOM: {
    LIST: "/Room",
    CREATE: "/Room",
    UPDATE: "/Room",
    DELETE: "/Room",
  },

  CATEGORY: {
    LIST: "/ConferenceCategory",
    DETAIL: "/ConferenceCategory",
    CREATE: "/ConferenceCategory",
    UPDATE: "/ConferenceCategory",
    DELETE: "/ConferenceCategory",
  },
  CONFERENCE: {
    LIST_PAGINATED: "/Conference/paginated-conferences",
    LIST_WITH_PRICES: "/Conference/conferences-with-prices",
    LIST_BY_STATUS: "/Conference/by-status",

    VIEW_REGISTERED_USERS: "/Conference/view-registered-users-for-conference",


    GET_TECH_BY_ID: (conferenceId: string) => `/Conference/technical-detail/${conferenceId}`,
    GET_RESEARCH_BY_ID: (conferenceId: string) => `/Conference/research-detail/${conferenceId}`,

    // ✅ Trạng thái & hoàn thành bước
    STEP_COMPLETION_STATUS: "/Conference/step-completion-status",
    RESEARCH_STEP_COMPLETION_STATUS: "/Conference/research-step-completion-status",
    CHECK_TECH_STEP_COMPLETION: "/Conference/check-technical-step-completion",
    CHECK_RESEARCH_STEP_COMPLETION: "/Conference/check-research-step-completion",

    //pending & approve
    PENDING_CONFERENCES: "/Conference/pending-conferences",
    APPROVE_CONFERENCE: (conferenceId: string) => `/Conference/approve-conference/${conferenceId}`,


    DETAIL: "/Conference",
    TECHNICAL_DETAIL: "/Conference/technical-detail",
    RESEARCH_DETAIL: "/Conference/research-detail",
    CREATE: "/Conference",
    UPDATE: "/Conference",
    DELETE: "/Conference",



  },

  CONFERENCE_STEP: {
    CREATE_BASIC: "/ConferenceStep/basic",
    CREATE_PRICE: (conferenceId: string) => `/ConferenceStep/${conferenceId}/prices`,
    CREATE_SESSION: (conferenceId: string) => `/ConferenceStep/${conferenceId}/sessions`,
    CREATE_POLICY: (conferenceId: string) => `/ConferenceStep/${conferenceId}/policies`,
    CREATE_MEDIA: (conferenceId: string) => `/ConferenceStep/${conferenceId}/media`,
    CREATE_SPONSOR: (conferenceId: string) => `/ConferenceStep/${conferenceId}/sponsors`,

    UPDATE_BASIC: (conferenceId: string) => `/ConferenceStep/${conferenceId}/basic`,
    UPDATE_PRICE: (priceId: string) => `/ConferenceStep/prices/${priceId}`,
    UPDATE_SESSION: (sessionId: string) => `/ConferenceStep/sessions/${sessionId}`,
    UPDATE_SPEAKER: (sessionId: string) => `/ConferenceStep/sessions/${sessionId}/speaker`,
    UPDATE_POLICY: (policyId: string) => `/ConferenceStep/policies/${policyId}`,
    UPDATE_MEDIA: (mediaId: string) => `/ConferenceStep/media/${mediaId}`,
    UPDATE_SPONSOR: (sponsorId: string) => `/ConferenceStep/sponsors/${sponsorId}`,

    GET_BASIC: (conferenceId: string) => `/ConferenceStep/${conferenceId}/basic`,
  },

  CITY: {
    LIST: "/City/cities",
  },

  TRANSACTION: {
    CREATE_TECH_PAYMENT: "/payment/pay-tech-with-momo",
    CREATE_RESEARCH_PAPER_PAYMENT: "/payment/pay-research-paper-with-momo",
    GET_OWN_TRANSACTION: "/payment/get-own-transaction",
  },
  
  PAPER: {
    SUBMIT: "/Conference/paginated-conferences",

    //ABSTRACT
    LIST_PENDING_ABSTRACT:"/Paper/list-pending-abstract",
    DECIDE_ABSTRACT:"/Paper/decide-abstract-paper-status",
    ASSIGN_PAPER_TO_REVIEWER:"/Paper/assign-reviewer-to-paper",


  },


}