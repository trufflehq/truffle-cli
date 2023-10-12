import { gql } from 'graphql-request';
import { request } from './request.js';
import path from 'path';

export const DEFAULT_APP_CONFIG_FILE_NAME = 'truffle.config.js';

interface AppInput {
  id?: string;
  path?: string;

  // must also pass org id if querying by slug
  slug?: string;
  orgId?: string;
}

export interface App {
  id: string;
  slug: string;
  name: string;
  orgId: string;
  description: string;
  currentVersion: number;
  configJson: string;
  configRaw: string;
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
  mutation ($input: AppUpsertInput!) {
    appUpsert(input: $input) {
      app {
        id
        configRaw
      }
    }
  }
`;

export async function fetchApp(
  input: AppInput,
  { throwError } = { throwError: false }
): Promise<App> {
  const resp = await request({
    query: APP_QUERY,
    variables: { input },
    isOrgRequired: input.slug || input.orgId ? true : false, // if querying by slug, orgId is required,
  });

  if (!resp?.data?.app && throwError) {
    console.error(`Error fetching app: ${input.slug || input.id}`, resp);
    throw new Error(`Error fetching app: ${input.slug || input.id}`);
  }

  return resp?.data?.app;
}

export async function readAppConfig() {
  return await import(
    new URL(`file://${path.join(process.cwd(), `/${DEFAULT_APP_CONFIG_FILE_NAME}`)}`).href
  );
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

export async function upsertApp(
  input: AppUpsertInput
): Promise<App | undefined> {
  const resp = await request({
    query: APP_UPSERT_MUTATION,
    variables: { input },
    isOrgRequired: input.slug || input.orgId ? true : false, // if querying by slug, orgId is required,
  });

  return resp?.data?.appUpsert?.app;
}
