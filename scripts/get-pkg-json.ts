import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = readFileSync(packageJsonPath, 'utf-8');
const tsFileContent = `export const packageJson = ${packageJson.trim()} as const;`;
writeFileSync(
  path.resolve(__dirname, '../src/constants/package-json.ts'),
  tsFileContent,
  'utf-8',
);
