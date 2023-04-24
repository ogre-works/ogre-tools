import { getInjectable } from "@ogre-tools/injectable";
import { workingDirectoryInjectable } from "../shared/working-directory.injectable";
import { resolvePathInjectable } from "../shared/path/resolve-path.injectable";

export const getLinkDirectoryInjectable = getInjectable({
  id: "get-link-directory",

  instantiate: (di) => {
    const resolvePath = di.inject(resolvePathInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return (moduleName: string) => resolvePath(workingDirectory, "node_modules", moduleName);
  },
});
