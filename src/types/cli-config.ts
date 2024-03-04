export interface CliConfig {
  apiUrl: string;
  userAccessTokens: Record<string, string>;
  currentOrgs: Record<string, string>;
}
