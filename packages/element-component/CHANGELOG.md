# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [26.0.0](https://github.com/ogre-works/ogre-tools/compare/v25.1.0...v26.0.0) (2026-08-27)

### ⚠ BREAKING CHANGES

- getAbstractInjectionToken2 and
  getAbstractInjectionTokenComponent2 are removed — abstractness is now
  automatic: getInjectionToken2(options)(factory) builds an abstract
  token, and getInjectionToken2(options)() builds a concrete token with
  no .for() at all. getSpecificInjectionToken2 and
  getSpecificInjectionTokenComponent2 are removed too — options carrying
  speciality on the base creators build a specific token directly, and
  may also take a factory so a specific token can root a nested family.
  The implicit recursive default .for() factory is gone: tokens are
  leaves by default, and deeper .for() chains supply an explicit
  recursive factory, which makes the intermediate levels abstract. The
  AbstractInjectionToken2 type is folded into InjectionToken2, keyed on
  its SpecificFactory parameter, and the hybrid pattern (a directly
  injectable token that also carries a real .for() factory) is retired.

### Miscellaneous Chores

- Prepare for major version release ([8c0a723](https://github.com/ogre-works/ogre-tools/commit/8c0a7233028326f65433f25cd65de9cce4adaadb))

## [25.1.0](https://github.com/ogre-works/ogre-tools/compare/v25.0.0...v25.1.0) (2026-08-26)

**Note:** Version bump only for package @ogre-tools/element-component

## [25.0.0](https://github.com/ogre-works/ogre-tools/compare/v24.0.0...v25.0.0) (2026-08-24)

**Note:** Version bump only for package @ogre-tools/element-component

## [24.0.0](https://github.com/ogre-works/ogre-tools/compare/v23.3.2...v24.0.0) (2026-08-20)

**Note:** Version bump only for package @ogre-tools/element-component

### [23.3.2](https://github.com/ogre-works/ogre-tools/compare/v23.3.1...v23.3.2) (2026-08-17)

**Note:** Version bump only for package @ogre-tools/element-component

### [23.3.1](https://github.com/ogre-works/ogre-tools/compare/v23.3.0...v23.3.1) (2026-08-17)

**Note:** Version bump only for package @ogre-tools/element-component

## [23.3.0](https://github.com/ogre-works/ogre-tools/compare/v23.2.0...v23.3.0) (2026-08-17)

**Note:** Version bump only for package @ogre-tools/element-component

## [23.2.0](https://github.com/ogre-works/ogre-tools/compare/v23.1.0...v23.2.0) (2026-05-19)

### Features

- **element-component:** Expose getPropsFromPlugins so non-React callers can derive element props ([6fa9f44](https://github.com/ogre-works/ogre-tools/commit/6fa9f440a3b33a9ff1b87507ebed944e31b65933))

## [23.1.0](https://github.com/ogre-works/ogre-tools/compare/v23.0.1...v23.1.0) (2026-05-07)

**Note:** Version bump only for package @ogre-tools/element-component

### [23.0.1](https://github.com/ogre-works/ogre-tools/compare/v23.0.0...v23.0.1) (2026-04-24)

**Note:** Version bump only for package @ogre-tools/element-component

## [23.0.0](https://github.com/ogre-works/ogre-tools/compare/v19.0.0...v23.0.0) (2026-04-24)

### Features

- Add dual CJS/ESM build output for all packages ([07f5ee9](https://github.com/ogre-works/ogre-tools/commit/07f5ee99bc96680b51f06b5dd932f5f557d0945c))
- **element-component:** Introduce mechanism for conditional $prop usage with react hooks ([a6a664c](https://github.com/ogre-works/ogre-tools/commit/a6a664cd19f412056c7e413cae1546797f57ed5f))

## [19.0.0](https://github.com/ogre-works/ogre-tools/compare/v18.2.2...v19.0.0) (2026-02-20)

### Features

- Introduce discoverable and element-component packages ([6e0c6f4](https://github.com/ogre-works/ogre-tools/commit/6e0c6f4b687e406a85f678f6f1586d9b9db5659e))
