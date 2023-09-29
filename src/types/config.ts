export interface OrgProfileConfig {
  apiUrl: string;
  secretKey: string;
}

export interface CliConfig {
  apiUrl: string;
  userAccessTokens: Record<string, string>;
  currentOrgs: Record<string, string>;
}

export interface PrivateConfig {
  secretKey: string;
  secrets: Record<string, Record<string, string>>;
}

export interface StepActionRelRuntimeData {
  query: string;
  variables: Record<string, unknown>;
}

export interface StepActionRel {
  actionPath: string;
  runtimeData: StepActionRelRuntimeData;
}

export interface RuntimeData {
  mode: string;
  stepActionRels: StepActionRel[];
}

export interface InstallActionRel {
  actionPath: string;
  runtimeData: RuntimeData;
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
  installActionRel: InstallActionRel;
  functions: {
    slug: string;
    description: string;
    entrypoint: string;
  }[]
}
