import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getDi } from "../../../get-di";
import { CreateSymlink, createSymlinkInjectable } from "./create-symlink.injectable";
import type { Symlink } from "../symlink.injectable";
import { symlinkInjectable } from "../symlink.injectable";
import { Exists, existsInjectable } from "../exists.injectable";
import { EnsureDirectory, ensureDirectoryInjectable } from "../ensure-directory.injectable";
import statInjectable, { Stat } from "../stat.injectable";
import { getPromiseStatus } from "@ogre-tools/test-utils";

describe("create-symlink", () => {
  let createSymlink: CreateSymlink;
  let symlinkMock: AsyncFnMock<Symlink>;
  let existsMock: AsyncFnMock<Exists>;
  let ensureDirectoryMock: AsyncFnMock<EnsureDirectory>;
  let statMock: AsyncFnMock<Stat>;

  beforeEach(() => {
    const di = getDi();

    existsMock = asyncFn();
    di.override(existsInjectable, () => existsMock);

    ensureDirectoryMock = asyncFn();
    di.override(ensureDirectoryInjectable, () => ensureDirectoryMock);

    statMock = asyncFn();
    di.override(statInjectable, () => statMock);

    symlinkMock = asyncFn();
    di.override(symlinkInjectable, () => symlinkMock);

    createSymlink = di.inject(createSymlinkInjectable);
  });

  describe("when creating symlink to a directory", () => {
    let actualPromise: Promise<void>;

    beforeEach(() => {
      actualPromise = createSymlink({
        target: "./some-target-directory/some-target",
        source: "./some-source-directory/some-source",
      });
    });

    it("ensures the target directory exists", () => {
      expect(ensureDirectoryMock).toHaveBeenCalledWith("./some-source-directory");
    });

    it("does not stat for file or directory of target yet", () => {
      expect(statMock).not.toHaveBeenCalled();
    });

    describe("when ensure resolves", () => {
      beforeEach(async () => {
        await ensureDirectoryMock.resolve();
      });

      it("investigates if the target is directory or file", () => {
        expect(statMock).toHaveBeenCalledWith("./some-target-directory/some-target");
      });

      it("doesn't symlink yet", () => {
        expect(symlinkMock).not.toHaveBeenCalled();
      });

      describe("when investigation resolves as directory", () => {
        beforeEach(async () => {
          await statMock.resolve({ isDirectory: () => true } as any);
        });

        it("symlinks source to target as directory", () => {
          expect(symlinkMock).toHaveBeenCalledWith(
            "./some-target-directory/some-target",
            "./some-source-directory/some-source",
            "dir",
          );
        });

        it("does not resolve yet", async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });

        it("when symlinking resolves, resolves", async () => {
          await symlinkMock.resolve();

          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });

      describe("when investigation resolves as file", () => {
        beforeEach(async () => {
          await statMock.resolve({ isDirectory: () => false } as any);
        });

        it("symlinks source to target as file", () => {
          expect(symlinkMock).toHaveBeenCalledWith(
            "./some-target-directory/some-target",
            "./some-source-directory/some-source",
            "file",
          );
        });

        it("does not resolve yet", async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });

        it("when symlinking resolves, resolves", async () => {
          await symlinkMock.resolve();

          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });
    });
  });
});
