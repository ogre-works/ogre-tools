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

import {
  AddYalcPackages,
  addYalcPackagesInjectable,
} from './add-yalc-packages.injectable';

import { ConsoleLog, consoleLogInjectable } from './console-log.injectable';
import { ConsoleWarn, consoleWarnInjectable } from './console-warn.injectable';

describe('push-links', () => {
  let pushLink: PushLink;
  let publishYalcPackageMock: AsyncFnMock<PublishYalcPackage>;
  let addYalcPackagesMock: AsyncFnMock<AddYalcPackages>;
  let consoleLogMock: jest.Mock<ConsoleLog>;
  let consoleWarnMock: jest.Mock<ConsoleWarn>;
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;

    const di = getDi();

    publishYalcPackageMock = asyncFn();
    di.override(publishYalcPackageInjectable, () => publishYalcPackageMock);
    di.override(workingDirectoryInjectable, () => 'some-working-directory');

    addYalcPackagesMock = asyncFn();
    di.override(addYalcPackagesInjectable, () => addYalcPackagesMock);

    consoleLogMock = jest.fn();
    di.override(consoleLogInjectable, () => consoleLogMock);

    consoleWarnMock = jest.fn();
    di.override(consoleWarnInjectable, () => consoleWarnMock);

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

    describe('given there are no missing packages in yalc-lockfiles of targets of publish, when publish resolves', () => {
      beforeEach(async () => {
        await publishYalcPackageMock.resolve();
      });

      it('ends script', async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(true);
      });

      it('does not add packages', () => {
        expect(addYalcPackagesMock).not.toHaveBeenCalled();
      });

      it('does not log', () => {
        expect(consoleLogMock).not.toHaveBeenCalled();
      });

      it('does not warn', () => {
        expect(consoleWarnMock).not.toHaveBeenCalled();
      });

      it('global console.log is restored to normal', () => {
        expect(console.log).toBe(originalConsoleLog);
      });

      it('global console.warn is restored to normal', () => {
        expect(console.warn).toBe(originalConsoleWarn);
      });
    });

    describe('given there are missing packages in yalc-lockfiles of targets of publish, when publish resolves', () => {
      beforeEach(async () => {
        console.warn(
          "Did not find package some-package in lockfile, please use 'add' command to add it explicitly.",
        );

        console.log(
          'Removing installation of some-package in /some/target-package/directory',
        );

        console.log(
          'Removing installation of some-package in /some-other/target-package/directory',
        );

        console.log('Some irrelevant logging');
        console.warn('Some irrelevant warning');

        await publishYalcPackageMock.resolve();
      });

      it('console.logs only the messages without custom handling', () => {
        expect(consoleLogMock.mock.calls).toEqual([
          ['Some irrelevant logging'],

          [
            'Encountered corrupted yalc.lock in /some/target-package/directory, resolving automatically by adding some-package.',
          ],

          [
            'Encountered corrupted yalc.lock in /some-other/target-package/directory, resolving automatically by adding some-package.',
          ],
        ]);
      });

      it('console.warns only the messages without custom handling', () => {
        expect(consoleWarnMock.mock.calls).toEqual([
          ['Some irrelevant warning'],
        ]);
      });

      it('does not end script yet', async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it('global console.log is restored to normal', () => {
        expect(console.log).toBe(originalConsoleLog);
      });

      it('global console.warn is restored to normal', () => {
        expect(console.warn).toBe(originalConsoleWarn);
      });

      it('calls for adding the first missing package', async () => {
        expect(addYalcPackagesMock.mock.calls).toEqual([
          [
            ['some-package'],
            {
              link: true,
              pure: false,
              workingDir: '/some/target-package/directory',
            },
          ],
        ]);
      });

      it('when add of first missing package resolves, adds the next one', async () => {
        addYalcPackagesMock.mockClear();

        await addYalcPackagesMock.resolve();

        expect(addYalcPackagesMock.mock.calls).toEqual([
          [
            ['some-package'],
            {
              link: true,
              pure: false,
              workingDir: '/some-other/target-package/directory',
            },
          ],
        ]);
      });

      it('when adding all the packages resolves, resolves', async () => {
        await addYalcPackagesMock.resolve();
        await addYalcPackagesMock.resolve();

        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(true);
      });
    });
  });
});
