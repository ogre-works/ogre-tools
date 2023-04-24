import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";

export type Stat = typeof fse.stat;

const statInjectable = getInjectable({
  id: "stat",
  instantiate: () => fse.stat,
});

export default statInjectable;
