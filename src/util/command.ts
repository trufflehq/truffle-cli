import { Command as BaseCommand } from 'commander';
import { kApiUrl, kCurrentOrg } from '../di/tokens';
import { container } from 'tsyringe';
import { getCliConfig } from './cli-config';
import { defaultCliConfig } from '../assets/default-config';

export class Command extends BaseCommand {
  public action(fn: (...args: any[]) => void | Promise<void>): this {
    // wrap around the function to extract the last element from the args array
    // which is the global flags object

    return super.action((...args: any[]) => {
      // get the top level cli command
      const getRootCommand = () => {
        let parent = (args[args.length - 1] as Command).parent!;
        while (parent?.parent) {
          parent = parent.parent;
        }
        return parent;
      };

      const globalOptions = getRootCommand().opts();
      const cliConfig = getCliConfig();

      // set the apiUrl in the container
      const apiUrl =
        globalOptions.apiUrl ?? cliConfig.apiUrl ?? defaultCliConfig.apiUrl;
      container.register(kApiUrl, { useValue: apiUrl });

      // set the current org in the container
      const currentOrg =
        globalOptions.org ?? cliConfig.currentOrgs[apiUrl] ?? false;
      container.register(kCurrentOrg, { useValue: currentOrg });

      return fn(...args);
    });
  }
}
