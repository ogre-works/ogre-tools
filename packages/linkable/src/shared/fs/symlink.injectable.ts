import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type Symlink = typeof fse.symlink;

export const symlinkInjectable = getInjectable({
  id: "symlink",
  instantiate: (): Symlink => fse.symlink,
});
