#!/usr/bin/env -S node --experimental-modules --experimental-import-meta-resolve --experimental-network-imports --no-warnings
import { Argument, Command, program } from 'commander'
import truffleCli from '../package.json' assert { type: 'json' }

program
  .name(truffleCli.name)
  .description(truffleCli.description)
  .version(truffleCli.version, '-v, --version')

program.addCommand(
  new Command('auth')
    .description('Set your API Key.')
    .alias('login')
    .argument('<secret-key>', 'Your API Key.')
    .action(async (secretKey) => {
      const { default: auth } = await
      import('./commands/auth.js')
      await auth({ secretKey })
    })
)

program.addCommand(
  new Command('clone')
    .description('Clone an existing package.')
    .argument('<package-path>', 'The name of the package to clone.')
    .argument('<package-name>', 'The name of the new package.')
    .action(async (packagePath, packageName) => {
      const { default: clone } = await
      import('./commands/clone.js')
      await clone({ packagePath, toPackageSlug: packageName })
    })
)

program.addCommand(
  new Command('create')
    .description('Create a new package.')
    .argument('<package-name>', 'The name of the package to create.')
    .action(async (packageName) => {
      const { default: create } = await
      import('./commands/create.js')
      await create({ toPackageSlug: packageName })
    })
)

program.addCommand(
  new Command('dev')
    .description('Starts the dev server.')
    .action(async () => {
      const { default: dev } = await
      import('./commands/dev.js')
      await dev()
    })
)

program.addCommand(
  new Command('deploy')
    .description('Deploy your package to production.')
    .action(async () => {
      const { deploy } = await
      import('./commands/deploy.js')
      await deploy({ shouldUpdateDomain: true })
    })
)

program.addCommand(
  new Command('fork')
    .description('Fork an existing package.')
    .argument('<package-path>', 'The name of the package to fork.')
    .argument('<package-name>', 'The name of the new package.')
    .action(async (packagePath, packageName) => {
      const { default: fork } = await
      import('./commands/fork.js')
      await fork({ packagePath, toPackageSlug: packageName })
    })
)

program.addCommand(
  new Command('regenerate-api-key')
    .description('Request a new API Key.')
    .action(async () => {
      const { default: regeneratePackageApiKey } = await
      import('./commands/regenerate.js')
      await regeneratePackageApiKey()
    })
)

program.addCommand(
  new Command('install')
    .description('Install a new package.')
    .argument('<package-path>', 'The name of the package to install.')
    .option('-f, --force', 'Force install the package.', false)
    .action(async (packagePath, { force }) => {
      const { default: install } = await
      import('./commands/install.js')
      await install({
        installedPackageVersionPath: packagePath,
        isForceInstall: force
      })
    })
)

program.addCommand(
  new Command('pull')
    .description('Fetch the upstream package.')
    .action(async () => {
      const { default: pull } = await
      import('./commands/pull.js')
      await pull()
    })
)

program.addCommand(
  new Command('watch')
    .description('Watch for changes.')
    .action(async () => {
      const { watch } = await
      import('./commands/deploy.js')
      await watch()
    })
)

program.addCommand(
  new Command('ls')
    .description('List existing packages.')
    .action(async () => {
      const { default: list } = await
      import('./commands/list.js')
      await list()
    })
)

program.addCommand(
  new Command('functions')
    .description('Manage Truffle Functions')
    .addCommand(
      new Command('deploy')
        .description('Deploy functions.')
        .option('-a, --all', 'Deploy all functions.', false)
        .argument('[function-name]', 'The name of the function to deploy.')
        .action(async (functionName, { all }) => {
          const { default: deploy } = await import('./commands/functions/deploy.js')
          await deploy({
            all,
            functionName
          })
        }).on('--help', () => {
          console.log('  Examples:')
          console.log()
          console.log('    $ truffle functions deploy')
          console.log('    $ truffle functions deploy --all')
          console.log('    $ truffle functions deploy myFunction')
        }))
    .addCommand(
      new Command('logs')
        .description('View logs for deployed Truffle Functions.')
        .option('-a, --all', 'View logs for all functions.', false)
        .argument('[function-name]', 'The name of the function to view logs for.')
        .action(async (functionName, { all }) => {
          const { default: logs } = await import('./commands/functions/logs.js')
          await logs({
            all,
            functionName
          })
        }).on('--help', () => {
          console.log('  Examples:')
          console.log()
          console.log('    $ truffle functions logs')
          console.log('    $ truffle functions logs --all')
          console.log('    $ truffle functions logs myFunction')
        }))
)

program.addCommand(
  new Command('describe')
    .description('Print data about your current package.')
    .addArgument(
      new Argument('[model]')
        .choices([
          'subscriptions',
          'topics',
          'package'
        ])
    )
    .action(async (model) => {
      const { default: describe } = await
      import('./commands/describe.js')
      await describe({ model })
    })
)

if (2 in process.argv === false) {
  program.help()
}

(async () => {
  await program.parseAsync(process.argv)
})()
