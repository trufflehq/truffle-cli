export interface CliConfig {
  apiUrl: string;
  userAccessTokens: Record<string, string>;
  currentOrgs: Record<string, string>;
}

export interface PublicConfig {
  name: string;
  version: string;
  apiUrl: string;
  secretKey: string;
  requestedPermissions: {
    action: string;
    value: string;
    filters: Record<string, { isAll: boolean; rank: number}>
  }[];
  functions: {
    slug: string;
    description: string;
    entrypoint: string;
  }[]
}
