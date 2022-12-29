import { gql } from "graphql-request";
import { request } from "../../util/request.js";

const ORG_USER_UPSERT_MUTATION = gql`
  mutation OrgUserUpsert {
    orgUserUpsert(input: {}) {
      orgUser {
        id
        userId
        org {
          id
          slug
          name
        }
      }
    }
  }
`

export default async function () {
  const res = await request({
    query: ORG_USER_UPSERT_MUTATION
  })
  console.log("Org user:", res?.data?.orgUserUpsert?.orgUser)
}