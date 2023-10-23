import { gql } from 'graphql-request';
import { request } from '../../util/request.js';
import { getCurrentOrgId } from '../../util/config.js';

const ORG_USER_CREATE_MUTATION = gql`
  mutation CliOrgUserCreate($orgId: ID!) {
    orgUserCreate(input: { orgId: $orgId }) {
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
`;

export default async function () {
  const res = await request({
    query: ORG_USER_CREATE_MUTATION,
    variables: { orgId: getCurrentOrgId() },
    isOrgRequired: true,
  });

  if (!res?.data?.orgUserCreate?.orgUser) {
    console.error('Failed to join org', res);
    throw new Error('Failed to join org');
  }

  console.log('Org user:', res.data.orgUserCreate.orgUser);
}
