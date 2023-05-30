import { getInjectable } from '@ogre-tools/injectable';
import { workingDirectoryInjectable } from './shared/working-directory.injectable';
import { publishYalcPackageInjectable } from './publish-yalc-package.injectable';
import { addYalcPackagesInjectable } from './add-yalc-packages.injectable';
import { pipeline } from '@ogre-tools/fp';
import { consoleLogInjectable } from './console-log.injectable';
import { consoleWarnInjectable } from './console-warn.injectable';

export type PushLink = () => Promise<void>;

export const pushLinkInjectable = getInjectable({
  id: 'push-link',
  instantiate: (di): PushLink => {
    const workingDirectory = di.inject(workingDirectoryInjectable);
    const publishYalcPackage = di.inject(publishYalcPackageInjectable);
    const addYalcPackages = di.inject(addYalcPackagesInjectable);
    const consoleLog = di.inject(consoleLogInjectable);
    const consoleWarn = di.inject(consoleWarnInjectable);

    return async () => {
      const lockFileProblems: LockFileProblem[] = [];

      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;

      console.log = (...messageArguments: string[]) => {
        const lockFileProblem = getLockFileProblem(messageArguments);

        if (lockFileProblem) {
          lockFileProblems.push(lockFileProblem);
          return;
        }

        consoleLog(...messageArguments);
      };

      console.warn = (...messageArguments: string[]) => {
        if (isLockFileWarning(messageArguments)) {
          return;
        }

        consoleWarn(...messageArguments);
      };

      await publishYalcPackage({
        push: true,
        workingDir: workingDirectory,
      });

      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;

      await pipeline(
        lockFileProblems,

        problems => {
          problems.forEach(problem => {
            consoleLog(
              `Encountered corrupted yalc.lock in ${problem.targetDirectory}, resolving automatically by adding ${problem.moduleName}.`,
            );
          });

          return problems;
        },

        async problems => {
          for (let problem of problems) {
            await addYalcPackages([problem.moduleName], {
              link: true,
              workingDir: problem.targetDirectory,
              pure: false,
            });
          }
        },
      );
    };
  },
});

type LockFileProblem = { moduleName: string; targetDirectory: string };

const getLockFileProblem = ([message]: string[]): LockFileProblem | undefined =>
  message.match(
    /^Removing installation of (?<moduleName>.+?) in (?<targetDirectory>.+?)$/,
  )?.groups as LockFileProblem | undefined;

const isLockFileWarning = ([message]: string[]): boolean =>
  !!message.match(
    /^Did not find package (?<moduleName>.+?) in lockfile, please use 'add' command to add it explicitly\.$/,
  );
