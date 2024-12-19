import '../shared/src/types';

import { join } from 'path';
import {
  readdir,
  readFile,
  stat,
  writeFile,
} from 'fs/promises';
import { keepProcessAlive } from './utils/keepProcessAlive';
import {isDebuggerAttached } from './utils/isDebuggerAttached';
import { sortBy } from 'lodash';
const packageRoot = join(__dirname, '../..');
const nodeModulesRoot = join(packageRoot, 'node_modules');
const dependenciesJsonPath = join(packageRoot, 'packages/client/src/util/dependencies.json');
const packageLockPath = join(packageRoot, 'package-lock.json');

function extractAuthor(author: PackageJson['author']) {
  if (typeof author === 'string') {
    return author;
  }
  if (typeof author !== 'object' || author === null) {
    return undefined;
  }
  return author.name;
}

function extractContributors(contributors: PackageJson['contributors'] | undefined) {
  if (contributors === undefined) {
    return undefined;
  }

  return (
    Array.isArray(contributors)
      ? contributors
      : [ contributors ]
  ).map(extractAuthor);
}

function extractHomepage(name: string, homepage: string | undefined) {
  return homepage ?? `https://www.npmjs.com/package/${name}`;
}

function extractLicense(licenseOrLicenses: string | string[] | PackageJsonLicense | PackageJsonLicense[] | undefined): string {
  if (licenseOrLicenses === undefined) {
    return 'undefined';
  }
  if (typeof licenseOrLicenses === 'string') {
    return licenseOrLicenses;
  }
  if (Array.isArray(licenseOrLicenses)) {
    return licenseOrLicenses.map(extractLicense).join(' OR ');
  }
  if ('type' in licenseOrLicenses) {
    return licenseOrLicenses.type;
  }
  // nothing we recognize, force license failure
  return `Unrecognized license format: ${JSON.stringify(licenseOrLicenses)}`;
}

async function testNeedToRegenerate() {
  try {

    if (isDebuggerAttached()) {
      return true;
    }
    const dependenciesStat = await stat(dependenciesJsonPath);
    const packageLockStat = await stat(packageLockPath);

    return dependenciesStat.mtimeMs < packageLockStat.mtimeMs;
  } catch {
    return true;
  }
}

async function loadPackageJson(jsonPath: string): Promise<PackageJson> {
  const fileContent = await readFile(join(nodeModulesRoot, jsonPath), 'utf8');
  return JSON.parse(fileContent);
}

export async function generateAttributions() {

  const needToRegenerate = await testNeedToRegenerate();
  if (!needToRegenerate) {
    console.log('dependencies.json is already up-to-date.');
    return;
  }

  console.log('Searching for package.json files.');
  const allNodeModuleFiles = await readdir(nodeModulesRoot, { recursive: true })
  const allPackagePaths = allNodeModuleFiles.filter(p => /(^[^\/]+|\/node_modules\/[^\/]+)\/package\.json$/.test(p));
  console.log(`Found ${ allPackagePaths.length } package.json files; loading them.`);
  const allPackages = await Promise.all(allPackagePaths.map(loadPackageJson));
  const packagesWeCareAbout = allPackages.filter(p => p?.name !== undefined && !p.name.startsWith('@waterlily/'));
  console.log(`Found ${ packagesWeCareAbout.length } package.json files that represent libraries; creating dependencies list.`);
  const dependencies = packagesWeCareAbout.map(
    ({
      name,
      description,
      version,
      homepage,
      license,
      licenses,
      author,
      contributors
    }) => {
      return ({
        name,
        description,
        version,
        homepage: extractHomepage(name, homepage),
        license: extractLicense(license ?? licenses),
        author: extractAuthor(author),
        contributors: extractContributors(contributors)
      })
    }
  );

  if(dependencies.length === 0) {
    throw new Error(`Found no dependencies.
      packageRoot: ${ packageRoot }
      nodeModulesRoot: ${nodeModulesRoot }
      dependenciesJsonPath: ${ dependenciesJsonPath }
      packageLockPath: ${ packageLockPath }
    `);
  }

  const sortedDependencies = sortBy(dependencies, dep => dep.name);

  console.log(`Generated dependencies.json with ${sortedDependencies.length} dependencies.`);

  await writeFile(
    dependenciesJsonPath,
    JSON.stringify(sortedDependencies, undefined, 2),
  );
}

if (require.main === module) {
  keepProcessAlive(generateAttributions);
}
