/* eslint-disable camelcase */
import chalk from "chalk";
import { getPackageConfig } from "../../util/config.js";
import { fetchFunction, fetchFunctionLogs } from "../../util/functions.js";
export default async function logs({ functionName, all } = {}) {
    const pkgConfig = await getPackageConfig();
    if (!pkgConfig?.functions) {
        console.log(chalk.red(`Package config file not found, make sure truffle.config.mjs exists`));
        return;
    }
    const funcs = [];
    if (functionName) {
        const func = await fetchFunction(functionName);
        if (!func) {
            throw new Error(`Function ${functionName} not found.`);
        }
        funcs.push(func);
    }
    else if (all) {
        for (const fn of pkgConfig.functions) {
            const func = await fetchFunction(fn.slug);
            if (!func) {
                throw new Error(`Function ${fn.slug} not found.`);
            }
            funcs.push(func);
        }
    }
    if (!funcs.length) {
        throw new Error(`No functions found.`);
    }
    console.log(chalk.green(`Fetching logs for ${funcs.length} function(s)`));
    for (const func of funcs) {
        console.log(chalk.green(`- ${func.slug} (${func.id})`));
    }
    const isLog = (e) => e.eventType === "log";
    const isBoot = (e) => e.eventType === "boot";
    const done = new Set();
    const logFetch = async (after) => {
        const res = await fetchFunctionLogs(funcs.map((func) => func.id), after);
        for (const log of res.nodes) {
            if (done.has(log.id))
                continue;
            done.add(log.id);
            const func = funcs.find((func) => func.id === log.functionId);
            if (isLog(log)) {
                console.log(chalk.white(`[${func?.slug}] [${log.body.level.toUpperCase()}] ${log.body.msg}`));
            }
            if (isBoot(log)) {
                console.log(chalk.magenta(`[${func?.slug}] Booted in ${log.body.boot_time}s`));
            }
        }
    };
    await logFetch();
    setInterval(() => logFetch(), 2000);
}
//# sourceMappingURL=logs.js.map