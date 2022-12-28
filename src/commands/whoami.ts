import { request } from '../util/request.js'
import { getOrgProfileConfig } from '../util/config.js'
import { stripIndents } from 'common-tags'
import chalk from 'chalk'
import { container } from 'tsyringe'
import { kProfile } from '../di/tokens.js'

export default async function whoami () {
  const profile = container.resolve<string>(kProfile)
  const globalConfig = getOrgProfileConfig(profile)

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
    variables: { secretKey: globalConfig.secretKey }
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
    Your API key for ${chalk.cyan(globalConfig.apiUrl)} (${chalk.gray(globalConfig.secretKey.slice(0, 8))}) is:
    - configured under profile ${chalk.bold(profile)}
    - a ${type} key
    - belonging to ${data.source.__typename.toLocaleLowerCase()}:${data.source.name} (${data.source.slug})
    - with a uuid of ${chalk.gray(data.id)}
  `)
}
