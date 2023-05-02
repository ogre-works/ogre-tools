import type { AsyncFnMock } from '@async-fn/jest';
import asyncFn from '@async-fn/jest';
import type { CreateLinks } from './create-links.injectable';
import { createLinksInjectable } from './create-links.injectable';
import { getPromiseStatus } from '@ogre-tools/test-utils';
import { posix } from 'path';
import type { Exists } from './shared/fs/exists.injectable';
import { existsInjectable } from './shared/fs/exists.injectable';
import type { ReadJsonFile } from './shared/fs/read-json-file.injectable';
import { readJsonFileWithoutErrorHandlingInjectable } from './shared/fs/read-json-file.injectable';
import type { WriteJsonFile } from './shared/fs/write-json-file.injectable';
import { writeJsonFileInjectable } from './shared/fs/write-json-file.injectable';
import { workingDirectoryInjectable } from './shared/working-directory.injectable';
import { resolvePathInjectable } from './shared/path/resolve-path.injectable';
import { getDi } from './get-di';
import type { Glob } from './shared/fs/glob.injectable';
import { globInjectable } from './shared/fs/glob.injectable';
import {
  AddYalcPackages,
  addYalcPackagesInjectable,
} from './add-yalc-packages.injectable';

describe('create-links', () => {
  let createLinks: CreateLinks;
  let existsMock: AsyncFnMock<Exists>;
  let readJsonFileMock: AsyncFnMock<ReadJsonFile>;
  let writeJsonFileMock: AsyncFnMock<WriteJsonFile>;
  let addYalcPackagesMock: AsyncFnMock<AddYalcPackages>;
  let globMock: AsyncFnMock<Glob>;

  beforeEach(() => {
    existsMock = asyncFn();
    readJsonFileMock = asyncFn();
    writeJsonFileMock = asyncFn();
    globMock = asyncFn();
    addYalcPackagesMock = asyncFn();

    const di = getDi();
    di.override(addYalcPackagesInjectable, () => addYalcPackagesMock);

    di.override(
      workingDirectoryInjectable,
      () => '/some-directory/some-project',
    );
    di.override(resolvePathInjectable, () => posix.resolve);
    di.override(existsInjectable, () => existsMock);
    di.override(
      readJsonFileWithoutErrorHandlingInjectable,
      () => readJsonFileMock,
    );
    di.override(writeJsonFileInjectable, () => writeJsonFileMock);
    di.override(globInjectable, () => globMock);

    createLinks = di.inject(createLinksInjectable);
  });

  describe('when called', () => {
    let actualPromise: Promise<void>;

    beforeEach(() => {
      actualPromise = createLinks();
    });

    it('checks for existence of config file', () => {
      expect(existsMock).toHaveBeenCalledWith(
        '/some-directory/some-project/.linkable.json',
      );
    });

    describe('given config file does not exist', () => {
      beforeEach(async () => {
        await existsMock.resolve(false);
      });

      it('creates it as empty', () => {
        expect(writeJsonFileMock).toHaveBeenCalledWith(
          '/some-directory/some-project/.linkable.json',
          [],
        );
      });

      it('does not read config file', () => {
        expect(readJsonFileMock).not.toHaveBeenCalled();
      });

      it('does not stop the script yet', async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it('when creation resolves, stops the script', async () => {
        await writeJsonFileMock.resolve();

        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(true);
      });
    });

    describe('given config file exists', () => {
      beforeEach(async () => {
        await existsMock.resolve(true);
      });

      it('does not create it again', () => {
        expect(writeJsonFileMock).not.toHaveBeenCalled();
      });

      it('reads config file', () => {
        expect(readJsonFileMock).toHaveBeenCalledWith(
          '/some-directory/some-project/.linkable.json',
        );
      });

      describe('when config file resolves as empty', () => {
        beforeEach(async () => {
          await readJsonFileMock.resolve([]);
        });

        it('stops the script', async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });

      describe('when config file resolves with module paths containing glob', () => {
        beforeEach(async () => {
          await readJsonFileMock.resolve([
            '../some-monorepo/packages/**/*',
            '../some-other-monorepo/packages/**/*',
          ]);
        });

        it('discovers the target module package.jsons using glob', () => {
          expect(globMock.mock.calls).toEqual([
            [
              '../some-monorepo/packages/**/*/package.json',

              {
                cwd: '/some-directory/some-project',
                ignore: ['**/node_modules/**/*'],
                absolute: true,
              },
            ],

            [
              '../some-other-monorepo/packages/**/*/package.json',
              {
                cwd: '/some-directory/some-project',
                ignore: ['**/node_modules/**/*'],
                absolute: true,
              },
            ],
          ]);
        });

        describe('when discovering resolves with package.jsons', () => {
          beforeEach(async () => {
            readJsonFileMock.mockClear();

            await globMock.resolve([
              '/some-directory/some-monorepo/packages/some-other-directory/some-module/package.json',
              '/some-directory/some-monorepo/packages/some-other-directory/some-other-module/package.json',
            ]);

            await globMock.resolve([]);
          });

          it('reads contents of package.jsons', () => {
            expect(readJsonFileMock.mock.calls).toEqual([
              [
                '/some-directory/some-monorepo/packages/some-other-directory/some-module/package.json',
              ],

              [
                '/some-directory/some-monorepo/packages/some-other-directory/some-other-module/package.json',
              ],
            ]);
          });
        });
      });

      describe('when config file resolves with module paths', () => {
        beforeEach(async () => {
          existsMock.mockClear();

          await readJsonFileMock.resolve([
            '../some-module',
            '/some-other-directory/some-other-module',
          ]);
        });

        it('discovers package.jsons using glob', () => {
          expect(globMock.mock.calls).toEqual([
            [
              '../some-module/package.json',

              {
                absolute: true,
                cwd: '/some-directory/some-project',
                ignore: ['**/node_modules/**/*'],
              },
            ],

            [
              '/some-other-directory/some-other-module/package.json',

              {
                absolute: true,
                cwd: '/some-directory/some-project',
                ignore: ['**/node_modules/**/*'],
              },
            ],
          ]);
        });

        describe('when discover resolves', () => {
          beforeEach(async () => {
            readJsonFileMock.mockClear();

            await globMock.resolve([
              '/some-directory/some-module/package.json',
            ]);

            await globMock.resolve([
              '/some-other-directory/some-other-module/package.json',
            ]);
          });

          it('reads contents of package.jsons', () => {
            expect(readJsonFileMock.mock.calls).toEqual([
              ['/some-directory/some-module/package.json'],
              ['/some-other-directory/some-other-module/package.json'],
            ]);
          });

          it('when any of the reading fails, throws', () => {
            readJsonFileMock.reject(new Error('some-error'));

            return expect(actualPromise).rejects.toThrow(
              'Tried to read file "/some-directory/some-module/package.json", but error was thrown: "some-error"',
            );
          });

          describe('when all contents resolve', () => {
            beforeEach(async () => {
              existsMock.mockClear();

              await readJsonFileMock.resolveSpecific(
                ([path]) => path === '/some-directory/some-module/package.json',
                {
                  name: 'some-module',
                },
              );

              await readJsonFileMock.resolveSpecific(
                ([path]) =>
                  path ===
                  '/some-other-directory/some-other-module/package.json',
                {
                  name: 'some-other-module',
                },
              );
            });

            it('adds yalc links for all packages', () => {
              expect(addYalcPackagesMock).toHaveBeenCalledWith(
                ['some-module', 'some-other-module'],

                {
                  link: true,

                  workingDir: '/some-directory/some-project',
                },
              );
            });

            it('does not resolve yet', async () => {
              const promiseStatus = await getPromiseStatus(actualPromise);

              expect(promiseStatus.fulfilled).toBe(false);
            });
          });
        });
      });
    });
  });
});
