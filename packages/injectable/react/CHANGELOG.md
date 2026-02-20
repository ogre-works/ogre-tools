# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [19.0.0](https://github.com/ogre-works/ogre-tools/compare/v18.2.2...v19.0.0) (2026-02-20)

### ⚠ BREAKING CHANGES

- Require React 18+ as peer dependency and remove the
  registerInjectableReact module that is no longer needed with the new
  hook-based API.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

- Migrate to using asyncComputed in package mobx-utils

Co-authored-by: Janne Savolainen <janne.savolainen@live.fi>

### Features

- Drop React 17 support and remove registerInjectableReact ([ef9e866](https://github.com/ogre-works/ogre-tools/commit/ef9e8661773e4f7b80fb57f61448ae8c2d5f213b))
- Introduce useInject hook and getInjectableComponent ([6080eab](https://github.com/ogre-works/ogre-tools/commit/6080eab51f7a07c9181e43045b4f15c2305459d1))

### Bug Fixes

- Fix React withInjectables rendering and memoization ([e17244f](https://github.com/ogre-works/ogre-tools/commit/e17244fa1e057b8cc626cc6a709d9817dbf8ff66))
- Make withInjectables have access to all features of di ([543dc16](https://github.com/ogre-works/ogre-tools/commit/543dc163f45a2d4f31c5ef141150e2e53cb31518))

### Miscellaneous Chores

- Get rid of duplicated asyncComputed ([b6fd8b3](https://github.com/ogre-works/ogre-tools/commit/b6fd8b3a4feac728ee3c2484191111660b1a8b34))
