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
    ORGANIZATION_LIST: "/auth/list-organization",
    COLLABORATOR_LIST: "/auth/list-collaborator-accounts",

    UPDATE_PROFILE: "/Auth/update-profile",
    CHANGE_PASSWORD: "/Auth/change-password",

    // SUSPEND: (userId: string) => `/Auth/suspend-account?userId=${userId}`,
    SUSPEND: `/Auth/suspend-account`,
    ACTIVATE: (userId: string) => `/Auth/activate-account?userId=${userId}`,

    SUSPEND_EXTERNAL_REVIEWER: (userId: string) =>
      `/auth/suspend-external-reviewer/${userId}`,
    ACTIVATE_EXTERNAL_REVIEWER: (userId: string) =>
      `/auth/activate-external-reviewer/${userId}`,

    GET_NOTIFICATION: "/notification/own-notification",

    LIST_COLLABORATOR_ACCOUNTS: "/auth/list-collaborator-accounts",
    LIST_ORGANIZATION: "/auth/list-organization",

    CREATE_LOCAL_REVIEWER_ACCOUNT: "/auth/create-local-reviewer-account",
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

    AVAILABLE_ROOM: "/room/available-rooms-between-dates"

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

    // TECH_CONF_FOR_COLLABORATOR_AND_ORGANIZER:
    //   "/Conference/technical-conferences-for-collaborator-and-Organizer",

    RESEARCH_CONF_FOR_ORGANIZER:
      "/Conference/research-conferences-for-organizer",
    TECHNICAL_CONFERENCES_BY_ORGANIZER: "/Conference/technical-conferences-by-organizer",
    // TECHNICAL_CONFERENCES_BY_COLLABORATOR: "/Conference/technical-conferences-by-collaborator",  
    TECHNICAL_CONFERENCES_BY_COLLABORATOR_NO_DRAFT: "/Conference/technical-conferences-by-collaborator-no-draft",
    TECHNICAL_CONFERENCES_BY_COLLABORATOR_ONLY_DRAFT: "/Conference/technical-conferences-by-collaborator-only-draft",

    //DETAIL CONF
    GET_TECH_BY_ID_INTERNAL: (conferenceId: string) =>
      `/Conference/detail-technical-for-organizer-collaborator/${conferenceId}`,
    GET_RESEARCH_BY_ID_INTERNAL: (conferenceId: string) =>
      `/Conference/detail-research-organizer-for-organizer/${conferenceId}`,

    //CUSTOMER
    GET_TECH_BY_ID: (conferenceId: string) =>
      `/Conference/technical-detail-for-anon/${conferenceId}`,
    GET_RESEARCH_BY_ID: (conferenceId: string) =>
      `/Conference/research-detail-for-anon/${conferenceId}`,

    // check status
    STEP_COMPLETION_STATUS: "/Conference/step-completion-status",
    RESEARCH_STEP_COMPLETION_STATUS:
      "/Conference/research-step-completion-status",
    CHECK_TECH_STEP_COMPLETION: "/Conference/check-technical-step-completion",
    CHECK_RESEARCH_STEP_COMPLETION:
      "/Conference/check-research-step-completion",

    //pending & approve
    PENDING_CONFERENCES: "/Conference/pending-conferences",
    APPROVE_CONFERENCE: (conferenceId: string) =>
      `/Conference/approve-conference/${conferenceId}`,

    //STATUS
    LIST_ALL_CONF_STATUS: "/ConferenceStatus/get-all-conference-statuses",
    UPDATE_OWN_STATUS: "/Conference/Update-own-conference-Status",
    REQUEST_CONFERENCE_APPROVE: "/Conference/request-a-conference-to-be-approved",

    DISABLE_CONFERENCE: "/conference/disable-conference",
    TRANSITION_CONF_FROM_DISABLE_TO_READY: "/conference/transition-conference-from-disable-to-ready",

    DETAIL: "/Conference",
    TECHNICAL_DETAIL: "/Conference/technical-detail-for-anon",
    RESEARCH_DETAIL: "/Conference/research-detail-for-anon",
    CREATE: "/Conference",
    UPDATE: "/Conference",
    DELETE: "/Conference",

    GET_OWN_CONFERENCES_FOR_SCHEDULE:
      "/Conference/own-conferences-for-schedule",
    GET_CONFERENCES_HAS_ASSIGNED_PAPERS_FOR_LOCAL_REVIEWER: "/Conference/get-conferences-assigned-papers-belong-to",
    GET_CONFERENCES_HAS_ASSIGNED_PAPERS_FOR_EXTERNAL_REVIEWER: "/contract/conferences-for-outsourced-reviewer",

    ACTIVATE_WAITLIST: "/conference/activate-waitlist",
    GET_SKELETON_TECH_CONF_FOR_COLLABORATOR: "/conference/get-skeleton-tech-conf-created-for-collaborator",

    SUBMIT_FEEDBACK: "/conference/submit-conference-feedback",
    ADD_DAYS_SINCE_LAST_ONHOLD: "/Conference/add-days-since-last-onhold"
  },

  CONFERENCE_STEP: {
    //CREATE
    CREATE_BASIC: "/conferencestep/basic",
    CREATE_PRICE: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/prices`,
    CREATE_PHASE_FOR_PRICE: (conferencePriceId: string) =>
      `/conferencestep/prices/${conferencePriceId}/phases`,
    CREATE_SESSION: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/sessions`,
    CREATE_POLICY: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/policies`,
    CREATE_REFUND_POLICY: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/refund-policies`,
    CREATE_MEDIA: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/media`,
    CREATE_SPONSOR: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/sponsors`,

    CREATE_RESEARCH_BASIC: "/conferencestep/research/basic",
    CREATE_RESEARCH_DETAIL: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/detail`,
    CREATE_RESEARCH_PHASE: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/phases`,
    CREATE_RESEARCH_SESSION: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/sessions`,
    CREATE_RESEARCH_RANKING_FILE: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/ranking-file-urls`,
    CREATE_RESEARCH_RANKING_REFERENCE: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/ranking-reference-urls`,
    CREATE_RESEARCH_MATERIAL: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/materials`,
    CREATE_REVISION_ROUND_DEADLINE: (researchConferencePhaseId: string) =>
      `/conferencestep/research/phases/${researchConferencePhaseId}/revision-round-deadlines`,

    //UPDATE
    UPDATE_BASIC: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/basic`,
    UPDATE_PRICE: (priceId: string) => `/conferencestep/prices/${priceId}`,
    UPDATE_PHASE: (pricePhaseId: string) =>
      `/conferencestep/phases/${pricePhaseId}`,
    UPDATE_SESSION: (sessionId: string) =>
      `/conferencestep/sessions/${sessionId}`,
    UPDATE_SPEAKER: (sessionId: string) =>
      `/conferencestep/sessions/${sessionId}/speaker`,
    UPDATE_POLICY: (policyId: string) => `/conferencestep/policies/${policyId}`,
    UPDATE_REFUND_POLICY: (refundPolicyId: string) =>
      `/conferencestep/refund-policies/${refundPolicyId}`,
    UPDATE_MEDIA: (mediaId: string) => `/conferencestep/media/${mediaId}`,
    UPDATE_SPONSOR: (sponsorId: string) =>
      `/conferencestep/sponsors/${sponsorId}`,

    UPDATE_DRAFT_RESEARCH_BASIC: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/basic`,
    UPDATE_RESEARCH_DETAIL: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/detail`,
    UPDATE_RESEARCH_PHASE: (researchPhaseId: string) =>
      `/conferencestep/research/phases/${researchPhaseId}`,
    UPDATE_RESEARCH_MATERIAL: (materialId: string) =>
      `/conferencestep/research/materials/${materialId}`,
    UPDATE_RESEARCH_RANKING_FILE: (rankingFileId: string) =>
      `/conferencestep/research/ranking-file-urls/${rankingFileId}`,
    UPDATE_RESEARCH_SESSION: (sessionId: string) =>
      `/conferencestep/research/sessions/${sessionId}`,
    UPDATE_RESEARCH_RANKING_REFERENCE: (referenceId: string) =>
      `/conferencestep/research/ranking-reference-urls/${referenceId}`,
    UPDATE_REVISION_ROUND_DEADLINE: (deadlineId: string) =>
      `/conferencestep/revision-round-deadlines/${deadlineId}`,

    //DELETE
    DELETE_PRICE: (priceId: string) => `/conferencestep/prices/${priceId}`,
    DELETE_PRICE_PHASE: (pricePhaseId: string) => `/conferencestep/phases/${pricePhaseId}`,
    DELETE_SESSION: (sessionId: string) => `/conferencestep/sessions/${sessionId}`,
    DELETE_REFUND_POLICY: (refundPolicyId: string) =>
      `/conferencestep/refund-policies/${refundPolicyId}`,
    DELETE_POLICY: (policyId: string) => `/conferencestep/policies/${policyId}`,
    DELETE_MEDIA: (mediaId: string) => `/conferencestep/media/${mediaId}`,
    DELETE_SPONSOR: (sponsorId: string) => `/conferencestep/sponsors/${sponsorId}`,
    DELETE_RESEARCH_MATERIAL: (materialId: string) =>
      `/conferencestep/research/materials/${materialId}`,
    DELETE_RESEARCH_RANKING_FILE: (fileId: string) =>
      `/conferencestep/research/ranking-file-urls/${fileId}`,
    DELETE_RESEARCH_SESSION: (sessionId: string) =>
      `/conferencestep/research/sessions/${sessionId}`,
    DELETE_RESEARCH_RANKING_REFERENCE: (referenceId: string) =>
      `/conferencestep/research/ranking-reference-urls/${referenceId}`,
    DELETE_REVISION_ROUND_DEADLINE: (id: string) =>
      `/conferencestep/revision-round-deadlines/${id}`,


    //GET
    GET_BASIC: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/basic`,
    GET_RESEARCH_SESSIONS: (conferenceId: string) =>
      `/conferencestep/${conferenceId}/research/sessions`,


    ADD_PRICE_PHASE_WAITLIST: '/conferencestep/add-pricephase-for-waitlist',

    CREATE_SKELETON_NAME_FOR_CONTRACT: "/conferencestep/create-skeleton-name-for-conference-in-contract-with-collaborator",

    GET_PRICES: (conferenceStepId: string) => `/conferencestep/${conferenceStepId}/prices`,

    CREATE_NEXT_PHASE: "/conferencestep/create-next-phase",
    ACTIVATE_NEXT_PHASE: "/conference/activate-next-phase",
    ADD_PRICE_PHASE_FOR_NEXT_RESEARCH_PHASE: "/conferencestep/add-pricephase-for-next-research-phase",
  },

  CITY: {
    LIST: "/City/cities",
  },

  TRANSACTION: {
    CREATE_TECH_PAYMENT: "/payment/pay-tech",
    CREATE_RESEARCH_PAPER_PAYMENT: "/payment/pay-research-paper",
    PAY_RESEARCH_AS_ATTENDEE: "/payment/pay-research-as-attendee",
    GET_OWN_TRANSACTION: "/payment/get-own-transaction",
  },

  WALLET: {
    VIEW_OWN_WALLET: "/wallet/view-own-wallet",
  },

  PAYMENT_METHOD: {
    GET_ALL: "/PaymentMethod/list-all-payment-methods",
  },

  PAPER: {
    LIST_ALL_PAPERS: "/Paper/list-all-papers",

    //ABSTRACT
    LIST_PENDING_ABSTRACT: (confId?: string) =>
      confId
        ? `/Paper/list-pending-abstract?confId=${confId}`
        : `/Paper/list-pending-abstract`,
    DECIDE_ABSTRACT: "/Paper/decide-abstract-paper-status",
    ASSIGN_PAPER_TO_REVIEWER: "/Paper/assign-reviewer-to-paper",
    LIST_UNASSIGN_ABSTRACT: "/Paper/list-unassign-abstract",
    LIST_ASSIGN_PAPER_REVIEWER: "/Paper/get-assigned-papers",
    SUBMIT_ABSTRACT: "/Paper/submit-abstract",

    GET_PAPER_DETAIL_REVIEWER: (paperId: string) =>
      `/Paper/paper-detail-for-reviewer?paperId=${paperId}`,

    //FULL PAPER
    SUBMIT_FULLPAPER_REVIEW: "/Paper/submit-fullpaper-review",
    LIST_FULLPAPER_REVIEWS: (fullPaperId: string) =>
      `/Paper/get-fullpaper-reviews/${fullPaperId}`,
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
    LIST_SUBMITTED_PAPERS_CUSTOMER:
      "/Paper/get-all-submitted-papers-for-customer",
    GET_PAPER_DETAIL_CUSTOMER: "/Paper/get-paper-detail-customer",
    LIST_PAPER_PHASES: "/Paper/list-paper-phases",
    LIST_AVAILABLE_CUSTOMERS: (conferenceId: string) =>
      `/paper/coauthors/available?conferenceId=${conferenceId}`,

    //WAITLIST
    ADD_TO_WAITLIST: "/Paper/add-waitlist",
    LIST_CUSTOMER_WAITLIST: "/Paper/list-customer-waitlist",
    LEAVE_WAITLIST: "/Paper/leave-waitlist",

    UPDATE_ABSTRACT: "/Paper/update-abstract",
    UPDATE_FULLPAPER: "/Paper/update-fullpaper",
    UPDATE_REVISION_SUBMISSION: "/Paper/update-revision-submission",
    UPDATE_CAMERA_READY: "/Paper/update-camera-ready",
    MARK_COMPLETE_REVISE: "/paper/mark-complete-revise",

    GET_DETAIL_ASSIGNED_PAPERS: "/paper/get-detail-assigned-list",
    ASSIGN_AUTHOR_TO_PAPER: "/paper/assign-author-to-paper",
    UPDATE_PAPER_INFO: "/paper/paper",
  },

  FAVOURITE_CONFERENCE: {
    LIST_OWN: "/FavouriteConference/list-own-favourite-conferences",
    ADD: "/FavouriteConference/add-to-favourite",
    DELETE: "/FavouriteConference/delete-from-favourite",
  },

  PRESENTER_SESSSION: {
    LIST_ACCEPTED_PAPER: "/assigningpresentersession/get-accepted-papers",
    ASSIGN_PRESENTER: "/assigningpresentersession/assign-presenter-to-session",
    REQUEST_CHANGE_PRESENTER:
      "/assigningpresentersession/request-change-presenter",
    APPROVE_CHANGE_PRESENTER:
      "/assigningpresentersession/approve-change-presenter",
    LIST_PENDING_CHANGE_REQUEST:
      "/assigningpresentersession/get-pending-presenter-change-requests",
  },

  REQUEST: {
    REFUND_REQUEST: "/ticket/refunds-request",
    REFUND_REQUEST_BY_CONFID: (conferenceId: string) =>
      `/ticket/conferences/${conferenceId}/refunds-request`,
  },

  CONTRACT: {
    CREATE_REVIEWER_CONTRACT: "/contract/create-review-contract",
    USER_FOR_REVIEWER_CONTRACT: "/contract/users-for-reviewer-contract",
    CREATE_REVIEW_CONTRACT_FOR_NEW_USER: "/contract/create-review-contract-for-new-user",
    LIST_BY_REVIEWER: "/contract/list-review-contract-by-reviewer",
    LIST_OWN_REVIEW_CONTRACT: "/contract/list-own-review-contract",
    CREATE_COLLABORATOR_CONTRACT: "/contract/create-collaborator-contract",
    LIST_COLLABORATOR_CONTRACT: "/contract/list-collaborator-contract",

    OWN_COLLABORATOR_CONTRACT: "/contract/own-collaborator-contract",
    UPDATE_COLLABORATOR_CONTRACT_STATUS: "/contract/collaborator-contract",
  },

  ASSIGNINGPRESENTERSESSION: {
    REQUEST_CHANGE_PRESENTER: "/assigningpresentersession/request-change-presenter",
    REQUEST_CHANGE_SESSION: "/assigningpresentersession/request-change-session",

    GET_PENDING_PRESENTER_CHANGE_REQUESTS: '/assigningpresentersession/get-pending-presenter-change-requests',
    GET_PENDING_SESSION_CHANGE_REQUESTS: '/assigningpresentersession/get-pending-session-change-requests',
    APPROVE_CHANGE_SESSION: '/assigningpresentersession/approve-change-session',
    APPROVE_CHANGE_PRESENTER: '/assigningpresentersession/approve-change-presenter',
  },

  STATISTICS: {
    SOLD_TICKET: '/statistics/sold-ticket',
    TICKET_HOLDERS: '/statistics/ticket-holders',
    EXPORT_SOLD_TICKET: '/statistics/export/sold-ticket',
    SUBMITTED_PAPERS: '/statistics/submitted-papers',
    ASSIGN_REVIEWERS: '/statistics/assign-reviewers',
    PRESENT_SESSION: '/statistics/present-session',
  },

  REPORT: {
    CREATE: "/report",
    GET_UNRESOLVED: "/report/unresolved",
    RESPONSE: (reportId: string) => `/report/${reportId}/response`,
    GET_RESPONSE: (reportId: string) => `/report/${reportId}/get-response`,
    GET_OWN_REPORTS: "/report/get-own-reports",
  },

  DASHBOARD: {
    CONFERENCES_GROUP_BY_STATUS: "/dashboard/conferences-group-by-status",
    UPCOMING_CONFERENCES: "/dashboard/upcoming-conferences",
    TOP_REGISTERED_CONFERENCES: "/dashboard/top-registered-conferences",
    REVENUE: "/dashboard/revenue",
  },

  AUDIT_LOG: {
    LIST: "/auditlog/list-audit-log",
    CATEGORIES: "/auditlog/list-audit-log-categories",
  },

  ORCID: {
    AUTHORIZE: "/orcid/authorize-orcid",
    CALLBACK: "/orcid/callback",
    GET_WORKS: "/orcid/Get-works-from-orcid",
    GET_BIOGRAPHY: "/orcid/Get-biography-from-orcid",
    GET_EDUCATIONS: "/orcid/Get-Educations-from-orcid",
    GET_SECTION: "/orcid/Get-section-from-db",
    STATUS: "/orcid/status",
  },
}

