#!/bin/sh
":" //# comment; exec /usr/bin/env node --experimental-import-meta-resolve --experimental-network-imports --no-warnings "$0" "$@"
'use strict'
import { Argument, Command, program } from 'commander'
import truffleCli from './package.json' assert { type: 'json' }

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
      const { default: auth } = await import('./auth.js')
      await auth({ secretKey })
    })
)

program.addCommand(
  new Command('clone')
    .description('Clone an existing package.')
    .argument('<package-path>', 'The name of the package to clone.')
    .argument('<package-name>', 'The name of the new package.')
    .action(async (packagePath, packageName) => {
      const { default: clone } = await import('./clone.js')
      await clone({ packagePath, toPackageSlug: packageName })
    })
)

program.addCommand(
  new Command('create')
    .description('Create a new package.')
    .argument('<package-name>', 'The name of the package to create.')
    .action(async (packageName) => {
      const { default: create } = await import('./create.js')
      await create({ toPackageSlug: packageName })
    })
)

program.addCommand(
  new Command('dev')
    .description('Starts the dev server.')
    .action(async () => {
      const { default: dev } = await import('./dev.js')
      await dev()
    })
)

program.addCommand(
  new Command('deploy')
    .description('Deploy your package to production.')
    .action(async () => {
      const { deploy } = await import('./deploy.js')
      await deploy({ shouldUpdateDomain: true })
    })
)

program.addCommand(
  new Command('fork')
    .description('Fork an existing package.')
    .argument('<package-path>', 'The name of the package to fork.')
    .argument('<package-name>', 'The name of the new package.')
    .action(async (packagePath, packageName) => {
      const { default: fork } = await import('./fork.js')
      await fork({ packagePath, toPackageSlug: packageName })
    })
)

program.addCommand(
  new Command('regenerate-api-key')
    .description('Request a new API Key.')
    .action(async () => {
      const { default: regeneratePackageApiKey } = await import('./regenerate.js')
      await regeneratePackageApiKey()
    })
)

program.addCommand(
  new Command('install')
    .description('Install a new package.')
    .argument('<package-path>', 'The name of the package to install.')
    .option('-f, --force', 'Force install the package.', false)
    .action(async (packagePath, { force }) => {
      const { default: install } = await import('./install.js')
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
      const { default: pull } = await import('./pull.js')
      await pull()
    })
)

program.addCommand(
  new Command('watch')
    .description('Watch for changes.')
    .action(async () => {
      const { watch } = await import('./deploy.js')
      await watch()
    })
)

program.addCommand(
  new Command('ls')
    .description('List existing packages.')
    .action(async () => {
      const { default: list } = await import('./list.js')
      await list()
    })
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
      const { default: describe } = await import('./describe.js')
      await describe({ model })
    })
)

if (2 in process.argv === false) {
  program.help()
}

await program.parseAsync(process.argv)
