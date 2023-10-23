import { getApiUrl, getCliConfig } from '../util/config.js'
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
  } else {
    console.log('You are not authenticated. Either login with `truffle-cli login` or configure an org api key in ~/.truffle/config.json')
  }
}
