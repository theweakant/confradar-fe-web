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
    PROFILE:"/Auth/view-profile-by-id"
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
    DETAIL: "/Conference",
    CREATE: "/Conference",
    UPDATE: "/Conference",
    DELETE: "/Conference",
    VIEW_REGISTERED_USERS: "/Conference/view-registered-users-for-conference",
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
}