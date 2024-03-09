import { gql } from 'graphql-request';
import { request } from '../../util/request';
import { getCurrentOrgId } from '../../util/cli-config';

const ORG_MEMBER_CREATE_MUTATION = gql`
  mutation CliOrgMemberCreate($orgId: ID!) {
    orgMemberCreate(input: { orgId: $orgId }) {
      orgMember {
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
    query: ORG_MEMBER_CREATE_MUTATION,
    variables: { orgId: getCurrentOrgId() },
    isOrgRequired: true,
  });

  if (!res?.data?.orgMemberCreate?.orgMember) {
    console.error('Failed to join org', res);
    throw new Error('Failed to join org');
  }

  console.log('Org member:', res.data.orgMemberCreate.orgMember);
}
