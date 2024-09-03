import { getInjectable } from '@ogre-tools/injectable';
import glob from 'fast-glob';

export type Glob = typeof glob;

export const globInjectable = getInjectable({
  id: 'glob',
  instantiate:
    /* c8 ignore next */
    (): Glob => glob,
});
