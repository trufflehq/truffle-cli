import { request } from '../util/request.js'
import { getApiUrl, getCliConfig, getOrgProfileConfig } from '../util/config.js'
import { stripIndents } from 'common-tags'
import chalk from 'chalk'
import { container } from 'tsyringe'
import { kProfile } from '../di/tokens.js'
import { Command } from 'commander'
import { getMe } from '../util/user.js'
import { getOrg } from '../util/org.js'

export default async function whoami (_options, command: Command) {

  // check if the user passed the `--profile` option
  const passedProfileOption = Boolean(command.parent?.opts().profile)

  // get the currently logged in user's access token and the org id that the user
  // set with `truffle-cli org use
  const cliConfig = getCliConfig()
  const apiUrl = getApiUrl()
  // if the user is logged in, this will be defined
  const userAccessToken = cliConfig.userAccessTokens[apiUrl]
  // if the user executed `truffle-cli org use`, then this will be defined
  const useOrgId = cliConfig.currentOrgs[apiUrl]

  // get the org profile that the user is currently using
  const profile = container.resolve<string>(kProfile) || 'default'
  const orgProfileConfig = getOrgProfileConfig({ profile, exitOnError: false })

  // by default, we should print the info of the currently signed in user and
  // the info for the org that the user set with `truffle-cli org use`,
  // unless the user passed the `--profile` option or the user is not signed in
  if (userAccessToken && !passedProfileOption) {
    console.log('Using API:', apiUrl)

    const me = await getMe()
    console.log(`You are signed in as '${me.name}'`)
    console.log('Email:', me.email)
    console.log('User ID:', me.id)

    if (useOrgId) {
      const org = await getOrg({ id: useOrgId })

      console.log()
      console.log(`You are using org '${org.name}'`)
      console.log('Slug:', org.slug)
      console.log('Org ID:', org.id)
    }

    // if the user specified an org profile, use that
  } else if (orgProfileConfig) {
    
    const res = await request({
      shouldUseGlobal: true,
      query: `
      query APIKeyWhoami($secretKey: String!) {
        apiKey(secretKey: $secretKey) {
          id
          orgId
          type
          key
          source {
            id
            slug
            name
            __typename
          }
          __typename
        }
      }
    `,
      variables: { secretKey: orgProfileConfig.secretKey }
    })
  
    const data = res.data.apiKey as {
      id: string;
      orgId: string;
      type: string;
      key: string;
      source: {
        id: string;
        slug: string;
        name: string;
        __typename: string;
      };
      __typename: string;
    }
  
    const type = data.type === 'secret' ? chalk.red('secret') : chalk.green('publishable')
  
    console.log(stripIndents`
      Your API key for ${chalk.cyan(orgProfileConfig.apiUrl)} (${chalk.gray(orgProfileConfig.secretKey.slice(0, 8))}) is:
      - configured under profile ${chalk.bold(profile)}
      - a ${type} key
      - belonging to ${data.source.__typename.toLocaleLowerCase()}:${data.source.name} (${data.source.slug})
      - with a uuid of ${chalk.gray(data.id)}
    `)
  } else {
    console.log('You are not authenticated. Either login with `truffle-cli login` or configure an org api key in ~/.truffle/config.json')
  }
}
