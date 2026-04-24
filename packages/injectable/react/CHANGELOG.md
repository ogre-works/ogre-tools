# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [23.0.0](https://github.com/ogre-works/ogre-tools/compare/v19.0.0...v23.0.0) (2026-04-24)

### ⚠ BREAKING CHANGES

- **injectable-react:** Rename getAbstractInjectionTokenComponent to \*2

### Features

- Add dual CJS/ESM build output for all packages ([07f5ee9](https://github.com/ogre-works/ogre-tools/commit/07f5ee99bc96680b51f06b5dd932f5f557d0945c))
- **injectable-react:** Add getAbstractInjectionTokenComponent ([c456d16](https://github.com/ogre-works/ogre-tools/commit/c456d1695fa1988ff008cea678cb4a5ed5c6ccb1))
- **injectable-react:** Add getInjectableComponent2 for v2 InjectionToken2 ([e0f0697](https://github.com/ogre-works/ogre-tools/commit/e0f069702f6d22eb11ad2262ad126497477fcb0a))
- **injectable-react:** Add getInjectionTokenComponent ([e0e3022](https://github.com/ogre-works/ogre-tools/commit/e0e3022e6c90bba5cb5225135d7e924b10695fb6))
- **injectable-react:** Add getInjectionTokenComponent2 for v2 InjectionToken2 ([ede306b](https://github.com/ogre-works/ogre-tools/commit/ede306b95b7e56f2706c89c56ccc448391ea8981))
- **injectable-react:** Add useInject2 factory-returning hook ([ad23e79](https://github.com/ogre-works/ogre-tools/commit/ad23e793504d44fb361dc520438d3acd3f237513))
- **injectable-react:** Support injectable2 in useInject hooks ([0711183](https://github.com/ogre-works/ogre-tools/commit/071118392890f234397c400e0a651fd8ff43cdd3))
- **injectable:** Add getInjectable2/getInjectionToken2 with curried instantiate and generic support ([e341713](https://github.com/ogre-works/ogre-tools/commit/e341713f0f9e6cba6c382a1f2ff5284c051561f5))
- **injectable:** Make di.override and di.override2 cross-compatible with v1/v2 ([99c9dc9](https://github.com/ogre-works/ogre-tools/commit/99c9dc9ba6d2741d02bf6608837a0238c514eaf2))
- **injectable:** Make preventSideEffects the default ([2dcc0a4](https://github.com/ogre-works/ogre-tools/commit/2dcc0a44f3a2a58b9893fe0af28f330c6506c4cc))

### Bug Fixes

- **injectable-react:** Accept specific ComponentType tokens for bare components ([1fa51c6](https://github.com/ogre-works/ogre-tools/commit/1fa51c68a6c529f85f9fc5036d4f516f82595b3f))
- **injectable-react:** Run tsd separately per test file to avoid multi-directory glob bug ([5e77ae5](https://github.com/ogre-works/ogre-tools/commit/5e77ae5cb14d5d0e744204e881f93a86f943add7))
- **injectable-react:** Update error message expectations after context removal ([0b0ad28](https://github.com/ogre-works/ogre-tools/commit/0b0ad28b4c4d6d2c663775f5b510d43fdd1040e6))
- **injectable-react:** Widen injectionToken type in getInjectableComponent ([3387e59](https://github.com/ogre-works/ogre-tools/commit/3387e5966b8333ab8825659a44baa84e1266d2f7))
- **injectable:** Fix cascade deregistration throwing for already-deregistered injectables ([bf41803](https://github.com/ogre-works/ogre-tools/commit/bf41803487550cfe78aef2a058f366f76254eb5e))
- **injectable:** Tolerate undefined instantiation args on old-style singletons ([25614a0](https://github.com/ogre-works/ogre-tools/commit/25614a0948feef250c8f7ecfc58eae8548c31914))

### Code Refactoring

- **injectable-react:** Rename getAbstractInjectionTokenComponent to \*2 ([bc36b47](https://github.com/ogre-works/ogre-tools/commit/bc36b474352eb7cadbb27ed6e208492aebae8fd6))

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
