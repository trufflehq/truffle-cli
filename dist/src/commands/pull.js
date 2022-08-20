import fs from 'fs';
import path from 'path';
import { packageVersionGet } from '../util/package-version.js';
export default async function clone() {
    const packageVersion = await packageVersionGet();
    console.log('module', JSON.stringify(packageVersion.moduleConnection.nodes, null, 2));
    packageVersion.moduleConnection.nodes.forEach((module) => {
        if (module.filename.startsWith('/truffle.config.')) {
            console.log('skipping config file');
            return;
        }
        const filename = `.${module.filename}`;
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(path.resolve(filename), module.code);
    });
}
//# sourceMappingURL=pull.js.map