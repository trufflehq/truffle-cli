import { packageJson } from './package-json';

export const defaultAppConfig = ({
  orgSlug,
  appSlug,
  appName,
}: {
  orgSlug: string;
  appSlug: string;
  appName: string;
}) => ({
  raw: `export default {
  path: '@${orgSlug}/${appSlug}',
  name: '${appName}',
  cliVersion: '${packageJson.version}'
};`,
  json: {
    path: `@${orgSlug}/${appSlug}`,
    name: appName,
    cliVersion: packageJson.version,
  },
});
