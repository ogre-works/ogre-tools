import { getInjectable } from '@ogre-tools/injectable';
import { dirname } from 'path';
import { ensureDirectoryInjectable } from '../ensure-directory.injectable';
import { symlinkInjectable } from '../symlink.injectable';
import statInjectable from '../stat.injectable';
import { pipeline } from '@ogre-tools/fp';

export type CreateSymlink = (config: {
  target: string;
  source: string;
}) => Promise<void>;

export const createSymlinkInjectable = getInjectable({
  id: 'create-symlink',

  instantiate: (di): CreateSymlink => {
    const ensureDirectory = di.inject(ensureDirectoryInjectable);
    const stat = di.inject(statInjectable);
    const symlink = di.inject(symlinkInjectable);

    return async ({ target, source }) => {
      await pipeline(source, dirname, ensureDirectory);

      const { isDirectory } = await stat(target);

      const dirOrFile = isDirectory() ? 'dir' : 'file';

      return symlink(target, source, dirOrFile);
    };
  },
});
