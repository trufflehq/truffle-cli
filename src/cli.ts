#!/usr/bin/env -S node --experimental-modules --experimental-import-meta-resolve --experimental-network-imports --no-warnings
// NOTE: `#!/usr/bin/env -S node` will break Windows (the -S). It screws w/ how npm generates ps1/cmd files (it looks at first word after /usr/bin/env)
// Unfortunately the -S is necessary for linux to parse the additional flags
// TODO: figure out a solution that can work for both
import 'reflect-metadata';

import { program } from 'commander';
import { Command } from './util/command.js';
import truffleCli from '../package.json' assert { type: 'json' };
import { readCliConfig, registerCliConfig } from './util/config.js';
import { defaultCliConfig } from './assets/default-config.js';
import { actionLoader } from './util/action-loader.js';
import { DEFAULT_APP_CONFIG_FILE_NAME } from './util/app.js';

program
  .name(truffleCli.name)
  .description(truffleCli.description)
  .version(truffleCli.version, '-v, --version')
  .option(
    '-p, --profile <name>',
    'The profile from your Truffle config file to use.'
  )
  .option(
    '--apiUrl <url>',
    `The Mycelium API URL to use, default: "${defaultCliConfig.apiUrl}"`
  )
  .option('--org <org-id>', 'The id of the org to use for this command.');

program.addCommand(
  new Command('login')
    .description('Login in to truffle.')
    .argument('[email]', 'Email to login with')
    .argument('[password]', 'Password to login with')
    .action(actionLoader('commands/login/login.js'))
);

program.addCommand(
  new Command('org')
    .description('Manage orgs')
    .addCommand(
      new Command('use')
        .description('Set the current org to use.')
        .argument('<slug-or-id>', 'The slug or the id of the org to use.')
        .action(actionLoader('commands/org/use.js'))
    )
    .addCommand(
      new Command('create')
        .description('Creates a new org')
        .argument('<org-name>', 'Name of the org to create')
        .action(actionLoader('commands/org/create.js'))
    )
    .addCommand(
      new Command('join')
        .description('Join an existing org')
        .action(actionLoader('commands/org/join.js'))
    )
);

program.addCommand(
  new Command('user')
    .description('Manage users')
    .addCommand(
      new Command('create')
        .description('Creates a new user')
        .argument('[email]', 'Email of the user to create')
        .argument('[password]', 'Password of the user to create')
        .action(actionLoader('commands/user/create.js'))
    )
);

program.addCommand(
  new Command('whoami')
    .description('Check your authentication status')
    .alias('me')
    .action(actionLoader('commands/whoami.js'))
);

program.addCommand(
  new Command('app')
    .description('Operations on your Truffle Apps')
    .addCommand(
      new Command('create')
        .description('Create a new Truffle App')
        .argument('<app-slug>', 'Slug of the app to create')
        .action(actionLoader('commands/app/create.js'))
    )
    .addCommand(
      new Command('clone')
        .description(
          `Retrieve the config for an existing Truffle App and write it to ${DEFAULT_APP_CONFIG_FILE_NAME}`
        )
        .argument(
          '<app-path|app-slug>',
          'The path or the slug of the app to clone'
        )
        .action(actionLoader('commands/app/clone.js'))
    )
    .addCommand(
      new Command('list')
        .description('List all Truffle Apps in this org')
        .action(actionLoader('commands/app/list.js'))
    )
    .addCommand(
      new Command('deploy')
        .description(`Deploy a new version of ${DEFAULT_APP_CONFIG_FILE_NAME}`)
        .action(actionLoader('commands/app/deploy.js'))
    )
    .addCommand(
      new Command('install')
        .description('Install a Truffle App to the current org')
        .argument('<app-path>', 'Path of the app to install')
        .action(actionLoader('commands/app/install.js'))
    )
);

if (2 in process.argv === false) {
  program.help();
}

(async () => {
  // load the cli config into memory
  const cliConfig = readCliConfig();
  registerCliConfig(cliConfig);

  await program.parseAsync(process.argv);
})();
