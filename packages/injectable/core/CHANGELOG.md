# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [19.0.0](https://github.com/ogre-works/ogre-tools/compare/v18.2.2...v19.0.0) (2026-02-20)

### ⚠ BREAKING CHANGES

- Update GetInjectable type to accept a generic lifecycle
  enum parameter, allowing typed lifecycle values beyond the built-in set.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

### Features

- Enhance injectable bunches and typed specifiers ([b1f6fa3](https://github.com/ogre-works/ogre-tools/commit/b1f6fa31da1efd2d065b59ede63ea9a95f14f246))
- Implement checking for if "alias-has-registrations" ([ae1fb0a](https://github.com/ogre-works/ogre-tools/commit/ae1fb0a1ffc4b641f8caf80012516629aaeb948d))
- Introduce specificity of injection tokens ([992551d](https://github.com/ogre-works/ogre-tools/commit/992551d423238d1a3c67012b0d27588dc32201b0))

### Bug Fixes

- Fix injectable core internals and remove cycle detection ([bfd24fa](https://github.com/ogre-works/ogre-tools/commit/bfd24fa70d670d9ccb7a1e61e9d2e805a287a38c))
- Fix typing of different public decorators of injectable ([e975baf](https://github.com/ogre-works/ogre-tools/commit/e975baf055736ab02c7d1d11008c1b0a7a5c1a4a))
- Make GetInjectable accept generic lifecycle enum ([cddd14e](https://github.com/ogre-works/ogre-tools/commit/cddd14eda5613ec062a69915a91334a9fe4d55d5))
