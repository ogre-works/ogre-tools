# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [18.4.1](https://github.com/lensapp/ogre-tools/compare/v18.4.0...v18.4.1) (2024-02-12)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

## [18.4.0](https://github.com/lensapp/ogre-tools/compare/v18.3.1...v18.4.0) (2024-02-12)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

### [18.3.1](https://github.com/lensapp/ogre-tools/compare/v18.3.0...v18.3.1) (2024-01-23)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

## [18.3.0](https://github.com/lensapp/ogre-tools/compare/v18.2.2...v18.3.0) (2024-01-08)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

### [18.2.2](https://github.com/lensapp/ogre-tools/compare/v18.2.1...v18.2.2) (2024-01-05)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

### [18.2.1](https://github.com/lensapp/ogre-tools/compare/v18.2.0...v18.2.1) (2024-01-04)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

## [18.2.0](https://github.com/lensapp/ogre-tools/compare/v18.1.0...v18.2.0) (2024-01-04)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

## [18.1.0](https://github.com/lensapp/ogre-tools/compare/v18.0.2...v18.1.0) (2023-11-27)

### Features

- Expose typing for instantiation parameter of computedInjectMany ([e87d092](https://github.com/lensapp/ogre-tools/commit/e87d092a1800e0338514ca1278a5b042ef875fd4))

### [18.0.2](https://github.com/lensapp/ogre-tools/compare/v18.0.1...v18.0.2) (2023-11-14)

**Note:** Version bump only for package @lensapp/injectable-extension-for-mobx

### [18.0.1](https://github.com/ogre-works/ogre-tools/compare/v18.0.0...v18.0.1) (2023-10-26)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [18.0.0](https://github.com/ogre-works/ogre-tools/compare/v17.10.0...v18.0.0) (2023-10-23)

### ⚠ BREAKING CHANGES

- Illegal attempts to inject singletons with an instantiation parameter now throw.
  Adapt by either:

1. Changing design to not use instantiation parameters for singletons
2. Making the singletons keyed singletons instead
3. Having singletons receive what they need as a dependency, instead of instantiation parameter

### Features

- Make ComputedInjectMany support instantiation parameters ([fc6aefa](https://github.com/ogre-works/ogre-tools/commit/fc6aefac3f0bff3ea91d92bb145004915eeacdcf))
- Make singletons throw if instantiation parameter is provided ([96215f2](https://github.com/ogre-works/ogre-tools/commit/96215f2d2abba2f817fdb4e184bfb6914b27e6c8))

## [17.10.0](https://github.com/ogre-works/ogre-tools/compare/v17.9.0...v17.10.0) (2023-10-19)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.9.0](https://github.com/ogre-works/ogre-tools/compare/v17.8.0...v17.9.0) (2023-10-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.8.0](https://github.com/ogre-works/ogre-tools/compare/v17.7.0...v17.8.0) (2023-10-09)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.7.0](https://github.com/ogre-works/ogre-tools/compare/v17.6.0...v17.7.0) (2023-09-12)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.6.0](https://github.com/ogre-works/ogre-tools/compare/v17.5.1...v17.6.0) (2023-09-06)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [17.5.1](https://github.com/ogre-works/ogre-tools/compare/v17.5.0...v17.5.1) (2023-06-22)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.5.0](https://github.com/ogre-works/ogre-tools/compare/v17.3.0...v17.5.0) (2023-06-21)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.4.0](https://github.com/ogre-works/ogre-tools/compare/v17.3.0...v17.4.0) (2023-06-21)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.3.0](https://github.com/ogre-works/ogre-tools/compare/v17.2.0...v17.3.0) (2023-06-19)

### Features

- Make injectable-mobx not require MobX-transaction ([45a2712](https://github.com/ogre-works/ogre-tools/commit/45a27123452ec200c5997cb91e7408344ae139dd))

## [17.2.0](https://github.com/ogre-works/ogre-tools/compare/v17.1.1...v17.2.0) (2023-06-01)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [17.1.1](https://github.com/ogre-works/ogre-tools/compare/v17.1.0...v17.1.1) (2023-05-31)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.1.0](https://github.com/ogre-works/ogre-tools/compare/v17.0.0...v17.1.0) (2023-05-30)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [17.0.0](https://github.com/ogre-works/ogre-tools/compare/v16.1.2...v17.0.0) (2023-05-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [16.1.2](https://github.com/ogre-works/ogre-tools/compare/v16.1.1...v16.1.2) (2023-05-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [16.1.1](https://github.com/ogre-works/ogre-tools/compare/v16.1.0...v16.1.1) (2023-05-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [16.1.0](https://github.com/ogre-works/ogre-tools/compare/v16.0.0...v16.1.0) (2023-05-16)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [16.0.0](https://github.com/ogre-works/ogre-tools/compare/v15.9.0...v16.0.0) (2023-05-15)

### Features

- Implement computedInjectManyWithMeta, and add missing type tests to computedInjectMany ([a8527c1](https://github.com/ogre-works/ogre-tools/commit/a8527c1465c4dd5475917208f25978b39c447f5c))

## [15.9.0](https://github.com/ogre-works/ogre-tools/compare/v15.8.1...v15.9.0) (2023-05-08)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.8.1](https://github.com/ogre-works/ogre-tools/compare/v15.8.0...v15.8.1) (2023-05-02)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.8.0](https://github.com/ogre-works/ogre-tools/compare/v15.7.0...v15.8.0) (2023-05-02)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.7.0](https://github.com/ogre-works/ogre-tools/compare/v15.6.1...v15.7.0) (2023-04-27)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.6.1](https://github.com/ogre-works/ogre-tools/compare/v15.6.0...v15.6.1) (2023-04-24)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.6.0](https://github.com/ogre-works/ogre-tools/compare/v15.5.1...v15.6.0) (2023-04-24)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.5.1](https://github.com/ogre-works/ogre-tools/compare/v15.5.0...v15.5.1) (2023-04-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.5.0](https://github.com/ogre-works/ogre-tools/compare/v15.4.0...v15.5.0) (2023-04-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.4.0](https://github.com/ogre-works/ogre-tools/compare/v15.3.1...v15.4.0) (2023-04-11)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.3.1](https://github.com/ogre-works/ogre-tools/compare/v15.3.0...v15.3.1) (2023-04-06)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.3.0](https://github.com/ogre-works/ogre-tools/compare/v15.2.1...v15.3.0) (2023-04-04)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.2.1](https://github.com/ogre-works/ogre-tools/compare/v15.2.0...v15.2.1) (2023-03-31)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.2.0](https://github.com/ogre-works/ogre-tools/compare/v15.1.1...v15.2.0) (2023-03-30)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.1.2](https://github.com/ogre-works/ogre-tools/compare/v15.1.1...v15.1.2) (2023-03-02)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.1.1](https://github.com/ogre-works/ogre-tools/compare/v15.1.0...v15.1.1) (2023-02-27)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.1.0](https://github.com/ogre-works/ogre-tools/compare/v15.0.1...v15.1.0) (2023-02-22)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [15.0.1](https://github.com/ogre-works/ogre-tools/compare/v15.0.0...v15.0.1) (2023-02-21)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [15.0.0](https://github.com/ogre-works/ogre-tools/compare/v14.0.3...v15.0.0) (2023-02-20)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [14.0.3](https://github.com/ogre-works/ogre-tools/compare/v14.0.2...v14.0.3) (2022-11-23)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [14.0.2](https://github.com/ogre-works/ogre-tools/compare/v14.0.1...v14.0.2) (2022-11-23)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [14.0.1](https://github.com/ogre-works/ogre-tools/compare/v14.0.0...v14.0.1) (2022-11-23)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [14.0.0](https://github.com/ogre-works/ogre-tools/compare/v13.2.1...v14.0.0) (2022-11-22)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

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
