import { filter, flatten, map, partition, uniq, uniqBy } from "lodash/fp";
import type { PackageJsonAndPath } from "../shared/package-json-and-path";
import { globInjectable } from "../shared/fs/glob.injectable";
import { resolvePathInjectable } from "../shared/path/resolve-path.injectable";
import { awaitAll } from "../await-all";
import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { getLinkDirectoryInjectable } from "../ensure-empty-link-directories/get-link-directory.injectable";
import path from "path";
import { existsInjectable } from "../shared/fs/exists.injectable";

const shouldBeGlobbed = (possibleGlobString: string) => possibleGlobString.includes("*");
const simplifyGlobbing = new RegExp("(\\/\\*\\/\\*\\*|\\/\\*\\*|\\/\\*\\*\\/\\*|\\/\\*)$");
const toAvoidableGlobStrings = (reference: string) => reference.replace(simplifyGlobbing, "");

export const getSymlinkPathsInjectable = getInjectable({
  id: "get-symlink-paths",

  instantiate: (di) => {
    const glob = di.inject(globInjectable);
    const resolvePath = di.inject(resolvePathInjectable);
    const getLinkDirectory = di.inject(getLinkDirectoryInjectable);
    const exists = di.inject(existsInjectable);

    return async (packageJsons: PackageJsonAndPath[]) =>
      pipeline(
        packageJsons,

        map(async ({ packageJsonPath, content }) => {
          const linkDirectory = getLinkDirectory(content.name);

          const fileStrings = content.files.map(toAvoidableGlobStrings);

          const [toBeGlobbed, toNotBeGlobbed] = partition(shouldBeGlobbed)(fileStrings);

          const moduleDirectory = path.dirname(packageJsonPath);

          let globbeds: string[] = [];

          if (toBeGlobbed.length) {
            globbeds = await glob(toBeGlobbed, { cwd: moduleDirectory });
          }

          const notGlobbedFilesOrDirectories = await pipeline(
            toNotBeGlobbed,

            uniq,

            map(async (fileOrDirectory) => ({
              fileOrDirectory,
              exists: await exists(fileOrDirectory),
            })),

            awaitAll,

            filter(({ exists }) => exists),

            map(async ({ fileOrDirectory }) => {
              const target = resolvePath(moduleDirectory, fileOrDirectory);

              return {
                target,
                source: resolvePath(linkDirectory, fileOrDirectory),
              };
            }),

            awaitAll,
          );

          return [
            {
              target: packageJsonPath,
              source: resolvePath(linkDirectory, "package.json"),
            },

            ...globbeds.map((fileString) => ({
              target: resolvePath(moduleDirectory, fileString),
              source: resolvePath(linkDirectory, fileString),
            })),

            ...notGlobbedFilesOrDirectories,
          ];
        }),

        awaitAll,

        flatten,

        uniqBy((x) => x.source),
      );
  },
});
