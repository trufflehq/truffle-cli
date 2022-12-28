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

interface OrgInput {
  id?: string;
  slug?: string;
  domain?: string;
}

export async function getOrg(input: OrgInput) {
  const response = await request({ query: ORG_QUERY, variables: { input } })
  return response.data.org as Org
}