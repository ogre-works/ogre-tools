# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [22.3.0](https://github.com/lensapp/ogre-tools/compare/v22.2.0...v22.3.0) (2026-05-19)

**Note:** Version bump only for package @lensapp/injectable-react

## [22.2.0](https://github.com/lensapp/ogre-tools/compare/v22.1.0...v22.2.0) (2026-05-04)

**Note:** Version bump only for package @lensapp/injectable-react

## [22.1.0](https://github.com/lensapp/ogre-tools/compare/v22.0.0...v22.1.0) (2026-04-24)

### Features

- Add dual CJS/ESM build output for all packages ([639e19e](https://github.com/lensapp/ogre-tools/commit/639e19e1db7c65b2c53a6234669f23219228299f))
- **injectable:** Make preventSideEffects the default ([c7245fd](https://github.com/lensapp/ogre-tools/commit/c7245fdf6eeaad71a7eda5485e7a78e9539e4a76))

## [22.0.0](https://github.com/lensapp/ogre-tools/compare/v21.1.0...v22.0.0) (2026-04-24)

### ⚠ BREAKING CHANGES

- **injectable-react:** Rename getAbstractInjectionTokenComponent to \*2

### Features

- **injectable-react:** Add getAbstractInjectionTokenComponent ([1fb8f41](https://github.com/lensapp/ogre-tools/commit/1fb8f4180c30c52dc9126cf2480bb4422a15b81f))
- **injectable-react:** Add getInjectableComponent2 for v2 InjectionToken2 ([b48ad13](https://github.com/lensapp/ogre-tools/commit/b48ad13d479469e1a58e69daf04da475166ba398))
- **injectable-react:** Add getInjectionTokenComponent ([0423f4a](https://github.com/lensapp/ogre-tools/commit/0423f4aa1ce701f920c5ff39d9727a5762aaa175))
- **injectable-react:** Add getInjectionTokenComponent2 for v2 InjectionToken2 ([baf9c15](https://github.com/lensapp/ogre-tools/commit/baf9c15224bf949315ddc739cdb241803677f019))
- **injectable-react:** Add useInject2 factory-returning hook ([9025880](https://github.com/lensapp/ogre-tools/commit/9025880bf5ca4f2dce4a7568e5ee8f542678ac5a))
- **injectable-react:** Support injectable2 in useInject hooks ([86b4e11](https://github.com/lensapp/ogre-tools/commit/86b4e113b852d95dbbbdea9b23c5f846a8e168d6))
- **injectable:** Add getInjectable2/getInjectionToken2 with curried instantiate and generic support ([f38e667](https://github.com/lensapp/ogre-tools/commit/f38e667e0e719513a7d8dd7dcd41bf9b95fadf86))
- **injectable:** Make di.override and di.override2 cross-compatible with v1/v2 ([7d8a697](https://github.com/lensapp/ogre-tools/commit/7d8a697bfed754b8fc61aacc3631f1e8f4733f26))

### Bug Fixes

- **injectable-react:** Accept specific ComponentType tokens for bare components ([f9645ce](https://github.com/lensapp/ogre-tools/commit/f9645cee3310d3bc98e5d3c45a8face0e6b7daac))
- **injectable-react:** Run tsd separately per test file to avoid multi-directory glob bug ([6e1014e](https://github.com/lensapp/ogre-tools/commit/6e1014ed51fc197782df6c0fd474e0dd08129f08))
- **injectable-react:** Update error message expectations after context removal ([ab10112](https://github.com/lensapp/ogre-tools/commit/ab1011205af68ffbb0cebaa3dbd9a29ad756fe6c))
- **injectable-react:** Widen injectionToken type in getInjectableComponent ([08109fe](https://github.com/lensapp/ogre-tools/commit/08109fe3f48d1fba6fb03ab0373de7ff4cd2047c))
- **injectable:** Fix cascade deregistration throwing for already-deregistered injectables ([dd56f22](https://github.com/lensapp/ogre-tools/commit/dd56f22c876c9d92d92b672e5b776e6d9c12606c))
- **injectable:** Tolerate undefined instantiation args on old-style singletons ([bb22999](https://github.com/lensapp/ogre-tools/commit/bb2299994c16e208a9bdce3e75e451957ab2f8af))

### Code Refactoring

- **injectable-react:** Rename getAbstractInjectionTokenComponent to \*2 ([738f2b8](https://github.com/lensapp/ogre-tools/commit/738f2b8e5982bf92dbf226d2c7b62633988735f3))

## [21.1.0](https://github.com/lensapp/ogre-tools/compare/v21.0.3...v21.1.0) (2026-03-19)

**Note:** Version bump only for package @lensapp/injectable-react

### [21.0.3](https://github.com/lensapp/ogre-tools/compare/v21.0.2...v21.0.3) (2026-02-20)

**Note:** Version bump only for package @lensapp/injectable-react

### [21.0.2](https://github.com/lensapp/ogre-tools/compare/v21.0.1...v21.0.2) (2026-02-18)

**Note:** Version bump only for package @lensapp/injectable-react

### [21.0.1](https://github.com/lensapp/ogre-tools/compare/v21.0.0...v21.0.1) (2026-02-03)

**Note:** Version bump only for package @lensapp/injectable-react

## [21.0.0](https://github.com/lensapp/ogre-tools/compare/v20.8.0...v21.0.0) (2025-11-14)

**Note:** Version bump only for package @lensapp/injectable-react

## [20.8.0](https://github.com/lensapp/ogre-tools/compare/v20.7.0...v20.8.0) (2025-10-23)

**Note:** Version bump only for package @lensapp/injectable-react

## [20.7.0](https://github.com/lensapp/ogre-tools/compare/v20.6.6...v20.7.0) (2025-10-14)

### Features

- Support react 19 ([134e081](https://github.com/lensapp/ogre-tools/commit/134e08143aa319003edee4cf438d0fe172ea359c))

### Bug Fixes

- Make injectableComponent work consistently when injected using a token ([3615fa7](https://github.com/lensapp/ogre-tools/commit/3615fa7b70a91ac38e4bfc3fd10b571a661755f5))

### [20.6.7](https://github.com/lensapp/ogre-tools/compare/v20.6.6...v20.6.7) (2025-09-30)

### Bug Fixes

- Make injectableComponent work consistently when injected using a token ([4e8f7b2](https://github.com/lensapp/ogre-tools/commit/4e8f7b20838a9d3973d3942eb253186ae99eb011))

### [20.6.6](https://github.com/lensapp/ogre-tools/compare/v20.6.5...v20.6.6) (2025-09-08)

### Bug Fixes

- Fix unwarrant re-renders caused by component specific di context used for error messages ([b7066d3](https://github.com/lensapp/ogre-tools/commit/b7066d3e62a20c73a0d7b0bc1c67da48d1b84d3f))

### [20.6.5](https://github.com/lensapp/ogre-tools/compare/v20.6.4...v20.6.5) (2025-09-04)

### Bug Fixes

- Fix react memoization causing incorrect di-container when nested containers are used ([6fbd8f0](https://github.com/lensapp/ogre-tools/commit/6fbd8f07f16dc1f6bced21710f4947cd629fa6c8))

### [20.6.4](https://github.com/lensapp/ogre-tools/compare/v20.6.3...v20.6.4) (2025-09-03)

### Bug Fixes

- Fix re-renders of component with di context provider causing unnecessary rerenders for children ([36dfb70](https://github.com/lensapp/ogre-tools/commit/36dfb70727a6dd2befb3f975b1c7662eb42e5ab8))

### [20.6.3](https://github.com/lensapp/ogre-tools/compare/v20.6.2...v20.6.3) (2025-06-02)

### Bug Fixes

- Fix typing of generic injectable components ([a548d51](https://github.com/lensapp/ogre-tools/commit/a548d51c8d03eb57fb8c5752fe1308e62b39966c))

### [20.6.2](https://github.com/lensapp/ogre-tools/compare/v20.6.1...v20.6.2) (2025-05-20)

### Bug Fixes

- Make injectableComponent able to infer typing of props from injectionToken ([3edbeb9](https://github.com/lensapp/ogre-tools/commit/3edbeb9f59744697277f1b505c68aa995ffe7793))

### [20.6.1](https://github.com/lensapp/ogre-tools/compare/v20.6.0...v20.6.1) (2025-05-08)

**Note:** Version bump only for package @lensapp/injectable-react

## [20.6.0](https://github.com/lensapp/ogre-tools/compare/v20.5.4...v20.6.0) (2025-03-20)

**Note:** Version bump only for package @lensapp/injectable-react

### [20.5.4](https://github.com/lensapp/ogre-tools/compare/v20.5.3...v20.5.4) (2025-03-19)

**Note:** Version bump only for package @lensapp/injectable-react

### [20.5.3](https://github.com/lensapp/ogre-tools/compare/v20.5.2...v20.5.3) (2025-02-24)

**Note:** Version bump only for package @lensapp/injectable-react

### [20.5.2](https://github.com/lensapp/ogre-tools/compare/v20.5.1...v20.5.2) (2025-02-21)

**Note:** Version bump only for package @lensapp/injectable-react

### [20.5.1](https://github.com/lensapp/ogre-tools/compare/v20.5.0...v20.5.1) (2025-02-21)

### Bug Fixes

- Fix typing of getInjectableComponent ([1f805c6](https://github.com/lensapp/ogre-tools/commit/1f805c6a50f520ea3b82604b31988e049a3001cc))

## [20.5.0](https://github.com/lensapp/ogre-tools/compare/v20.4.1...v20.5.0) (2025-02-10)

### Features

- Make useInject support suspending between updates ([46302aa](https://github.com/lensapp/ogre-tools/commit/46302aa36a80f765c675f9fbe01d98cbe212a3c6))
- Make useInject suspend between updates as default ([54746ef](https://github.com/lensapp/ogre-tools/commit/54746eff91ed84a1042914be8980d9114584b78d))

### [20.4.1](https://github.com/lensapp/ogre-tools/compare/v20.4.0...v20.4.1) (2025-01-31)

**Note:** Version bump only for package @lensapp/injectable-react

## [20.4.0](https://github.com/lensapp/ogre-tools/compare/v20.3.0...v20.4.0) (2025-01-30)

### Features

- Support PlaceholderComponents to consume the props of an InjectableComponent ([404f697](https://github.com/lensapp/ogre-tools/commit/404f6976aea5eefca882e02533b7888d537e437e))

## [20.3.0](https://github.com/lensapp/ogre-tools/compare/v20.2.1...v20.3.0) (2025-01-30)

**Note:** Version bump only for package @lensapp/injectable-react

### [20.2.1](https://github.com/lensapp/ogre-tools/compare/v20.2.0...v20.2.1) (2025-01-23)

**Note:** Version bump only for package @lensapp/injectable-react

## [20.2.0](https://github.com/lensapp/ogre-tools/compare/v20.1.0...v20.2.0) (2025-01-22)

### Bug Fixes

- Make an injectableComponent not confuse different dis ([e102d98](https://github.com/lensapp/ogre-tools/commit/e102d98b53cc246496f3a520208468e5a931c395))

## [20.1.0](https://github.com/lensapp/ogre-tools/compare/v20.0.1...v20.1.0) (2025-01-13)

**Note:** Version bump only for package @lensapp/injectable-react

### [20.0.1](https://github.com/lensapp/ogre-tools/compare/v20.0.0...v20.0.1) (2025-01-10)

**Note:** Version bump only for package @lensapp/injectable-react

## [20.0.0](https://github.com/lensapp/ogre-tools/compare/v18.5.3...v20.0.0) (2025-01-09)

### ⚠ BREAKING CHANGES

- Migrate to React ^18.

Co-authored-by: Janne Savolainen <janne.savolainen@live.fi>
Signed-off-by: Iku-turso <mikko.aspiala@gmail.com>

### Features

- Introduce way to create injectables that are also components: "getInjectableComponent" ([8c8c5ff](https://github.com/lensapp/ogre-tools/commit/8c8c5ff26581e44c97404b7f0e06785ed80c02fa))
- Introduce way to inject injectables in components using react hook: "useInject" ([11474f9](https://github.com/lensapp/ogre-tools/commit/11474f91c0f54c46d3082813b4f693cdbc098664))
- Use layoutEffect in withInjectables to probably serve unit-testability ([8ba8734](https://github.com/lensapp/ogre-tools/commit/8ba8734e3099fa9ed54235ea8226eed731557bf5))

### Bug Fixes

- Make changes in props not lose focus on inputs when using withInjectables and async deps ([eee31b9](https://github.com/lensapp/ogre-tools/commit/eee31b9e7e67b00dd178d4aa37d9e56f0bb3e1b2))

### Reverts

- Revert "chore: Consolidate dependencies after major version bump" ([c411800](https://github.com/lensapp/ogre-tools/commit/c41180041d828f6ca4b77939384819700b3c73c2))

### Miscellaneous Chores

- Drop support for React 17 ([b387379](https://github.com/lensapp/ogre-tools/commit/b38737910009306db2d2f5ed0380dc6f1160b212))

## [19.0.0](https://github.com/lensapp/ogre-tools/compare/v18.3.1...v19.0.0) (2024-01-24)

### ⚠ BREAKING CHANGES

- Migrate to using asyncComputed in package mobx-utils

Co-authored-by: Janne Savolainen <janne.savolainen@live.fi>

### Miscellaneous Chores

- Get rid of duplicated asyncComputed ([b6fd8b3](https://github.com/lensapp/ogre-tools/commit/b6fd8b3a4feac728ee3c2484191111660b1a8b34))

## [19.0.0](https://github.com/lensapp/ogre-tools/compare/v18.3.1...v19.0.0) (2024-01-24)

### ⚠ BREAKING CHANGES

- Migrate to using asyncComputed in package mobx-utils

Co-authored-by: Janne Savolainen <janne.savolainen@live.fi>

### Miscellaneous Chores

- Get rid of duplicated asyncComputed ([b6fd8b3](https://github.com/lensapp/ogre-tools/commit/b6fd8b3a4feac728ee3c2484191111660b1a8b34))

### [18.5.3](https://github.com/lensapp/ogre-tools/compare/v18.5.2...v18.5.3) (2024-10-01)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.5.2](https://github.com/lensapp/ogre-tools/compare/v18.5.1...v18.5.2) (2024-09-03)

### Bug Fixes

- Make withInjectables have access to all features of di ([974cb5f](https://github.com/lensapp/ogre-tools/commit/974cb5f193f453b64781927a61823167729a7e9b))

### [18.5.1](https://github.com/lensapp/ogre-tools/compare/v18.5.0...v18.5.1) (2024-04-19)

**Note:** Version bump only for package @lensapp/injectable-react

## [18.5.0](https://github.com/lensapp/ogre-tools/compare/v18.4.1...v18.5.0) (2024-04-17)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.4.1](https://github.com/lensapp/ogre-tools/compare/v18.4.0...v18.4.1) (2024-02-12)

**Note:** Version bump only for package @lensapp/injectable-react

## [18.4.0](https://github.com/lensapp/ogre-tools/compare/v18.3.1...v18.4.0) (2024-02-12)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.3.1](https://github.com/lensapp/ogre-tools/compare/v18.3.0...v18.3.1) (2024-01-23)

**Note:** Version bump only for package @lensapp/injectable-react

## [18.3.0](https://github.com/lensapp/ogre-tools/compare/v18.2.2...v18.3.0) (2024-01-08)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.2.2](https://github.com/lensapp/ogre-tools/compare/v18.2.1...v18.2.2) (2024-01-05)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.2.1](https://github.com/lensapp/ogre-tools/compare/v18.2.0...v18.2.1) (2024-01-04)

**Note:** Version bump only for package @lensapp/injectable-react

## [18.2.0](https://github.com/lensapp/ogre-tools/compare/v18.1.0...v18.2.0) (2024-01-04)

**Note:** Version bump only for package @lensapp/injectable-react

## [18.1.0](https://github.com/lensapp/ogre-tools/compare/v18.0.2...v18.1.0) (2023-11-27)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.0.2](https://github.com/lensapp/ogre-tools/compare/v18.0.1...v18.0.2) (2023-11-14)

**Note:** Version bump only for package @lensapp/injectable-react

### [18.0.1](https://github.com/ogre-works/ogre-tools/compare/v18.0.0...v18.0.1) (2023-10-26)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [18.0.0](https://github.com/ogre-works/ogre-tools/compare/v17.10.0...v18.0.0) (2023-10-23)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.10.0](https://github.com/ogre-works/ogre-tools/compare/v17.9.0...v17.10.0) (2023-10-19)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.9.0](https://github.com/ogre-works/ogre-tools/compare/v17.8.0...v17.9.0) (2023-10-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.8.0](https://github.com/ogre-works/ogre-tools/compare/v17.7.0...v17.8.0) (2023-10-09)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.7.0](https://github.com/ogre-works/ogre-tools/compare/v17.6.0...v17.7.0) (2023-09-12)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.6.0](https://github.com/ogre-works/ogre-tools/compare/v17.5.1...v17.6.0) (2023-09-06)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [17.5.1](https://github.com/ogre-works/ogre-tools/compare/v17.5.0...v17.5.1) (2023-06-22)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.5.0](https://github.com/ogre-works/ogre-tools/compare/v17.3.0...v17.5.0) (2023-06-21)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.4.0](https://github.com/ogre-works/ogre-tools/compare/v17.3.0...v17.4.0) (2023-06-21)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.3.0](https://github.com/ogre-works/ogre-tools/compare/v17.2.0...v17.3.0) (2023-06-19)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.2.0](https://github.com/ogre-works/ogre-tools/compare/v17.1.1...v17.2.0) (2023-06-01)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [17.1.1](https://github.com/ogre-works/ogre-tools/compare/v17.1.0...v17.1.1) (2023-05-31)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.1.0](https://github.com/ogre-works/ogre-tools/compare/v17.0.0...v17.1.0) (2023-05-30)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [17.0.0](https://github.com/ogre-works/ogre-tools/compare/v16.1.2...v17.0.0) (2023-05-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [16.1.2](https://github.com/ogre-works/ogre-tools/compare/v16.1.1...v16.1.2) (2023-05-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [16.1.1](https://github.com/ogre-works/ogre-tools/compare/v16.1.0...v16.1.1) (2023-05-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [16.1.0](https://github.com/ogre-works/ogre-tools/compare/v16.0.0...v16.1.0) (2023-05-16)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [16.0.0](https://github.com/ogre-works/ogre-tools/compare/v15.9.0...v16.0.0) (2023-05-15)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.9.0](https://github.com/ogre-works/ogre-tools/compare/v15.8.1...v15.9.0) (2023-05-08)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.8.1](https://github.com/ogre-works/ogre-tools/compare/v15.8.0...v15.8.1) (2023-05-02)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.8.0](https://github.com/ogre-works/ogre-tools/compare/v15.7.0...v15.8.0) (2023-05-02)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.7.0](https://github.com/ogre-works/ogre-tools/compare/v15.6.1...v15.7.0) (2023-04-27)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.6.1](https://github.com/ogre-works/ogre-tools/compare/v15.6.0...v15.6.1) (2023-04-24)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.6.0](https://github.com/ogre-works/ogre-tools/compare/v15.5.1...v15.6.0) (2023-04-24)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.5.1](https://github.com/ogre-works/ogre-tools/compare/v15.5.0...v15.5.1) (2023-04-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.5.0](https://github.com/ogre-works/ogre-tools/compare/v15.4.0...v15.5.0) (2023-04-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.4.0](https://github.com/ogre-works/ogre-tools/compare/v15.3.1...v15.4.0) (2023-04-11)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.3.1](https://github.com/ogre-works/ogre-tools/compare/v15.3.0...v15.3.1) (2023-04-06)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.3.0](https://github.com/ogre-works/ogre-tools/compare/v15.2.1...v15.3.0) (2023-04-04)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.2.1](https://github.com/ogre-works/ogre-tools/compare/v15.2.0...v15.2.1) (2023-03-31)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.2.0](https://github.com/ogre-works/ogre-tools/compare/v15.1.1...v15.2.0) (2023-03-30)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.1.2](https://github.com/ogre-works/ogre-tools/compare/v15.1.1...v15.1.2) (2023-03-02)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [15.1.1](https://github.com/ogre-works/ogre-tools/compare/v15.1.0...v15.1.1) (2023-02-27)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [15.1.0](https://github.com/ogre-works/ogre-tools/compare/v15.0.1...v15.1.0) (2023-02-22)

### Features

- Make placeholder of withInjectables able to be more specialized by passing props to it ([d3fa8aa](https://github.com/ogre-works/ogre-tools/commit/d3fa8aa8528533942c612cf92cf54cad70ad212d))

### [15.0.1](https://github.com/ogre-works/ogre-tools/compare/v15.0.0...v15.0.1) (2023-02-21)

### Bug Fixes

- Fix bad import path ([c90d54b](https://github.com/ogre-works/ogre-tools/commit/c90d54b4c2713bccff6e2830808994a4c7a05f77))

## [15.0.0](https://github.com/ogre-works/ogre-tools/compare/v14.0.3...v15.0.0) (2023-02-20)

### ⚠ BREAKING CHANGES

- `injectable-react` now requires `registerInjectableReact(di)` to work.

### Features

- Remove too complex concept of "ad-hoc"-injectables (ie. injectable without registration) ([3baaf04](https://github.com/ogre-works/ogre-tools/commit/3baaf049bff802f015c5dc8497aa6c3e01f91cfe))

### [14.0.3](https://github.com/ogre-works/ogre-tools/compare/v14.0.2...v14.0.3) (2022-11-23)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [14.0.2](https://github.com/ogre-works/ogre-tools/compare/v14.0.1...v14.0.2) (2022-11-23)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [14.0.1](https://github.com/ogre-works/ogre-tools/compare/v14.0.0...v14.0.1) (2022-11-23)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [14.0.0](https://github.com/ogre-works/ogre-tools/compare/v13.2.1...v14.0.0) (2022-11-22)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [13.2.1](https://github.com/ogre-works/ogre-tools/compare/v13.2.0...v13.2.1) (2022-11-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [13.2.0](https://github.com/ogre-works/ogre-tools/compare/v13.1.0...v13.2.0) (2022-11-17)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [13.1.0](https://github.com/ogre-works/ogre-tools/compare/v13.0.0...v13.1.0) (2022-11-15)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [13.0.0](https://github.com/ogre-works/ogre-tools/compare/v12.0.1...v13.0.0) (2022-11-14)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [12.0.1](https://github.com/ogre-works/ogre-tools/compare/v12.0.0...v12.0.1) (2022-10-25)

### Bug Fixes

- Manually update versions of peerDependencies as Lerna doesn't do it for some reason ([0b46667](https://github.com/ogre-works/ogre-tools/commit/0b46667c106a93131f6320222aced3187cd9a292))

## [12.0.0](https://github.com/ogre-works/ogre-tools/compare/v11.0.0...v12.0.0) (2022-10-25)

### ⚠ BREAKING CHANGES

- Make asyncComputed receive parameters as value object instead of many arguments

### Features

- Make asyncComputed able to show latest value (instead of pending value) between updates ([d543053](https://github.com/ogre-works/ogre-tools/commit/d5430534f16b67d7b5f09a5ce07d893dab48426d))
- Make asyncComputed receive parameters as value object instead of many arguments ([7cf0035](https://github.com/ogre-works/ogre-tools/commit/7cf00350e079a65d8aa9d904d71fb07ce0eff520))

## [11.0.0](https://github.com/ogre-works/ogre-tools/compare/v10.3.2...v11.0.0) (2022-10-04)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [10.3.2](https://github.com/ogre-works/ogre-tools/compare/v10.3.1...v10.3.2) (2022-09-26)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [10.3.1](https://github.com/ogre-works/ogre-tools/compare/v10.3.0...v10.3.1) (2022-09-26)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [10.3.0](https://github.com/ogre-works/ogre-tools/compare/v10.2.0...v10.3.0) (2022-09-26)

### Features

- Make build of a ts-package include type information ([d174431](https://github.com/ogre-works/ogre-tools/commit/d1744317a55a4975f68452534321d98a8ff5e543))

## [10.2.0](https://github.com/ogre-works/ogre-tools/compare/v10.1.0...v10.2.0) (2022-09-23)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [10.1.0](https://github.com/ogre-works/ogre-tools/compare/v10.0.0...v10.1.0) (2022-09-02)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [10.0.0](https://github.com/ogre-works/ogre-tools/compare/v9.0.3...v10.0.0) (2022-09-01)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [9.0.3](https://github.com/ogre-works/ogre-tools/compare/v9.0.2...v9.0.3) (2022-08-25)

### Bug Fixes

- Make injectable-react not break React reconciliation when using async dependencies ([049c84a](https://github.com/ogre-works/ogre-tools/commit/049c84a022ed18e14cd6b1d0a8ad7358ccec8640))

### [9.0.2](https://github.com/ogre-works/ogre-tools/compare/v9.0.1...v9.0.2) (2022-08-10)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [9.0.1](https://github.com/ogre-works/ogre-tools/compare/v9.0.0...v9.0.1) (2022-06-29)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [9.0.0](https://github.com/ogre-works/ogre-tools/compare/v8.0.0...v9.0.0) (2022-06-20)

### ⚠ BREAKING CHANGES

- Make containers have ID for better error messages

### Features

- Make containers have ID for better error messages ([ea3ac4c](https://github.com/ogre-works/ogre-tools/commit/ea3ac4c4becbb79509ffe19f66ffac62364e22d6))

## [8.0.0](https://github.com/ogre-works/ogre-tools/compare/v7.1.0...v8.0.0) (2022-06-15)

### Reverts

- Revert "chore: Consolidate to relying of peer dependencies in injectable extensions" ([8f9b9b2](https://github.com/ogre-works/ogre-tools/commit/8f9b9b2afee9154e523254ea0d9338aa5fdd4fb4))

## [7.1.0](https://github.com/ogre-works/ogre-tools/compare/v7.0.0...v7.1.0) (2022-06-09)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [7.0.0](https://github.com/ogre-works/ogre-tools/compare/v6.0.1...v7.0.0) (2022-04-27)

### ⚠ BREAKING CHANGES

- Extract auto-registration as extension

### Miscellaneous Chores

- Extract auto-registration as extension ([8395a7a](https://github.com/ogre-works/ogre-tools/commit/8395a7a8eba457f98ebd10a1dfa7c6cf901fdc34))

### [6.0.1](https://github.com/ogre-works/ogre-tools/compare/v6.0.0...v6.0.1) (2022-03-30)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [6.0.0](https://github.com/ogre-works/ogre-tools/compare/v5.2.0...v6.0.0) (2022-03-29)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [5.2.0](https://github.com/ogre-works/ogre-tools/compare/v5.1.3...v5.2.0) (2022-03-23)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [5.1.3](https://github.com/ogre-works/ogre-tools/compare/v5.1.2...v5.1.3) (2022-03-18)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [5.1.2](https://github.com/ogre-works/ogre-tools/compare/v5.1.1...v5.1.2) (2022-03-14)

**Note:** Version bump only for package @ogre-tools/injectable-react

### [5.1.1](https://github.com/ogre-works/ogre-tools/compare/v5.1.0...v5.1.1) (2022-03-11)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [5.1.0](https://github.com/ogre-works/ogre-tools/compare/v5.0.0...v5.1.0) (2022-03-11)

### Features

- Add injection context for withInjectables ([d69a57d](https://github.com/ogre-works/ogre-tools/commit/d69a57d7d1428342b76bb0d6ef272ede6c85858c))

### Bug Fixes

- Resolve PR comments ([bb2e1de](https://github.com/ogre-works/ogre-tools/commit/bb2e1debdcfe901f998eabcaba1941222e917950))
- **typings:** Improve typings to work with arbitrary injection params ([c1d900a](https://github.com/ogre-works/ogre-tools/commit/c1d900a22ae9d609e3b70b3d0a034dd5e81901b0))

## [5.0.0](https://github.com/ogre-works/ogre-tools/compare/v4.1.0...v5.0.0) (2022-02-09)

### ⚠ BREAKING CHANGES

- Consolidate typing of injectable and injectable-react

### Bug Fixes

- Consolidate typing of injectable and injectable-react ([a52180d](https://github.com/ogre-works/ogre-tools/commit/a52180d28119e544c5023a8706ca2a077f2217cf))

## [4.1.0](https://github.com/ogre-works/ogre-tools/compare/v4.0.0...v4.1.0) (2022-02-08)

**Note:** Version bump only for package @ogre-tools/injectable-react

## [4.0.0](https://github.com/ogre-works/ogre-tools/compare/v3.2.1...v4.0.0) (2022-02-07)

### Bug Fixes

- fix build by using webpack made available to a package by lerna ([5b08e24](https://github.com/ogre-works/ogre-tools/commit/5b08e2472fe06514901546e8a5eb8d8664282a0c))
