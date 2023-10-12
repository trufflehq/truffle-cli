import { gql } from "graphql-request";
import { Org } from "src/types/org.js";
import { request } from "./request.js";

const ORG_QUERY = gql`
  query CliOrgQuery($input: OrgInput!) {
    org (input: $input) {
      id
      slug
      name
    }
  }
`

const ORG_CREATE_MUTATION = gql`
  mutation CliOrgCreateMutation($name: String!) {
    orgUpsert(input: { name: $name }) {
      org {
        id
        name
        slug
      }
    }
  }
`;

interface OrgInput {
  id?: string;
  slug?: string;
  domain?: string;
}

export async function getOrg(input: OrgInput) {
  const response = await request({
    query: ORG_QUERY,
    variables: { input },
    isOrgRequired: false,
  })

  if (!response?.data?.org) {
    console.error('Failed to get org', response);
    throw new Error('Failed to get org');
  }

  return response.data.org as Org
}

export async function createOrg ({ name }: { name: string }) {
  const response = await request({
    query: ORG_CREATE_MUTATION,
    variables: { name },
    isOrgRequired: false,
  });

  if (!response?.data?.orgUpsert?.org) {
    console.error('Failed to create org', response);
    throw new Error('Failed to create org');
  }

  return response.data.orgUpsert.org as Org
}