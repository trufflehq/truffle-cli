import fs from 'fs';
import path from 'path';
import os from 'os';
export function getConfigFilename() {
    return path.resolve(os.homedir(), path.normalize('.truffle/config.json'));
}
export function getGlobalConfig() {
    return JSON.parse(fs.readFileSync(getConfigFilename()).toString('utf-8'));
}
export async function getPublicPackageConfig() {
    const publicConfig = await getPackageConfigJson('truffle.config');
    if (!publicConfig) {
        console.log('package config not found, make sure truffle.config.mjs or truffle.config.js exists');
        return;
    }
    if (publicConfig.default.secretKey) {
        throw new Error('Secret key must go in truffle.secret.js');
    }
    return { ...publicConfig.default };
}
export async function getPackageConfig() {
    const publicConfig = await getPackageConfigJson('truffle.config');
    const secretConfig = await getPackageConfigJson('truffle.secret');
    if (!publicConfig || !secretConfig) {
        return;
    }
    if (publicConfig.default.secretKey) {
        throw new Error('Secret key must go in truffle.secret.js');
    }
    return { ...publicConfig.default, ...secretConfig.default };
}
async function getPackageConfigJson(prefix) {
    let config;
    try {
        config = await import(new URL(`file://${path.join(process.cwd(), `/${prefix}.js`)}`).href);
    }
    catch {
        try {
            config = await import(new URL(`file://${path.join(process.cwd(), `/${prefix}.mjs`)}`).href);
        }
        catch { }
    }
    return config;
}
//# sourceMappingURL=config.js.map