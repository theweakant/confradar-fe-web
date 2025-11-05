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
    USERS_LIST: "/Auth/list-users",
    REVIEWERS_LIST: "/Auth/list-all-reviewers",
    CREATE_COLLABORATOR: "/Auth/create-collaborator-account",

    UPDATE_PROFILE: "/Auth/update-profile",
    CHANGE_PASSWORD: "/Auth/change-password",

    SUSPEND: (userId: string) => `/Auth/suspend-account?userId=${userId}`,
    ACTIVATE: (userId: string) => `/Auth/activate-account?userId=${userId}`,
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
    DETAIL: "/room",
  },

  CATEGORY: {
    LIST: "/ConferenceCategory",
    DETAIL: "/ConferenceCategory",
    CREATE: "/ConferenceCategory",
    UPDATE: "/ConferenceCategory",
    DELETE: "/ConferenceCategory",
  },
  RANKING_CONFERENCE: {
    LIST: "/ConferenceRanking/Get-all-ranking-category",
  },

  CONFERENCE: {
    LIST_PAGINATED: "/Conference/paginated-conferences",
    LIST_WITH_PRICES: "/Conference/conferences-with-prices",
    LIST_BY_STATUS: "/Conference/by-status",
    VIEW_REGISTERED_USERS: "/Conference/view-registered-users-for-conference",

    TECH_CONF_FOR_COLLABORATOR_AND_ORGANIZER: "/Conference/technical-conferences-for-collaborator-and-Organizer",
    RESEARCH_CONF_FOR_ORGANIZER: "/Conference/research-conferences-for-Organizer",

    //DETAIL CONF
    GET_TECH_BY_ID_INTERNAL: (conferenceId: string) => `/Conference/detail-technical-for-organizer-collaborator/${conferenceId}`,
    GET_RESEARCH_BY_ID_INTERNAL: (conferenceId: string) => `/Conference/detail-research-organizer-for-organizer/${conferenceId}`,


    //CUSTOMER
    GET_TECH_BY_ID: (conferenceId: string) => `/Conference/technical-detail/${conferenceId}`,
    GET_RESEARCH_BY_ID: (conferenceId: string) => `/Conference/research-detail/${conferenceId}`,

    // check status
    STEP_COMPLETION_STATUS: "/Conference/step-completion-status",
    RESEARCH_STEP_COMPLETION_STATUS: "/Conference/research-step-completion-status",
    CHECK_TECH_STEP_COMPLETION: "/Conference/check-technical-step-completion",
    CHECK_RESEARCH_STEP_COMPLETION: "/Conference/check-research-step-completion",

    //pending & approve
    PENDING_CONFERENCES: "/Conference/pending-conferences",
    APPROVE_CONFERENCE: (conferenceId: string) => `/Conference/approve-conference/${conferenceId}`,

    //STATUS
    LIST_ALL_CONF_STATUS: "/ConferenceStatus/get-all-conference-statuses",
    UPDATE_OWN_STATUS: "/Conference/Update-own-conference-Status",


    DETAIL: "/Conference",
    TECHNICAL_DETAIL: "/Conference/technical-detail",
    RESEARCH_DETAIL: "/Conference/research-detail",
    CREATE: "/Conference",
    UPDATE: "/Conference",
    DELETE: "/Conference",


  },

  CONFERENCE_STEP: {

    //TECH
    CREATE_BASIC: "/conferencestep/basic",
    CREATE_PRICE: (conferenceId: string) => `/conferencestep/${conferenceId}/prices`,
    CREATE_SESSION: (conferenceId: string) => `/conferencestep/${conferenceId}/sessions`,
    CREATE_POLICY: (conferenceId: string) => `/conferencestep/${conferenceId}/policies`,
    CREATE_REFUND_POLICY: (conferenceId: string) => `/conferencestep/${conferenceId}/refund-policies`,
    CREATE_MEDIA: (conferenceId: string) => `/conferencestep/${conferenceId}/media`,
    CREATE_SPONSOR: (conferenceId: string) => `/conferencestep/${conferenceId}/sponsors`,


    UPDATE_BASIC: (conferenceId: string) => `/conferencestep/${conferenceId}/basic`,
    UPDATE_PRICE: (priceId: string) => `/conferencestep/prices/${priceId}`,
    UPDATE_PHASE: (pricePhaseId: string) => `/conferencestep/phases/${pricePhaseId}`,
    UPDATE_SESSION: (sessionId: string) => `/conferencestep/sessions/${sessionId}`,
    UPDATE_SPEAKER: (sessionId: string) => `/conferencestep/sessions/${sessionId}/speaker`,
    UPDATE_POLICY: (policyId: string) => `/conferencestep/policies/${policyId}`,
    UPDATE_REFUND_POLICY: (refundPolicyId: string) => `/conferencestep/refund-policies/${refundPolicyId}`,  
    UPDATE_MEDIA: (mediaId: string) => `/conferencestep/media/${mediaId}`,
    UPDATE_SPONSOR: (sponsorId: string) => `/conferencestep/sponsors/${sponsorId}`,

    GET_BASIC: (conferenceId: string) => `/conferencestep/${conferenceId}/basic`,


    //RESEARCH
    CREATE_RESEARCH_BASIC: "/conferencestep/research/basic",
    CREATE_RESEARCH_DETAIL: (conferenceId: string) => `/conferencestep/${conferenceId}/research/detail`,
    CREATE_RESEARCH_PHASE: (conferenceId: string) => `/conferencestep/${conferenceId}/research/phases`,
    CREATE_RESEARCH_SESSION: (conferenceId: string) => `/conferencestep/${conferenceId}/research/sessions`,
    CREATE_RESEARCH_RANKING_FILE: (conferenceId: string) => `/conferencestep/${conferenceId}/research/ranking-file-urls`,
    CREATE_RESEARCH_RANKING_REFERENCE: (conferenceId: string) => `/conferencestep/${conferenceId}/research/ranking-reference-urls`,
    CREATE_RESEARCH_MATERIAL: (conferenceId: string) => `/conferencestep/${conferenceId}/research/materials`,

  },

  CITY: {
    LIST: "/City/cities",
  },

  TRANSACTION: {
    CREATE_TECH_PAYMENT: "/payment/pay-tech",
    CREATE_RESEARCH_PAPER_PAYMENT: "/payment/pay-research",
    GET_OWN_TRANSACTION: "/payment/get-own-transaction",
  },

  PAYMENT_METHOD: {
    GET_ALL: "/PaymentMethod/list-all-payment-methods",
  },

  PAPER: {
    LIST_ALL_PAPERS: "/Paper/list-all-papers",

    //ABSTRACT
    LIST_PENDING_ABSTRACT: "/Paper/list-pending-abstract",
    DECIDE_ABSTRACT: "/Paper/decide-abstract-paper-status",
    ASSIGN_PAPER_TO_REVIEWER: "/Paper/assign-reviewer-to-paper",
    LIST_UNASSIGN_ABSTRACT: "/Paper/list-unassign-abstract",
    LIST_ASSIGN_PAPER_REVIEWER: "/Paper/get-assigned-papers",
    SUBMIT_ABSTRACT: "/Paper/submit-abstract",

    GET_PAPER_DETAIL_REVIEWER: (paperId: string) =>
      `/Paper/paper-detail-for-reviewer?paperId=${paperId}`,

    //FULL PAPER
    SUBMIT_FULLPAPER_REVIEW: "/Paper/submit-fullpaper-review",
    LIST_FULLPAPER_REVIEWS: (fullPaperId: string) => `/Paper/get-fullpaper-reviews/${fullPaperId}`,
    DECIDE_FULLPAPER_STATUS: "/Paper/decide-fullpaper-status",


    //CAMERA-READY
    LIST_PENDING_CAMERA_READY: "/Paper/get-pending-cameraready",
    DECIDE_CAMERA_READY: "/Paper/decide-camera-ready-status",

    //REVISION
    SUBMIT_PAPER_REVISION_REVIEW: "/Paper/submit-paper-revision-review",
    LIST_REVISION_PAPER_REVIEW: "/Paper/list-revision-paper-review",
    DECIDE_REVISION_STATUS: "/Paper/decide-revise-status",
    SUBMIT_PAPER_REVISION_FEEDBACK: "/Paper/submit-paper-revision-feedback",


    // FULL PAPER
    SUBMIT_FULLPAPER: "/Paper/submit-fullpaper",

    // REVISION PAPER
    SUBMIT_PAPER_REVISION: "/Paper/submit-paper-revision",
    SUBMIT_PAPER_REVISION_RESPONSE: "/Paper/submit-paper-revision-response",

    // CAMERA READY
    SUBMIT_CAMERA_READY: "/Paper/submit-camera-ready",
    LIST_SUBMITTED_PAPERS_CUSTOMER: "/Paper/get-all-submitted-papers-for-customer",
    GET_PAPER_DETAIL_CUSTOMER: "/Paper/get-paper-detail-customer",
    LIST_PAPER_PHASES: "/Paper/list-paper-phases",
    LIST_AVAILABLE_CUSTOMERS: "/Paper/list-available-customers",

    //WAITLIST
    LIST_CUSTOMER_WAITLIST: "/Paper/list-customer-waitlist",
    LEAVE_WAITLIST: "/Paper/leave-waitlist",
  },

  FAVOURITE_CONFERENCE: {
    LIST_OWN: '/FavouriteConference/list-own-favourite-conferences',
    ADD: '/FavouriteConference/add-to-favourite',
    DELETE: '/FavouriteConference/delete-from-favourite',
  }
}