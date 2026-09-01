# Injectable - A Dependency Injection Library

## What is it?
- A lightweight and performant dependency injection library for TypeScript and JavaScript.
- Basically it's this: 
  1. Create a `di-container`
  2. Register an `injectable` to the `di-container`
  3. Inject an `instance` of the `injectable` from the `di-container`.

```ts
it("given di-container, and injectable, and the injectable is registered in the di-container, when the injectable is injected from the di-container, the resulting instance is ok", () => {
    const di = createContainer("some-di-container");
    
    const someInjectable = getInjectable({
      id: "some-injectable",
      instantiate: (di) => "some-instance",
    });
    
    di.register(someInjectable);
    
    const actualInstance = di.inject(someInjectable);
    
    expect(actualInstance).toBe("some-instance");
});
```

Notable: the unit-tests of this library are a designed as comprehensive documentation for **every** functionality `injectable` has. Look into `./scenarios` for this documentation.

## Why?
- Dependency Inversion Principle (DIP) of SOLID principles. DIP enables:
  - Decoupling
  - Composability
  - Unit-testability
  - Incremental refactoring
  - More compliance to Open/Closed Principle (OCP) -> Add more functionality without modifying existing code.
  - More flexible and clean architecture
- Plugin-architecture (enables 3rd party extensions/plugins, and Hot Feature Replacement during development)

## How is it different?
- Special features:
  - Injection Token -> a representation of an "interface" or a "contract".
  - An injected instance can be anything, even a primitives or a promise.
  - No requirement of classes or experimental TS-/JS-decorators to make injection work.
  - Lifecycle of **Keyed Singleton** -> an instance is made unique by a custom key as **Instantiation Parameter** (eg. id of customer).
  - React-compatibility and strong **Separation of Concerns** (UI-layer vs. Business-logic-layer).
  - MobX-compatibility and support for reactive extendability -> `computedInjectMany` observes new registrations during runtime.
  - Unit-testability with overriding, global overrides, and enforced no-side-effects.
  - `di.injectMany()` -> ability to inject all contributions to an injection Token.
  - Composability by using `injectableBunch` (ie. a group of `injectables` registered together to orchestrate more complex new behaviour).
  - Type-safe contracts with `.for()` and untyped/typed-specifiers.
  - (Auto-)registration enables Hollywood Principle -> "Don't call us, we'll call you".

## Key concepts
### Common
#### DI-container
- Contains **registrations** for all the `injectables` of an application so that they can be `injected` (see "To Inject").
- Short for **Dependency Injection Container**.

#### Injectable
- An instruction for what to **instantiate** when a `registered` `injectable` is `injected` from a `di-container`.
- Guarantees unique and namespaced id within `Feature` (or more technically `scope` — see [Scopes](#scopes)). The id is mostly used for error messages and debugging, but production code can access it too using `di.injectManyWithMeta`, which provides the id as meta-data, along with the usual instance.
- Has `lifecycle` of `singleton` as default.
- Can have an `instantiationParameter` to permit other `lifecycles`:
  - `singleton`: repeated injections of same `injectable` result in same instance. No `instantiationParameter` is permitted.
  - `keyedSingleton`: repeated injections of same `injectable` and same `instantiationParameter` result in same `instance`.
  - `transitive`: repeated injections of same `injectable` result in different instance every time, regardless of `instantiationParameter`.
- Has access to `di` for recursively injecting other `injectables` as part of its instantiation.
- Can implement an `injectionToken`, which guarantees the `injectable` to comply to a "contract", and make it injectable indirectly as such. This enables decoupling and DIP, eg. injectables depend on `injectionTokens` instead of concrete implementations.
- Can also be injected directly using reference to the `injectable`, when creating a new `injectionToken` would be overkill.
- Can be injected indirectly as the single implementation of a certain `injectionToken`.
- Can be injected indirectly as one of many implementations of a certain `injectionToken`.
- Can be injected indirectly and reactively as one of many implementations of a certain `injectionToken` using `computedInjectMany`. This returns a **MobX-computed** of related instances, and is therefore reactive.
- The instance can be of **any type**, even primitive, or a `Promise`.
- Can be auto-registered in a `di` by using auto-registration, and exported from a `.injectable.ts(x)` -file.

#### Instance
- Result of different ways "To Inject", such as `di.inject`. See "To Inject".
- Gets created by `instantiate()` of an `Ìnjectable`.

#### InstantiationParameter
- Parameter used with different ways "To Inject" distinguish instances of `keyedSingleton` `injectables`.

#### Lifecycles: `singleton`, `keyedSingleton`, `transient`
See Injectable.

#### `injectionToken`
- Contract (or interface, or abstraction) of an `Injectable`:
  - Type of **instance**
  - Type of `instantiationParameter` (when relevant) to permit instantiation of `keyedSingleton` injectables.
- Makes it possible for code to depend on decoupled abstractions instead of concrete implementations to satisfy DIP (Dependency Inversion Principle).
- Has **non-unique** id, relevant **only** for debugging and error-messages.
- Can be **general**, or more **specific** by using a **specifier**.
  - The **specifier** can even be **typed** to create generically typed specific tokens (see Specificity of `injectionTokens`).

`InjectionTokens` can have different names depending on perspective:
##### Contributable (injectionTokens)
- `injectionTokens` that one can implement as new `injectable` to extend the abilities of a system, eg. create new `injectable` that implements `clusterSourceInjectionToken` to teach the system to display clusters from a new source, eg. AWS EKS.

##### Consumable (injectionTokens)
- Also `injectionTokens`, but ones that can be injected as `di.inject()` to gain abilities such as `executeCliCommandInjectionToken`.

#### `instantiate()`
- Method of `injectable` which creates the instance when the `injectable` is injected. See "To Inject".

#### To Inject
- Different ways **To Inject**:
  1. Methods of `di` to inject an instance of an `injectable`: `di.inject`, `di.injectMany` or `di.injectManyWithMeta`.
  2. Methods of `@ogre-tools/injectable-extension-for-mobx` to inject instances reactively: `computedInjectMany`, `computedInjectManyWithMeta` or `computedInjectMaybe`.
- If injected `injectable` has lifecycle of `keyedSingleton`, different strategies also require the key as `instantiationParameter`.

Different ways **To Inject**:
##### `di.inject`
- One of ways **To Inject**.
- Not reactive, one-off.
- Returns exactly one instance of `injectable`.
- Throws if other amount of registrations are encountered, as that indicates a design mistake.

##### `di.injectMany`
- One of ways **To Inject**.
- Not reactive (ie. not `computed` of MobX), one-off (ie. instances at the moment of injection, not an observation of also future registrations).
- Returns 0-n instances of all `injectables` implementing an `injectionToken`.

##### `di.injectManyWithMeta`
- One of ways **To Inject**.
- Not reactive (ie. not `computed` of MobX), one-off (ie. instances at the moment of injection, not an observation of also future registrations).
- Returns 0-n instances of all `injectables` implementing an `injectionToken`.
- Provides the ids of `injectables` as meta-data, along with the usual instances.

##### `computedInjectMany`
- One of ways **To Inject**.
- Reactive (ie. `computed` of MobX, observing also future registrations), not one-off.
- Returns 0-n instances of all `injectables` implementing an `injectionToken`.

##### `computedInjectManyWithMeta`
- One of ways **To Inject**.
- Reactive (ie. `computed` of MobX, observing also future registrations), not one-off.
- Returns 0-n instances of all `injectables` implementing an `injectionToken`.
- Provides the ids of `injectables` as meta-data, along with the usual instances.

##### `computedInjectMaybe`
- One of ways **To Inject**.
- Reactive (ie. `computed` of MobX, observing also future registrations), not one-off.
- Returns exactly 0-1 instances of all `injectables` implementing an `injectionToken`.
- Throws if other amount of registrations are encountered, as that indicates a design mistake.

#### Side-effect
A unit-test with side-effects is not a unit-test, but instead an integration-test.

A side-effect is:
1. Anything slow (ie. slower than milliseconds).
2. Anything non-deterministic (eg. roll of dice, API-call, FS-access, console.log, any access to global state).

`Injectable` enforces having no side-effects in unit-tests by both: 
1. Flagging the di-container with `di.preventSideEffects()`  
2. Flagging relevant `injectables` with `causesSideEffects: true`

After that, these `injectables` need to be handled by `di.overriding` them with **test doubles** that do not have side-effects, otherwise the injecting them will throw.

#### `di.override`
A way to override an `injectable` or a single registration of an `injectionToken` with a `test double` to serve unit-testing. That can mean:
1. Overriding an `injectable` causing **side-effects** with a **test-double** not causing side-effects.
2. Normal mocking/stubbing/faking for unit-testing.

`di.override` is *imperative*: when in place, it preempts any declarative `instantiationDecoratorToken`-based override (the imperative stub is returned raw, no decoration applied). Use it for ad-hoc test setup or runtime swaps.

#### Override-as-injectable (declarative override)

A package can publish a "test stub" as a regular injectable that takes effect whenever it's registered. The stub is just an `instantiationDecoratorToken.for(target)`-tagged injectable whose decorator function ignores its argument and returns the stub:

```ts
// console-log.injectable.ts — production
export const consoleLogInjectable = getInjectable2({
  id: 'console-log',
  instantiate: () => (...args: unknown[]) => console.log(...args),
});

// console-log.override.test-injectable.ts — test stub
export const consoleLogOverrideInjectable = getInjectable2({
  id: 'override--console-log',
  tags: ['override'],
  injectionToken: instantiationDecoratorToken.for(consoleLogInjectable),
  // Decorator ignores its argument and replaces with a no-op:
  instantiate: () => () => _wrappedInstantiate => _di => () => {},
});

// Production opt-out — registered once in an early batch in production builds,
// not in test builds:
export const skipOverridesInProductionInjectable = getInjectable2({
  id: 'skip-overrides-in-production',
  injectionToken: registrationDecoratorToken.for('override'),  // tag-keyed
  instantiate: () => () => _registerSingle => _injectable => {
    /* drop the registration entirely */
  },
});
```

Key properties:

- **Targets injectables or tokens.** `instantiationDecoratorToken.for(target)` accepts either form; targeting a token applies the override to every registered implementer.
- **Phase 0 ordering.** Inside one `di.register(...)` call, `instantiationDecoratorToken`-tagged injectables register before `registrationDecoratorToken`-tagged ones, so a same-batch override can preempt a registration-decorator before it ever fires.
- **Tag-keyed registration-decorator dispatch.** `registrationDecoratorToken.for(tag)` (where `tag` is a string) fires for every injectable carrying that tag — the basis of the production opt-out shown above. The same primitive works for any other cross-cutting registration concern.
- **Imperative wins.** `di.override` always wins over a declarative override on the same target.

#### Tagging of injection tokens

Injection tokens (both `getInjectionToken` and `getInjectionToken2`) accept `tags` just like injectables do, and a tag on a token fires tag-keyed decorators everywhere targeting the token itself with `.for(token)` would: registering, deregistering, instantiating or purging an implementer of the token, and injecting via the token as an alias.

```ts
const messageHandlerToken = getInjectionToken2<() => void>({
  id: 'message-handler',
  tags: ['message-bus'],
});

// Fires when any implementer of messageHandlerToken is registered:
export const auditRegistrationsInjectable = getInjectable2({
  id: 'audit-message-bus-registrations',
  injectionToken: registrationDecoratorToken.for('message-bus'),
  instantiate: () => () => registerToBeDecorated => injectable => {
    audit(injectable.id);
    registerToBeDecorated(injectable);
  },
});
```

Key properties:

- **Initial `injectionToken` tag.** Every token automatically carries the tag `'injectionToken'` (exported as the constant `injectionTokenTag`) before any custom tags, so any token can be targeted for decoration, e.g. `injectionDecoratorToken.for(injectionTokenTag)` decorates every token-based injection.
- **`.for()` children inherit tags.** A specific token created with `someToken.for(specifier)` carries the general token's tags, the same way it inherits `maxCacheSize`. Tags are deduped at dispatch, so a tag occurring on several chain levels fires its decorator once.
- **Built-in machinery tokens are untagged.** The exported decorator/callback tokens (`instantiationDecoratorToken`, `injectionDecoratorToken`, `registrationDecoratorToken`, `deregistrationDecoratorToken`, `instancePurgeCallbackToken`, `preInjectCallbackToken`, `registrationCallbackToken`, `deregistrationCallbackToken`) carry no tags — otherwise a decorator targeting `'injectionToken'` would decorate the decoration machinery itself and recurse.
- **Footgun.** Tagging a decorator injectable itself with a tag its own decorator type targets (e.g. an injection decorator carrying the very tag it decorates) recurses; don't do that.

#### Pre-inject callbacks

A pre-inject callback registers under `preInjectCallbackToken.for(target)` — targeting an injectable, a token, or a tag, with the same three dispatch dimensions as the decorator tokens — and fires **before** every matching inject operation with `(alias, kind, injectingInjectable)`, where `kind` is `'inject'` or `'injectMany'` and `injectingInjectable` is the injecting party: the injectable whose `instantiate` made the call, or the container root (`{ id, aliasType: 'container' }`) for injects made directly on `di`. Unlike an injection decorator, it does not wrap anything and its return value is ignored.

Key properties:

- **Fires before resolution and before any failure check.** The callback fires even when nothing is registered for the alias, so it can register implementations on demand that the very same operation then observes — lazy registration:

```ts
const someFeatureToken = getInjectionToken2<() => Feature>({ id: 'some-feature' });

export const registerFeatureOnDemandInjectable = getInjectable2({
  id: 'register-feature-on-demand',
  injectionToken: preInjectCallbackToken.for(someFeatureToken),
  instantiate: () => () => () => {
    di.register(...featureInjectables);
  },
});

// Elsewhere, without registering the feature up front:
di.inject(someFeatureToken); // the callback registers just in time; this succeeds
```

- **Once per operation.** `di.inject` fires it once per call — including nested `di.inject` inside an `instantiate` and singleton cache hits (it is pre-*inject*, not pre-instantiation). `di.injectMany` fires it once for the whole call with the token alias; resolving the elements does not fire it again, and an `injectMany` of a token with zero registrations fires the callback and returns `[]` without throwing.
- **Ordering.** Pre-inject callbacks fire before injection decorators compose, so a callback may even register decorators the same operation picks up.
- **Free when unused.** Like injection decorators, the wiring is swapped in only while at least one pre-inject callback is registered; containers without any pay no overhead.
- **Footgun.** A callback whose own injectable matches keys its callback type targets would recurse — the machinery tokens are exempt (untagged), user injectables are not. Also note the callback fires on *every* matching operation: a register-on-demand callback must be idempotent or deregister itself.

#### Auto-registration
When there's a lot of `injectables`, registering them manually with `di.register` can be a chore. As a solution, auto-registration can be used to register all exported injectables from files with eg. `.injectable.ts(x)` -naming.

```typescript
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";

registerInjectablesFromModules(di, modulesWithInjectables);
```

Note: the glob/wildcard import requires appropriate bundler extension.

### Advanced
#### `injectableBunch`
Sometimes it's a chore to register many related `injectables` one by one. An `injectableBunch` is a group of `injectables` that can be registered together to orchestrate this more complex new behaviour. Typically an `injectableBunch` is the result of a factory function which removes said chore from creating similar repeated `injectables`.

```typescript
// bad musical band
export const someVocalistInjectable = getInjectable({
  id: "some-vocalist-bad",
  instantiate: (di) => (song) => sing(song),
  injectionToken: vocalistInjectionToken.for("finnish-folk"),
});

export const someDrummerInjectable = getInjectable({
  id: "some-drummer-bad",
  instantiate: (di) => (song) => hitDrums(song),
  injectionToken: drummerInjectionToken.for("finnish-folk"),
});

// good musical band
const getVocalistAndDrummerBandBunch = (bandKind) => getInjectableBunch({ 
    vocalistInjectable: getInjectable({
      id: `vocalist-for-${bandKind}`,
      instantiate: (di) => (song) => sing(song),
      injectionToken: vocalistInjectionToken.for(bandKind),
    }),

    drummerInjectable: getInjectable({
      id: `drummer-for-${bandKind}`,
      instantiate: (di) => (song) => hitDrums(song),
      injectionToken: drummerInjectionToken.for(bandKind),
    }),
});

// See, no chore :D
export const getVocalistAndDrummerBandBunch("metal");
```

#### Scopes

The `di` handed to an injectable's `instantiate` registers into a **scope** owned by that injectable. Anything registered through it belongs to the scope — what decides membership is *which* `register` was called, never when:

```ts
const someFeatureInjectable = getInjectable({
  id: "some-feature",

  instantiate: (di) => {
    // Registering right away, if the feature knows what it needs up front.
    di.register(someServiceInjectable);

    // Or handing its own registration out, to be called whenever.
    return { register: di.register };
  },
});

di.register(someFeatureInjectable);

const someFeature = di.inject(someFeatureInjectable);

// Long after the instantiation returned, and from outside the injectable —
// still the same scope.
someFeature.register(someOtherServiceInjectable);

di.injectManyWithMeta(someServiceToken)[0].meta.id; // "some-feature:some-service"
```

Instantiating the owner is only how its `di` is obtained; the scope keeps working for as long as something holds that `di`. There is no scope object and no scope API beyond it. (Older code sometimes carries a `scope: true` property on such an injectable; nothing reads it, and it has no effect.)

Key properties:

- **The namespaced id.** A scoped registration's id becomes `<owner-id>:<own-id>`, nesting one segment per level — an injectable registered by a scope that was itself registered by a scope reads `outer:inner:own-id`. The container's id is not part of it. That namespaced id is what appears in `meta.id` from `injectManyWithMeta`, in `di.getNumberOfInstances()` keys, in `di.validate()` reports, and in error messages naming the injecting party.
- **No isolation of resolution.** This is the part worth being precise about: a scope affects identity, the registration tree and the `registeredInLocalScope*` queries — nothing else. Registrations are container-global, so a scoped injectable is injectable from the root container and from sibling scopes, `injectMany` on a token picks up implementations registered in any scope, and code inside a scope injects container-level things normally. The crispest statement of this is that `di.hasRegistrations(someToken)` is `true` for a scope-registered implementation while `di.registeredInLocalScope(someToken)` is `false`.
- **Uniqueness is per namespaced id.** Two different scopes may each register an injectable with the same bare id. Registering the same id twice *within* one scope throws `Tried to register multiple injectables for ID "some-scope:some-id"`.
- **Deregistration cascades.** Deregistering the owner deregisters everything its scope registered, to any depth, purging their instances on the way. Afterwards the same injectable objects can be registered again, in the same scope or elsewhere, and take a freshly computed namespaced id.
- **Querying a scope.** `di.registeredInLocalScope(alias)` asks whether something matching `alias` was registered *directly* by this scope; `di.registeredInLocalScopeSubtree(alias)` asks whether it was registered anywhere below it, at any depth. Both exist on the container, where the scope in question is the container itself — note that `registeredInLocalScopeSubtree` on the container is therefore equivalent to `hasRegistrations`, everything being in the container's subtree.
- **`di.sourceNamespace`** is the namespace of whatever is injecting you, not your own — the namespaced id of the consuming injectable with its last segment removed, or `undefined` when the consumer is at container level. Its intended use is as a `keyedSingleton` key, giving one instance per consuming namespace:

```ts
const someLoggerInjectable = getInjectable({
  id: "some-logger",
  instantiate: (di) => createLogger({ prefix: di.sourceNamespace }),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di) => di.sourceNamespace,
  }),
});
```

  Be aware it is `undefined` for anything resolved through `injectMany`, where the token stands in as the injecting party rather than the consumer.

- **`di.purge` means two different things.** On the container it purges instances globally. On the `di` inside an `instantiate` it is restricted to the scope: the owner's own instances and those of the injectables it registered directly, and it throws `Tried to purge "some-id" from "some-owner", but it is not within its registration context tree.` for anything else. Neither form removes registrations — only instances.
- **Footgun: a scope belongs to the injectable, not to the instance.** The owner's identity is the injectable object, so a `transient` or `keyedSingleton` owner does not get a fresh scope per instantiation. Its second instantiation re-runs the same `di.register` calls and throws `Tried to register same injectable multiple times: "some-owner:some-id"`. The same happens after `di.purge` of a singleton owner, since purging drops the instance but keeps the registrations, so re-injecting re-runs `instantiate`. Scopes are a structural mechanism for features, not a per-instance one.
- **Footgun: cardinality bounds are container-wide.** Two scopes cannot each register their own implementation of a token declared `one` or `zero-or-one`; the second registration is rejected regardless of which scope it is in.

#### Composite keys of keyed singletons
Sometimes a single parameter is not enough to uniquely identify an instance of a `keyedSingleton` injectable. For that, a composite key can be used.

```typescript
const someInjectable = getInjectable({
  id: "some-id",

  instantiate: () => ({
    some: "instance",
  }),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, param: string[]) => getKeyedSingletonCompositeKey(...param),
  }),
});

di.register(someInjectable);

const actualInstance1 = di.inject(someInjectable, ["some-key-1", "some-key-2"]);
const actualInstance2 = di.inject(someInjectable, ["some-key-1", "some-key-2"]);

expect(actualInstance1).toBe(actualInstance2);
```

#### Specificity of `injectionTokens`
Sometimes there can be more specific versions of a general `injectionToken`. This is made possible by using specifiers to create specific tokens from general ones. See examples below.

"In **general** I am a Hollywood-actress, and I thus have a method for acting, but more **specifically** I have a method for singing as well, meaning I can also be injected in musicals".

##### Example: Specific token using a primitive specifier
```typescript
const someGeneralToken = getInjectionToken<boolean>({ id: "some-functionality" });

const someInjectable1 = getInjectable({
  // ...
  instantiate: (di) => true,
  // Note: .for() creates a specific token from a more general one.
  injectionToken: someGeneralToken.for("some-specifier-1")
});

const someInjectable2 = getInjectable({
  // ...
  instantiate: (di) => false,
  injectionToken: someGeneralToken.for("some-specifier-2")
});

// This returns true
const actual = di.inject(someGeneralToken.for("some-specifier-1"));
```

##### Example: Specific token using a typed specifier
```typescript
type HappyValidator<T> = (toBeValidated: T) => boolean;

// A token for a sad validator only knows "any" as the type to be validated.
const sadValidatorInjectionToken = getInjectionToken<HappyValidator<any>>({
  id: "sad-validator",
});

// A token for a happy validator is able to infer more specific types from a typed specifier.
const happyGeneralValidatorInjectionToken = getInjectionToken<
  // For general token, the type of validator is unknown
  HappyValidator<unknown>,
  // No instantiation parameter in this example
  void,
  <S extends TypedSpecifierWithType<"validatable">>(
    specifier: S,
  ) => SpecificInjectionToken<
    // For the more specific token, the type of validator is inferred from the typed specifier
    HappyValidator<TypedSpecifierType<"validatable", S>>
  >
>({
  id: "happy-validator",
});

// A typed specifier for something that is (among other things) "validatable" as string.
const devNameSpecifier = getTypedSpecifier<{
  validatable: string;
  otherThing: boolean;
}>()("dev-names");

const someValidatorInjectable = getInjectable({
  id: `some-happy-validator`,
  // Input is inferred as string already
  instantiate: (di) => (input) => input === "stevan",
  
  injectionToken: happyGeneralValidatorInjectionToken.for(
    // Note: a typed specifier with no definition for "validatable" would cause a type error here already.
    devNameSpecifier
  ),
});

// Type of "validate" is inferred as (toBeValidated: string) => boolean
const validate = di.inject(happyGeneralValidatorInjectionToken.for(devNameSpecifier));

expect(validate("stevan")).toBe(true);
expect(validate("torvalds")).toBe(false);
// Type error, 42 is not a string.
expect(validate(42)).toBe(false);
```

### Injectable2 — Curried Instantiation

`getInjectable2` is an evolution of `getInjectable` that uses **curried instantiation**: `instantiate` receives only `di` and returns a **factory function**. The factory's parameters become the injection parameters, and its return value becomes the instance. This gives full generic and variadic parameter support in TypeScript.

All v2 APIs are **cross-compatible** with v1 — old and new injectables coexist in the same container.

| | v1 (`getInjectable`) | v2 (`getInjectable2`) |
|---|---|---|
| **Instantiate shape** | `(di, param?) => instance` | `(di) => (...params) => instance` |
| **Lifecycle** | `singleton`, `keyedSingleton`, `transient` | keyed singleton (default), `transient: true` |
| **Parameters** | Single instantiation parameter | Variadic (multiple parameters) |
| **Generic support** | Limited | Full — factory type flows through |

#### Basic usage

```ts
// Non-parametric singleton
const configInjectable = getInjectable2({
  id: "config",
  instantiate: (di) => () => ({ port: 3000 }),
});

di.register(configInjectable);
const config = di.inject(configInjectable); // { port: 3000 }
```

```ts
// Parametric keyed singleton — same params = same instance
const userInjectable = getInjectable2({
  id: "user",
  instantiate: (di) => (id: string) => ({ id, name: `User ${id}` }),
});

di.register(userInjectable);
const user1 = di.inject(userInjectable, "alice");
const user2 = di.inject(userInjectable, "alice");
expect(user1).toBe(user2); // same instance — keyed singleton
```

```ts
// Transient — new instance every time
const requestInjectable = getInjectable2({
  id: "request",
  instantiate: (di) => () => ({ timestamp: Date.now() }),
  transient: true,
});
```

```ts
// Multiple parameters
const greetInjectable = getInjectable2({
  id: "greet",
  instantiate: (di) => (name: string, greeting: string) => `${greeting}, ${name}!`,
});

di.register(greetInjectable);
di.inject(greetInjectable, "Alice", "Hello"); // "Hello, Alice!"
```

#### Injecting dependencies inside `instantiate`

Inside the `instantiate` of `getInjectable2`, `di.inject` and `di.injectMany` return **factory functions** (not raw instances). Call the factory to get the value. Injecting another injectable by reference, as below, needs nothing declared; injecting an *injection token* does — see [Consumptions](#consumptions--declaring-what-an-injectable-may-inject):

```ts
const depInjectable = getInjectable2({
  id: "dep",
  instantiate: (di) => (name: string) => `hello-${name}`,
});

const serviceInjectable = getInjectable2({
  id: "service",
  instantiate: (di) => {
    const getDep = di.inject(depInjectable);  // returns the factory
    return () => getDep("world");             // call the factory
  },
});

di.register(depInjectable, serviceInjectable);
di.inject(serviceInjectable); // "hello-world"
```

This also works with v1 dependencies — they are auto-wrapped into factories:

```ts
const oldDep = getInjectable({
  id: "old-dep",
  instantiate: () => "old-value",
});

const newService = getInjectable2({
  id: "new-service",
  instantiate: (di) => {
    const getOld = di.inject(oldDep);  // returns () => "old-value"
    return () => `using-${getOld()}`;
  },
});
```

#### `getInjectionToken2` — Contracts for factories

```ts
const serviceToken = getInjectionToken2<(id: string) => ServiceResult>({
  id: "service",
  cardinality: "one",
})();

const implInjectable = getInjectable2({
  id: "impl",
  injectionToken: serviceToken,
  instantiate: (di) => (id) => ({ id, status: "ok" }),
});

di.register(implInjectable);

di.inject(serviceToken, "abc");       // { id: "abc", status: "ok" }
```

The trailing `()` takes an optional `specificInjectionTokenFactory` — the token's `.for()` factory, whose type is inferred from the factory itself instead of being spelled out as a type argument. Passing one gives the token a `.for()`; omitting it, as above, gives a token with no `.for()` at all.

Passing a `specificInjectionTokenFactory` also makes the token **abstract**: it can no longer be injected or registered against directly, only reached via `.for(specifier)`. A token only ever needs a factory when it's meant to be resolved exclusively that way, so this is automatic — there's no separate "abstract" creator to opt into:

```ts
const abstractToken = getInjectionToken2<(x: number) => string>({
  id: "formatter",
  cardinality: "one",
})(specifier =>
  getSpecificInjectionToken2<(x: number) => string>()({
    id: specifier,
    speciality: specifier,
  }),
);

const currencyFormatter = getInjectable2({
  id: "currency-formatter",
  injectionToken: abstractToken.for("currency"),
  instantiate: (di) => (amount) => `$${amount.toFixed(2)}`,
});
```

#### Cardinality of injection tokens

Every v2 token declares how many implementations it expects, and that decides the one way it can be consumed:

The table names the members of the root container. `inject` and `injectMany` there are eager — they hand back instances — while the factory-returning forms carry a `2` suffix: `inject2`, `injectMany2`, `injectMaybe2`. A `zero-or-one` token has only the factory-returning form, since presence has to be resolved when the factory is called. Inside an `instantiate` every member is factory-returning, so there the names are plain: `inject`, `injectMany`, `injectMaybe`.

| Cardinality | Consumed with | Yields |
| --- | --- | --- |
| `one` | `di.inject` | the instance |
| `zero-or-one` | `di.injectMaybe2` | the instance, or `undefined` |
| `zero-or-many` | `di.injectMany` | every instance |
| `one-or-many` | `di.injectMany` | every instance, at least one |

```ts
const themeToken = getInjectionToken2<() => Theme>()({
  id: "theme",
  cardinality: "zero-or-one",
});

const getTheme = di.injectMaybe2(themeToken);

getTheme();                  // Theme | undefined
di.inject(themeToken);       // type error — use injectMaybe2
```

Key properties:

- **Enforced from both ends.** Upper bounds are enforced when registering: a second implementation of a `one` or `zero-or-one` token is rejected there, so it cannot be violated later. Lower bounds are checked by [`di.validate()`](#divalidate), since registration order must not matter.
- **Counted per token, not per family.** The bound counts implementations registered against that exact token, so `someToken.for("a")` and `someToken.for("b")` each get their own — specialization is never outlawed by the general token's bound.
- **Declared per token, and inherited by `.for()` children.** A family whose specific tokens have a different arity than its general one is common — many implementations under the general token, exactly one per specifier — and the factory that builds the specific tokens declares their cardinality, the same way any token declares its own:

```ts
const handlerToken = getInjectionToken2<(event: Event) => void>()({
  id: "handler",
  cardinality: "zero-or-many",   // all handlers

  specificInjectionTokenFactory: (specifier) =>
    getSpecificInjectionToken2<(event: Event) => void>()({
      id: specifier,
      speciality: specifier,
      cardinality: "one",        // one handler per event kind
    }),
});

di.injectMany(handlerToken);            // every handler
di.inject(handlerToken.for("click"));   // the click handler
```

  A specific token that declares nothing inherits its general token's cardinality, which is what the default `.for()` gives you.

- **Resolved per call.** The factories returned by `injectMany2` and `injectMaybe2` re-resolve on every invocation, so an implementation registered later starts being returned, and one deregistered stops being.
- **Footgun.** `injectMaybe2` cannot distinguish "nothing registered" from "the implementation returned `undefined`". If that difference matters, return a wrapper the implementation can fill.

#### Consumptions — declaring what an injectable may inject

An injectable2 declares the injection tokens it injects. This is what makes it safe to keep tokens and implementations in separate packages: the contract a package depends on is written down, so a composition root that forgot to register an implementation can be caught before anything runs.

```ts
const someConsumer = getInjectable2({
  id: "some-consumer",
  consumptions: [serviceToken, themeToken],

  instantiate: (di) => {
    const getService = di.inject(serviceToken);
    const getTheme = di.injectMaybe(themeToken);

    return () => render(getService("abc"), getTheme());
  },
});
```

Key properties:

- **Declaring nothing means injecting no tokens.** An injectable with no `consumptions` can still inject other *injectables* — passing an injectable by reference already implies a dependency on wherever it lives. A token is the case where the implementation may come from a package this one does not depend on, which is the whole point of declaring.
- **Enforced twice over.** `instantiate`'s `di` only accepts what was declared, so an undeclared inject does not compile. The container also checks at runtime, which catches plain-JS callers and — since the compile-time layer is structural — a token that merely has the same shape as a declared one.
- **Declaring a token covers its `.for()` derivatives.** That is what makes a specifier only known at runtime declarable at all. The walk is upwards only: declaring `someToken.for("a")` does not permit injecting `someToken`.
- **Leave `di` unannotated.** Its type comes from the `consumptions` array, contextually. For an `instantiate` written as a named function elsewhere, annotate it `ConsumptionDi<typeof someToken>`.
- **Footgun.** The array is evaluated when the injectable is created, so two injectables in one module that consume each other need declaration-order care — put a token between them, or keep the reference lazy inside `instantiate`.

#### `di.validate()`

Checks every registered injectable2's declared consumptions against what is actually registered, without instantiating anything:

```ts
di.register(...tokenPackage, ...implementationPackage);

di.validate();
// throws if, say, nothing implements a token declared "one":
// Tried to validate container "some-container", but found violations:
//  - Injectable "some-consumer" consumes injection token "some-service-token" with cardinality "one", but it has no registrations.
```

Key properties:

- **One error for the whole container.** Every violation is listed at once, so a composition root is fixed in one pass rather than one failed inject at a time. A cheap test per composition root — register everything, validate — is the intended use.
- **Nothing is instantiated.** Side effects do not fire and parametric factories are never called, unlike a smoke test that injects everything.
- **Says what it could not check.** The returned report separates injectables whose consumptions were checked from v1 injectables, which declare nothing, and lists declared v1 tokens as unverifiable — they carry no cardinality, so there is no arity to check. Residual runtime risk stays visible instead of counting as verified.
- **Holds no state.** Registering afterwards works, and validating again reflects it.
- **Footgun.** A token whose `.for(specifier)` is built from a runtime value can only be validated at the general token's granularity: validation confirms the family has an implementation, not that one exists for every specifier the code will ask for.

#### Overriding

Both `override2` (curried) and `override` (v1-shape) work on v2 injectables:

```ts
const fooInjectable = getInjectable2({
  id: "foo",
  instantiate: (di) => (name: string) => `original-${name}`,
});

di.register(fooInjectable);

// v2-style override (curried)
di.override2(fooInjectable, (di) => (name) => `stub-${name}`);

// v1-style override also works
di.override(fooInjectable, (di, name) => `stub-${name}`);
```

#### Meta-data injection

```ts
di.injectWithMeta(fooInjectable, "test");
// { instance: "original-test", meta: { id: "foo" } }

di.injectManyWithMeta(serviceToken, "abc");
// [{ instance: { id: "abc", status: "ok" }, meta: { id: "impl" } }]
```

#### LRU caching (`maxCacheSize`)

Limits how many keyed-singleton instances are cached. When the limit is reached, the least recently used entry is evicted:

```ts
const cacheableInjectable = getInjectable2({
  id: "cacheable",
  maxCacheSize: 2,
  instantiate: (di) => (key: string) => ({ key }),
});

di.register(cacheableInjectable);

const a = di.inject(cacheableInjectable, "a");
di.inject(cacheableInjectable, "b");
di.inject(cacheableInjectable, "c"); // evicts "a"

di.inject(cacheableInjectable, "a") !== a; // true — a was evicted
```

`maxCacheSize` can also be set on `getInjectionToken2` to apply as a default for all implementations. An injectable's own `maxCacheSize` takes precedence.

#### Purging by key

Selectively purge cached instances by key or key prefix:

```ts
const obj = getInjectable2({
  id: "obj",
  instantiate: (di) => (category: string, id: string) => ({ category, id }),
});

di.register(obj);

di.inject(obj, "a", "1");
di.inject(obj, "a", "2");
di.inject(obj, "b", "1");

di.purge(obj, "a");           // purges all instances with prefix "a" → ("a","1") and ("a","2")
di.purge(obj, "a", "1");      // purges only the specific composite key ("a","1")
di.purge(token);              // purges all implementations of a token
di.purge(token, "a");         // purges key "a" across all implementations of a token
```

### Extensions:
#### MobX: Reactive ways To Inject
Reactive utilities in `@ogre-tools/injectable-extension-for-mobx`.

See "To Inject" for examples.

#### React: `useInject` and `useInjectDeferred` in UI-code
Even with **Segregation of Concerns** (UI-layer vs. Business-logic-layer), often injection is needed in React components. For that, `useInject` and `useInjectDeferred` hooks are provided by `@ogre-tools/injectable-react` package.

Notably, the result of `useInject` is always synchronous, and Promises are translated as such by using React's Suspense mechanism under the hood. This means, some React-component will need to catch the Suspense boundary, and render a fallback UI while the Promise is pending.

```typescript jsx
const someAsyncInjectable = getInjectable({
  id: "some-async-injectable",
  instantiate: (di) => new Promise((resolve) => setTimout(() => resolve("some-instance-after-a-second"), 1000))
});

const SomeComponent = () => {
  const someSyncInstance = useInject(someAsyncInjectable);

  // Will render <div>some-instance-after-a-second</div> after suspense is over
  return <div>{someSyncInstance}</div>;
};

const rendered = render(<Suspense fallback={<Loading />}><SomeComponent /></Suspense>);
```

#### Feature
A grouping of related `injectables` representing a self-contained slice of functionality. A feature can be enabled or disabled as a unit.

#### Global overrides
A mechanism for declaring overrides that apply across all `di-containers` (eg. shared test doubles), as opposed to per-container `di.override` calls.
