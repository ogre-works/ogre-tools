# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [23.1.0](https://github.com/ogre-works/ogre-tools/compare/v23.0.1...v23.1.0) (2026-05-07)

### Features

- **injectable:** Override-as-injectable via instantiationDecoratorToken ([635d0a0](https://github.com/ogre-works/ogre-tools/commit/635d0a07ab7a9a7c33b2f9209fd09d5c25bda15e))
- **injectable:** Tag-keyed dispatch for every targeted decorator/callback ([65c3998](https://github.com/ogre-works/ogre-tools/commit/65c3998e026975cb498a0ab01780071e7bc0daef))
- **injectable:** Walk specificTokenOf chain at decorator dispatch sites ([27534bd](https://github.com/ogre-works/ogre-tools/commit/27534bd16ee0177b3d5d5473ccbf7f4a8d185854))

### Performance Improvements

- **injectable:** Direct-store v2-default no-args injects, closing the v1/v2 gap ([cdb18b9](https://github.com/ogre-works/ogre-tools/commit/cdb18b9f5be1a13141dad2a3d8c1bf5ff46aedea))
- **injectable:** Skip decorator dispatch and direct-store singletons in hot paths ([5c489c2](https://github.com/ogre-works/ogre-tools/commit/5c489c2efbef35435279ed015b21c1cb105400bb))
- **injectable:** Trim per-call overhead in inject, injectMany and register hot loops ([f14a99c](https://github.com/ogre-works/ogre-tools/commit/f14a99c31794584f9b545dbfd71622cf1a81486b))

### [23.0.1](https://github.com/ogre-works/ogre-tools/compare/v23.0.0...v23.0.1) (2026-04-24)

**Note:** Version bump only for package @ogre-tools/injectable

## [23.0.0](https://github.com/ogre-works/ogre-tools/compare/v19.0.0...v23.0.0) (2026-04-24)

### ⚠ BREAKING CHANGES

- **injectable:** Restructure Inject/Inject2 types and clean minimalDi interfaces
- **injectable:** di.decorate(alias, decorator) and
  di.decorateFunction(alias, decorator) are gone. Replace call sites by
  registering an injectable with injectionToken: injectionDecoratorToken.for(alias)
  on a container created with { injectionDecorators: true }.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
(cherry picked from commit 4add9f612cbaec7cc774449dfe194199c4f4c753)

- **injectable:** Containers that rely on di.decorate, di.decorateFunction,
  or injectables registered against injectionDecoratorToken.for(...) must
  now pass { injectionDecorators: true } to createContainer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
(cherry picked from commit ed0f5d2e34459349000db3ce73b60e9ae08dd981)

### Features

- Add dual CJS/ESM build output for all packages ([07f5ee9](https://github.com/ogre-works/ogre-tools/commit/07f5ee99bc96680b51f06b5dd932f5f557d0945c))
- **injectable-react:** Add getInjectionTokenComponent ([e0e3022](https://github.com/ogre-works/ogre-tools/commit/e0e3022e6c90bba5cb5225135d7e924b10695fb6))
- **injectable:** Add getAbstractInjectionToken2 with full enforcement ([21d194c](https://github.com/ogre-works/ogre-tools/commit/21d194cff3fd33385f95ab4c7b2f6d4cea27ce75))
- **injectable:** Add getInjectable2/getInjectionToken2 with curried instantiate and generic support ([e341713](https://github.com/ogre-works/ogre-tools/commit/e341713f0f9e6cba6c382a1f2ff5284c051561f5))
- **injectable:** Add getNumberOfInstances for global instance count introspection ([a818797](https://github.com/ogre-works/ogre-tools/commit/a8187978ddeb57658e14d2882f8472f9201c040a))
- **injectable:** Add inject2/injectMany2 for factory-returning injection ([d8c2e73](https://github.com/ogre-works/ogre-tools/commit/d8c2e7358758caaa5643c3fc6a43125700df43a3))
- **injectable:** Add injectable2/token2 support to Override type ([cf5bb83](https://github.com/ogre-works/ogre-tools/commit/cf5bb8392eafe20dc24674b34e35cceb2a0d4555))
- **injectable:** Add instancePurgeCallbackToken with three-phase purge and LRU integration ([0eac0f6](https://github.com/ogre-works/ogre-tools/commit/0eac0f673e32ab7e557c89cb1d04f60d2cd8341a))
- **injectable:** Add LRU cache support for keyedSingleton instances ([80beb7b](https://github.com/ogre-works/ogre-tools/commit/80beb7bc399b7789dc9051fa8828e6848b7f7756))
- **injectable:** Add registration/deregistration decorator tokens ([5a2e94e](https://github.com/ogre-works/ogre-tools/commit/5a2e94edd1f9705b7bd1b716cb220bad58800245))
- **injectable:** Add registration/deregistration decorator tokens as abstract v2 ([e7949bf](https://github.com/ogre-works/ogre-tools/commit/e7949bfb7c5b2ff3f13e8ea8a4c1ad3f78790eee))
- **injectable:** Enhance purge with key-based, token, scoped, and typed support ([8730312](https://github.com/ogre-works/ogre-tools/commit/87303120d552e9748a740314a21b565d19b90d9a))
- **injectable:** Hold object-typed keyed singleton keys weakly ([c0649a9](https://github.com/ogre-works/ogre-tools/commit/c0649a9b5676a4dad7292f3c222d29ac65654fe0))
- **injectable:** Make di.override and di.override2 cross-compatible with v1/v2 ([99c9dc9](https://github.com/ogre-works/ogre-tools/commit/99c9dc9ba6d2741d02bf6608837a0238c514eaf2))
- **injectable:** Make injectionDecorators opt-in at container creation ([b5379eb](https://github.com/ogre-works/ogre-tools/commit/b5379eb2dd374df7dc96d20e37b1cb61574266e1))
- **injectable:** Make preventSideEffects the default ([2dcc0a4](https://github.com/ogre-works/ogre-tools/commit/2dcc0a44f3a2a58b9893fe0af28f330c6506c4cc))

### Bug Fixes

- **injectable:** Detect override-after-injection when overriding by token ([f871f43](https://github.com/ogre-works/ogre-tools/commit/f871f439e5a8aa7711695d6200bee526f705773e))
- **injectable:** Fix cascade deregistration throwing for already-deregistered injectables ([fbbca02](https://github.com/ogre-works/ogre-tools/commit/fbbca029701fb88751f616b5464d8ca0f554e53d))
- **injectable:** Fix cascade deregistration throwing for already-deregistered injectables ([bf41803](https://github.com/ogre-works/ogre-tools/commit/bf41803487550cfe78aef2a058f366f76254eb5e))
- **injectable:** Fix context mutation and optimize hot paths ([f095d95](https://github.com/ogre-works/ogre-tools/commit/f095d95e8757a73e0ece540e1b30cc50a6b76bf6))
- **injectable:** Fix WithMeta types and add type tests for token2 ([326bb8f](https://github.com/ogre-works/ogre-tools/commit/326bb8f0b0d46962875f50fa6acb9d0dbac61bb1))
- **injectable:** Include injectable id in singleton instantiation-parameter error ([0021718](https://github.com/ogre-works/ogre-tools/commit/0021718336d6dd4fe201a0164a5760340ac9098c))
- **injectable:** Include injecting injectable's namespaced id in inject error messages ([dfa89c5](https://github.com/ogre-works/ogre-tools/commit/dfa89c5676c8c87b0d0717ddd9bb7e6b58cd0077))
- **injectable:** Look up instantiation decorators by original injectable, not override ([ffbe1b9](https://github.com/ogre-works/ogre-tools/commit/ffbe1b9e83ba4e3526e32e890cf68de185f52cfd))
- **injectable:** Prevent double-decoration when injectable and token share id ([1cd7d60](https://github.com/ogre-works/ogre-tools/commit/1cd7d60e3863690eb7ff8b7350f3731b3c261f17))
- **injectable:** Stop double-applying injection decorators via injectMany ([4318dd7](https://github.com/ogre-works/ogre-tools/commit/4318dd7d9f0ebfe8f372f20889ddb2eb02c3fa2f))
- **injectable:** Stop spreading v1 instantiation param in Inject2 factory ([13eed28](https://github.com/ogre-works/ogre-tools/commit/13eed28545b05cbd21fae7535a20ea38fefe6d1f))
- **injectable:** Tolerate undefined instantiation args on old-style singletons ([25614a0](https://github.com/ogre-works/ogre-tools/commit/25614a0948feef250c8f7ecfc58eae8548c31914))
- **injectable:** Use namespaced ids in error messages where injectable is registered ([3271f1f](https://github.com/ogre-works/ogre-tools/commit/3271f1f8a5a9fc22aa79732897ba190cd614ed7a))
- **injectable:** Use object reference as speciality in abstract decorator tokens ([e666d1d](https://github.com/ogre-works/ogre-tools/commit/e666d1d3ab3f4bf09414767caf2b2c3649c614f9))

### Performance Improvements

- **injectable:** Cache injection and instantiation decorator lists ([3d49715](https://github.com/ogre-works/ogre-tools/commit/3d49715160463b37e7d0d99ebe3b8e365de98d82))
- **injectable:** Fast-path singleton cache hits, avoiding minimalDi allocation ([de5c292](https://github.com/ogre-works/ogre-tools/commit/de5c2922bf507b7d4c3767316e38189b1f0c3130))
- **injectable:** Optimize getInstance with lifecycle fast paths and decorator skip ([5269878](https://github.com/ogre-works/ogre-tools/commit/5269878940ddf88de21e9c8d743012bb45f18c2b))
- **injectable:** Optimize inject hot path and eliminate redundant computation ([387fddf](https://github.com/ogre-works/ogre-tools/commit/387fddfc6eb362208e0b446f872064f853e393fb))
- **injectable:** Optimize registration decoration to avoid per-injectable overhead ([2a17117](https://github.com/ogre-works/ogre-tools/commit/2a171177db4623844a38910a057ed441a733b724))
- **injectable:** Optimize registration path allocations ([766fc9a](https://github.com/ogre-works/ogre-tools/commit/766fc9a7df6bc11f54007d5b1e779fb83bd8223d))
- **injectable:** Reduce per-inject overhead in injectMany and inject ([4700dd9](https://github.com/ogre-works/ogre-tools/commit/4700dd9f94ab73ee23ae6813959eddf654088f29))
- **injectable:** Remove unused dependency tracking maps ([9365d44](https://github.com/ogre-works/ogre-tools/commit/9365d44e9d5908bf808ed8f50d520e869d4aaa41))
- **injectable:** Replace O(n\*m) deregistration context scan with reverse index ([be3cf14](https://github.com/ogre-works/ogre-tools/commit/be3cf14628a7a17cd4decad65f94d652fa879cf2))

### Code Refactoring

- **injectable:** Remove di.decorate and di.decorateFunction shorthands ([f2eda60](https://github.com/ogre-works/ogre-tools/commit/f2eda60c9870ab955fe13bbffd3e5cb89f0cfcb8))
- **injectable:** Restructure Inject/Inject2 types and clean minimalDi interfaces ([e420920](https://github.com/ogre-works/ogre-tools/commit/e4209203ea2c617737e76028239320e43a0430ca))

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
