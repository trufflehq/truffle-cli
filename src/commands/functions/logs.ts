/* eslint-disable camelcase */
import chalk from "chalk"
import { getPackageConfig } from "../../util/config.js"
import { fetchFunction, fetchFunctionLogs } from "../../util/functions.js"

type FetchedLog<T extends string, D extends Record<string, unknown>> = Omit<
  Awaited<ReturnType<typeof fetchFunctionLogs>>["nodes"][0],
  "eventType" | "body"
> & { eventType: T; body: D };
type LogEvent = FetchedLog<
  "log",
  { msg: string; level: "info" | "warning" | "error" | "debug" }
>;
type BootEvent = FetchedLog<"boot", { boot_time: number }>;
type BootFailureEvent = FetchedLog<"bootFailure", { msg: number }>;
type UncaughExceptionEvent = FetchedLog<
  "uncaughException",
  { exception: string }
>;
type MemoryLimitEvent = FetchedLog<"memoryLimit", Record<never, never>>;
type TimeLimitEvent = FetchedLog<"timeLimit", Record<never, never>>;
type Event =
  | BootEvent
  | BootFailureEvent
  | UncaughExceptionEvent
  | MemoryLimitEvent
  | TimeLimitEvent
  | LogEvent;

export default async function logs ({
  functionName,
  all
}: { functionName?: string; all?: boolean } = {}) {
  const pkgConfig = await getPackageConfig()
  if (!pkgConfig?.functions) {
    console.log(
      chalk.red(
        `Package config file not found, make sure truffle.config.mjs exists`
      )
    )
    return
  }

  const funcs: Awaited<ReturnType<typeof fetchFunction>>[] = []
  if (functionName) {
    const func = await fetchFunction(functionName)
    if (!func) {
      throw new Error(`Function ${functionName} not found.`)
    }
    funcs.push(func)
  } else if (all) {
    for (const fn of pkgConfig!.functions) {
      const func = await fetchFunction(fn.slug)
      if (!func) {
        throw new Error(`Function ${fn.slug} not found.`)
      }
      funcs.push(func)
    }
  }

  if (!funcs.length) {
    throw new Error(`No functions found.`)
  }

  console.log(chalk.green(`Fetching logs for ${funcs.length} function(s)`))
  for (const func of funcs) {
    console.log(chalk.green(`- ${func.slug} (${func.id})`))
  }

  const isLog = (e: Event): e is LogEvent => e.eventType === "log"
  const isBoot = (e: Event): e is BootEvent => e.eventType === "boot"

  const done = new Set<string>()
  const logFetch = async (after?: string) => {
    const res = await fetchFunctionLogs(
      funcs.map((func) => func.id),
      after
    )
    for (const log of res.nodes as Event[]) {
      if (done.has(log.id)) continue
      done.add(log.id)
      const func = funcs.find((func) => func.id === log.functionId)

      if (isLog(log)) {
        console.log(chalk.white(`[${func?.slug}] [${log.body.level.toUpperCase()}] ${log.body.msg}`))
      }

      if (isBoot(log)) {
        console.log(chalk.magenta(`[${func?.slug}] Booted in ${log.body.boot_time}s`))
      }
    }
  }
  await logFetch()
  setInterval(() => logFetch(), 2000)
}
