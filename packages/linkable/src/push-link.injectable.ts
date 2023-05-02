import { getInjectable } from '@ogre-tools/injectable';
import { workingDirectoryInjectable } from './shared/working-directory.injectable';
import { publishYalcPackageInjectable } from './publish-yalc-package.injectable';

export type PushLink = () => Promise<void>;

export const pushLinkInjectable = getInjectable({
  id: 'push-link',
  instantiate: (di): PushLink => {
    const workingDirectory = di.inject(workingDirectoryInjectable);
    const publishYalcPackage = di.inject(publishYalcPackageInjectable);

    return () =>
      publishYalcPackage({ push: true, workingDir: workingDirectory });
  },
});
