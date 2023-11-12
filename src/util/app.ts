import { gql } from 'graphql-request';
import { request } from './request.js';
import path from 'path';
import { readFile } from 'fs/promises';

export const DEFAULT_APP_CONFIG_FILE_NAME = 'truffle.config.mjs';

interface AppInput {
  id?: string;
  path?: string;
  orgIdAndSlug?: {
    slug: string;
    orgId: string;
  }
}

export interface App {
  id: string;
  slug: string;
  name: string;
  orgId: string;
  path: string;
  description: string;
  currentVersion: number;
  configJson: string;
  configRaw: string;
}

export interface AppInstall {
  id: string;
  orgId: string;
  installedVersion: number;
}

const APP_QUERY = gql`
  query CliAppQuery($input: AppInput) {
    app(input: $input) {
      id
      slug
      name
      orgId
      description
      currentVersion
      configJson
      configRaw
    }
  }
`;

interface AppUpsertInput {
  id?: string;
  path?: string;
  slug?: string;
  orgId?: string;
  name?: string;
  description?: string;
  configJson?: string;
  configRaw?: string;
}

const APP_UPSERT_MUTATION = gql`
  mutation CliAppUpsertMutation($input: AppUpsertInput!) {
    appUpsert(input: $input) {
      app {
        id
        configRaw
        currentVersion
      }
    }
  }
`;

interface AppConnectionInput {
  orgId: string;
}

const APP_CONNECTION_QUERY = gql`
  query CliAppQuery($input: AppConnectionInput) {
    appConnection(input: $input) {
      nodes {
        id
        name
        path
      }
    }
  }
`;

interface AppInstallUpsertInput {
  appLocator: {
    path: string;
  };
  orgId: string;
}

const APP_INSTALL_UPSERT_MUTATION = gql`
  mutation CliAppUpsertMutation($input: AppInstallUpsertInput!) {
    appInstallUpsert(input: $input) {
      appInstall {
        id
        orgId
        installedVersion
      }
    }
  }
`;

const APP_INSTALL_CONNECTION_QUERY = gql`
  query CliAppInstallConnectionQuery($input: AppInstallConnectionInput!) {
    appInstallConnection(input: $input) {
      nodes {
        id
        app {
          id
          path
        }
      }
    }
  }
`;

interface AppInstallAccessTokenInput {
  appInstallId: string;
}

const APP_INSTALL_ACCESS_TOKEN_MUTATION = gql`
  query CliAppInstallAccessTokenQuery($input: AppInstallAccessTokenInput!) {
    appInstallAccessToken(input: $input) {
      accessToken
    }
  }
`;

export interface AppInstall {
  id: string;
  appId: string;
  orgId: string;
  installedVersion: number;
  app: App;
}

export async function fetchApp(
  input: AppInput,
  { throwError } = { throwError: false }
): Promise<App> {
  const resp = await request({
    query: APP_QUERY,
    variables: { input },
    isOrgRequired: input.orgIdAndSlug ? true : false, // if querying by slug, orgId is required,
  });

  if (!resp?.data?.app && throwError) {
    console.error(`Error fetching app: ${input.orgIdAndSlug || input.id}`, resp);
    throw new Error(`Error fetching app: ${input.orgIdAndSlug || input.id}`);
  }

  return resp?.data?.app;
}

export function getAppConfigPath() {
  return path.join(process.cwd(), `/${DEFAULT_APP_CONFIG_FILE_NAME}`);
}

export async function readRawAppConfig() {
  return await readFile(getAppConfigPath(), 'utf8');
}

export async function readAppConfig() {
  return await import(new URL(`file://${getAppConfigPath()}`).href);
}

export async function isInAppDir() {
  // check if app config already exists
  try {
    await readAppConfig();
    return true;
  } catch {
    return false;
  }
}

export async function appUpsert(
  input: AppUpsertInput,
  { throwError } = { throwError: false }
): Promise<App | undefined> {
  const resp = await request({
    query: APP_UPSERT_MUTATION,
    variables: { input },
    isOrgRequired: input.slug || input.orgId ? true : false, // if querying by slug, orgId is required,
  });

  if (!resp?.data?.appUpsert?.app && throwError) {
    console.error(`Error upserting app: ${input.slug || input.id}`, resp);
    throw new Error(`Error upserting app: ${input.slug || input.id}`);
  }

  return resp?.data?.appUpsert?.app;
}

export async function fetchAppConnection(
  input: AppConnectionInput
): Promise<App[]> {
  const resp = await request({
    query: APP_CONNECTION_QUERY,
    variables: { input },
    isOrgRequired: true,
  });

  if (!resp?.data?.appConnection?.nodes) {
    console.error(`Error fetching app connection`, resp);
    throw new Error(`Error fetching app connection`);
  }

  return resp?.data?.appConnection?.nodes;
}

export async function appInstallUpsert(
  input: AppInstallUpsertInput
): Promise<AppInstall> {
  const resp = await request({
    query: APP_INSTALL_UPSERT_MUTATION,
    variables: { input },
    isOrgRequired: true,
  });

  if (!resp?.data?.appInstallUpsert?.appInstall) {
    console.error(`Error upserting app install`, resp);
    throw new Error(`Error upserting app install`);
  }

  return resp?.data?.appInstallUpsert?.appInstall;
}

export async function fetchAppInstallConnection(
  orgId: string
): Promise<AppInstall[]> {
  const resp = await request({
    query: APP_INSTALL_CONNECTION_QUERY,
    variables: { input: { orgId } },
    isOrgRequired: true,
  });

  if (!resp?.data?.appInstallConnection?.nodes) {
    console.error(`Error fetching app install connection`, resp);
    throw new Error(`Error fetching app install connection`);
  }

  return resp?.data?.appInstallConnection?.nodes;
}

export async function fetchAppInstallAccessToken(
  appInstallId: string
): Promise<string> {
  const resp = await request({
    query: APP_INSTALL_ACCESS_TOKEN_MUTATION,
    variables: { input: { appInstallId } },
    isOrgRequired: true,
  });

  if (!resp?.data?.appInstallAccessToken?.accessToken) {
    console.error(`Error fetching app install access token`, resp);
    throw new Error(`Error fetching app install access token`);
  }

  return resp?.data?.appInstallAccessToken?.accessToken;
}