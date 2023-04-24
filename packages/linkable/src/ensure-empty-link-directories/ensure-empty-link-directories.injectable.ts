import { awaitAll } from "../await-all";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJsonAndPath } from "../shared/package-json-and-path";

import { getInjectable } from "@ogre-tools/injectable";
import { ensureEmptyDirectoryInjectable } from "../shared/fs/ensure-empty-directory.injectable";
import { getLinkDirectoryInjectable } from "./get-link-directory.injectable";

export type EnsureEmptyLinkDirectories = (packageJsons: PackageJsonAndPath[]) => Promise<void>;

export const ensureEmptyLinkDirectoriesInjectable = getInjectable({
  id: "ensure-empty-link-directories",

  instantiate: (di): EnsureEmptyLinkDirectories => {
    const getLinkDirectory = di.inject(getLinkDirectoryInjectable);
    const ensureEmptyDirectory = di.inject(ensureEmptyDirectoryInjectable);

    return async (packageJsons: PackageJsonAndPath[]) => {
      await pipeline(
        packageJsons,
        map(({ content: { name } }) => getLinkDirectory(name)),
        map(ensureEmptyDirectory),
        awaitAll,
      );
    };
  },
});
