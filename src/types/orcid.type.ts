export interface OrcidStatusResponse {
    isLinked: boolean;
    orcidId: string;
    userName: string;
    grantedScopes: string[];
}