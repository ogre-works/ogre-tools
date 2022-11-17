# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [13.2.1](https://github.com/ogre-works/ogre-tools/compare/v13.2.0...v13.2.1) (2022-11-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [13.2.0](https://github.com/ogre-works/ogre-tools/compare/v13.1.0...v13.2.0) (2022-11-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [13.1.0](https://github.com/ogre-works/ogre-tools/compare/v13.0.0...v13.1.0) (2022-11-15)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [13.0.0](https://github.com/ogre-works/ogre-tools/compare/v12.0.1...v13.0.0) (2022-11-14)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [12.0.1](https://github.com/ogre-works/ogre-tools/compare/v12.0.0...v12.0.1) (2022-10-25)

### Bug Fixes

- Manually update versions of peerDependencies as Lerna doesn't do it for some reason ([0b46667](https://github.com/ogre-works/ogre-tools/commit/0b46667c106a93131f6320222aced3187cd9a292))

## [12.0.0](https://github.com/ogre-works/ogre-tools/compare/v11.0.0...v12.0.0) (2022-10-25)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [11.0.0](https://github.com/ogre-works/ogre-tools/compare/v10.3.2...v11.0.0) (2022-10-04)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [10.3.2](https://github.com/ogre-works/ogre-tools/compare/v10.3.1...v10.3.2) (2022-09-26)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [10.3.1](https://github.com/ogre-works/ogre-tools/compare/v10.3.0...v10.3.1) (2022-09-26)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [10.3.0](https://github.com/ogre-works/ogre-tools/compare/v10.2.0...v10.3.0) (2022-09-26)

### Features

- Make build of a ts-package include type information ([d174431](https://github.com/ogre-works/ogre-tools/commit/d1744317a55a4975f68452534321d98a8ff5e543))

## [10.2.0](https://github.com/ogre-works/ogre-tools/compare/v10.1.0...v10.2.0) (2022-09-23)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [10.1.0](https://github.com/ogre-works/ogre-tools/compare/v10.0.0...v10.1.0) (2022-09-02)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [10.0.0](https://github.com/ogre-works/ogre-tools/compare/v9.0.3...v10.0.0) (2022-09-01)

### ⚠ BREAKING CHANGES

- Make sure all registrations happen before injections
- Make registrations in presence of computedInjectMany require explicit MobX-transaction

### Features

- Make registrations in presence of computedInjectMany require explicit MobX-transaction ([dcbf551](https://github.com/ogre-works/ogre-tools/commit/dcbf55102e240a7c6f4e775cfab1cc94b565e5d8))
- Permit registrations without MobX transaction when injectable has no token ([c65a529](https://github.com/ogre-works/ogre-tools/commit/c65a5292a00ff95f9882c8c3b6f5cba9b325cfbe))

### Bug Fixes

- Make computedInjectMany not blow up when unrelated decorators are present ([888f76f](https://github.com/ogre-works/ogre-tools/commit/888f76f8a1d9214ab92e3c0715235fd1f06d3eb0))
- Make sure all registrations happen before injections ([e551e70](https://github.com/ogre-works/ogre-tools/commit/e551e707934c35a11350818f66307fb40b51e693))

### [9.0.3](https://github.com/ogre-works/ogre-tools/compare/v9.0.2...v9.0.3) (2022-08-25)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [9.0.2](https://github.com/ogre-works/ogre-tools/compare/v9.0.1...v9.0.2) (2022-08-10)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [9.0.1](https://github.com/ogre-works/ogre-tools/compare/v9.0.0...v9.0.1) (2022-06-29)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [9.0.0](https://github.com/ogre-works/ogre-tools/compare/v8.0.0...v9.0.0) (2022-06-20)

### ⚠ BREAKING CHANGES

- Make containers have ID for better error messages

### Features

- Make containers have ID for better error messages ([ea3ac4c](https://github.com/ogre-works/ogre-tools/commit/ea3ac4c4becbb79509ffe19f66ffac62364e22d6))

### Bug Fixes

- Prevent nested computedInjectMany's from appearing as cycles ([24cfa1f](https://github.com/ogre-works/ogre-tools/commit/24cfa1f9dd5eaddec604bfd723a548e261e13169))

## [8.0.0](https://github.com/ogre-works/ogre-tools/compare/v7.1.0...v8.0.0) (2022-06-15)

### ⚠ BREAKING CHANGES

- Expose function for injecting reactively many instead of using instantiation parameter

### Features

- Expose function for injecting reactively many instead of using instantiation parameter ([b572b32](https://github.com/ogre-works/ogre-tools/commit/b572b328f977120713e9c3339a9cff5c1daaa1ba))

### Bug Fixes

- Return same computed when injecting reactively many multiple times for same injection token ([75d8f51](https://github.com/ogre-works/ogre-tools/commit/75d8f51107c92de493bb73d51b6b285653753027))

### Reverts

- Revert "chore: Consolidate to relying of peer dependencies in injectable extensions" ([8f9b9b2](https://github.com/ogre-works/ogre-tools/commit/8f9b9b2afee9154e523254ea0d9338aa5fdd4fb4))

## [7.1.0](https://github.com/ogre-works/ogre-tools/compare/v7.0.0...v7.1.0) (2022-06-09)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [7.0.0](https://github.com/ogre-works/ogre-tools/compare/v6.0.1...v7.0.0) (2022-04-27)

### Features

- Introduce "reactive injectMany" which reacts to "late registrations" of injection tokens ([da932a6](https://github.com/ogre-works/ogre-tools/commit/da932a64b05073dcff9be88b8e5a2d82ed591679))
- Make all reactive registrations happen together in one transaction ([3acf508](https://github.com/ogre-works/ogre-tools/commit/3acf5082f424ba30fd1c02ff5a0831d49bb55b40))
- Make async injectMany react also to deregistrations ([be2f193](https://github.com/ogre-works/ogre-tools/commit/be2f1930d6e14f4cff88783eb0bfc2ce705ba311))

### Bug Fixes

- Make MobX peer-dependency for injectable-extension-for-mobx ([924b4f6](https://github.com/ogre-works/ogre-tools/commit/924b4f686c4d4d8e24311ed7febbf120d32578a4))
