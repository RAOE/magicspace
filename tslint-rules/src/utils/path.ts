import * as FS from 'fs';
import * as Path from 'path';

const KNOWN_MODULE_EXTENSION_REGEX = /\.(?:jsx?|tsx?)$/i;

export function removeQuotes(value: string): string {
  let groups = /^(['"])(.*)\1$/.exec(value);
  return groups ? groups[2] : '';
}

export function removeModuleFileExtension(fileName: string): string {
  return fileName.replace(/\.(?:(?:js|ts)x?|d\.ts)?$/i, '');
}

export function hasKnownModuleExtension(fileName: string): boolean {
  return KNOWN_MODULE_EXTENSION_REGEX.test(fileName);
}

export function getBaseNameWithoutExtension(fileName: string): string {
  return Path.basename(fileName, Path.extname(fileName));
}

export function searchProjectRootDir(from: string, searchName: string): string {
  let nextDir = from;

  while (true) {
    let currentDir = nextDir;

    let searchPath = Path.join(currentDir, searchName);

    if (FS.existsSync(searchPath)) {
      return currentDir;
    }

    nextDir = Path.dirname(currentDir);

    if (nextDir === currentDir) {
      throw new Error(
        `Cannot find base url directory by search name "${searchName}"`,
      );
    }
  }
}

export function getInBaseURLOfModulePath(
  path: string,
  baseURL: string,
  sourcefileName: string,
  baseURLDirSearchName: string,
): {ok: boolean; parsedModulePath: string} {
  let modulePath = path;

  if (/^\.{1,2}[\\/]/.test(path)) {
    return {ok: false, parsedModulePath: ''};
  }

  let rootPath = searchProjectRootDir(sourcefileName, baseURLDirSearchName);

  modulePath = Path.join(rootPath, baseURL, modulePath);

  if (!Path.isAbsolute(modulePath)) {
    modulePath = Path.resolve(modulePath);
  }

  let baseURLOfAbsolute = Path.join(rootPath, baseURL);

  return {
    ok: !/^\.{2}\/?/.test(Path.relative(baseURLOfAbsolute, modulePath)),
    parsedModulePath: modulePath,
  };
}
