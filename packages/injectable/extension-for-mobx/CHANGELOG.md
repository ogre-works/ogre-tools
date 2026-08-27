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

### Bug Fixes

- **injectable-extension-for-mobx:** Adapt to getInjectionToken2's flattened call shape ([5b3bf6e](https://github.com/ogre-works/ogre-tools/commit/5b3bf6ecc70567995ccdaf13abd415201fc67491))
- **injectable-extension-for-mobx:** Adapt to the merged InjectionToken2 type ([a50f001](https://github.com/ogre-works/ogre-tools/commit/a50f00175dc3d9234079bd72a821d97d6dfc865b))

### Miscellaneous Chores

- Prepare for major version release ([8c0a723](https://github.com/ogre-works/ogre-tools/commit/8c0a7233028326f65433f25cd65de9cce4adaadb))

## [25.1.0](https://github.com/ogre-works/ogre-tools/compare/v25.0.0...v25.1.0) (2026-08-26)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [25.0.0](https://github.com/ogre-works/ogre-tools/compare/v24.0.0...v25.0.0) (2026-08-24)

### ⚠ BREAKING CHANGES

- **injectable-mobx:** passing a v2 injection token whose cardinality does not
  match the helper no longer typechecks, and the maybe-helpers throw on
  one at runtime.
- **injectable:** `getInjectionToken2`, `getAbstractInjectionToken2` and
  `getSpecificInjectionToken2` are curried and require a cardinality:
  `getInjectionToken2<F>()({ id, cardinality })`. Currying is what lets
  the options value drive inference — the `.for()` factory's type is now
  inferred from the factory itself instead of being spelled out as a type
  argument. Tokens consumed both singly and as a group are two tokens.

### Features

- **injectable-mobx:** Gate computed inject helpers on cardinality ([82d2a5f](https://github.com/ogre-works/ogre-tools/commit/82d2a5f93807abf5eab66ee98b473da126258295))
- **injectable:** Require cardinality on injection tokens ([5811c5e](https://github.com/ogre-works/ogre-tools/commit/5811c5e2d7008d229dba600588fb0ab24726e73f))

## [24.0.0](https://github.com/ogre-works/ogre-tools/compare/v23.3.2...v24.0.0) (2026-08-20)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [23.3.2](https://github.com/ogre-works/ogre-tools/compare/v23.3.1...v23.3.2) (2026-08-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [23.3.1](https://github.com/ogre-works/ogre-tools/compare/v23.3.0...v23.3.1) (2026-08-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [23.3.0](https://github.com/ogre-works/ogre-tools/compare/v23.2.0...v23.3.0) (2026-08-17)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [23.2.0](https://github.com/ogre-works/ogre-tools/compare/v23.1.0...v23.2.0) (2026-05-19)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [23.1.0](https://github.com/ogre-works/ogre-tools/compare/v23.0.1...v23.1.0) (2026-05-07)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

### [23.0.1](https://github.com/ogre-works/ogre-tools/compare/v23.0.0...v23.0.1) (2026-04-24)

**Note:** Version bump only for package @ogre-tools/injectable-extension-for-mobx

## [23.0.0](https://github.com/ogre-works/ogre-tools/compare/v19.0.0...v23.0.0) (2026-04-24)

### ⚠ BREAKING CHANGES

- **injectable-extension-for-mobx:** Unwrap computedInjectMany2 family and reuse ManyFactory
- **injectable-extension-for-mobx:** The following named exports are removed from
  @ogre-tools/injectable-extension-for-mobx: computedInjectManyInjectable,
  computedInjectManyWithMetaInjectable, computedInjectMany2Injectable,
  computedInjectManyWithMeta2Injectable, computedInjectMaybeInjectable,
  computedInjectMaybe2Injectable. Use the matching \*InjectionToken exports
  together with registerMobX instead.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
(cherry picked from commit a675191e4c939308e187164ef04380c16338c356)

### Features

- Add dual CJS/ESM build output for all packages ([07f5ee9](https://github.com/ogre-works/ogre-tools/commit/07f5ee99bc96680b51f06b5dd932f5f557d0945c))
- **injectable-extension-for-mobx:** Add 2-variants of computedInjectMany et al ([ea46423](https://github.com/ogre-works/ogre-tools/commit/ea46423adcbfeaf7bef733be35a893f93e896aa8))
- **injectable:** Add getAbstractInjectionToken2 with full enforcement ([21d194c](https://github.com/ogre-works/ogre-tools/commit/21d194cff3fd33385f95ab4c7b2f6d4cea27ce75))
- **injectable:** Add getInjectable2/getInjectionToken2 with curried instantiate and generic support ([e341713](https://github.com/ogre-works/ogre-tools/commit/e341713f0f9e6cba6c382a1f2ff5284c051561f5))
- **injectable:** Add registration/deregistration decorator tokens ([5a2e94e](https://github.com/ogre-works/ogre-tools/commit/5a2e94edd1f9705b7bd1b716cb220bad58800245))
- **injectable:** Add registration/deregistration decorator tokens as abstract v2 ([e7949bf](https://github.com/ogre-works/ogre-tools/commit/e7949bfb7c5b2ff3f13e8ea8a4c1ad3f78790eee))

### Bug Fixes

- **injectable-extension-for-mobx:** Wrap computed reads in runInAction to suppress MobX warnings ([3bbed48](https://github.com/ogre-works/ogre-tools/commit/3bbed483b0cdca14beea3de96eee0b0638e5e211))
- **injectable-mobx:** Use curried inject for v2 minimalDi in computed-inject-2 variants ([7d5dbf9](https://github.com/ogre-works/ogre-tools/commit/7d5dbf9a04a6ba1316f53f545266841a73c9629e))

### Performance Improvements

- **injectable-mobx:** Track reactivity atoms lazily, share wrapper singletons, drop rest-spread ([62b7115](https://github.com/ogre-works/ogre-tools/commit/62b7115ea4a2d726e9e3dda67ac74c2b53279848))

### Code Refactoring

- **injectable-extension-for-mobx:** Stop exporting injectables from package surface ([f08c877](https://github.com/ogre-works/ogre-tools/commit/f08c87740778263dff59b7ee0a4a1a2521fbece1))
- **injectable-extension-for-mobx:** Unwrap computedInjectMany2 family and reuse ManyFactory ([557b650](https://github.com/ogre-works/ogre-tools/commit/557b650057fd6683318c3f41c7ba0b3d518f0eff))

## [19.0.0](https://github.com/ogre-works/ogre-tools/compare/v18.2.2...v19.0.0) (2026-02-20)

### Features

- Introduce specificity of injection tokens ([992551d](https://github.com/ogre-works/ogre-tools/commit/992551d423238d1a3c67012b0d27588dc32201b0))
- Support React 19 and introduce computedInjectMaybe ([f6ed37f](https://github.com/ogre-works/ogre-tools/commit/f6ed37f3482bf191b57e3b64187edd3fbe8adccf))

### Bug Fixes

- **injectable-extension-for-mobx:** ComputedInjectMaybe should pass through injection params ([df63bb0](https://github.com/ogre-works/ogre-tools/commit/df63bb0d288befe8384e7ac232fbf2074ae1276c))
