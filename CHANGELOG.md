# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [19.0.0](https://github.com/ogre-works/ogre-tools/compare/v18.2.2...v19.0.0) (2026-02-20)

### ⚠ BREAKING CHANGES

- Update GetInjectable type to accept a generic lifecycle
  enum parameter, allowing typed lifecycle values beyond the built-in set.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

- Require React 18+ as peer dependency and remove the
  registerInjectableReact module that is no longer needed with the new
  hook-based API.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

- Migrate to using asyncComputed in package mobx-utils

Co-authored-by: Janne Savolainen <janne.savolainen@live.fi>

### Features

- Drop React 17 support and remove registerInjectableReact ([ef9e866](https://github.com/ogre-works/ogre-tools/commit/ef9e8661773e4f7b80fb57f61448ae8c2d5f213b))
- Enhance injectable bunches and typed specifiers ([b1f6fa3](https://github.com/ogre-works/ogre-tools/commit/b1f6fa31da1efd2d065b59ede63ea9a95f14f246))
- Expose typing for instantiation parameter of computedInjectMany ([64674a1](https://github.com/ogre-works/ogre-tools/commit/64674a149864c532b8cd09a7b2aa6c59f8c97e1f))
- Implement checking for if "alias-has-registrations" ([ae1fb0a](https://github.com/ogre-works/ogre-tools/commit/ae1fb0a1ffc4b641f8caf80012516629aaeb948d))
- Introduce discoverable and element-component packages ([6e0c6f4](https://github.com/ogre-works/ogre-tools/commit/6e0c6f4b687e406a85f678f6f1586d9b9db5659e))
- Introduce specificity of injection tokens ([992551d](https://github.com/ogre-works/ogre-tools/commit/992551d423238d1a3c67012b0d27588dc32201b0))
- Introduce useInject hook and getInjectableComponent ([6080eab](https://github.com/ogre-works/ogre-tools/commit/6080eab51f7a07c9181e43045b4f15c2305459d1))
- Make replaceTagsWithValues exported as point-free, and with typing ([3ff26b1](https://github.com/ogre-works/ogre-tools/commit/3ff26b1e59d4a9cfd7bee4b72cecae7911c843c4))
- Support React 19 and introduce computedInjectMaybe ([f6ed37f](https://github.com/ogre-works/ogre-tools/commit/f6ed37f3482bf191b57e3b64187edd3fbe8adccf))

### Bug Fixes

- Fix bad export ([df4b9c1](https://github.com/ogre-works/ogre-tools/commit/df4b9c1ea5c738748e421d3f99dd80a2384b21c9))
- Fix injectable core internals and remove cycle detection ([bfd24fa](https://github.com/ogre-works/ogre-tools/commit/bfd24fa70d670d9ccb7a1e61e9d2e805a287a38c))
- Fix React withInjectables rendering and memoization ([e17244f](https://github.com/ogre-works/ogre-tools/commit/e17244fa1e057b8cc626cc6a709d9817dbf8ff66))
- Fix typing of conditional promises in pipeline ([850a3aa](https://github.com/ogre-works/ogre-tools/commit/850a3aab1a50563226400dfcc0843d8f14355420))
- Fix typing of different public decorators of injectable ([e975baf](https://github.com/ogre-works/ogre-tools/commit/e975baf055736ab02c7d1d11008c1b0a7a5c1a4a))
- **injectable-extension-for-mobx:** ComputedInjectMaybe should pass through injection params ([df63bb0](https://github.com/ogre-works/ogre-tools/commit/df63bb0d288befe8384e7ac232fbf2074ae1276c))
- Make GetInjectable accept generic lifecycle enum ([cddd14e](https://github.com/ogre-works/ogre-tools/commit/cddd14eda5613ec062a69915a91334a9fe4d55d5))
- Make withInjectables have access to all features of di ([543dc16](https://github.com/ogre-works/ogre-tools/commit/543dc163f45a2d4f31c5ef141150e2e53cb31518))

### Miscellaneous Chores

- Get rid of duplicated asyncComputed ([b6fd8b3](https://github.com/ogre-works/ogre-tools/commit/b6fd8b3a4feac728ee3c2484191111660b1a8b34))
