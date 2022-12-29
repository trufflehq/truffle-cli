import readline from 'readline-sync';
import { request, gql } from 'graphql-request';
import { getApiUrl, getCliConfig, writeCliConfig } from '../../util/config.js';

const LOGIN_MUTATION = gql`
  mutation EmailLogin($email: String!, $password: String!) {
    userLoginEmailPhone(input: { email: $email, password: $password }) {
      accessToken
    }
  }
`;

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

  const config = getCliConfig()
  const apiUrl = getApiUrl()

  const { userLoginEmailPhone } = await request(
    apiUrl,
    LOGIN_MUTATION,
    {
      email,
      password,
    }
  ).catch(() => {
    console.error(
      'There was an error logging in... your email or password may be incorrect.'
    );
    process.exit(1);
  });

  // check if there were errors
  if (!userLoginEmailPhone) {
    console.error('There was an error logging in.');
    process.exit(1);
  }

  config.userAccessTokens[apiUrl] = userLoginEmailPhone.accessToken;
  writeCliConfig(config);

  console.log(`Logged in to "${apiUrl}" as ${email}.`);
}