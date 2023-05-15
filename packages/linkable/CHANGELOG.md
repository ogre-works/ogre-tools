# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [16.0.0](https://github.com/ogre-works/ogre-tools/compare/v15.9.0...v16.0.0) (2023-05-15)

**Note:** Version bump only for package @ogre-tools/linkable

## [15.9.0](https://github.com/ogre-works/ogre-tools/compare/v15.8.1...v15.9.0) (2023-05-08)

### Features

- Permit also programmatic access to functionalities of linkable ([8e51894](https://github.com/ogre-works/ogre-tools/commit/8e518945b929209a1827258d4f43f0e50d4090ad))

### [15.8.1](https://github.com/ogre-works/ogre-tools/compare/v15.8.0...v15.8.1) (2023-05-02)

### Bug Fixes

- Use correct kind of npm-dependencies ([5039d1f](https://github.com/ogre-works/ogre-tools/commit/5039d1fa298e78a7976c4e185571f81ca0c705fe))

## [15.8.0](https://github.com/ogre-works/ogre-tools/compare/v15.7.0...v15.8.0) (2023-05-02)

**Note:** Version bump only for package @ogre-tools/linkable

## [15.7.0](https://github.com/ogre-works/ogre-tools/compare/v15.6.1...v15.7.0) (2023-04-27)

### Features

- Add "linkable-push" as counterpart of "linkable" ([240ea84](https://github.com/ogre-works/ogre-tools/commit/240ea841122588926b96c455a222d4b39143dbd5))
- Add support for globs in the linkable configuration ([62144eb](https://github.com/ogre-works/ogre-tools/commit/62144eb4dd3d8851626f4f220ef4c2907cbbb4da))

### Bug Fixes

- Make local node_modules of linked packages not break runtime when in non-bundled context ([a9bfcae](https://github.com/ogre-works/ogre-tools/commit/a9bfcae307dca628c78ad7a8e972991795e81192))

### [15.6.1](https://github.com/ogre-works/ogre-tools/compare/v15.6.0...v15.6.1) (2023-04-24)

**Note:** Version bump only for package @ogre-tools/linkable

## [15.6.0](https://github.com/ogre-works/ogre-tools/compare/v15.5.1...v15.6.0) (2023-04-24)

### Features

- Indicate lack of support for missing "files" in package.jsons used by linkable ([e0d14e6](https://github.com/ogre-works/ogre-tools/commit/e0d14e661314ba15e22447b64fc9208d20e7a020))
- Introduce "linkable", ie. like "npm link", but mimicking "npm pack" as symlinks ([1955082](https://github.com/ogre-works/ogre-tools/commit/1955082490f3513ca0e19e73228edc8932fe0f94))
- Make built linkable runnable as npm bin script ([410a78e](https://github.com/ogre-works/ogre-tools/commit/410a78e11ed2d46886a61376afdbb0d960c8560a))

### Bug Fixes

- Avoid destructuring to not make brittle this-context of "fs" not break ([5db7984](https://github.com/ogre-works/ogre-tools/commit/5db7984bbc8f927f61577dd1475c8e4f8662015c))
- Fix "path"-specific typing error ([b670b36](https://github.com/ogre-works/ogre-tools/commit/b670b3631f967cf0c844a99d88e4c60e2cdf6f4d))
- Fixup ([6284ca4](https://github.com/ogre-works/ogre-tools/commit/6284ca4f14d5b2ded89f755139b8e1b91b2b4e98))
- Make existence of static linked files work by using absolute path ([50fa2d6](https://github.com/ogre-works/ogre-tools/commit/50fa2d6a21fa836cb933d3970fa3d55db341d795))
- Use correct build script for a ts-package ([d80a233](https://github.com/ogre-works/ogre-tools/commit/d80a233d0ae78f9fb4d5c03398d060e9171520ab))
