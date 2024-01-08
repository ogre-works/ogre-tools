# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [18.3.0](https://github.com/lensapp/ogre-tools/compare/v18.2.2...v18.3.0) (2024-01-08)

### Features

- Expose typing for instantiation parameter of computedInjectMany ([64674a1](https://github.com/lensapp/ogre-tools/commit/64674a149864c532b8cd09a7b2aa6c59f8c97e1f))
- Implement checking for if "alias-has-registrations" ([ae1fb0a](https://github.com/lensapp/ogre-tools/commit/ae1fb0a1ffc4b641f8caf80012516629aaeb948d))

### [18.2.2](https://github.com/lensapp/ogre-tools/compare/v18.2.1...v18.2.2) (2024-01-05)

**Note:** Version bump only for package ogre-tools

### [18.2.1](https://github.com/lensapp/ogre-tools/compare/v18.2.0...v18.2.1) (2024-01-04)

**Note:** Version bump only for package ogre-tools

## [18.2.0](https://github.com/lensapp/ogre-tools/compare/v18.1.0...v18.2.0) (2024-01-04)

### Features

- Introduce mechanism to purge all instances but not overrides ([6b98501](https://github.com/lensapp/ogre-tools/commit/6b98501bd36a4e8ac8ecda92049ccffdf9793833))

### Reverts

- Revert "chore: Add work in progress unit tests for early overriding injection tokens" ([83b6ad7](https://github.com/lensapp/ogre-tools/commit/83b6ad7e69abd6ca1882b41288bbdf18b7207c77))

## [18.1.0](https://github.com/lensapp/ogre-tools/compare/v18.0.2...v18.1.0) (2023-11-27)

### Features

- Expose typing for instantiation parameter of computedInjectMany ([e87d092](https://github.com/lensapp/ogre-tools/commit/e87d092a1800e0338514ca1278a5b042ef875fd4))

### [18.0.2](https://github.com/lensapp/ogre-tools/compare/v18.0.1...v18.0.2) (2023-11-14)

**Note:** Version bump only for package ogre-tools

### [18.0.1](https://github.com/ogre-works/ogre-tools/compare/v18.0.0...v18.0.1) (2023-10-26)

### Bug Fixes

- Fix bad imports and remove dead comment ([088ecb0](https://github.com/ogre-works/ogre-tools/commit/088ecb0caed37991cbaf942466387649f1501b29))

## [18.0.0](https://github.com/ogre-works/ogre-tools/compare/v17.10.0...v18.0.0) (2023-10-23)

### ⚠ BREAKING CHANGES

- Illegal attempts to inject singletons with an instantiation parameter now throw.
  Adapt by either:

1. Changing design to not use instantiation parameters for singletons
2. Making the singletons keyed singletons instead
3. Having singletons receive what they need as a dependency, instead of instantiation parameter

### Features

- Expose typing of getKeyedSingletonCompositeKey ([2e94d50](https://github.com/ogre-works/ogre-tools/commit/2e94d50dbed1fd22fce2ce891b294cb469f798f2))
- Introduce DeepMap, being like Map, but with composite keys instead of singular ones ([7ef8e99](https://github.com/ogre-works/ogre-tools/commit/7ef8e998a2ec09093715d2d77892fb8223906971))
- Make ComputedInjectMany support instantiation parameters ([fc6aefa](https://github.com/ogre-works/ogre-tools/commit/fc6aefac3f0bff3ea91d92bb145004915eeacdcf))
- Make keys of keyedSingleton able to be composed of multiple reference values ([ad6c067](https://github.com/ogre-works/ogre-tools/commit/ad6c067b477b6d77ca066ab17a38c0079b24e329))
- Make singletons throw if instantiation parameter is provided ([96215f2](https://github.com/ogre-works/ogre-tools/commit/96215f2d2abba2f817fdb4e184bfb6914b27e6c8))

## [17.10.0](https://github.com/ogre-works/ogre-tools/compare/v17.9.0...v17.10.0) (2023-10-19)

### Features

- Introduce proper typing for pipelineBreak ([6a78b40](https://github.com/ogre-works/ogre-tools/commit/6a78b4066dbb23c66a22765cf54633cf9b48c0f9))
- Introduce safePipeline which is like pipeline, but considers "undefined" as pipelineBreak ([db82b7c](https://github.com/ogre-works/ogre-tools/commit/db82b7c8f3868564c133b6941df2ec10dea364cb))

## [17.9.0](https://github.com/ogre-works/ogre-tools/compare/v17.8.0...v17.9.0) (2023-10-17)

### Features

- Introduce early-override to permit override of injectable before registered ([6e7f5ea](https://github.com/ogre-works/ogre-tools/commit/6e7f5ea7f91b0be86f900c5fade72b1172153777))
- Introduce way to get return-value of first of many functions that matches an input-value ([c939461](https://github.com/ogre-works/ogre-tools/commit/c9394610187223812b8882a7bbbf0259ced11299))

## [17.8.0](https://github.com/ogre-works/ogre-tools/compare/v17.7.0...v17.8.0) (2023-10-09)

### Features

- Make public a way to break/abort flow of a pipeline ([30b58d9](https://github.com/ogre-works/ogre-tools/commit/30b58d938f47200924d0a7dcf745b95b862d03b5))

## [17.7.0](https://github.com/ogre-works/ogre-tools/compare/v17.6.0...v17.7.0) (2023-09-12)

### Features

- Make linkable throw when a glob in .linkable.json leads to no package.json ([be952b6](https://github.com/ogre-works/ogre-tools/commit/be952b6049c5f2298fae5263fea4fb75bafbe01a))

## [17.6.0](https://github.com/ogre-works/ogre-tools/compare/v17.5.1...v17.6.0) (2023-09-06)

### Features

- Introduce the injectable bunch, ie. a registrable object of multiple injectables ([e115dde](https://github.com/ogre-works/ogre-tools/commit/e115ddea8f4c90c2403d6fe17db330e87d2da6dc))
- Make auto-register support same injectable being exported multiple times ([a1527e3](https://github.com/ogre-works/ogre-tools/commit/a1527e3b17b44d7df6c5084049a01f2af30b9141))

### Bug Fixes

- Enforce code coverage yet again ([08dde1f](https://github.com/ogre-works/ogre-tools/commit/08dde1fc1e20bc6b8f07c1aa141d264fec5020c8))

### [17.5.1](https://github.com/ogre-works/ogre-tools/compare/v17.5.0...v17.5.1) (2023-06-22)

### Bug Fixes

- Expose InjectWithMeta in DI during instantiate ([816e57a](https://github.com/ogre-works/ogre-tools/commit/816e57a75c08dccc7d9071c6384d5857c5364b96))

## [17.5.0](https://github.com/ogre-works/ogre-tools/compare/v17.3.0...v17.5.0) (2023-06-21)

### Features

- Introduce InjectWithMeta ([24e9bf0](https://github.com/ogre-works/ogre-tools/commit/24e9bf05f995720790daee31ff0623999e5ce227))

## [17.4.0](https://github.com/ogre-works/ogre-tools/compare/v17.3.0...v17.4.0) (2023-06-21)

### Features

- Introduce InjectWithMeta ([24e9bf0](https://github.com/ogre-works/ogre-tools/commit/24e9bf05f995720790daee31ff0623999e5ce227))

## [17.3.0](https://github.com/ogre-works/ogre-tools/compare/v17.2.0...v17.3.0) (2023-06-19)

### Features

- Make injectable-mobx not require MobX-transaction ([45a2712](https://github.com/ogre-works/ogre-tools/commit/45a27123452ec200c5997cb91e7408344ae139dd))

## [17.2.0](https://github.com/ogre-works/ogre-tools/compare/v17.1.1...v17.2.0) (2023-06-01)

### Features

- Make permitting side effects work properly with injection tokens ([f3dea3b](https://github.com/ogre-works/ogre-tools/commit/f3dea3b2c3938b94ba3773ca63cd39328eb6ebcd))

### [17.1.1](https://github.com/ogre-works/ogre-tools/compare/v17.1.0...v17.1.1) (2023-05-31)

### Bug Fixes

- Handle all permutations of ill-formatted paths ([3e3bd6b](https://github.com/ogre-works/ogre-tools/commit/3e3bd6b9bcb0e6bc8e4e7d39f7bd56e9a79a1473))
- Make linkable push throw when encountering file paths incompatible with yalc ([be75a7e](https://github.com/ogre-works/ogre-tools/commit/be75a7ec25f618e894270a83806928b5b109d809))

## [17.1.0](https://github.com/ogre-works/ogre-tools/compare/v17.0.0...v17.1.0) (2023-05-30)

### Features

- Make linkable able to automatically attempt fixing corrupted yalc.lock files ([a574e19](https://github.com/ogre-works/ogre-tools/commit/a574e193bf31bac2bfbde64afacab210f84f41c3))
- Make linkable able to link from monorepo ([2de597b](https://github.com/ogre-works/ogre-tools/commit/2de597b1782ee5e04e67d942741e78fb7d123397))

## [17.0.0](https://github.com/ogre-works/ogre-tools/compare/v16.1.2...v17.0.0) (2023-05-17)

### ⚠ BREAKING CHANGES

- Adapt to changes in typing of asyncComputed.

### Bug Fixes

- Make types of asyncComputed describe the value for pending more ([b6719f5](https://github.com/ogre-works/ogre-tools/commit/b6719f57ec206b48213814cf8133ad5e4c3ab745))

### [16.1.2](https://github.com/ogre-works/ogre-tools/compare/v16.1.1...v16.1.2) (2023-05-17)

### Bug Fixes

- Revert a patch release contents that was actually breaking ([22628a3](https://github.com/ogre-works/ogre-tools/commit/22628a303d9dcbc660ddf9c873c51dd9587409b1))

### [16.1.1](https://github.com/ogre-works/ogre-tools/compare/v16.1.0...v16.1.1) (2023-05-17)

### Bug Fixes

- Make types of asyncComputed describe the value for pending more accurately ([e4d6325](https://github.com/ogre-works/ogre-tools/commit/e4d6325b276fd4ffa4f6a71a679f9aa703bc1c10))

## [16.1.0](https://github.com/ogre-works/ogre-tools/compare/v16.0.0...v16.1.0) (2023-05-16)

### Features

- Implement access to source namespace to permit eg. "scope specific" keyedSingletons ([a3a0326](https://github.com/ogre-works/ogre-tools/commit/a3a0326ecf9cdee9a69aaa92cddf56f608f48d65))

## [16.0.0](https://github.com/ogre-works/ogre-tools/compare/v15.9.0...v16.0.0) (2023-05-15)

### ⚠ BREAKING CHANGES

- Make sure previous usages of injectable id of meta do not break with the
  new addition of namespace. Eg. what previously was di.injectManyWithMeta(someInjectionToken) ->
  { id: 'some-id', instance: ... }
  ...will now become:
  { id: 'some-scope:some-id', instance: ... }
  ...when a scope is present.

### Features

- Implement computedInjectManyWithMeta, and add missing type tests to computedInjectMany ([a8527c1](https://github.com/ogre-works/ogre-tools/commit/a8527c1465c4dd5475917208f25978b39c447f5c))
- Make the injectable id for "meta" namespaced to avoid collisions ([baa52a9](https://github.com/ogre-works/ogre-tools/commit/baa52a94c4274807c446c801e95c736b22b4d4ed))

## [15.9.0](https://github.com/ogre-works/ogre-tools/compare/v15.8.1...v15.9.0) (2023-05-08)

### Features

- Permit also programmatic access to functionalities of linkable ([8e51894](https://github.com/ogre-works/ogre-tools/commit/8e518945b929209a1827258d4f43f0e50d4090ad))
- Permit unoverride of injectionToken with exactly one implementation ([4346c92](https://github.com/ogre-works/ogre-tools/commit/4346c92ecceb58f119aceaddb87ae773d2364c9e))

### [15.8.1](https://github.com/ogre-works/ogre-tools/compare/v15.8.0...v15.8.1) (2023-05-02)

### Bug Fixes

- Use correct kind of npm-dependencies ([5039d1f](https://github.com/ogre-works/ogre-tools/commit/5039d1fa298e78a7976c4e185571f81ca0c705fe))

## [15.8.0](https://github.com/ogre-works/ogre-tools/compare/v15.7.0...v15.8.0) (2023-05-02)

### Features

- Allow isInjectable and isInjectionToken to be used for type narrowing ([b82c1c9](https://github.com/ogre-works/ogre-tools/commit/b82c1c9e5d52b12288f555b0698f0f8996108fb9))

## [15.7.0](https://github.com/ogre-works/ogre-tools/compare/v15.6.1...v15.7.0) (2023-04-27)

### Features

- Add "linkable-push" as counterpart of "linkable" ([240ea84](https://github.com/ogre-works/ogre-tools/commit/240ea841122588926b96c455a222d4b39143dbd5))
- Add support for globs in the linkable configuration ([62144eb](https://github.com/ogre-works/ogre-tools/commit/62144eb4dd3d8851626f4f220ef4c2907cbbb4da))

### Bug Fixes

- Make local node_modules of linked packages not break runtime when in non-bundled context ([a9bfcae](https://github.com/ogre-works/ogre-tools/commit/a9bfcae307dca628c78ad7a8e972991795e81192))

### [15.6.1](https://github.com/ogre-works/ogre-tools/compare/v15.6.0...v15.6.1) (2023-04-24)

**Note:** Version bump only for package ogre-tools

## [15.6.0](https://github.com/ogre-works/ogre-tools/compare/v15.5.1...v15.6.0) (2023-04-24)

### Features

- Indicate lack of support for missing "files" in package.jsons used by linkable ([e0d14e6](https://github.com/ogre-works/ogre-tools/commit/e0d14e661314ba15e22447b64fc9208d20e7a020))
- Introduce "linkable", ie. like "npm link", but mimicking "npm pack" as symlinks ([1955082](https://github.com/ogre-works/ogre-tools/commit/1955082490f3513ca0e19e73228edc8932fe0f94))
- Make built linkable runnable as npm bin script ([410a78e](https://github.com/ogre-works/ogre-tools/commit/410a78e11ed2d46886a61376afdbb0d960c8560a))

### Bug Fixes

- Avoid destructuring to not make brittle this-context of "fs" not break ([5db7984](https://github.com/ogre-works/ogre-tools/commit/5db7984bbc8f927f61577dd1475c8e4f8662015c))
- Fix "path"-specific typing error ([b670b36](https://github.com/ogre-works/ogre-tools/commit/b670b3631f967cf0c844a99d88e4c60e2cdf6f4d))
- Fixup ([6284ca4](https://github.com/ogre-works/ogre-tools/commit/6284ca4f14d5b2ded89f755139b8e1b91b2b4e98))
- Make existence of static linked files work by using absolute path ([50fa2d6](https://github.com/ogre-works/ogre-tools/commit/50fa2d6a21fa836cb933d3970fa3d55db341d795))
- Use correct build script for a ts-package ([d80a233](https://github.com/ogre-works/ogre-tools/commit/d80a233d0ae78f9fb4d5c03398d060e9171520ab))

### [15.5.1](https://github.com/ogre-works/ogre-tools/compare/v15.5.0...v15.5.1) (2023-04-17)

### Bug Fixes

- Implement also nested di.injectFactory() ([4db761b](https://github.com/ogre-works/ogre-tools/commit/4db761b692206217d088a5fd7df73121d4831806))

## [15.5.0](https://github.com/ogre-works/ogre-tools/compare/v15.4.0...v15.5.0) (2023-04-17)

### Features

- Introduce di.injectFactory() ([c21a5fa](https://github.com/ogre-works/ogre-tools/commit/c21a5faa347669e094c5a381cd73ab3b5aa79273))

## [15.4.0](https://github.com/ogre-works/ogre-tools/compare/v15.3.1...v15.4.0) (2023-04-11)

### Features

- Introduce access to already injected instances ([a8ecc66](https://github.com/ogre-works/ogre-tools/commit/a8ecc66db8603ea416bd9f1e58a0d10937fd609a))

### [15.3.1](https://github.com/ogre-works/ogre-tools/compare/v15.3.0...v15.3.1) (2023-04-06)

### Bug Fixes

- Clarify typing of injectionDecoratorToken and instantiationDecoratorToken ([cea796b](https://github.com/ogre-works/ogre-tools/commit/cea796bb6ffe29a301892dcdf11cc52e9b05b117))

## [15.3.0](https://github.com/ogre-works/ogre-tools/compare/v15.2.1...v15.3.0) (2023-04-04)

### Features

- Allow disabling cycle detection ([661f346](https://github.com/ogre-works/ogre-tools/commit/661f346f7c216e3695f26e545a8b4a2b1228fa64))

### [15.2.1](https://github.com/ogre-works/ogre-tools/compare/v15.2.0...v15.2.1) (2023-03-31)

### Bug Fixes

- Change the typing of injectionDecoratorToken ([e0b8871](https://github.com/ogre-works/ogre-tools/commit/e0b8871b1f48a7dab61d8ad00fdab91c016ed2fc))

## [15.2.0](https://github.com/ogre-works/ogre-tools/compare/v15.1.1...v15.2.0) (2023-03-30)

### Features

- Restore cycle detection ([f603234](https://github.com/ogre-works/ogre-tools/commit/f603234635c5026fbd3ab63cf623775dfd54e456))

### Bug Fixes

- Fix injectable-utils entrypoint ([84cf9de](https://github.com/ogre-works/ogre-tools/commit/84cf9de08517b0e91554aec4ba54662a799f22f4))
- Fix type decl to fix test ([ab00ef9](https://github.com/ogre-works/ogre-tools/commit/ab00ef9546ef6dd78013b782e18af89ee6ceb07b))
- Improve typing of injectionDecoratorToken and instantiationDecoratorToken ([b204cf1](https://github.com/ogre-works/ogre-tools/commit/b204cf107e6fb8cb8c6dabd3af517b595dc97607))

### [15.1.2](https://github.com/ogre-works/ogre-tools/compare/v15.1.1...v15.1.2) (2023-03-02)

### Bug Fixes

- Fix injectable-utils entrypoint ([6a668b5](https://github.com/ogre-works/ogre-tools/commit/6a668b56b58bdeca0e2d6607b52de832fdaa4bcf))

### [15.1.1](https://github.com/ogre-works/ogre-tools/compare/v15.1.0...v15.1.1) (2023-02-27)

**Note:** Version bump only for package ogre-tools

## [15.1.0](https://github.com/ogre-works/ogre-tools/compare/v15.0.1...v15.1.0) (2023-02-22)

### Features

- Make placeholder of withInjectables able to be more specialized by passing props to it ([d3fa8aa](https://github.com/ogre-works/ogre-tools/commit/d3fa8aa8528533942c612cf92cf54cad70ad212d))

### [15.0.1](https://github.com/ogre-works/ogre-tools/compare/v15.0.0...v15.0.1) (2023-02-21)

### Bug Fixes

- Fix bad import path ([c90d54b](https://github.com/ogre-works/ogre-tools/commit/c90d54b4c2713bccff6e2830808994a4c7a05f77))

## [15.0.0](https://github.com/ogre-works/ogre-tools/compare/v14.0.3...v15.0.0) (2023-02-20)

### ⚠ BREAKING CHANGES

- `injectable-react` now requires `registerInjectableReact(di)` to work.
- Identify injectables and tokens by reference instead of id to permit namespaces later
- Make flow not automatically await for promises in arrays

### Features

- Identify injectables and tokens by reference instead of id to permit namespaces later ([72487e2](https://github.com/ogre-works/ogre-tools/commit/72487e204d8a8c022405b6d51ea4480e716e9b6e))
- Include "scope" of injectable in typing ([6a81e7c](https://github.com/ogre-works/ogre-tools/commit/6a81e7c3b7075f0b820b02063e898eec33fa4246))
- Introduce "di.injectManyWithMeta()" to permit reuse of injectable id in implementation code ([94fed1e](https://github.com/ogre-works/ogre-tools/commit/94fed1e267f5deeb7dd3344fd8bb95aad73cf65e))
- Introduce "generable" (ie. generator library X) as package ([bd1b8c7](https://github.com/ogre-works/ogre-tools/commit/bd1b8c75cbb912d5c9ab1b27ca25fe0d3afcd8cd))
- Introduce combinations in fp ([88f0617](https://github.com/ogre-works/ogre-tools/commit/88f061776e6c9027241c8876d07b159c99286ee5))
- Introduce matchAll in fp ([000b23e](https://github.com/ogre-works/ogre-tools/commit/000b23e75fa0c4ff51ab9c44e163ece13c67e0bc))
- Introduce movingWindow in fp ([1f212c0](https://github.com/ogre-works/ogre-tools/commit/1f212c00e1c5d23b4c733564aacfb0ccf127c412))
- Introduce relationJoin in fp ([09ee015](https://github.com/ogre-works/ogre-tools/commit/09ee015b07d7637b659e9d0ed2beab9774d98d6c))
- Introduce replaceTagsWithValues in fp ([235be79](https://github.com/ogre-works/ogre-tools/commit/235be79a8db6e320ea1203513cf6c1ab4fbde88e))
- Introduce scopes for injectables to initially serve as namespaces ([d773e34](https://github.com/ogre-works/ogre-tools/commit/d773e34af86d40d7cc46ef11aa0c850ff7c1c76e))
- Make flow not automatically await for promises in arrays ([9752ef4](https://github.com/ogre-works/ogre-tools/commit/9752ef46d863fbbaaaeda0e01a683a53cb6b4b77))
- Remove too complex concept of "ad-hoc"-injectables (ie. injectable without registration) ([3baaf04](https://github.com/ogre-works/ogre-tools/commit/3baaf049bff802f015c5dc8497aa6c3e01f91cfe))

### [14.0.3](https://github.com/ogre-works/ogre-tools/compare/v14.0.2...v14.0.3) (2022-11-23)

**Note:** Version bump only for package ogre-tools

### [14.0.2](https://github.com/ogre-works/ogre-tools/compare/v14.0.1...v14.0.2) (2022-11-23)

**Note:** Version bump only for package ogre-tools

### [14.0.1](https://github.com/ogre-works/ogre-tools/compare/v14.0.0...v14.0.1) (2022-11-23)

**Note:** Version bump only for package ogre-tools

## [14.0.0](https://github.com/ogre-works/ogre-tools/compare/v13.2.1...v14.0.0) (2022-11-22)

### ⚠ BREAKING CHANGES

- Make properties of an injectable read-only to prevent misuse

### Features

- Make properties of an injectable read-only to prevent misuse ([abf402a](https://github.com/ogre-works/ogre-tools/commit/abf402a2c3edaa9701d818c926c9faa3d029779e))
- Permit override of single injectable using injection token ([f6ae117](https://github.com/ogre-works/ogre-tools/commit/f6ae117a949c353267ccd21bb7b5239705c6a62e))

### [13.2.1](https://github.com/ogre-works/ogre-tools/compare/v13.2.0...v13.2.1) (2022-11-17)

### Bug Fixes

- Make auto-register work in already built packages ([35ed955](https://github.com/ogre-works/ogre-tools/commit/35ed9558154cd016b9e983dd9cd76539db349c40))

## [13.2.0](https://github.com/ogre-works/ogre-tools/compare/v13.1.0...v13.2.0) (2022-11-17)

### Features

- Duplicate asyncComputed in proper, new package ([5e83f5f](https://github.com/ogre-works/ogre-tools/commit/5e83f5fcf0151db990d430394150abac2ed0fb27))

## [13.1.0](https://github.com/ogre-works/ogre-tools/compare/v13.0.0...v13.1.0) (2022-11-15)

### Features

- Expose typing for test utils ([5c0d408](https://github.com/ogre-works/ogre-tools/commit/5c0d408ffbd5ad930aa1757fe8ec6742d1c0449d))

## [13.0.0](https://github.com/ogre-works/ogre-tools/compare/v12.0.1...v13.0.0) (2022-11-14)

### ⚠ BREAKING CHANGES

- `autoRegister()` now requires `targetModule` and `getRequireContexts`
  instead of `requireContexts`.
- Prevent overriding already injected injectables

### Features

- Make auto-register work within jest without hacks ([7ef90d1](https://github.com/ogre-works/ogre-tools/commit/7ef90d13852196beaf50e23d612a94b83b5d59c9))
- Make getSafeFrom list existing properties as part of error for none found ([8eef13c](https://github.com/ogre-works/ogre-tools/commit/8eef13c71c06eb99a7dfb5a911f1af3b8a100e33))
- Prevent overriding already injected injectables ([3a611bc](https://github.com/ogre-works/ogre-tools/commit/3a611bc3710bcd838a9b4bd9130a2a0871f20054))

### Bug Fixes

- Export fp-functions present in typing: "getFrom" and "getSafeFrom" ([f9e85a4](https://github.com/ogre-works/ogre-tools/commit/f9e85a43252a5e6a97822437535912322b441827))
- Fix TypeScript compilation ([0bdcd5b](https://github.com/ogre-works/ogre-tools/commit/0bdcd5ba2efbad35642cb3f9403565dfac33cb34))

### Reverts

- Revert "chore: Make CI NPM install in non-CI way to try fix build in CI" ([f5aeefd](https://github.com/ogre-works/ogre-tools/commit/f5aeefd3c138dcc94816921844784f58a97eb201))

### [12.0.1](https://github.com/ogre-works/ogre-tools/compare/v12.0.0...v12.0.1) (2022-10-25)

### Bug Fixes

- Manually update versions of peerDependencies as Lerna doesn't do it for some reason ([0b46667](https://github.com/ogre-works/ogre-tools/commit/0b46667c106a93131f6320222aced3187cd9a292))

## [12.0.0](https://github.com/ogre-works/ogre-tools/compare/v11.0.0...v12.0.0) (2022-10-25)

### ⚠ BREAKING CHANGES

- Make asyncComputed receive parameters as value object instead of many arguments
- Make bundle sizes a lot smaller by not bundling from node_modules

### Features

- Make asyncComputed able to show latest value (instead of pending value) between updates ([d543053](https://github.com/ogre-works/ogre-tools/commit/d5430534f16b67d7b5f09a5ce07d893dab48426d))
- Make asyncComputed receive parameters as value object instead of many arguments ([7cf0035](https://github.com/ogre-works/ogre-tools/commit/7cf00350e079a65d8aa9d904d71fb07ce0eff520))
- Make bundle sizes a lot smaller by not bundling from node_modules ([d47acbe](https://github.com/ogre-works/ogre-tools/commit/d47acbedb351e61b783a95a3272003c2d94aacc7))

### Bug Fixes

- Enable "npm workspaces" to make peerDependencies work in build and development ([628c37b](https://github.com/ogre-works/ogre-tools/commit/628c37b69c4cb83384746fcac191375daa8085c4))

## [11.0.0](https://github.com/ogre-works/ogre-tools/compare/v10.3.2...v11.0.0) (2022-10-04)

### ⚠ BREAKING CHANGES

- Stop exposing technicalities

### Bug Fixes

- Replace symbols with magic strings, as external libs may bundle multiple instances ([ce79b25](https://github.com/ogre-works/ogre-tools/commit/ce79b257f6513bd5f349e797132b8d8320943412))

### Miscellaneous Chores

- Stop exposing technicalities ([e06d77c](https://github.com/ogre-works/ogre-tools/commit/e06d77cf45f9add236ea48b1f35ba83f1047df93))

### [10.3.2](https://github.com/ogre-works/ogre-tools/compare/v10.3.1...v10.3.2) (2022-09-26)

### Bug Fixes

- Export missing types from Runnable ([05f48b4](https://github.com/ogre-works/ogre-tools/commit/05f48b459e6e3a89b670d45b26875bafe9fbc5bf))

### [10.3.1](https://github.com/ogre-works/ogre-tools/compare/v10.3.0...v10.3.1) (2022-09-26)

**Note:** Version bump only for package ogre-tools

## [10.3.0](https://github.com/ogre-works/ogre-tools/compare/v10.2.0...v10.3.0) (2022-09-26)

### Features

- Introduce "runnable" in injectable-utils ([80eb213](https://github.com/ogre-works/ogre-tools/commit/80eb213b7ff195f0190bcbe55b190edf739df3dd))
- Make build of a ts-package include type information ([d174431](https://github.com/ogre-works/ogre-tools/commit/d1744317a55a4975f68452534321d98a8ff5e543))

## [10.2.0](https://github.com/ogre-works/ogre-tools/compare/v10.1.0...v10.2.0) (2022-09-23)

### Features

- Make auto-register also register named exports, and not just the default export ([6af7f4c](https://github.com/ogre-works/ogre-tools/commit/6af7f4cc844142efaff1f9e5a1bc7d1eeb8bfa29))

## [10.1.0](https://github.com/ogre-works/ogre-tools/compare/v10.0.0...v10.1.0) (2022-09-02)

### Features

- Make error message for attempt to inject a side-effect contain context ([b474146](https://github.com/ogre-works/ogre-tools/commit/b4741460e0a487980ed531f0c175debe5ff07f4d))

### Bug Fixes

- Make decorator injectables behave consistently with cycles ([b6481b5](https://github.com/ogre-works/ogre-tools/commit/b6481b5466d10dd4b9f6b95bab9c9aa9a80b719b))

## [10.0.0](https://github.com/ogre-works/ogre-tools/compare/v9.0.3...v10.0.0) (2022-09-01)

### ⚠ BREAKING CHANGES

- Make sure all registrations happen before injections
- Make registrations in presence of computedInjectMany require explicit MobX-transaction

### Features

- Expose id of injectionToken in typing ([09284f3](https://github.com/ogre-works/ogre-tools/commit/09284f3fb3f012be3441893949d65fc34aa4c4ec))
- Expose typings for decorability, tags and di.context ([fb49104](https://github.com/ogre-works/ogre-tools/commit/fb491045b93b28f15e372d153aa97f94fc7d093c))
- Make registrations in presence of computedInjectMany require explicit MobX-transaction ([dcbf551](https://github.com/ogre-works/ogre-tools/commit/dcbf55102e240a7c6f4e775cfab1cc94b565e5d8))
- Permit registrations without MobX transaction when injectable has no token ([c65a529](https://github.com/ogre-works/ogre-tools/commit/c65a5292a00ff95f9882c8c3b6f5cba9b325cfbe))

### Bug Fixes

- Add unit tests to prove and document the injection context in di.context ([3126248](https://github.com/ogre-works/ogre-tools/commit/312624836ee4bc195d137f8c838e3e717dd98b4a))
- Make computedInjectMany not blow up when unrelated decorators are present ([888f76f](https://github.com/ogre-works/ogre-tools/commit/888f76f8a1d9214ab92e3c0715235fd1f06d3eb0))
- Make sure all registrations happen before injections ([e551e70](https://github.com/ogre-works/ogre-tools/commit/e551e707934c35a11350818f66307fb40b51e693))

### [9.0.3](https://github.com/ogre-works/ogre-tools/compare/v9.0.2...v9.0.3) (2022-08-25)

### Bug Fixes

- Make injectable-react not break React reconciliation when using async dependencies ([049c84a](https://github.com/ogre-works/ogre-tools/commit/049c84a022ed18e14cd6b1d0a8ad7358ccec8640))

### Reverts

- Revert "chore: Change to using v8 coverage provider for babel misbehaving" ([4fb612b](https://github.com/ogre-works/ogre-tools/commit/4fb612be9fcbda37333e51cea75d3c6ab5767b30))

### [9.0.2](https://github.com/ogre-works/ogre-tools/compare/v9.0.1...v9.0.2) (2022-08-10)

**Note:** Version bump only for package ogre-tools

### [9.0.1](https://github.com/ogre-works/ogre-tools/compare/v9.0.0...v9.0.1) (2022-06-29)

**Note:** Version bump only for package ogre-tools

## [9.0.0](https://github.com/ogre-works/ogre-tools/compare/v8.0.0...v9.0.0) (2022-06-20)

### ⚠ BREAKING CHANGES

- Make containers have ID for better error messages

### Features

- Make containers have ID for better error messages ([ea3ac4c](https://github.com/ogre-works/ogre-tools/commit/ea3ac4c4becbb79509ffe19f66ffac62364e22d6))

### Bug Fixes

- Prevent nested computedInjectMany's from appearing as cycles ([24cfa1f](https://github.com/ogre-works/ogre-tools/commit/24cfa1f9dd5eaddec604bfd723a548e261e13169))

## [8.0.0](https://github.com/ogre-works/ogre-tools/compare/v7.1.0...v8.0.0) (2022-06-15)

### ⚠ BREAKING CHANGES

- Expose function for injecting reactively many instead of using instantiation parameter

### Features

- Add shorthands for decorating to make addition of e.g. jest.spy easier ([350a957](https://github.com/ogre-works/ogre-tools/commit/350a9575ba2b20d0395bcfb0e855c0ee93be80a8))
- Expose deregistering in types ([6823839](https://github.com/ogre-works/ogre-tools/commit/6823839c781e8c6aca1394fd70d5fc3e9f8405fe))
- Expose function for injecting reactively many instead of using instantiation parameter ([b572b32](https://github.com/ogre-works/ogre-tools/commit/b572b328f977120713e9c3339a9cff5c1daaa1ba))

### Bug Fixes

- Return same computed when injecting reactively many multiple times for same injection token ([75d8f51](https://github.com/ogre-works/ogre-tools/commit/75d8f51107c92de493bb73d51b6b285653753027))

### Reverts

- Revert "chore: Consolidate to relying of peer dependencies in injectable extensions" ([8f9b9b2](https://github.com/ogre-works/ogre-tools/commit/8f9b9b2afee9154e523254ea0d9338aa5fdd4fb4))

## [7.1.0](https://github.com/ogre-works/ogre-tools/compare/v7.0.0...v7.1.0) (2022-06-09)

### Features

- Expose way to decorate instantiations ([8f4b39a](https://github.com/ogre-works/ogre-tools/commit/8f4b39a884e8566159ac72d04f3a9cf69b977a2a))

## [7.0.0](https://github.com/ogre-works/ogre-tools/compare/v6.0.1...v7.0.0) (2022-04-27)

### ⚠ BREAKING CHANGES

- Extract auto-registration as extension

### Features

- Add decorator for deregistration of injectables ([1192484](https://github.com/ogre-works/ogre-tools/commit/1192484e1c28be4f8f8c8524f9c0a841e6fca1f6))
- Expose deregister to instantiate ([eea8bcc](https://github.com/ogre-works/ogre-tools/commit/eea8bcc8ebd63ec316d39f43d4284f79a9c47b5e))
- Expose di.unoverride() for TypeScript ([293b3ac](https://github.com/ogre-works/ogre-tools/commit/293b3ace89d535efe33f50d43a0b9bc0e33e824b))
- Introduce "reactive injectMany" which reacts to "late registrations" of injection tokens ([da932a6](https://github.com/ogre-works/ogre-tools/commit/da932a64b05073dcff9be88b8e5a2d82ed591679))
- Introduce automated testing for typings ([19b2d45](https://github.com/ogre-works/ogre-tools/commit/19b2d45eccd34698f6709b1f3eaf2cc849475a2c))
- Introduce decorator for registration to later permit reactive injectMany ([34d2667](https://github.com/ogre-works/ogre-tools/commit/34d266764124cf247018fd8714e95e4fdee7ef76))
- Introduce deregistration of injectables ([d5ee408](https://github.com/ogre-works/ogre-tools/commit/d5ee408e1d75ac520ed05a83bf86dd135709242f))
- Make all reactive registrations happen together in one transaction ([3acf508](https://github.com/ogre-works/ogre-tools/commit/3acf5082f424ba30fd1c02ff5a0831d49bb55b40))
- Make async injectMany react also to deregistrations ([be2f193](https://github.com/ogre-works/ogre-tools/commit/be2f1930d6e14f4cff88783eb0bfc2ce705ba311))
- Make deregistration of injectables variadic ([8681a6e](https://github.com/ogre-works/ogre-tools/commit/8681a6eff8002373056a151f6405fb945280d427))
- Make late registered branches deregister together ([41304db](https://github.com/ogre-works/ogre-tools/commit/41304db962b3fd0147e2d6855071f640a42a03f9))
- Make registration of injectables variadic ([eea1c0a](https://github.com/ogre-works/ogre-tools/commit/eea1c0af9944ff695d77bdc1a5b62a7e2fc87291))

### Bug Fixes

- Make MobX peer-dependency for injectable-extension-for-mobx ([924b4f6](https://github.com/ogre-works/ogre-tools/commit/924b4f686c4d4d8e24311ed7febbf120d32578a4))

### Miscellaneous Chores

- Extract auto-registration as extension ([8395a7a](https://github.com/ogre-works/ogre-tools/commit/8395a7a8eba457f98ebd10a1dfa7c6cf901fdc34))

### [6.0.1](https://github.com/ogre-works/ogre-tools/compare/v6.0.0...v6.0.1) (2022-03-30)

### Bug Fixes

- Fix error in typing of a lifecycle ([3b4b3cd](https://github.com/ogre-works/ogre-tools/commit/3b4b3cdae9f67afd668c96bc451e1f858af27513))

## [6.0.0](https://github.com/ogre-works/ogre-tools/compare/v5.2.0...v6.0.0) (2022-03-29)

### ⚠ BREAKING CHANGES

- Remove concept of setuppable
- Extract dependency graphing from core as extensions
- Extract error monitoring from core as extensions

### Miscellaneous Chores

- Extract dependency graphing from core as extensions ([4ab3eeb](https://github.com/ogre-works/ogre-tools/commit/4ab3eebd334bc8d0c7aecf3c762f676ae845dc30))
- Extract error monitoring from core as extensions ([d255f06](https://github.com/ogre-works/ogre-tools/commit/d255f06e94322d624022a9ff28ab48dc535220fe))
- Remove concept of setuppable ([51affc5](https://github.com/ogre-works/ogre-tools/commit/51affc58f0c3e69d3e8754bcf5505b79d03d7a43))

## [5.2.0](https://github.com/ogre-works/ogre-tools/compare/v5.1.3...v5.2.0) (2022-03-23)

### Features

- Expose permitting of side-effects to TypeScript ([a69daea](https://github.com/ogre-works/ogre-tools/commit/a69daea9c27cbb9ee146c970b7c1947a7dc309ca))

### [5.1.3](https://github.com/ogre-works/ogre-tools/compare/v5.1.2...v5.1.3) (2022-03-18)

**Note:** Version bump only for package ogre-tools

### [5.1.2](https://github.com/ogre-works/ogre-tools/compare/v5.1.1...v5.1.2) (2022-03-14)

### Bug Fixes

- Report misconfigured \*.injectable.{js|ts} files ([8117f16](https://github.com/ogre-works/ogre-tools/commit/8117f1614a49b2202eb8620d280dfed6e6f1fcb6))
- Unit tests ([435690e](https://github.com/ogre-works/ogre-tools/commit/435690e1095c0214aece8bb81d54372e706102e7))
- Uppercase for errors ([8b48b69](https://github.com/ogre-works/ogre-tools/commit/8b48b69843a0c4e2994b2b498fd14a6a48870742))

### [5.1.1](https://github.com/ogre-works/ogre-tools/compare/v5.1.0...v5.1.1) (2022-03-11)

### Bug Fixes

- Make all reports directories excludes from NPM ([a7b71ce](https://github.com/ogre-works/ogre-tools/commit/a7b71ce6aa89b957a1cd7995b2396781854cd5c6))

## [5.1.0](https://github.com/ogre-works/ogre-tools/compare/v5.0.0...v5.1.0) (2022-03-11)

### Features

- Add "setup" to branch-tags of dependency graphing ([da315b2](https://github.com/ogre-works/ogre-tools/commit/da315b2dbcaa3e248b7133642db232e5e28bdc00))
- Add branch tags for dependency graphing ([9e43197](https://github.com/ogre-works/ogre-tools/commit/9e431972a7d0722b4bbffaacefb91e7d7cb9bb2c))
- Add injection context for withInjectables ([d69a57d](https://github.com/ogre-works/ogre-tools/commit/d69a57d7d1428342b76bb0d6ef272ede6c85858c))
- Expose instantiation parameters to error monitoring for better messages ([7b13267](https://github.com/ogre-works/ogre-tools/commit/7b13267fcb0798a1ac4879389747139ee348041d))
- Expose naive, synchronous types for pipeline ([b909e72](https://github.com/ogre-works/ogre-tools/commit/b909e7239c5d2507088805a1d51aaef649ade837))
- **graphing:** Add appearance for sync/async ([a1523cf](https://github.com/ogre-works/ogre-tools/commit/a1523cf9ee3059adb52a6f8598d2fdcde6642055))
- **graphing:** Introduce graph customizers to eg. make reactive dependencies stick out ([8877020](https://github.com/ogre-works/ogre-tools/commit/8877020ab7e756d732f204f1b996b91e1343badc))
- **graphing:** Make graph more eye-ballable by adding colors and symbols ([d31bc57](https://github.com/ogre-works/ogre-tools/commit/d31bc57dcfc04677de0d4201475d9bdb763e1343))
- **graphing:** Make injection tokens stand out ([17796b5](https://github.com/ogre-works/ogre-tools/commit/17796b5d1608be6ddcd223dba456a79aa7908ae9))
- **graphing:** Make link and link info text color customizable separately ([aa42120](https://github.com/ogre-works/ogre-tools/commit/aa42120a70babd163dd817cd25583a090a7b3d18))
- **graphing:** Make link and link info text colors customizable ([2057001](https://github.com/ogre-works/ogre-tools/commit/205700110f2fbea33c90c9ff1f23848e0db6ccdc))
- Hide irrelevant data in dependency graphing ([7e38ac3](https://github.com/ogre-works/ogre-tools/commit/7e38ac34c219d6cba23c37e94decf2d04964d7df))
- **injectable:** Make setups able to inject many ([1dfca82](https://github.com/ogre-works/ogre-tools/commit/1dfca82428959204d352ba86292e2d418656fef2))
- Introduce ad-hoc injectables that do not require registration ([82c7a43](https://github.com/ogre-works/ogre-tools/commit/82c7a43ba530325c090334108827c92f700dfbd3))
- Introduce error monitoring for all injectables that return a function ([6f458f2](https://github.com/ogre-works/ogre-tools/commit/6f458f27fb028435f8d3147e78a9ba3dc4c98bd5))
- Introduce injectable extension for dependency graphing using Plant UML ([a32d206](https://github.com/ogre-works/ogre-tools/commit/a32d206a5d14feb7a61544ed47b5bdef9219e831))
- Introduce late registration ([5524f0e](https://github.com/ogre-works/ogre-tools/commit/5524f0e61a86ddbb60f0d33db5347fba90ba19b7))
- Introduce variation point for error handling of instantiation ([481b4d5](https://github.com/ogre-works/ogre-tools/commit/481b4d5a3a3995a5f2f0383e7986fa27ddaddf5c))
- Introduce variation point for global decoration of "instantiate" ([fe5e1a9](https://github.com/ogre-works/ogre-tools/commit/fe5e1a991884d589b60934e4dda1377b69202baa))
- Introduce variation point for targeted decoration of "instantiate" ([70b8918](https://github.com/ogre-works/ogre-tools/commit/70b8918f415c450638cade56098c1f8a4588b23c))
- Introduce way to get property value from dictionary and throw if it does not exist ([3707c78](https://github.com/ogre-works/ogre-tools/commit/3707c78c525fd9eb3e2b02f509e19f977164757d))
- Make error monitoring possible for TypeScript ([d0fd4ef](https://github.com/ogre-works/ogre-tools/commit/d0fd4ef7c4525189918397069dc2e6ff1de0eff0))
- Make injection tokens display more pretty in dependency graphing ([dc55d12](https://github.com/ogre-works/ogre-tools/commit/dc55d12a3f7d30ee957843e734968294d2e95efe))
- Make setuppables display more pretty in dependency graphing ([1fbdf74](https://github.com/ogre-works/ogre-tools/commit/1fbdf74405a7b7d97ec4680eed12149ad036d725))
- Permit instance key of any type ([0a68f24](https://github.com/ogre-works/ogre-tools/commit/0a68f24079b8d887e6b586bd1d2d83df7efc63e3))
- Show lifecycle names in dependency graphing ([9c0cf20](https://github.com/ogre-works/ogre-tools/commit/9c0cf205d7116d8438d307aee8b5752c37588851))

### Bug Fixes

- Add missing export for error monitoring in JS ([55fd4d2](https://github.com/ogre-works/ogre-tools/commit/55fd4d20241bd044be5668d80df4fdc493311da4))
- complete fix ([2bba4f3](https://github.com/ogre-works/ogre-tools/commit/2bba4f30cee996559a2135e718c87686f38f9bde))
- Define nodes before links in dependency graphing for human-readability ([af2c0d3](https://github.com/ogre-works/ogre-tools/commit/af2c0d3e4a67efebaa58eaf8c1d31bcfc5dd1f79))
- Faulty type parameter value ([17cfa76](https://github.com/ogre-works/ogre-tools/commit/17cfa76954a97671466cdcc7ae2c2433720ab5a8))
- Fix bad import ([16f06ce](https://github.com/ogre-works/ogre-tools/commit/16f06ce96b8e7b078e3e3d4df3ecc8fb266299e7))
- Fix typing of getting injectable for injection token ([53ca8ad](https://github.com/ogre-works/ogre-tools/commit/53ca8ad616d4c1ffa6fdde1811f2a404527bc585))
- lifecycleEnum.keyedSingleton not working ([06a86dc](https://github.com/ogre-works/ogre-tools/commit/06a86dc9fc19777616d1367300a8b13846ae7a0e))
- Make also injectMany comply to error monitoring for instantiation ([eb8baf7](https://github.com/ogre-works/ogre-tools/commit/eb8baf7b6fa0d71d7d5d9841b9e90093a5098799))
- Make setuppables display correctly in dependency graphing ([30425e4](https://github.com/ogre-works/ogre-tools/commit/30425e4de36b82ca97983390f54ff9e7d7b88ec7))
- Present dependency graph in correct order and with tokens ([17a5b6c](https://github.com/ogre-works/ogre-tools/commit/17a5b6c4654e9bc5ab0c5f0c499840d08beead13))
- Resolve PR comments ([bb2e1de](https://github.com/ogre-works/ogre-tools/commit/bb2e1debdcfe901f998eabcaba1941222e917950))
- **typings:** Improve typings to work with arbitrary injection params ([c1d900a](https://github.com/ogre-works/ogre-tools/commit/c1d900a22ae9d609e3b70b3d0a034dd5e81901b0))

## [5.0.0](https://github.com/ogre-works/ogre-tools/compare/v4.1.0...v5.0.0) (2022-02-09)

### ⚠ BREAKING CHANGES

- Consolidate typing of injectable and injectable-react

### Bug Fixes

- Consolidate typing of injectable and injectable-react ([a52180d](https://github.com/ogre-works/ogre-tools/commit/a52180d28119e544c5023a8706ca2a077f2217cf))

## [4.1.0](https://github.com/ogre-works/ogre-tools/compare/v4.0.0...v4.1.0) (2022-02-08)

### Features

- Expose keyed singleton as lifecycle in types ([282762e](https://github.com/ogre-works/ogre-tools/commit/282762e3b8e7998fd26474198c10592c67c89ddb))
- introduce keyedSingleton as lifecycle ([174472c](https://github.com/ogre-works/ogre-tools/commit/174472c296c8bdaf2b5ca38469d1f9b3a1963277))
- Permit primitive instantiation parameters ([b10dd82](https://github.com/ogre-works/ogre-tools/commit/b10dd82d7674952129ee5eeb31f50e0c5cb06e6c))

## [4.0.0](https://github.com/ogre-works/ogre-tools/compare/v3.2.1...v4.0.0) (2022-02-07)

### ⚠ BREAKING CHANGES

- force breaking change to cause major version bump in Lerna
- add NPM-script for opening github in browser

### Bug Fixes

- drop another old version of node for breaking build ([d5cfaf7](https://github.com/ogre-works/ogre-tools/commit/d5cfaf7bed2d3c17e0a6b17bcc431071617f8b47))
- fix build by using webpack made available to a package by lerna ([5b08e24](https://github.com/ogre-works/ogre-tools/commit/5b08e2472fe06514901546e8a5eb8d8664282a0c))
- force breaking change to cause major version bump in Lerna ([f0c1def](https://github.com/ogre-works/ogre-tools/commit/f0c1defeb85166ccf1907e5d6e9a36cb1cb2314a))
- make breaking changes in git cause major version bump in Lerna ([be13e14](https://github.com/ogre-works/ogre-tools/commit/be13e142a36b501e921c454dd212646989580c4d))
- make publish not time out by watching tests ([be4aba6](https://github.com/ogre-works/ogre-tools/commit/be4aba639a4dcbb9faac64b0e02ed0c8f37effba))
- stop using workspaces for not being supported in CI ([3858ee2](https://github.com/ogre-works/ogre-tools/commit/3858ee28dd0f92c55b54489daa6b7c88e75b41dc))

### Reverts

- Revert "Revert "Enhance error for injecting non-registered injectable"" ([8e24a0c](https://github.com/ogre-works/ogre-tools/commit/8e24a0c058758a4c8c50209e9702fd7a2bd792f9))
- Revert "Revert "Implement di.injectMany() as way to inject multiple registered injectables for an injection token"" ([f5d0e01](https://github.com/ogre-works/ogre-tools/commit/f5d0e013d7e079deb5fe1eba5396595850930901))
- Revert "Revert "Permit injection using only injectable or injection token. Replace "id" with "module" for better error messages."" ([fc67c38](https://github.com/ogre-works/ogre-tools/commit/fc67c38aaf4fd4bf81edbcd8dd8bc843864ba0ce))
- Revert "Revert "Remove concept of "injectable viability" for being YAGNI"" ([e4979c6](https://github.com/ogre-works/ogre-tools/commit/e4979c6ef6a002e0f8ae1da248323a2cba672049))
- Revert "Revert "Prevent public access to injection context"" ([4c88b4a](https://github.com/ogre-works/ogre-tools/commit/4c88b4a1c7db1135a2a47c5f97dd976c085bdb42))

### Miscellaneous Chores

- add NPM-script for opening github in browser ([c94284f](https://github.com/ogre-works/ogre-tools/commit/c94284f760270c166965635deec59598f8233303))
