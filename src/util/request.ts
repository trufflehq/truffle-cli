import { getApiUrl, getCliConfig, getCurrentOrgId } from './cli-config';
import fetch from 'node-fetch';
export interface RequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  isOrgRequired?: boolean;
  maxAttempts?: number;
  shouldUseGlobal?: boolean;
}

interface BaseGraphQLResponse {
  errors?: { message: string; extensions: { info: string } }[];
  data: Record<string, unknown>;
}

interface GraphQLCredentials {
  apiUrl: string;
  headerProps: {
    'x-access-token'?: string;
    'x-org-id'?: string;
    Authorization?: string;
  };
}

async function getCredentials({
  isOrgRequired = false,
  isAuthRequired = true,
}: {
  isOrgRequired?: boolean;
  isAuthRequired?: boolean;
}): Promise<GraphQLCredentials> {
  const getGlobalCredentials: () => GraphQLCredentials = () => {
    const apiUrl = getApiUrl();
    const cliConfig = getCliConfig();
    const userAccessToken = cliConfig.userAccessTokens[apiUrl];
    const orgId = getCurrentOrgId();

    const headerProps = { 'x-access-token': userAccessToken };

    if (!userAccessToken && isAuthRequired) {
      console.error(
        'No user access token found. Please login with `truffle-cli login`.',
      );
      process.exit(1);
    }

    if (!orgId && isOrgRequired) {
      console.error(
        'No org id found. Please select an org with `truffle-cli org use`.',
      );
      process.exit(1);
    }

    return {
      apiUrl,
      headerProps,
    };
  };

  return getGlobalCredentials();
}

export async function request({
  query,
  variables,
  isOrgRequired = true,
  maxAttempts = 1,
}: RequestOptions): Promise<any> {
  const { apiUrl, headerProps } = await getCredentials({ isOrgRequired });

  let response;
  let attemptsLeft = maxAttempts;
  while ((!response || response.status !== 200) && attemptsLeft > 0) {
    if (response?.status) {
      console.log('Retrying. Last attempt:', response.status);
    }
    attemptsLeft -= 1;
    response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
      headers: {
        ...headerProps,
        'Content-Type': 'application/json',
      },
    });
  }

  // console.log(chalk.gray(`[request] POST ${new URL(apiUrl).pathname} ${response.status} ${response.statusText}`))
  const data = (await response.json()) as BaseGraphQLResponse;

  // console.log({ apiUrl, headerProps, query, variables, data: data.data, errors: data.errors })

  if (data?.errors?.length) {
    const error = data.errors[0].extensions?.info ?? data.errors[0].message;
    throw new Error(`Request error: ${JSON.stringify(error)}`, {
      cause: error,
    });
  }
  return data;
}
