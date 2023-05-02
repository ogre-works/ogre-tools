import type { AsyncFnMock } from '@async-fn/jest';
import asyncFn from '@async-fn/jest';
import type { PushLink } from './push-link.injectable';
import { pushLinkInjectable } from './push-link.injectable';
import { getDi } from './get-di';
import {
  PublishYalcPackage,
  publishYalcPackageInjectable,
} from './publish-yalc-package.injectable';
import { getPromiseStatus } from '@ogre-tools/test-utils';
import { workingDirectoryInjectable } from './shared/working-directory.injectable';

describe('push-links', () => {
  let pushLink: PushLink;
  let publishYalcPackageMock: AsyncFnMock<PublishYalcPackage>;

  beforeEach(() => {
    const di = getDi();

    publishYalcPackageMock = asyncFn();
    di.override(publishYalcPackageInjectable, () => publishYalcPackageMock);
    di.override(workingDirectoryInjectable, () => 'some-working-directory');

    pushLink = di.inject(pushLinkInjectable);
  });

  describe('when called', () => {
    let actualPromise: Promise<void>;

    beforeEach(() => {
      actualPromise = pushLink();
    });

    it('publishes yalc package', () => {
      expect(publishYalcPackageMock).toHaveBeenCalledWith({
        workingDir: 'some-working-directory',
        push: true,
      });
    });

    it('does not resolve yet', async () => {
      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it('when publish resolves, ends script', async () => {
      publishYalcPackageMock.resolve();

      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(true);
    });

    it('when publish resolves, ends script', async () => {
      publishYalcPackageMock.resolve();

      const promiseStatus = await getPromiseStatus(actualPromise);

      expect(promiseStatus.fulfilled).toBe(true);
    });
  });
});
