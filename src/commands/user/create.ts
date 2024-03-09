import { gql, request } from 'graphql-request';
import readline from 'readline-sync';
import { getApiUrl, getCliConfig, writeCliConfig } from '../../util/cli-config';

const USER_CREATE_MUTATION = gql`
  mutation UserCreate($email: String!, $password: String!) {
    userCreate(
      input: { emailAndPassword: { email: $email, password: $password } }
    ) {
      accessToken
    }
  }
`;

interface UserCreateResponse {
  userCreate: {
    accessToken: string;
  };
}

export default async function (email?: string, password?: string) {
  // check if username was provided
  if (!email) {
    // prompt for email
    email = readline.question('Email: ');
  }

  // check if password was provided
  if (!password) {
    // prompt for password
    password = readline.question('Password: ', { hideEchoBack: true });
  }

  const apiUrl = getApiUrl();

  // set the email/password for the user
  const { userCreate } = (await request(apiUrl, USER_CREATE_MUTATION, {
    email,
    password,
  }).catch((error) => {
    console.error('There was an error creating the user.');
    console.error(error?.response?.errors || error);
    process.exit(1);
  })) as UserCreateResponse;

  // set the access token in the cli config
  const cliConfig = getCliConfig();
  cliConfig.userAccessTokens[apiUrl] = userCreate.accessToken;

  // only write the config if the user was created
  writeCliConfig(cliConfig);

  console.log('New user created. Now logged in as', email);
}
