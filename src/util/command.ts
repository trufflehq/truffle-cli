import { Command as BaseCommand } from 'commander'
import { kApiUrl, kProfile } from "../di/tokens.js"
import { container } from "tsyringe"
import { getCliConfig } from './config.js';
import { defaultCliConfig } from '../assets/default-config.js';

export class Command extends BaseCommand {
  public action (fn: (...args: any[]) => void | Promise<void>): this {
    // wrap around the function to extract the last element from the args array
    // which is the global flags object

    return super.action((...args: any[]) => {
      const globalOptions = (args[args.length - 1] as Command).parent!.opts();
      const cliConfig = getCliConfig()

      // set the profile in the container
      const profile = globalOptions.profile
      container.register(kProfile, { useValue: profile ?? false })

      // set the apiUrl in the container
      const apiUrl = globalOptions.apiUrl ?? cliConfig.apiUrl ?? defaultCliConfig.apiUrl
      container.register(kApiUrl, { useValue: apiUrl })

      return fn(...args)
    })
  }
}