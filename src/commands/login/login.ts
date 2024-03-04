import readline from 'readline-sync';
import { request, gql } from 'graphql-request';
import { getApiUrl, getCliConfig, writeCliConfig } from '../../util/cli-config';

const LOGIN_MUTATION = gql`
  mutation CliEmailLogin($email: String!, $password: String!) {
    userLogin(
      input: { emailAndPassword: { email: $email, password: $password } }
    ) {
      accessToken
    }
  }
`;

interface LoginResponse {
  userLogin: {
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

  const config = getCliConfig();
  const apiUrl = getApiUrl();

  const { userLogin } = (await request(apiUrl, LOGIN_MUTATION, {
    email,
    password,
  }).catch(() => {
    console.error(
      'There was an error logging in... your email or password may be incorrect.',
    );
    process.exit(1);
  })) as LoginResponse;

  // check if there were errors
  if (!userLogin) {
    console.error('There was an error logging in.');
    process.exit(1);
  }

  config.userAccessTokens[apiUrl] = userLogin.accessToken;
  writeCliConfig(config);

  console.log(`Logged in to "${apiUrl}" as ${email}.`);
}
