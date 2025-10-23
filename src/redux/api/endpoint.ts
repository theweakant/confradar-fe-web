// redux/api/endpoint.ts
export const endpoint = {
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    REFRESH: "/Auth/refresh-token",
    GOOGLE: "Auth/firebase-login"
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
    LIST: "/Conference",
    DETAIL: "/Conference",
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
    UPDATE_PRICE: (conferenceId: string) => `/ConferenceStep/${conferenceId}/prices`,
    UPDATE_SESSION: (conferenceId: string) => `/ConferenceStep/${conferenceId}/sessions`,
    UPDATE_POLICY: (conferenceId: string) => `/ConferenceStep/${conferenceId}/policies`,
    UPDATE_MEDIA: (conferenceId: string) => `/ConferenceStep/${conferenceId}/media`,
    UPDATE_SPONSOR: (conferenceId: string) => `/ConferenceStep/${conferenceId}/sponsors`,

  },


}