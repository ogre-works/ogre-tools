# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [5.1.1](https://github.com/ogre-works/ogre-tools/compare/v5.1.0...v5.1.1) (2022-03-11)


### Bug Fixes

* Make all reports directories excludes from NPM ([a7b71ce](https://github.com/ogre-works/ogre-tools/commit/a7b71ce6aa89b957a1cd7995b2396781854cd5c6))



## [5.1.0](https://github.com/ogre-works/ogre-tools/compare/v5.0.0...v5.1.0) (2022-03-11)


### Features

* Add "setup" to branch-tags of dependency graphing ([da315b2](https://github.com/ogre-works/ogre-tools/commit/da315b2dbcaa3e248b7133642db232e5e28bdc00))
* Add branch tags for dependency graphing ([9e43197](https://github.com/ogre-works/ogre-tools/commit/9e431972a7d0722b4bbffaacefb91e7d7cb9bb2c))
* Add injection context for withInjectables ([d69a57d](https://github.com/ogre-works/ogre-tools/commit/d69a57d7d1428342b76bb0d6ef272ede6c85858c))
* Expose instantiation parameters to error monitoring for better messages ([7b13267](https://github.com/ogre-works/ogre-tools/commit/7b13267fcb0798a1ac4879389747139ee348041d))
* Expose naive, synchronous types for pipeline ([b909e72](https://github.com/ogre-works/ogre-tools/commit/b909e7239c5d2507088805a1d51aaef649ade837))
* **graphing:** Add appearance for sync/async ([a1523cf](https://github.com/ogre-works/ogre-tools/commit/a1523cf9ee3059adb52a6f8598d2fdcde6642055))
* **graphing:** Introduce graph customizers to eg. make reactive dependencies stick out ([8877020](https://github.com/ogre-works/ogre-tools/commit/8877020ab7e756d732f204f1b996b91e1343badc))
* **graphing:** Make graph more eye-ballable by adding colors and symbols ([d31bc57](https://github.com/ogre-works/ogre-tools/commit/d31bc57dcfc04677de0d4201475d9bdb763e1343))
* **graphing:** Make injection tokens stand out ([17796b5](https://github.com/ogre-works/ogre-tools/commit/17796b5d1608be6ddcd223dba456a79aa7908ae9))
* **graphing:** Make link and link info text color customizable separately ([aa42120](https://github.com/ogre-works/ogre-tools/commit/aa42120a70babd163dd817cd25583a090a7b3d18))
* **graphing:** Make link and link info text colors customizable ([2057001](https://github.com/ogre-works/ogre-tools/commit/205700110f2fbea33c90c9ff1f23848e0db6ccdc))
* Hide irrelevant data in dependency graphing ([7e38ac3](https://github.com/ogre-works/ogre-tools/commit/7e38ac34c219d6cba23c37e94decf2d04964d7df))
* **injectable:** Make setups able to inject many ([1dfca82](https://github.com/ogre-works/ogre-tools/commit/1dfca82428959204d352ba86292e2d418656fef2))
* Introduce ad-hoc injectables that do not require registration ([82c7a43](https://github.com/ogre-works/ogre-tools/commit/82c7a43ba530325c090334108827c92f700dfbd3))
* Introduce error monitoring for all injectables that return a function ([6f458f2](https://github.com/ogre-works/ogre-tools/commit/6f458f27fb028435f8d3147e78a9ba3dc4c98bd5))
* Introduce injectable extension for dependency graphing using Plant UML ([a32d206](https://github.com/ogre-works/ogre-tools/commit/a32d206a5d14feb7a61544ed47b5bdef9219e831))
* Introduce late registration ([5524f0e](https://github.com/ogre-works/ogre-tools/commit/5524f0e61a86ddbb60f0d33db5347fba90ba19b7))
* Introduce variation point for error handling of instantiation ([481b4d5](https://github.com/ogre-works/ogre-tools/commit/481b4d5a3a3995a5f2f0383e7986fa27ddaddf5c))
* Introduce variation point for global decoration of "instantiate" ([fe5e1a9](https://github.com/ogre-works/ogre-tools/commit/fe5e1a991884d589b60934e4dda1377b69202baa))
* Introduce variation point for targeted decoration of "instantiate" ([70b8918](https://github.com/ogre-works/ogre-tools/commit/70b8918f415c450638cade56098c1f8a4588b23c))
* Introduce way to get property value from dictionary and throw if it does not exist ([3707c78](https://github.com/ogre-works/ogre-tools/commit/3707c78c525fd9eb3e2b02f509e19f977164757d))
* Make error monitoring possible for TypeScript ([d0fd4ef](https://github.com/ogre-works/ogre-tools/commit/d0fd4ef7c4525189918397069dc2e6ff1de0eff0))
* Make injection tokens display more pretty in dependency graphing ([dc55d12](https://github.com/ogre-works/ogre-tools/commit/dc55d12a3f7d30ee957843e734968294d2e95efe))
* Make setuppables display more pretty in dependency graphing ([1fbdf74](https://github.com/ogre-works/ogre-tools/commit/1fbdf74405a7b7d97ec4680eed12149ad036d725))
* Permit instance key of any type ([0a68f24](https://github.com/ogre-works/ogre-tools/commit/0a68f24079b8d887e6b586bd1d2d83df7efc63e3))
* Show lifecycle names in dependency graphing ([9c0cf20](https://github.com/ogre-works/ogre-tools/commit/9c0cf205d7116d8438d307aee8b5752c37588851))


### Bug Fixes

* Add missing export for error monitoring in JS ([55fd4d2](https://github.com/ogre-works/ogre-tools/commit/55fd4d20241bd044be5668d80df4fdc493311da4))
* complete fix ([2bba4f3](https://github.com/ogre-works/ogre-tools/commit/2bba4f30cee996559a2135e718c87686f38f9bde))
* Define nodes before links in dependency graphing for human-readability ([af2c0d3](https://github.com/ogre-works/ogre-tools/commit/af2c0d3e4a67efebaa58eaf8c1d31bcfc5dd1f79))
* Faulty type parameter value ([17cfa76](https://github.com/ogre-works/ogre-tools/commit/17cfa76954a97671466cdcc7ae2c2433720ab5a8))
* Fix bad import ([16f06ce](https://github.com/ogre-works/ogre-tools/commit/16f06ce96b8e7b078e3e3d4df3ecc8fb266299e7))
* Fix typing of getting injectable for injection token ([53ca8ad](https://github.com/ogre-works/ogre-tools/commit/53ca8ad616d4c1ffa6fdde1811f2a404527bc585))
* lifecycleEnum.keyedSingleton not working ([06a86dc](https://github.com/ogre-works/ogre-tools/commit/06a86dc9fc19777616d1367300a8b13846ae7a0e))
* Make also injectMany comply to error monitoring for instantiation ([eb8baf7](https://github.com/ogre-works/ogre-tools/commit/eb8baf7b6fa0d71d7d5d9841b9e90093a5098799))
* Make setuppables display correctly in dependency graphing ([30425e4](https://github.com/ogre-works/ogre-tools/commit/30425e4de36b82ca97983390f54ff9e7d7b88ec7))
* Present dependency graph in correct order and with tokens ([17a5b6c](https://github.com/ogre-works/ogre-tools/commit/17a5b6c4654e9bc5ab0c5f0c499840d08beead13))
* Resolve PR comments ([bb2e1de](https://github.com/ogre-works/ogre-tools/commit/bb2e1debdcfe901f998eabcaba1941222e917950))
* **typings:** Improve typings to work with arbitrary injection params ([c1d900a](https://github.com/ogre-works/ogre-tools/commit/c1d900a22ae9d609e3b70b3d0a034dd5e81901b0))



## [5.0.0](https://github.com/ogre-works/ogre-tools/compare/v4.1.0...v5.0.0) (2022-02-09)


### ⚠ BREAKING CHANGES

* Consolidate typing of injectable and injectable-react

### Bug Fixes

* Consolidate typing of injectable and injectable-react ([a52180d](https://github.com/ogre-works/ogre-tools/commit/a52180d28119e544c5023a8706ca2a077f2217cf))



## [4.1.0](https://github.com/ogre-works/ogre-tools/compare/v4.0.0...v4.1.0) (2022-02-08)


### Features

* Expose keyed singleton as lifecycle in types ([282762e](https://github.com/ogre-works/ogre-tools/commit/282762e3b8e7998fd26474198c10592c67c89ddb))
* introduce keyedSingleton as lifecycle ([174472c](https://github.com/ogre-works/ogre-tools/commit/174472c296c8bdaf2b5ca38469d1f9b3a1963277))
* Permit primitive instantiation parameters ([b10dd82](https://github.com/ogre-works/ogre-tools/commit/b10dd82d7674952129ee5eeb31f50e0c5cb06e6c))



## [4.0.0](https://github.com/ogre-works/ogre-tools/compare/v3.2.1...v4.0.0) (2022-02-07)


### ⚠ BREAKING CHANGES

* force breaking change to cause major version bump in Lerna
* add NPM-script for opening github in browser

### Bug Fixes

* drop another old version of node for breaking build ([d5cfaf7](https://github.com/ogre-works/ogre-tools/commit/d5cfaf7bed2d3c17e0a6b17bcc431071617f8b47))
* fix build by using webpack made available to a package by lerna ([5b08e24](https://github.com/ogre-works/ogre-tools/commit/5b08e2472fe06514901546e8a5eb8d8664282a0c))
* force breaking change to cause major version bump in Lerna ([f0c1def](https://github.com/ogre-works/ogre-tools/commit/f0c1defeb85166ccf1907e5d6e9a36cb1cb2314a))
* make breaking changes in git cause major version bump in Lerna ([be13e14](https://github.com/ogre-works/ogre-tools/commit/be13e142a36b501e921c454dd212646989580c4d))
* make publish not time out by watching tests ([be4aba6](https://github.com/ogre-works/ogre-tools/commit/be4aba639a4dcbb9faac64b0e02ed0c8f37effba))
* stop using workspaces for not being supported in CI ([3858ee2](https://github.com/ogre-works/ogre-tools/commit/3858ee28dd0f92c55b54489daa6b7c88e75b41dc))


### Reverts

* Revert "Revert "Enhance error for injecting non-registered injectable"" ([8e24a0c](https://github.com/ogre-works/ogre-tools/commit/8e24a0c058758a4c8c50209e9702fd7a2bd792f9))
* Revert "Revert "Implement di.injectMany() as way to inject multiple registered injectables for an injection token"" ([f5d0e01](https://github.com/ogre-works/ogre-tools/commit/f5d0e013d7e079deb5fe1eba5396595850930901))
* Revert "Revert "Permit injection using only injectable or injection token. Replace "id" with "module" for better error messages."" ([fc67c38](https://github.com/ogre-works/ogre-tools/commit/fc67c38aaf4fd4bf81edbcd8dd8bc843864ba0ce))
* Revert "Revert "Remove concept of "injectable viability" for being YAGNI"" ([e4979c6](https://github.com/ogre-works/ogre-tools/commit/e4979c6ef6a002e0f8ae1da248323a2cba672049))
* Revert "Revert "Prevent public access to injection context"" ([4c88b4a](https://github.com/ogre-works/ogre-tools/commit/4c88b4a1c7db1135a2a47c5f97dd976c085bdb42))


### Miscellaneous Chores

* add NPM-script for opening github in browser ([c94284f](https://github.com/ogre-works/ogre-tools/commit/c94284f760270c166965635deec59598f8233303))
