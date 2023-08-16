import { getInjectable } from '@ogre-tools/injectable';
import fse from 'fs-extra';

export type Exists = (path: string) => Promise<boolean>;

export const existsInjectable = getInjectable({
  id: 'exists',
  instantiate:
    /* c8 ignore next */
    (): Exists => fse.pathExists,
});
