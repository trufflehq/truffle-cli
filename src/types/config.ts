export interface OrgProfileConfig {
  apiUrl: string;
  secretKey: string;
}

export interface CliConfig {
  apiUrl: string;
  orgProfiles: Record<string, OrgProfileConfig>;
}
