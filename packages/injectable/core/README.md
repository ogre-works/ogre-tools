# Injectable - A Dependency Injection Library

## What is it?
- A lightweight and performant dependency injection library for TypeScript and JavaScript.
- Customised to requirements of Lens.
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
- Maintained by original authors as Lens-team members -> ability to adapt to specific needs of Lens.
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
- Guarantees unique and namespaced id within `Feature` (or more technically `scope`). The id is mostly used for error messages and debugging, but production code can access it too using `di.injectManyWithMeta`, which provides the id as meta-data, along with the usual instance.
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
- `injectionTokens` that one can implement as new `injectable` to extend the abilities of a system, eg. create new `injectable` that implements `clusterSourceInjectionToken` to teach Lens display clusters from a new source, eg. AWS EKS.

##### Consumable (injectionTokens)
- Also `injectionTokens`, but ones that can be injected as `di.inject()` to gain abilities such as `executeCliCommandInjectionToken`.

#### `instantiate()`
- Method of `injectable` which creates the instance when the `injectable` is injected. See "To Inject".

#### To Inject
- Different ways **To Inject**:
  1. Methods of `di` to inject an instance of an `injectable`: `di.inject`, `di.injectMany` or `di.injectManyWithMeta`.
  2. Methods of `@ogre-tools/injectable-mobx` to inject instances reactively: `computedInjectMany`, `computedInjectManyWithMeta` or `computedInjectMaybe`.
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

#### Auto-registration
When there's a lot of `injectables`, registering them manually with `di.register` can be a chore. As a solution, auto-registration can be used to register all exported injectables from files with eg. `.injectable.ts(x)` -naming.

```typescript
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";

registerInjectablesFromModules(di, modulesWithInjectables);
```

Note: the glob/wildcard import requires appropriate bundler extension, for Lens that means using `$ lens-package-build`.

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
const lensDevNameSpecifier = getTypedSpecifier<{
  validatable: string;
  otherThing: boolean;
}>()("lens-dev-names");

const someValidatorInjectable = getInjectable({
  id: `some-happy-validator`,
  // Input is inferred as string already
  instantiate: (di) => (input) => input === "stevan",
  
  injectionToken: happyGeneralValidatorInjectionToken.for(
    // Note: a typed specifier with no definition for "validatable" would cause a type error here already.
    lensDevNameSpecifier
  ),
});

// Type of "validate" is inferred as (toBeValidated: string) => boolean
const validate = di.inject(happyGeneralValidatorInjectionToken.for(lensDevNameSpecifier));

expect(validate("stevan")).toBe(true);
expect(validate("torvalds")).toBe(false);
// Type error, 42 is not a string.
expect(validate(42)).toBe(false);
```

### Extensions:
#### MobX: Reactive ways To Inject
Reactive utilities in `@ogre-tools/injectable-mobx`.

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
See [Feature](https://github.com/lensapp/lens-desktop-monorepo/wiki/Terminology#feature) in the Lens Wiki.

#### Global overrides
See [Global Overrides](https://github.com/lensapp/lens-desktop-monorepo/wiki/Terminology#global-override) in the Lens Wiki.
