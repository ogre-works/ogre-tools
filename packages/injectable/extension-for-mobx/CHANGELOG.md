# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
