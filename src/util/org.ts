import { gql } from "graphql-request";
import { Org } from "src/types/org.js";
import { request } from "./request.js";

const ORG_QUERY = gql`
  query($input: OrgInput!) {
    org (input: $input) {
      id
      slug
      name
    }
  }
`

const ORG_CREATE_MUTATION = gql`
  mutation OrgCreate($name: String!) {
    orgCreate(input: { name: $name }) {
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
  const response = await request({ query: ORG_QUERY, variables: { input } })
  return response.data.org as Org
}

export async function createOrg ({ name }: { name: string }) {
  const response = await request({
    query: ORG_CREATE_MUTATION,
    variables: { name }
  })
  return response.data.orgCreate.org as Org
}