export interface OrcidStatusResponse {
    isLinked: boolean;
    orcidId: string;
    userName: string;
    grantedScopes: string[];
}

export interface OrcidEducation {
    OrcidPutCode?: number | null;
    Degree?: string | null;
    Institution?: string | null;
    Period?: string | null;
    Location?: string | null;
}

export interface OrcidBiography {
    Content?: string | null;
    LastModified?: string | null;
}

export interface OrcidWorksResponse {
    "last-modified-date": OrcidDateValue;
    group: OrcidWorkGroup[];
    path: string;
}

export interface OrcidDateValue {
    value: number;
}

export interface OrcidWorkGroup {
    "last-modified-date": OrcidDateValue;
    "external-ids": OrcidExternalIds;
    "work-summary": OrcidWorkSummary[];
}

export interface OrcidExternalIds {
    "external-id": OrcidExternalId[];
}

export interface OrcidExternalId {
    "external-id-type": string;
    "external-id-value": string;
    "external-id-normalized": OrcidExternalIdNormalized;
    "external-id-normalized-error": unknown | null;
    "external-id-url": OrcidUrl | null;
    "external-id-relationship": string;
}

export interface OrcidExternalIdNormalized {
    value: string;
    transient: boolean;
}

export interface OrcidUrl {
    value?: string;
}

export interface OrcidWorkSummary {
    "put-code": number;
    "created-date": OrcidDateValue;
    "last-modified-date": OrcidDateValue;
    source: OrcidWorkSource;
    title: OrcidWorkTitle;
    "external-ids": OrcidExternalIds;
    url: OrcidUrl | null;
    type: string;
    "publication-date"?: OrcidWorkPublicationDate;
    "journal-title"?: { value: string };
    visibility: string;
    path: string;
    "display-index": string;
}

export interface OrcidWorkTitle {
    title: { value: string };
    subtitle?: { value: string } | null;
    "translated-title"?: { value: string } | null;
}

export interface OrcidWorkPublicationDate {
    year?: { value: string };
    month?: { value: string };
    day?: { value: string };
}

export interface OrcidWorkSource {
    "source-orcid"?: OrcidSourceOrcid;
    "source-client-id"?: unknown | null;
    "source-name"?: { value: string };
    "assertion-origin-orcid"?: unknown | null;
    "assertion-origin-client-id"?: unknown | null;
    "assertion-origin-name"?: unknown | null;
}

export interface OrcidSourceOrcid {
    uri: string;
    path: string;
    host: string;
}

// export interface OrcidWorksResponse {
//     "last-modified-date": OrcidDateValue;
//     group: OrcidWorkGroup[];
//     path: string;
// }

// export interface OrcidDateValue {
//     value: number;
// }

// export interface OrcidWorkGroup {
//     "last-modified-date": OrcidDateValue;
//     "external-ids": OrcidExternalIds;
//     "work-summary": OrcidWorkSummary[];
// }

// export interface OrcidExternalIds {
//     "external-id": OrcidExternalId[];
// }

// export interface OrcidExternalId {
//     "external-id-type": string;
//     "external-id-value": string;
//     "external-id-normalized": {
//         value: string;
//         transient: boolean;
//     };
//     "external-id-normalized-error": any | null;
//     "external-id-url": { value?: string } | null;
//     "external-id-relationship": string;
// }

// export interface OrcidWorkSummary {
//     "put-code": number;
//     "created-date": OrcidDateValue;
//     "last-modified-date": OrcidDateValue;
//     source: OrcidWorkSource;
//     title: {
//         title: { value: string };
//         subtitle: any | null;
//         "translated-title": any | null;
//     };
//     "external-ids": OrcidExternalIds;
//     url: { value: string } | null;
//     type: string;
//     "publication-date"?: {
//         year?: { value: string };
//         month?: { value: string };
//         day?: { value: string };
//     };
//     "journal-title"?: { value: string };
//     visibility: string;
//     path: string;
//     "display-index": string;
// }

// export interface OrcidWorkSource {
//     "source-orcid"?: {
//         uri: string;
//         path: string;
//         host: string;
//     };
//     "source-client-id"?: any | null;
//     "source-name"?: { value: string };
//     "assertion-origin-orcid"?: any | null;
//     "assertion-origin-client-id"?: any | null;
//     "assertion-origin-name"?: any | null;
// }
