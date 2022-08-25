# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [9.0.3](https://github.com/ogre-works/ogre-tools/compare/v9.0.2...v9.0.3) (2022-08-25)


### Bug Fixes

* Make injectable-react not break React reconciliation when using async dependencies ([049c84a](https://github.com/ogre-works/ogre-tools/commit/049c84a022ed18e14cd6b1d0a8ad7358ccec8640))


### Reverts

* Revert "chore: Change to using v8 coverage provider for babel misbehaving" ([4fb612b](https://github.com/ogre-works/ogre-tools/commit/4fb612be9fcbda37333e51cea75d3c6ab5767b30))



### [9.0.2](https://github.com/ogre-works/ogre-tools/compare/v9.0.1...v9.0.2) (2022-08-10)

**Note:** Version bump only for package ogre-tools





### [9.0.1](https://github.com/ogre-works/ogre-tools/compare/v9.0.0...v9.0.1) (2022-06-29)

**Note:** Version bump only for package ogre-tools





## [9.0.0](https://github.com/ogre-works/ogre-tools/compare/v8.0.0...v9.0.0) (2022-06-20)


### ⚠ BREAKING CHANGES

* Make containers have ID for better error messages

### Features

* Make containers have ID for better error messages ([ea3ac4c](https://github.com/ogre-works/ogre-tools/commit/ea3ac4c4becbb79509ffe19f66ffac62364e22d6))


### Bug Fixes

* Prevent nested computedInjectMany's from appearing as cycles ([24cfa1f](https://github.com/ogre-works/ogre-tools/commit/24cfa1f9dd5eaddec604bfd723a548e261e13169))



## [8.0.0](https://github.com/ogre-works/ogre-tools/compare/v7.1.0...v8.0.0) (2022-06-15)


### ⚠ BREAKING CHANGES

* Expose function for injecting reactively many instead of using instantiation parameter

### Features

* Add shorthands for decorating to make addition of e.g. jest.spy easier ([350a957](https://github.com/ogre-works/ogre-tools/commit/350a9575ba2b20d0395bcfb0e855c0ee93be80a8))
* Expose deregistering in types ([6823839](https://github.com/ogre-works/ogre-tools/commit/6823839c781e8c6aca1394fd70d5fc3e9f8405fe))
* Expose function for injecting reactively many instead of using instantiation parameter ([b572b32](https://github.com/ogre-works/ogre-tools/commit/b572b328f977120713e9c3339a9cff5c1daaa1ba))


### Bug Fixes

* Return same computed when injecting reactively many multiple times for same injection token ([75d8f51](https://github.com/ogre-works/ogre-tools/commit/75d8f51107c92de493bb73d51b6b285653753027))


### Reverts

* Revert "chore: Consolidate to relying of peer dependencies in injectable extensions" ([8f9b9b2](https://github.com/ogre-works/ogre-tools/commit/8f9b9b2afee9154e523254ea0d9338aa5fdd4fb4))



## [7.1.0](https://github.com/ogre-works/ogre-tools/compare/v7.0.0...v7.1.0) (2022-06-09)


### Features

* Expose way to decorate instantiations ([8f4b39a](https://github.com/ogre-works/ogre-tools/commit/8f4b39a884e8566159ac72d04f3a9cf69b977a2a))



## [7.0.0](https://github.com/ogre-works/ogre-tools/compare/v6.0.1...v7.0.0) (2022-04-27)


### ⚠ BREAKING CHANGES

* Extract auto-registration as extension

### Features

* Add decorator for deregistration of injectables ([1192484](https://github.com/ogre-works/ogre-tools/commit/1192484e1c28be4f8f8c8524f9c0a841e6fca1f6))
* Expose deregister to instantiate ([eea8bcc](https://github.com/ogre-works/ogre-tools/commit/eea8bcc8ebd63ec316d39f43d4284f79a9c47b5e))
* Expose di.unoverride() for TypeScript ([293b3ac](https://github.com/ogre-works/ogre-tools/commit/293b3ace89d535efe33f50d43a0b9bc0e33e824b))
* Introduce "reactive injectMany" which reacts to "late registrations" of injection tokens ([da932a6](https://github.com/ogre-works/ogre-tools/commit/da932a64b05073dcff9be88b8e5a2d82ed591679))
* Introduce automated testing for typings ([19b2d45](https://github.com/ogre-works/ogre-tools/commit/19b2d45eccd34698f6709b1f3eaf2cc849475a2c))
* Introduce decorator for registration to later permit reactive injectMany ([34d2667](https://github.com/ogre-works/ogre-tools/commit/34d266764124cf247018fd8714e95e4fdee7ef76))
* Introduce deregistration of injectables ([d5ee408](https://github.com/ogre-works/ogre-tools/commit/d5ee408e1d75ac520ed05a83bf86dd135709242f))
* Make all reactive registrations happen together in one transaction ([3acf508](https://github.com/ogre-works/ogre-tools/commit/3acf5082f424ba30fd1c02ff5a0831d49bb55b40))
* Make async injectMany react also to deregistrations ([be2f193](https://github.com/ogre-works/ogre-tools/commit/be2f1930d6e14f4cff88783eb0bfc2ce705ba311))
* Make deregistration of injectables variadic ([8681a6e](https://github.com/ogre-works/ogre-tools/commit/8681a6eff8002373056a151f6405fb945280d427))
* Make late registered branches deregister together ([41304db](https://github.com/ogre-works/ogre-tools/commit/41304db962b3fd0147e2d6855071f640a42a03f9))
* Make registration of injectables variadic ([eea1c0a](https://github.com/ogre-works/ogre-tools/commit/eea1c0af9944ff695d77bdc1a5b62a7e2fc87291))


### Bug Fixes

* Make MobX peer-dependency for injectable-extension-for-mobx ([924b4f6](https://github.com/ogre-works/ogre-tools/commit/924b4f686c4d4d8e24311ed7febbf120d32578a4))


### Miscellaneous Chores

* Extract auto-registration as extension ([8395a7a](https://github.com/ogre-works/ogre-tools/commit/8395a7a8eba457f98ebd10a1dfa7c6cf901fdc34))



### [6.0.1](https://github.com/ogre-works/ogre-tools/compare/v6.0.0...v6.0.1) (2022-03-30)


### Bug Fixes

* Fix error in typing of a lifecycle ([3b4b3cd](https://github.com/ogre-works/ogre-tools/commit/3b4b3cdae9f67afd668c96bc451e1f858af27513))



## [6.0.0](https://github.com/ogre-works/ogre-tools/compare/v5.2.0...v6.0.0) (2022-03-29)


### ⚠ BREAKING CHANGES

* Remove concept of setuppable
* Extract dependency graphing from core as extensions
* Extract error monitoring from core as extensions

### Miscellaneous Chores

* Extract dependency graphing from core as extensions ([4ab3eeb](https://github.com/ogre-works/ogre-tools/commit/4ab3eebd334bc8d0c7aecf3c762f676ae845dc30))
* Extract error monitoring from core as extensions ([d255f06](https://github.com/ogre-works/ogre-tools/commit/d255f06e94322d624022a9ff28ab48dc535220fe))
* Remove concept of setuppable ([51affc5](https://github.com/ogre-works/ogre-tools/commit/51affc58f0c3e69d3e8754bcf5505b79d03d7a43))



## [5.2.0](https://github.com/ogre-works/ogre-tools/compare/v5.1.3...v5.2.0) (2022-03-23)


### Features

* Expose permitting of side-effects to TypeScript ([a69daea](https://github.com/ogre-works/ogre-tools/commit/a69daea9c27cbb9ee146c970b7c1947a7dc309ca))



### [5.1.3](https://github.com/ogre-works/ogre-tools/compare/v5.1.2...v5.1.3) (2022-03-18)

**Note:** Version bump only for package ogre-tools





### [5.1.2](https://github.com/ogre-works/ogre-tools/compare/v5.1.1...v5.1.2) (2022-03-14)


### Bug Fixes

* Report misconfigured *.injectable.{js|ts} files ([8117f16](https://github.com/ogre-works/ogre-tools/commit/8117f1614a49b2202eb8620d280dfed6e6f1fcb6))
* Unit tests ([435690e](https://github.com/ogre-works/ogre-tools/commit/435690e1095c0214aece8bb81d54372e706102e7))
* Uppercase for errors ([8b48b69](https://github.com/ogre-works/ogre-tools/commit/8b48b69843a0c4e2994b2b498fd14a6a48870742))



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
