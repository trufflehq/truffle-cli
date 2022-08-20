import { packageFork } from '../util/package.js';
import { apiKeyCreate } from '../util/api-key.js';
import clone from './clone.js';
export default async function fork({ packagePath, toPackageSlug }) {
    const pkg = await packageFork({ packagePath, toPackageSlug });
    const packageVersionId = pkg.latestPackageVersionId;
    const apiKeyPayload = await apiKeyCreate({ type: 'secret', sourceType: 'package', sourceId: pkg.id });
    await clone({
        packageVersionId,
        toPackageSlug,
        shouldCreateConfigFile: true,
        secretKey: apiKeyPayload.apiKey.key
    });
}
//# sourceMappingURL=fork.js.map