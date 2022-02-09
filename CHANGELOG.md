# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
