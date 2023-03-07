import { gql, request } from 'graphql-request';
import readline from 'readline-sync';
import { getApiUrl, getCliConfig, writeCliConfig } from '../../util/config.js';
import { request as authenticatedRequest } from '../../util/request.js'

const USER_LOGIN_ANON_MUTATION = gql`
  mutation UserLoginAnon {
    userLoginAnon {
      accessToken
    }
  }
`

const USER_UPSERT_MUTATION = gql`
  mutation UserUpsert($email: String!, $password: String!) {
    userUpsert(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
    }
  }
`

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

  const apiUrl = getApiUrl()

  // create an anonymous user
  const { userLoginAnon } = await request(
    apiUrl,
    USER_LOGIN_ANON_MUTATION
  )

  // set the access token in the cli config
  const accessToken = userLoginAnon?.accessToken
  if (!accessToken) {
    console.error('There was an error creating the anonymous user.')
    process.exit(1)
  }

  // set the access token in the cli config
  const cliConfig = getCliConfig()
  cliConfig.userAccessTokens[apiUrl] = accessToken

  // set the email/password for the user
  const { data: userUpsertData } = await authenticatedRequest({
    query: USER_UPSERT_MUTATION,
    variables: {
      email,
      password,
    }
  })
  .catch(error => {
    console.error('There was an error creating the user.')
    console.error('cause:', error.cause)
    process.exit(1)
  })

  console.log('New user created: ', userUpsertData?.userUpsert?.user)

  // only write the config if the user was created
  writeCliConfig(cliConfig)
}