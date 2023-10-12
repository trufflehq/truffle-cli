import { gql } from 'graphql-request';
import { request } from './request.js';
import path from 'path';

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

export async function fetchApp(input: AppInput): Promise<App | undefined> {
  const resp = await request({
    query: APP_QUERY,
    variables: { input },
    isOrgRequired: input.slug || input.orgId ? true : false, // if querying by slug, orgId is required,
  });

  return resp?.data?.app;
}

export async function readAppConfig() {
  return await import(
    new URL(`file://${path.join(process.cwd(), `/truffle.config.js`)}`).href
  );
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
