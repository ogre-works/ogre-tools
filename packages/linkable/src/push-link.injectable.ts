import { getInjectable } from '@ogre-tools/injectable';
import { workingDirectoryInjectable } from './shared/working-directory.injectable';
import { publishYalcPackageInjectable } from './publish-yalc-package.injectable';
import { addYalcPackagesInjectable } from './add-yalc-packages.injectable';
import { pipeline } from '@ogre-tools/fp';
import { consoleLogInjectable } from './console-log.injectable';
import { consoleWarnInjectable } from './console-warn.injectable';
import { readJsonFileInjectable } from './shared/fs/read-json-file.injectable';
import { resolvePathInjectable } from './shared/path/resolve-path.injectable';
import { PackageJson } from 'type-fest';

export type PushLink = () => Promise<void>;

export const pushLinkInjectable = getInjectable({
  id: 'push-link',

  instantiate: (di): PushLink => {
    const workingDirectory = di.inject(workingDirectoryInjectable);
    const publishYalcPackage = di.inject(publishYalcPackageInjectable);
    const readJsonFile = di.inject(readJsonFileInjectable);
    const resolvePath = di.inject(resolvePathInjectable);

    const getLockFileProblemsUsingGloballyOverwrittenLogging = di.inject(
      getLockFileProblemsUsingGloballyOverwrittenLoggingInjectable,
    );

    const logAboutLockFileProblems = di.inject(
      logAboutLockFileProblemsInjectable,
    );

    const tryFixLockFileProblems = di.inject(tryFixLockFileProblemsInjectable);

    const pushPackage = di.inject(pushPackageInjectable);

    return async () => {
      const packageJsonPath = resolvePath(workingDirectory, 'package.json');
      const packageJson = (await readJsonFile(packageJsonPath)) as PackageJson;
      checkForYalcCompliantPaths(packageJson);

      const lockFileProblems =
        await getLockFileProblemsUsingGloballyOverwrittenLogging(pushPackage);

      await pipeline(
        lockFileProblems,
        logAboutLockFileProblems,
        tryFixLockFileProblems,
      );
    };
  },
});

const checkForYalcCompliantPaths = (packageJson: PackageJson) => {
  if (packageJson.main?.startsWith('./')) {
    throw new Error(
      `Tried to linkable push "${packageJson.name}", but property "main" in package.json started with "./". Please remove the prefix to satisfy yalc.`,
    );
  }

  const illFormattedFiles = packageJson.files?.filter(file =>
    file.startsWith('./'),
  );

  if (illFormattedFiles.length) {
    throw new Error(
      `Tried to linkable push "${
        packageJson.name
      }", but property "files" in package.json has items starting with "./": "${illFormattedFiles.join(
        '", "',
      )}". Please remove the prefixes to satisfy yalc.`,
    );
  }
};

type LockFileProblem = { moduleName: string; targetDirectory: string };

const getLockFileProblem = ([message]: string[]): LockFileProblem | undefined =>
  message.match(
    /^Removing installation of (?<moduleName>.+?) in (?<targetDirectory>.+?)$/,
  )?.groups as LockFileProblem | undefined;

const isLockFileWarning = ([message]: string[]): boolean =>
  !!message.match(
    /^Did not find package (?<moduleName>.+?) in lockfile, please use 'add' command to add it explicitly\.$/,
  );

export const getLockFileProblemsUsingGloballyOverwrittenLoggingInjectable =
  getInjectable({
    id: 'get-lock-file-problems-using-globally-overwritten-logging',

    instantiate: di => {
      const consoleLog = di.inject(consoleLogInjectable);
      const consoleWarn = di.inject(consoleWarnInjectable);
      const lockFileProblems: LockFileProblem[] = [];

      return async callback => {
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

        await callback();

        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;

        return lockFileProblems;
      };
    },
  });

export const logAboutLockFileProblemsInjectable = getInjectable({
  id: 'log-about-lock-file-problems',
  instantiate: di => {
    const consoleLog = di.inject(consoleLogInjectable);

    return problems => {
      problems.forEach(problem => {
        consoleLog(
          `Encountered corrupted yalc.lock in ${problem.targetDirectory}, resolving automatically by adding ${problem.moduleName}.`,
        );
      });

      return problems;
    };
  },
});

export const tryFixLockFileProblemsInjectable = getInjectable({
  id: 'try-fix-lock-file-problems',
  instantiate: di => {
    const addYalcPackages = di.inject(addYalcPackagesInjectable);

    return async problems => {
      for (let problem of problems) {
        await addYalcPackages([problem.moduleName], {
          link: true,
          workingDir: problem.targetDirectory,
          pure: false,
        });
      }
    };
  },
});

export const pushPackageInjectable = getInjectable({
  id: 'push-package',

  instantiate: di => {
    const publishYalcPackage = di.inject(publishYalcPackageInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return () =>
      publishYalcPackage({
        push: true,
        workingDir: workingDirectory,
      });
  },
});
