/// <reference types="jest" />

// "Any function shape" — the canonical constraint for a v2 factory.
// Uses `any` deliberately: `(...args: unknown[]) => unknown` is not a valid
// universal function constraint (concrete functions don't extend it).
export type Factory = (...args: any[]) => any;

// v1-shape stub for v1 targets: (di, param) => instance
type OverrideV1ShapeOldStyle = <
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance,
  InstantiationParam,
>(
  injectable:
    | InjectionToken<InjectionInstance, InstantiationParam>
    | Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>,
  instantiateStub: Instantiate<InjectionInstance, InstantiationParam>,
) => void;

// v1-shape stub for v2 targets (cross-compat): (di, ...params) => instance
type OverrideV1ShapeForInjectable2 = <F extends Factory>(
  alias: Alias2<F>,
  instantiateStub: (
    di: DiContainerForInjection2,
    ...params: Parameters<F>
  ) => ReturnType<F>,
) => void;

// v2-shape stub for v2 targets: (di) => (...params) => instance
export type OverrideInjectable2 = <F extends Factory>(
  alias: Alias2<F>,
  instantiateStub: (di: DiContainerForInjection2) => F,
) => void;

// v2-shape stub for v1 targets (cross-compat): (di) => (param) => instance
type Override2V2ShapeForOldStyle = <
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance,
  InstantiationParam,
>(
  injectable:
    | InjectionToken<InjectionInstance, InstantiationParam>
    | Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>,
  instantiateStub: (
    di: DiContainerForInjection,
  ) => (param: InstantiationParam) => InjectionInstance,
) => void;

// Cross-compat override: v1-shape stub works on any target.
export type Override = OverrideV1ShapeOldStyle & OverrideV1ShapeForInjectable2;

// Cross-compat override2: v2-shape stub works on any target.
export type Override2 = OverrideInjectable2 & Override2V2ShapeForOldStyle;

// ---- validate ----
//
// Checks every registered injectable2's declared consumptions against what is
// actually registered, without instantiating anything: a token declared 'one'
// or 'one-or-many' must have at least one implementation, counting those
// registered against any of its `.for()` derivatives. Upper bounds need no
// check here, registering having already rejected a second implementation.
//
// All violations are reported in one thrown error, so a composition root is
// fixed in one pass rather than one registration at a time.

export interface ValidationReportInjectables {
  count: number;
  ids: string[];
}

export interface UnverifiableConsumption {
  injectableId: string;
  consumptionId: string;
}

export interface ValidationReport {
  // Injectables whose consumptions were checked — every injectable2.
  verifiedInjectables: ValidationReportInjectables;
  // v1 injectables, which declare nothing and so cannot be checked.
  unverifiedInjectables: ValidationReportInjectables;
  // Declared v1 tokens: carrying no cardinality, they have no arity to check,
  // and remain a runtime concern.
  unverifiableConsumptions: UnverifiableConsumption[];
}

export interface DiContainer extends DiContainerForInjection {
  validate: () => ValidationReport;
  inject2: Inject2;
  injectMany2: InjectMany2;
  injectMaybe2: InjectMaybe2;
  injectWithMeta2: InjectWithMeta2;
  injectManyWithMeta2: InjectManyWithMeta2;
  injectMaybeWithMeta2: InjectMaybeWithMeta2;

  purge: Purge;
  purgeAllButOverrides: () => void;

  permitSideEffects: (alias?: Alias) => void;

  override: Override;
  override2: Override2;
  earlyOverride: Override;
  earlyOverride2: Override2;
  unoverride<F extends Factory>(alias: Alias2<F>): void;
  unoverride(alias: Alias1): void;

  register(...injectables: (Alias | InjectableBunch)[]): void;

  deregister(...injectables: (Alias | InjectableBunch)[]): void;

  getNumberOfInstances: () => Record<string, number>;
}

export type Instantiate<InjectionInstance, InstantiationParam = void> = (di: DiContainerForInjection, param: InstantiationParam) => InjectionInstance;

export interface InjectionToken<
  InjectionInstance = any,
  InstantiationParam = void,
  SpecificInjectionTokenFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam> = (
    id: string,
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam>,
> {
  readonly aliasType: "injection-token";
  template: InjectionInstance;
  instantiationParameter: InstantiationParam;
  key: Symbol;
  id: string;
  for: SpecificInjectionTokenFactory;
  maxCacheSize?: number;
  // Every token carries the initial tag 'injectionToken' plus any tags given
  // at creation; `.for()` children inherit the general token's tags. Optional
  // because the built-in machinery tokens are untagged.
  tags?: string[];
}

export interface SpecificInjectionToken<
  InjectionInstance = any,
  InstantiationParam = void,
  SpecificInjectionTokenFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam> = (
    id: string,
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam>,
> extends InjectionToken<
    InjectionInstance,
    InstantiationParam,
    SpecificInjectionTokenFactory
  > {
  speciality: any;
}

export interface Injectable<
  InjectionInstance extends InjectionTokenInstance = any,
  InjectionTokenInstance = InjectionInstance,
  InstantiationParam = void,
> {
  readonly aliasType: "injectable";
  readonly id: string;
  readonly causesSideEffects?: boolean;
  readonly injectionToken?: InjectionToken<
    InjectionTokenInstance,
    InstantiationParam
  >;
  readonly instantiate: Instantiate<InjectionInstance, InstantiationParam>;
  readonly lifecycle: Lifecycle<InstantiationParam>;
  readonly tags?: any[];
  readonly maxCacheSize?: number;
}

export type GetInjectableOptionsWithoutInstantiationParameter<I extends TI, TI> = Omit<Injectable<I, TI>, "lifecycle" | "instantiate" | "aliasType"> & {
  readonly instantiate: (di: DiContainerForInjection, param: void) => I;
  readonly lifecycle?: Lifecycle;
}

export type GetInjectableOptionsWithInstantiationParameter<I extends TI, TI, P> = Omit<Injectable<I, TI, P>, "instantiate" | "aliasType"> & {
  readonly instantiate: (di: DiContainerForInjection, param: P) => I;
};

export interface GetInjectable{
  <I extends TI, TI>(options: GetInjectableOptionsWithoutInstantiationParameter<I, TI>): Injectable<I, TI>;
  <I extends TI, TI, P>(options: GetInjectableOptionsWithInstantiationParameter<I, TI, P>): Injectable<I, TI, P>;
}

export const getInjectable: GetInjectable;

export type InjectableBunch<InjectableConfig extends object = object> = InjectableConfig;

export function getInjectableBunch<Type extends object>(
  bunch: Type,
): InjectableBunch<Type>;

export function getInjectionToken<
  InjectionInstance,
  InstantiationParam = void,
  SpecificInjectionTokenFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam> = (
    id: string,
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam>,
>(options: {
  id: string;
  // Must be pure and deterministic: `.for()` memoizes by specifier and skips
  // calling the factory again for a specifier it has already seen.
  specificInjectionTokenFactory?: SpecificInjectionTokenFactory;
  target?: object;
  maxCacheSize?: number;
  tags?: string[];
}): InjectionToken<
  InjectionInstance,
  InstantiationParam,
  SpecificInjectionTokenFactory
>;

export function getSpecificInjectionToken<
  InjectionInstance,
  InstantiationParam = void,
  SpecificInjectionTokenFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam> = (
    id: string,
  ) => SpecificInjectionToken<InjectionInstance, InstantiationParam>,
>(options: {
  id: string;
  speciality: any;
  tags?: string[];
}): SpecificInjectionToken<
  InjectionInstance,
  InstantiationParam,
  SpecificInjectionTokenFactory
>;

// The initial tag carried by every injection token (v1 and v2), permitting
// tag-keyed decorators to target any token.
export const injectionTokenTag: 'injectionToken';

export type InjectWithoutParameter = <InjectionInstance>(
  alias:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance>,
) => InjectionInstance;

export type InjectWithParameter = <InjectionInstance, InstantiationParam>(
  alias:
    | Injectable<InjectionInstance, unknown, InstantiationParam>
    | InjectionToken<InjectionInstance, InstantiationParam>,
  param: InstantiationParam,
) => InjectionInstance;

// Only tokens declared 'one' are injectable singly; 'zero-or-one' goes through
// `injectMaybe`, the many-cardinalities through `injectMany`. Injectables carry
// no cardinality and are always injectable directly.
export type InjectInjectable2 = <F extends Factory>(
  alias: Injectable2<F> | InjectionToken2<F, any, undefined, 'one'>,
  ...params: Parameters<F>
) => ReturnType<F>;

export type Inject = InjectWithoutParameter & InjectWithParameter & InjectInjectable2;

// Factory-returning inject — handles all aliases (v1 and v2).
// v2 aliases return the native factory F; v1 aliases return a synthesized factory.
export interface Inject2 {
  <F extends Factory>(alias: Injectable2<F>): F;
  <F extends Factory>(alias: InjectionToken2<F, any, undefined, 'one'>): F;
  <I>(alias: Injectable<I, any> | InjectionToken<I>): () => I;
  <I, P>(alias: Injectable<I, any, P> | InjectionToken<I, P>): (...params: [P]) => I;
}

type TuplePrefix<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [] | [First, ...TuplePrefix<Rest>]
  : [];

type PurgeAll = () => void;

type PurgeInjectable2 = <F extends Factory>(
  alias: Alias2<F>,
  ...keyParts: TuplePrefix<Parameters<F>>
) => void;

type PurgeWithoutParameter = <I>(
  alias: Injectable<I, any> | InjectionToken<I>,
) => void;

type PurgeWithParameter = <I, P>(
  alias: Injectable<I, any, P> | InjectionToken<I, P>,
  ...keyParts: [] | [P]
) => void;

export type Purge = PurgeAll & PurgeInjectable2 & PurgeWithoutParameter & PurgeWithParameter;

export type SpecificInjectWithoutParameter<InjectionInstance> = (
  alias:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance>,
) => InjectionInstance;

export type SpecificInjectWithParameter<InjectionInstance, InstantiationParam> =
  (
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ) => InjectionInstance;

export type SpecificInject<InjectionInstance, InstantiationParam> =
  InstantiationParam extends void
    ? SpecificInjectWithoutParameter<InjectionInstance>
    : SpecificInjectWithParameter<InjectionInstance, InstantiationParam>;

export interface InjectMany {
  // The element type comes from the token's many-factory, but the result is
  // normalized to a plain array: the exact consumption shape (one-or-many's
  // non-empty tuple) is injectMany2's factory-returning domain, and widening
  // here keeps this a non-breaking fix for v1 consumers.
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
    ...params: Parameters<F>
  ): ReturnType<MF> extends (infer R)[] ? R[] : never;

  <InjectionInstance>(
    alias:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance, void, any>,
  ): InjectionInstance[];

  <InjectionInstance, InstantiationParam>(
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam, any>,
    param: InstantiationParam,
  ): InjectionInstance[];
}

export type Meta = {
  id: string;
};

export type InjectionInstanceWithMeta<InjectionInstance> = {
  instance: InjectionInstance;
  meta: Meta;
};

export interface InjectManyWithMeta {
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
    ...params: Parameters<F>
  ): InjectionInstanceWithMeta<
    ReturnType<MF> extends (infer R)[] ? R : never
  >[];

  <InjectionInstance>(
    alias:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance, void, any>,
  ): InjectionInstanceWithMeta<InjectionInstance>[];

  <InjectionInstance, InstantiationParam>(
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam, any>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>[];
}

export interface InjectWithMeta {
  <F extends Factory>(
    alias: Injectable2<F> | InjectionToken2<F, any, undefined, 'one'>,
    ...params: Parameters<F>
  ): InjectionInstanceWithMeta<ReturnType<F>>;

  <InjectionInstance>(
    alias:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance, void, any>,
  ): InjectionInstanceWithMeta<InjectionInstance>;

  <InjectionInstance, InstantiationParam>(
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam, any>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>;
}

export interface DiContainerForInjection {
  inject: Inject;
  injectMany: InjectMany;
  injectWithMeta: InjectWithMeta;
  injectManyWithMeta: InjectManyWithMeta;
  injectFactory: Inject2;

  register(...injectables: (Alias | InjectableBunch)[]): void;

  deregister(...injectables: (Alias | InjectableBunch)[]): void;

  sourceNamespace: string | undefined;

  purge: Purge;

  hasRegistrations: (alias: Alias) => boolean;

  registeredInLocalScope: (alias: Alias) => boolean;

  registeredInLocalScopeSubtree: (alias: Alias) => boolean;

  getNumberOfRegistrations: (alias: Alias) => number;

  getNumberOfInstances: () => Record<string, number>;
}

export interface Lifecycle<InstantiationParam = void> {
  getInstanceKey: (di: DiContainer, params: InstantiationParam) => any;
}

declare const storedInstanceKey: unique symbol;
declare const nonStoredInstanceKey: unique symbol;

export const lifecycleEnum: {
  singleton: {
    getInstanceKey: (di: DiContainer) => typeof storedInstanceKey;
  };

  keyedSingleton<InstantiationParam>(
    options: Lifecycle<InstantiationParam>,
  ): typeof options;

  transient: {
    getInstanceKey: (di: DiContainer) => typeof nonStoredInstanceKey;
  };
};

type RegistrationCallback = (injectable: Injectable<any, any, any>) => void;

// --- injectionDecoratorToken ---
//
// Abstract token for decorating injection. Decorators must be registered
// against a target via `.for(target)` where target is an Injectable, Injectable2,
// InjectionToken, or InjectionToken2.
//
// The decorator function receives the bound inject for that alias:
//   inject => (...params) => decoratedInstance
// where inject: (...params) => instance.
//
// This decorator does not respect lifecycle — it is called on every `di.inject`.

export type InjectionDecoratorForInjectable2<F extends Factory = Factory> =
  () => (inject: (...params: Parameters<F>) => ReturnType<F>)
       => (...params: Parameters<F>) => ReturnType<F>;

export interface InjectionDecoratorSpecificFactory {
  <F extends Factory>(
    target: Alias2<F>,
  ): SpecificInjectionToken2<InjectionDecoratorForInjectable2<F>>;

  <InjectionInstance, InstantiationParam = void>(
    target: Injectable<InjectionInstance, any, InstantiationParam> | InjectionToken<InjectionInstance, InstantiationParam>,
  ): SpecificInjectionToken2<() => (inject: Factory) => Factory>;

  // Tag-keyed dispatch: an injection decorator targeting a string tag fires
  // for every injectable whose `tags` array contains that tag — but ONLY when
  // `di.inject` is called with a concrete injectable as the alias. Token-aliases
  // (`di.inject(someToken)`) do NOT trigger tag-keyed injection-decorators.
  // Weak typing is intentional — the tag is a documentation string.
  (tag: string): SpecificInjectionToken2<() => (inject: Factory) => Factory>;
}

export const injectionDecoratorToken: InjectionToken2<
  Factory,
  ManyFactory,
  InjectionDecoratorSpecificFactory,
  'zero-or-many'
>;

// --- instantiationDecoratorToken ---
//
// Abstract token for decorating instantiation. Decorators must be registered
// against a target via `.for(target)` where target is an Injectable, Injectable2,
// InjectionToken, or InjectionToken2.
//
// The decorator function wraps the instantiate function:
//   instantiate => (di, ...params) => decoratedInstance   (v1 injectables)
//   instantiate => (di) => (...params) => decoratedInstance (v2 injectables)
//
// This decorator respects the lifecycle of the injectables.

export type InstantiationDecoratorForInjectable2<F extends Factory = Factory> =
  () => (instantiate: (di: DiContainerForInjection) => F)
       => (di: DiContainerForInjection) => F;

export type InstantiationDecoratorForTags<InjectionInstance, InstantiationParams extends any[]> = (di: DiContainerForInjection, ...params: InstantiationParams) => InjectionInstance;

export interface InstantiationDecoratorSpecificFactory {
  <F extends Factory>(
    target: Alias2<F>,
  ): SpecificInjectionToken2<InstantiationDecoratorForInjectable2<F>>;

  <InjectionInstance, InstantiationParam = void>(
    target: Injectable<InjectionInstance, any, InstantiationParam> | InjectionToken<InjectionInstance, InstantiationParam>,
  ): SpecificInjectionToken2<() => (instantiate: Instantiate<InjectionInstance, InstantiationParam>) => Instantiate<InjectionInstance, InstantiationParam>>;

  // Tag-keyed dispatch: an instantiation decorator targeting a string tag
  // fires for every injectable whose `tags` array contains that tag.
  (tag: string): SpecificInjectionToken2<<InjectionInstance, InstantiationParams extends any[]>() => 
    (instantiate: InstantiationDecoratorForTags<InjectionInstance, InstantiationParams>) => 
      InstantiationDecoratorForTags<InjectionInstance, InstantiationParams>>;
}

export const instantiationDecoratorToken: InjectionToken2<
  Factory,
  ManyFactory,
  InstantiationDecoratorSpecificFactory,
  'zero-or-many'
>;

// --- registrationDecoratorToken ---
//
// Abstract token for decorating registration. Decorators must be registered
// against a target via `.for(target)` where target is an Injectable, Injectable2,
// InjectionToken, or InjectionToken2. The decorator receives the bound register
// call and may call it (to proceed), skip it (to prevent registration), or
// store it for deferred invocation.

export type RegistrationDecorator = () =>
  (register: (injectable: Injectable<any, any, any> | Injectable2) => void)
    => (injectable: Injectable<any, any, any> | Injectable2) => void;

export interface RegistrationDecoratorSpecificFactory {
  <F extends Factory>(
    target: Alias2<F>,
  ): SpecificInjectionToken2<RegistrationDecorator>;

  <InjectionInstance, InstantiationParam = void>(
    target: Injectable<InjectionInstance, any, InstantiationParam> | InjectionToken<InjectionInstance, InstantiationParam>,
  ): SpecificInjectionToken2<RegistrationDecorator>;

  // Tag-keyed dispatch: a registration decorator targeting a string tag
  // fires for every injectable whose `tags` array contains that tag.
  // Weak typing is intentional — the tag is a documentation string, not a
  // type witness.
  (tag: string): SpecificInjectionToken2<RegistrationDecorator>;
}

export const registrationDecoratorToken: InjectionToken2<
  Factory,
  ManyFactory,
  RegistrationDecoratorSpecificFactory,
  'zero-or-many'
>;

export const deregistrationDecoratorToken: InjectionToken2<
  Factory,
  ManyFactory,
  RegistrationDecoratorSpecificFactory,
  'zero-or-many'
>;

export const registrationCallbackToken: RegistrationCallback;
export const deregistrationCallbackToken: RegistrationCallback;

// --- instancePurgeCallbackToken ---
//
// Abstract base token. Callbacks must be registered against a specifier-
// scoped token produced by `.for(target)` — there is no untargeted variant.
// Targets are `Injectable2<F>` or `InjectionToken2<F>`; old-style targets
// are not supported. Firing happens when a cached instance of an injectable2
// is evicted by `di.purge(...)`, `di.deregister(...)`, or LRU eviction.
//
// The scoped token's Factory is `() => Callback` — parameterless so it
// resolves as a singleton per callback injectable (one cached entry under
// the singleton key, not one per evicted instance). The returned Callback
// is CURRIED `(payload) => Factory` — mirroring the Override `(di) => F`
// trick — so free generics in `Factory` survive to the inner arrow. The
// inner Factory's return value is discarded at runtime; it is required
// only to keep Factory intact as a covariant return position.
//
// Payload is an object for readability.

export type InstancePurgeCallbackForInjectable2<F extends Factory = Factory> =
  () => (payload: { instance: ReturnType<F> }) => F;

export interface InstancePurgeCallbackSpecificFactory {
  <F extends Factory>(
    target: Alias2<F>,
  ): SpecificInjectionToken2<InstancePurgeCallbackForInjectable2<F>>;

  // Tag-keyed dispatch: a purge callback targeting a string tag fires for
  // every injectable whose `tags` array contains that tag.
  // Weak typing is intentional — the tag is a documentation string.
  (tag: string): SpecificInjectionToken2<InstancePurgeCallbackForInjectable2<Factory>>;
}

export const instancePurgeCallbackToken: InjectionToken2<
  Factory,
  ManyFactory,
  InstancePurgeCallbackSpecificFactory,
  'zero-or-many'
>;

// --- preInjectCallbackToken ---
//
// Abstract base token. Callbacks must be registered against a specifier-
// scoped token produced by `.for(target)` — targets are any alias
// (injectable or token, v1 or v2) or a string tag. The callback fires once
// before every matching inject operation — before alias resolution and
// before any failure check, so a callback may register implementations that
// the same operation then observes, and it fires even when nothing is
// registered for the alias. `di.injectMany` fires it once for the whole
// call with the token alias; resolving the elements does not fire it again.
//
// The callback also receives the injecting party — the injectable whose
// `instantiate` made the call, or the container root for injects made
// directly on `di`.
//
// The scoped token's Factory is `() => PreInjectCallback` — parameterless
// so it resolves as a singleton per callback injectable.

export type PreInjectCallbackKind = 'inject' | 'injectMany';

// The container itself, which stands in as the injecting party for injects
// made directly on `di` rather than from within an `instantiate`.
export interface ContainerRoot {
  id: string;
  aliasType: 'container';
}

export type PreInjectCallback = (
  alias: Alias,
  kind: PreInjectCallbackKind,
  injectingInjectable: Alias | ContainerRoot,
) => void;

export interface PreInjectCallbackSpecificFactory {
  (target: Alias): SpecificInjectionToken2<() => PreInjectCallback>;

  // Tag-keyed dispatch: a pre-inject callback targeting a string tag fires
  // for every inject operation whose alias (or a token in its chain)
  // carries the tag. Weak typing is intentional — the tag is a
  // documentation string.
  (tag: string): SpecificInjectionToken2<() => PreInjectCallback>;
}

export const preInjectCallbackToken: InjectionToken2<
  Factory,
  ManyFactory,
  PreInjectCallbackSpecificFactory,
  'zero-or-many'
>;

export const isInjectable: (
  thing: unknown,
) => thing is Injectable<unknown, unknown, unknown>;
export const isInjectableBunch: (
  thing: unknown,
) => thing is InjectableBunch;
export const isInjectionToken: (
  thing: unknown,
) => thing is InjectionToken<unknown, unknown>;

export function createContainer(containerId: string): DiContainer;

export function getKeyedSingletonCompositeKey<T extends [...unknown[]]>(
  ...keys: T
): { keys: T };

export type TypedSpecifier<SpecifierName extends string = string, Typing extends object = {}> =
  SpecifierName
  & [Typing];

export type TypedSpecifierWithType<TypeName extends string, T = unknown> = TypedSpecifier<string, { [K in TypeName]: T }>;

export type TypedSpecifierType<TypeName extends string, Specifier extends TypedSpecifierWithType<TypeName>> =
  Specifier extends TypedSpecifier<string, infer Typing extends Record<TypeName, unknown>>
    ? Typing[TypeName]
    : never;

export function getTypedSpecifier
  <Typing extends object>():
    <SpecifierName extends string>(specifier: SpecifierName) =>
      TypedSpecifier<SpecifierName, Typing>;

// ---- Injectable2 / InjectionToken2 ----

export interface Injectable2<F extends Factory = Factory> {
  readonly aliasType: 'injectable2';
  readonly id: string;
  readonly instantiate: (di: DiContainerForInjection2) => F;
  // Stored at the wider Factory shape so an injectable's F can stay narrower
  // than its token's F. The construction-time `F extends TF` constraint on
  // `getInjectable2` keeps the relationship sound; precise per-injectable
  // token typing isn't observably useful here (runtime reads only token-level
  // fields like `.id`, `.abstract`, `.maxCacheSize`).
  readonly injectionToken?: InjectionToken2<Factory, any, any>;
  readonly consumptions?: ReadonlyArray<Consumption>;
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly tags?: string[];
  readonly maxCacheSize?: number;
}

// ---- Consumptions ----
//
// An injectable2 declares the injection tokens it may inject. The declaration
// is enforced twice over: `instantiate`'s `di` only accepts what was declared,
// and the container checks every inject at runtime — which is what catches
// plain-JS callers and tokens that merely have the same shape as a declared
// one. Injecting another injectable by reference needs no declaration: that
// already implies a dependency on wherever the injectable lives.
//
// Absence means "injects no tokens": with nothing declared, `Cons` is `never`
// and no token is injectable.

export type Consumption =
  | InjectionToken2<any, any, any, any>
  | InjectionToken<any, any, any>;

// The `.for()` derivatives of a declared token are covered by declaring the
// token itself — otherwise a specifier only known at runtime could not be
// declared at all. One level suffices: the default `.for()` factory is
// self-similar, so a child's own `for` yields the same shape again.
type NotAny<T> = 0 extends 1 & T ? never : T;

export type ConsumptionChildOf<C> = C extends {
  for: (...args: any[]) => infer Child;
}
  ? NotAny<Child> extends { speciality: any }
    ? NotAny<Child>
    : never
  : never;

type Consumable<Cons extends Consumption> =
  | Cons
  | ConsumptionChildOf<Cons>;

// The injection surface of `instantiate`'s `di`: the same cardinality gating as
// the container's, narrowed to what the injectable declared. Injectables pass
// freely, matching the runtime exemption.
export interface ConsumptionInject2<Cons extends Consumption> {
  <F extends Factory>(alias: Injectable2<F>): F;
  <F extends Factory>(
    alias: Consumable<Cons> & InjectionToken2<F, any, undefined, 'one'>,
  ): F;
  <I>(alias: Injectable<I, any> | (Consumable<Cons> & InjectionToken<I>)): () => I;
  <I, P>(
    alias:
      | Injectable<I, any, P>
      | (Consumable<Cons> & InjectionToken<I, P>),
  ): (...params: [P]) => I;
}

export interface ConsumptionInjectMany2<Cons extends Consumption> {
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: Consumable<Cons> &
      InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
  ): MF;
  <I>(alias: Consumable<Cons> & InjectionToken<I>): () => I[];
  <I, P>(
    alias: Consumable<Cons> & InjectionToken<I, P>,
  ): (...params: P extends any[] ? P : [P]) => I[];
}

export interface ConsumptionInjectMaybe2<Cons extends Consumption> {
  <F extends Factory, MF extends (...args: Parameters<F>) => ReturnType<F> | undefined>(
    alias: Consumable<Cons> & InjectionToken2<F, MF, undefined, 'zero-or-one'>,
  ): MF;
}

// The withMeta pair mirrors InjectWithMeta2 / InjectManyWithMeta2 with the
// same consumption gating as the plain variants — the runtime enforces
// declarations on these paths too.
export interface ConsumptionInjectWithMeta2<Cons extends Consumption> {
  <F extends Factory>(alias: Injectable2<F>): ToWithMetaFactory<F>;
  <F extends Factory, WF>(
    alias: Consumable<Cons> & InjectionToken2<F, any, undefined, 'one', WF>,
  ): WF;
  <I>(
    alias: Injectable<I, any> | (Consumable<Cons> & InjectionToken<I>),
  ): () => InjectionInstanceWithMeta<I>;
  <I, P>(
    alias: Injectable<I, any, P> | (Consumable<Cons> & InjectionToken<I, P>),
  ): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>;
}

export interface ConsumptionInjectManyWithMeta2<Cons extends Consumption> {
  <F extends Factory, WMF>(
    alias: Consumable<Cons> &
      InjectionToken2<F, any, any, 'zero-or-many' | 'one-or-many', any, WMF>,
  ): WMF;
  <I>(
    alias: Consumable<Cons> & InjectionToken<I>,
  ): () => InjectionInstanceWithMeta<I>[];
  <I, P>(alias: Consumable<Cons> & InjectionToken<I, P>): (
    ...params: P extends any[] ? P : [P]
  ) => InjectionInstanceWithMeta<I>[];
}

export interface ConsumptionInjectMaybeWithMeta2<Cons extends Consumption> {
  <F extends Factory, WMF>(
    alias: Consumable<Cons> &
      InjectionToken2<F, any, undefined, 'zero-or-one', any, WMF>,
  ): WMF;
}

/** @deprecated Renamed to ConsumptionInject2 — "scoped" clashes with the container's registration scopes. */
export type ScopedInject2<Cons extends Consumption> = ConsumptionInject2<Cons>;
/** @deprecated Renamed to ConsumptionInjectMany2 — "scoped" clashes with the container's registration scopes. */
export type ScopedInjectMany2<Cons extends Consumption> =
  ConsumptionInjectMany2<Cons>;
/** @deprecated Renamed to ConsumptionInjectMaybe2 — "scoped" clashes with the container's registration scopes. */
export type ScopedInjectMaybe2<Cons extends Consumption> =
  ConsumptionInjectMaybe2<Cons>;

// `instantiate`'s di. Leave the parameter unannotated so it is typed
// contextually from the `consumptions` array; annotate it with this when
// `instantiate` is written as a named function elsewhere.
export interface ConsumptionDi<Cons extends Consumption = never>
  extends Omit<
    DiContainerForInjection2,
    | 'inject'
    | 'injectMany'
    | 'injectMaybe'
    | 'injectWithMeta'
    | 'injectManyWithMeta'
    | 'injectMaybeWithMeta'
  > {
  inject: ConsumptionInject2<Cons>;
  injectMany: ConsumptionInjectMany2<Cons>;
  injectMaybe: ConsumptionInjectMaybe2<Cons>;
  injectWithMeta: ConsumptionInjectWithMeta2<Cons>;
  injectManyWithMeta: ConsumptionInjectManyWithMeta2<Cons>;
  injectMaybeWithMeta: ConsumptionInjectMaybeWithMeta2<Cons>;
}

// With injectionToken: F is the injectable's actual factory (kept narrow so
// `di.inject2(injectable)` returns the narrow factory), TF is the token's
// factory contract. The `F extends TF` constraint verifies the implementation
// satisfies the contract.
export function getInjectable2<
  F extends TF,
  TF extends Factory,
  const Cons extends Consumption = never,
>(options: {
  readonly id: string;
  readonly consumptions?: ReadonlyArray<Cons>;
  readonly instantiate: (di: ConsumptionDi<Cons>) => F;
  readonly injectionToken: InjectionToken2<TF, any, undefined, any>;
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly tags?: string[];
  readonly maxCacheSize?: number;
}): Injectable2<F>;

// Without injectionToken: infer F from instantiate, so callers of di.inject /
// useInject / useInject2 still get precise parameter and return types.
export function getInjectable2<
  F extends Factory,
  const Cons extends Consumption = never,
>(options: {
  readonly id: string;
  readonly consumptions?: ReadonlyArray<Cons>;
  readonly instantiate: (di: ConsumptionDi<Cons>) => F;
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly tags?: string[];
  readonly maxCacheSize?: number;
}): Injectable2<F>;

export type ManyFactory<F extends Factory = Factory> = F extends (...args: infer P) => infer R
  ? (...args: P) => R[]
  : never;

// ---- Cardinality ----
//
// Every v2 injection token declares how many implementations it expects, which
// decides the one consumption API that accepts it: `inject` for 'one',
// `injectMaybe` for 'zero-or-one', `injectMany` for the two many-cardinalities.
// Upper bounds ('one', 'zero-or-one' permit at most one implementation) are
// enforced when registering; lower bounds ('one', 'one-or-many' require at
// least one) by `di.validate()`.

export type Cardinality = 'one' | 'zero-or-one' | 'zero-or-many' | 'one-or-many';

// The consumption shape of a 'zero-or-one' token: the instance, or undefined
// when nothing is registered. Presence is resolved per call, so a token whose
// implementation is registered later starts yielding it. Note this cannot
// distinguish "nothing registered" from "the factory returned undefined".
export type MaybeResultFactory<F extends Factory = Factory> = F extends (...args: infer P) => infer R
  ? (...args: P) => R | undefined
  : never;

// The consumption shape of a 'one-or-many' token: a non-empty array, so
// indexing the first element needs no defensive check.
export type NonEmptyManyFactory<F extends Factory = Factory> = F extends (...args: infer P) => infer R
  ? (...args: P) => [R, ...R[]]
  : never;

// Constraint for the many-factory slot on the token interfaces: wide enough to
// hold every cardinality's consumption shape. Each creator overload narrows it
// to the shape its cardinality actually permits, so a token can never be built
// carrying a shape its cardinality disallows.
export type AnyConsumptionFactory<F extends Factory> = (
  ...args: Parameters<F>
) => ReturnType<F>[] | ReturnType<F> | undefined;

export type DefaultConsumptionFactory<C extends Cardinality, F extends Factory> =
  C extends 'zero-or-one'
    ? MaybeResultFactory<F>
    : C extends 'one-or-many'
    ? NonEmptyManyFactory<F>
    : ManyFactory<F>;

// Default with-meta consumption shapes derived from the base/many factory:
// the same parameters, the result (or each element) wrapped in
// InjectionInstanceWithMeta. Like every utility-type derivation, these
// collapse a generic factory to its constraint — a token whose withMeta
// consumers must keep a generic declares its with-meta slots explicitly
// instead (see InjectionToken2Base). Both are `any`-proofed: deriving over
// `any` (wide positions such as `Consumption`'s InjectionToken2<any, ...>)
// would otherwise produce `(...args: unknown[]) => ...`, whose contravariant
// parameters REJECT every concrete token — the opposite of wide.
export type DefaultWithMetaFactory<F> = 0 extends 1 & F
  ? any
  : ToWithMetaFactory<F>;

// Cardinality-shaped, exactly like the MF slot it derives from: an
// array-returning MF (the many-cardinalities, and 'one') yields the
// injectManyWithMeta shape, a MaybeResultFactory ('zero-or-one') yields the
// injectMaybeWithMeta shape. The trailing `MF extends any` distributes over
// the default MF slot — a bare `InjectionToken2<F>` leaves MF as the
// ManyFactory | MaybeResultFactory union, and deriving non-distributively
// would collapse the shape to nonsense, making the bare annotation reject
// every concrete token.
export type DefaultWithMetaConsumptionFactory<MF extends Factory> = 0 extends 1 &
  MF
  ? any
  : MF extends any
  ? ReturnType<MF> extends (infer R)[]
    ? (...args: Parameters<MF>) => InjectionInstanceWithMeta<R>[]
    : (
        ...args: Parameters<MF>
      ) =>
        | InjectionInstanceWithMeta<Exclude<ReturnType<MF>, undefined>>
        | undefined
  : never;

export interface InjectionToken2Base<
  F extends Factory = Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
  C extends Cardinality = Cardinality,
  WF = DefaultWithMetaFactory<F>,
  WMF = DefaultWithMetaConsumptionFactory<MF>,
> {
  readonly aliasType: 'injection-token2';
  template: F;
  manyTemplate: MF;
  // With-meta consumption shapes: what injectWithMeta / injectManyWithMeta
  // (and their factory-returning forms) hand back for this token. Purely
  // type-level anchors — never set at runtime — defaulted by derivation from
  // F / MF, which collapses a generic factory to its constraint. To keep a
  // generic through the withMeta consumers, declare the slots explicitly by
  // creating the token through the slots-bag creator overload, which stamps
  // them on the returned token:
  //   const token = getInjectionToken2<{
  //     singleFactory: GF;
  //     manyFactory: GMF;
  //     singleMetaFactory: <T>(value: T) => InjectionInstanceWithMeta<T>;
  //     manyMetaFactory: <T>(value: T) => InjectionInstanceWithMeta<T>[];
  //   }>({ id: 'some-id', cardinality: 'zero-or-many' })();
  // (On a token built positionally, a cast to the bag annotation does the
  // same — a cast, not an assignment, since a monomorphic default-derived
  // shape can't be assigned to a generic one; honest either way because the
  // runtime is parametric.)
  withMetaTemplate: WF;
  withMetaConsumptionTemplate: WMF;
  key: Symbol;
  id: string;
  // Declared arity. The creators always stamp a literal, so a token annotated
  // without one (`InjectionToken2<F>`, C = the whole union) means "a token of
  // some cardinality" — it is accepted by wide positions like `register` but
  // cannot be consumed until narrowed. The property is optional because the
  // runtime is plain JS and nothing type-level should assume its presence.
  cardinality?: C;
  maxCacheSize?: number;
  // Every token carries the initial tag 'injectionToken' plus any tags given
  // at creation; `.for()` children inherit the general token's tags. Optional
  // because the built-in machinery tokens are untagged.
  tags?: string[];
}

// ---- Named type-parameter slots (the favoured annotation form) ----
//
// InjectionToken2 and SpecificInjectionToken2 accept, instead of the
// positional tail, a single object of named slots as the first (and only)
// type argument:
//
//   InjectionToken2<{ singleFactory: F; cardinality: 'one' }>
//
// `singleFactory` is mandatory; every other slot is optional and defaults
// exactly as its positional counterpart does, so a bag names only what it
// customizes — immune to positional-order concerns, and new slots can be
// added without breaking anything. Exception: a GENERIC (or overloaded)
// singleFactory makes `manyFactory`, `singleMetaFactory` and
// `manyMetaFactory` mandatory as well, because their derived defaults would
// silently collapse it (see Token2SingleFactoryBound below) — spell the collapsed
// `unknown`-product shape deliberately when that is what is wanted. Unknown
// keys are rejected (see Token2ExactSlots below). The slots are uncorrelated
// (e.g. `manyFactory` is not checked against `singleFactory`'s parameters):
// cross-slot conformance is the creators' job; annotations state intent.
// "Any specific-token factory" — what a `.for()` slot may hold, with no
// correlation to a particular contract. The single point of truth for the
// uncorrelated shape; the creators' SF bounds spell the F-correlated
// variant, where the correlation is the point.
type AnySpecificTokenFactory = (
  ...args: any[]
) => SpecificInjectionToken2<any, any, any, any>;

export interface InjectionToken2Slots {
  singleFactory?: Factory;
  manyFactory?: Factory;
  cardinality?: Cardinality;
  // Function-bounded, unlike the positional WF/WMF parameters (which stay
  // unconstrained for provability): a bag is always spelled by hand, and a
  // non-function meta slot is always a mistake.
  singleMetaFactory?: Factory;
  manyMetaFactory?: Factory;
  specificTokenFactory?: undefined | AnySpecificTokenFactory;
}

// Detects a generic function type: rebuilding the signature from
// Parameters<>/ReturnType<> collapses type parameters to their constraints,
// and the collapsed signature is assignable back to F only when F had no
// type parameters to lose. A non-generic factory that deliberately produces
// `unknown` (e.g. `() => unknown`) rebuilds to itself, so it is NOT flagged.
// OVERLOADED factories are flagged as well — deliberately: the rebuild sees
// only the last call signature, which is exactly what the derived defaults
// would silently reduce an overloaded contract to, so the explicit-slots
// mandate protects them for the same reason it protects generics.
type IsGenericFactory<F extends Factory> = 0 extends 1 & F
  ? false
  : ((...args: Parameters<F>) => ReturnType<F>) extends F
  ? false
  : true;

// The bound the bag's own `singleFactory` value must meet: normally just
// Factory, but a GENERIC singleFactory in a bag that does not also spell
// every derived factory slot (manyFactory and both meta slots, whose
// defaults would silently collapse the generic to its constraint) is bounded
// by an error literal instead, so the constraint fails right on the bag with
// the requirement spelled out in the compiler output. Naming a collapsed
// `unknown`-product shape deliberately satisfies the requirement; having the
// collapse happen silently does not.
type Token2SingleFactoryBound<Bag> = Bag extends {
  singleFactory: infer F extends Factory;
}
  ? IsGenericFactory<F> extends true
    ? Bag extends {
        manyFactory: Factory;
        singleMetaFactory: unknown;
        manyMetaFactory: unknown;
      }
      ? Factory
      : 'ERROR: a generic (or overloaded) singleFactory requires explicit manyFactory, singleMetaFactory and manyMetaFactory slots — their derived defaults would collapse it'
    : Factory
  : Factory;

// The slots-bag constraint: a bag whose every key exists on
// InjectionToken2Slots with a conforming value, which carries the mandatory
// `singleFactory` (a bag without the contract factory is a mistake, not a
// wide annotation — the positional form covers "any factory"), and whose
// generic-singleFactory obligations hold (see Token2SingleFactoryBound).
// Self-referential on purpose — a plain `extends Partial<InjectionToken2Slots>`
// bound would let a typo'd key (`cardinalty`) pass silently, since extra
// properties satisfy an all-optional object type; mapping the bag's own keys
// makes an unknown key demand `never` and fail the constraint instead. The
// generic-obligation conditional lives in the mapped type's VALUE position
// (and the presence requirement is a plain intersection) because a
// conditional over the bag directly in the type parameter's own constraint
// is a circular constraint (TS2313); mapped-type values are evaluated
// lazily, which is what makes the self-reference legal.
type Token2ExactSlots<Bag> = {
  [K in keyof Bag]: K extends 'singleFactory'
    ? Token2SingleFactoryBound<Bag>
    : // specificTokenFactory is the one slot where `undefined` is a real
    // value (the concrete pin), so it keeps it explicitly...
    K extends 'specificTokenFactory'
    ? undefined | AnySpecificTokenFactory
    : K extends keyof InjectionToken2Slots
    ? // ...while every other present key must carry a real value —
      // `singleMetaFactory: undefined` would otherwise silence the
      // generic-collapse mandate.
      NonNullable<InjectionToken2Slots[K]>
    : never;
} & { singleFactory: Factory };

// ---- Slot extractors ----
//
// Each maps either form of the first type argument to one effective slot:
// the positional branch hands the value through (or the positional default),
// the bag branches extract the key or fall back to that same default. All of
// them are DELIBERATELY naked distributive conditionals with the checked
// parameter appearing in the first branch: inside a distributive true branch
// TS substitutes `X & Factory` for X, which keeps the whole conditional
// provably Factory-bounded (so it can instantiate InjectionToken2Base and
// sit inside Parameters<>/ReturnType<>) while staying transparent to
// inference — a tuple guard or an `infer`-rebound branch would be opaque to
// one or the other, and the machinery signatures below infer F through
// these. For a concrete positional F every extractor resolves to exactly
// what the pre-slots declaration spelled, so existing annotations keep their
// exact types.
type Token2SingleFactorySlot<X> = X extends Factory
  ? X
  : X extends { singleFactory: infer F extends Factory }
  ? F
  : Factory;

// A bag that pins `cardinality` without `manyFactory` derives the
// consumption shape from the cardinality, exactly like the creators and the
// per-cardinality aliases do — something the positional form cannot offer,
// since its MF parameter precedes C.
type Token2ManyFactorySlot<X> = X extends Factory
  ? ManyFactory<X> | MaybeResultFactory<X>
  : X extends { manyFactory: infer F extends Factory }
  ? F
  : X extends { cardinality: infer C extends Cardinality }
  ? DefaultConsumptionFactory<C, Token2SingleFactorySlot<X>>
  : ManyFactory<Token2SingleFactorySlot<X>> | MaybeResultFactory<Token2SingleFactorySlot<X>>;

type Token2CardinalitySlot<X> = X extends Factory
  ? Cardinality
  : X extends { cardinality: infer C extends Cardinality }
  ? C
  : Cardinality;

type Token2SingleMetaFactorySlot<X> = X extends Factory
  ? DefaultWithMetaFactory<X>
  : X extends { singleMetaFactory: infer F }
  ? F
  : DefaultWithMetaFactory<Token2SingleFactorySlot<X>>;

type Token2ManyMetaFactorySlot<X, MF extends Factory> = X extends Factory
  ? DefaultWithMetaConsumptionFactory<MF>
  : X extends { manyMetaFactory: infer F }
  ? F
  : DefaultWithMetaConsumptionFactory<MF>;

// The specific-token-factory slot decides abstractness, and its
// key-omitted fallback differs per alias — `any` (wide, "abstract or not")
// for InjectionToken2, `undefined` (concrete) for SpecificInjectionToken2 —
// mirroring their positional defaults, so the fallback is a parameter.
type Token2SpecificFactorySlot<X, Fallback> = X extends Factory
  ? Fallback
  : X extends {
      specificTokenFactory: infer F extends undefined | AnySpecificTokenFactory;
    }
  ? F
  : Fallback;

// `for` — and abstractness — exist only when a real `specificInjectionTokenFactory`
// was given: `getInjectionToken2<F>(options)()` (no factory) instantiates
// SpecificFactory as `undefined`, so the resulting token has no `.for` at all
// (a compile error to access, not merely `for: undefined`) and is not
// abstract; a real factory value makes it both have `.for()` and be abstract
// — a token only ever needs a factory when it's meant to be resolved
// exclusively through `.for()`. This must stay a naked conditional, not the
// usual `[X] extends [Y]` tuple guard against distributing over unions — a
// naked conditional distributes `any` into the union of both branches, which
// is what lets wide positions that must accept both a for-less token and an
// abstract, for-bearing one (e.g. `injectMany`, typed
// `InjectionToken2<F, any, any, C>`) keep doing so, while positions that must
// reject abstract tokens (e.g. `di.inject`, `getInjectable2`'s
// `injectionToken`) pin `SpecificFactory` to `undefined` instead of `any`.
// `undefined`, not `never`, is the sentinel: a naked conditional collapses to
// `never` whenever the checked type is `never` itself, which would make a
// for-less token's type useless.
//
// The first slot also accepts a named-slots bag — see InjectionToken2Slots.
// The positional tail (every parameter after the first) is deprecated in
// favour of the bag; it remains for compatibility and the machinery
// signatures below, which still spell it.
export type InjectionToken2<
  F extends Factory | Token2ExactSlots<F> = Factory,
  // Bound `Factory`, not `AnyConsumptionFactory<F>`: F may now be a slots
  // bag, and the extractor standing in for it is opaque to the constraint
  // solver — a correlated bound here is unprovable at every generic call
  // site. The creators still enforce the real consumption shape;
  // InjectionToken2Base keeps the strict bound for direct use.
  MF extends Factory = Token2ManyFactorySlot<F>,
  // The positional fallback is `any`, not `undefined`: a bare
  // `InjectionToken2<F>` means "a token of some cardinality, abstract or
  // not" — the same wide, don't-care reading `any` gets everywhere else
  // (`injectMany`, `Consumption`, `Alias2`). Positions that must pin one
  // state spell it out explicitly instead of relying on this default. The
  // returned token's F in the bound is `any`, uncorrelated with this alias's
  // F, for the same provability reason as MF's bound; the creators keep the
  // correlated constraint.
  SpecificFactory extends
    | undefined
    | AnySpecificTokenFactory = Token2SpecificFactorySlot<F, any>,
  C extends Cardinality = Token2CardinalitySlot<F>,
  WF = Token2SingleMetaFactorySlot<F>,
  WMF = Token2ManyMetaFactorySlot<F, MF>,
> = SpecificFactory extends undefined
  ? InjectionToken2Base<Token2SingleFactorySlot<F>, MF, C, WF, WMF> & {
      readonly __abstract?: never;
    }
  : InjectionToken2Base<Token2SingleFactorySlot<F>, MF, C, WF, WMF> & {
      readonly __abstract: true;
      for: SpecificFactory;
    };

// Defaults to no factory: the speciality-aware overloads of `getInjectionToken2`
// below and the DI-machinery per-target factories (e.g.
// `instantiationDecoratorToken`'s `.for(target)`) build leaves this way, with
// no further `.for()` of their own. A specific token that *does* carry its
// own factory (nested specificity) is itself abstract — see the comment on
// `InjectionToken2`. Every `.for()` factory must return something with
// `speciality` — enforced by `InjectionToken2`'s own SpecificFactory bound
// above — so that `buildToken`'s memoization-by-speciality has something to
// key on.
// Accepts the same named-slots bag as InjectionToken2 in its first slot; the
// bag's omitted specificTokenFactory defaults to `undefined` here (concrete),
// mirroring the positional default below rather than InjectionToken2's `any`.
export type SpecificInjectionToken2<
  F extends Factory | Token2ExactSlots<F> = Factory,
  // Bound `Factory` for the same reason as on InjectionToken2 above.
  MF extends Factory = Token2ManyFactorySlot<F>,
  SpecificFactory extends
    | undefined
    | AnySpecificTokenFactory = Token2SpecificFactorySlot<F, undefined>,
  C extends Cardinality = Token2CardinalitySlot<F>,
  WF = Token2SingleMetaFactorySlot<F>,
  WMF = Token2ManyMetaFactorySlot<F, MF>,
> = InjectionToken2<F, MF, SpecificFactory, C, WF, WMF> & { speciality: any };

export interface GetInjectionToken2Options<SpecificFactory> {
  id: string;
  // Must be pure and deterministic: `.for()` memoizes by specifier and skips
  // calling the factory again for a specifier it has already seen.
  specificInjectionTokenFactory?: SpecificFactory;
  target?: object;
  maxCacheSize?: number;
  tags?: string[];
}

// Same fields again, minus the factory entirely — for the
// `getInjectionToken2<F>(options)(specificInjectionTokenFactory)`
// overloads below, where the factory is curried as its own, later call
// instead of an options property.
export interface GetInjectionToken2OptionsWithoutFactory {
  id: string;
  target?: object;
  maxCacheSize?: number;
  tags?: string[];
}

// Returned by `getInjectionToken2<F>(options)` / `getInjectionToken2<F, MF>(options)`
// below. Calling it with no arguments gives a token with no `.for` at all —
// see the comment on `InjectionToken2`; calling it with a factory value keeps
// that factory's own generic signature intact in `SF` — an *optional* slot
// (property or positional parameter) collapses a generic factory's signature
// instead, which is why this is two genuine overloads rather than one
// optional parameter. `SF` must NOT have a default either: a default doubles
// as the contextual signature for the factory argument whenever this call
// sits inside another factory that is itself being inferred (a multi-level
// `.for()` family), and TS instantiates a generic factory against that
// non-generic contextual signature — erasing its type parameters to `any`
// and losing every level's per-specifier narrowing with them. The default
// that used to sit here guarded the old getSpecificInjectionToken2's
// literal-cardinality inference from widening; that creator is folded away
// and cardinality is now an overload discriminant, so nothing needs it.
export interface InjectionToken2FactoryCall<
  F extends Factory,
  MF extends AnyConsumptionFactory<F>,
  C extends Cardinality,
> {
  (): InjectionToken2<F, MF, undefined, C>;

  <SF extends (...args: any[]) => SpecificInjectionToken2<F, any, any, any>>(
    specificInjectionTokenFactory: SF,
  ): InjectionToken2<F, MF, SF, C>;
}

// getInjectionToken2<F, MF, SF>(options)(specificInjectionTokenFactory?): the
// explicit-SF escape hatch. Needed for a `.for()` factory whose return type
// narrows the general contract per specifier (e.g. via `TypedSpecifierType`)
// in a way inference from a real value could never reconstruct — spelling
// `SF` out here lets that type be declared without needing to construct a
// matching runtime value. Flattened to the same "options first" shape as the
// overloads below rather than curried (`()(options)`): since `SF` is already
// fixed explicitly, nothing on the options call needs inferring from it, so
// there's no reason for a separate empty call — and unlike collapsing this
// down to a *single* call, keeping the factory as its own optional trailing
// call matches the runtime, which always returns a function from a
// one-argument call, never a token directly.
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F>,
  SF extends (...args: any[]) => SpecificInjectionToken2<F, any, any, any>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: MF extends (...args: Parameters<F>) => ReturnType<F>[] ? 'one' : never;
  },
): (specificInjectionTokenFactory?: SF) => InjectionToken2<F, MF, SF, 'one'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F>,
  SF extends (...args: any[]) => SpecificInjectionToken2<F, any, any, any>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    // Requiring `undefined` in the result, not merely permitting it: the
    // factory is handed back verbatim, and a 'zero-or-one' token yields
    // nothing when no implementation is registered.
    cardinality: MF extends (...args: Parameters<F>) => ReturnType<F> | undefined
      ? undefined extends ReturnType<MF>
        ? 'zero-or-one'
        : never
      : never;
  },
): (specificInjectionTokenFactory?: SF) => InjectionToken2<F, MF, SF, 'zero-or-one'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F>,
  SF extends (...args: any[]) => SpecificInjectionToken2<F, any, any, any>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: MF extends (...args: Parameters<F>) => ReturnType<F>[] ? 'zero-or-many' : never;
  },
): (specificInjectionTokenFactory?: SF) => InjectionToken2<F, MF, SF, 'zero-or-many'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F>,
  SF extends (...args: any[]) => SpecificInjectionToken2<F, any, any, any>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: MF extends (...args: Parameters<F>) => [ReturnType<F>, ...ReturnType<F>[]]
      ? 'one-or-many'
      : never;
  },
): (specificInjectionTokenFactory?: SF) => InjectionToken2<F, MF, SF, 'one-or-many'>;

// getInjectionToken2<F>(options): a single, non-curried call — options given
// directly, factory curried as its own optional trailing call.
// `getInjectionToken2<F>(options)()` gives a token with no `.for` at all and
// makes it not abstract; `getInjectionToken2<F>(options)(specificInjectionTokenFactory)`
// keeps a generic factory's own signature intact and makes the token
// abstract.
export function getInjectionToken2<F extends Factory>(
  options: GetInjectionToken2OptionsWithoutFactory & { cardinality: 'one' },
): InjectionToken2FactoryCall<F, ManyFactory<F>, 'one'>;
export function getInjectionToken2<F extends Factory>(
  options: GetInjectionToken2OptionsWithoutFactory & { cardinality: 'zero-or-one' },
): InjectionToken2FactoryCall<F, MaybeResultFactory<F>, 'zero-or-one'>;
export function getInjectionToken2<F extends Factory>(
  options: GetInjectionToken2OptionsWithoutFactory & { cardinality: 'zero-or-many' },
): InjectionToken2FactoryCall<F, ManyFactory<F>, 'zero-or-many'>;
export function getInjectionToken2<F extends Factory>(
  options: GetInjectionToken2OptionsWithoutFactory & { cardinality: 'one-or-many' },
): InjectionToken2FactoryCall<F, NonEmptyManyFactory<F>, 'one-or-many'>;

// The many-factory-explicit escape hatch, non-curried — mirrors the four
// arms above, but admits only the cardinality whose consumption shape the
// given MF actually has (matching the removed `InjectionToken2CreatorWithConsumptionFactory`).
export function getInjectionToken2<F extends Factory, MF extends AnyConsumptionFactory<F>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: MF extends (...args: Parameters<F>) => ReturnType<F>[] ? 'one' : never;
  },
): InjectionToken2FactoryCall<F, MF, 'one'>;
export function getInjectionToken2<F extends Factory, MF extends AnyConsumptionFactory<F>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    // Requiring `undefined` in the result, not merely permitting it: the
    // factory is handed back verbatim, and a 'zero-or-one' token yields
    // nothing when no implementation is registered.
    cardinality: MF extends (...args: Parameters<F>) => ReturnType<F> | undefined
      ? undefined extends ReturnType<MF>
        ? 'zero-or-one'
        : never
      : never;
  },
): InjectionToken2FactoryCall<F, MF, 'zero-or-one'>;
export function getInjectionToken2<F extends Factory, MF extends AnyConsumptionFactory<F>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: MF extends (...args: Parameters<F>) => ReturnType<F>[] ? 'zero-or-many' : never;
  },
): InjectionToken2FactoryCall<F, MF, 'zero-or-many'>;
export function getInjectionToken2<F extends Factory, MF extends AnyConsumptionFactory<F>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: MF extends (...args: Parameters<F>) => [ReturnType<F>, ...ReturnType<F>[]]
      ? 'one-or-many'
      : never;
  },
): InjectionToken2FactoryCall<F, MF, 'one-or-many'>;

// Mirrors `InjectionToken2FactoryCall`, narrowed to `SpecificInjectionToken2`:
// returned by the `speciality`-carrying overload of `getInjectionToken2`
// below, which folds what used to be the separate `getSpecificInjectionToken2`
// creator into `getInjectionToken2` itself.
export interface SpecificInjectionToken2FactoryCall<
  F extends Factory,
  MF extends AnyConsumptionFactory<F>,
  C extends Cardinality,
> {
  (): SpecificInjectionToken2<F, MF, undefined, C>;

  <SF extends (...args: any[]) => SpecificInjectionToken2<F, any, any, any>>(
    specificInjectionTokenFactory: SF,
  ): SpecificInjectionToken2<F, MF, SF, C>;
}

// getInjectionToken2<F>(options) where options carries `speciality`: builds a
// specific token directly, folding in what used to be the separate
// getSpecificInjectionToken2 creator — buildToken already threads
// `speciality` through via `...rest` regardless of which overload is called,
// so this needed no runtime change, only a type declaration. Unlike the old
// getSpecificInjectionToken2, this also accepts a factory (curried, same as
// every other getInjectionToken2 call), so a specific token can itself be a
// family root for nested specificity — which makes it abstract too, same as
// any other factory-bearing token (see the comment on `InjectionToken2`).
//
// Specific tokens take their cardinality from the `.for()` of the general
// token that produced them, so `cardinality` is optional — give one when a
// family's specific tokens have a different arity than its general token,
// omit it to inherit the general token's. Four literal-cardinality overloads
// plus one no-cardinality overload, mirroring the general creator's own split
// above, for the same reason: `cardinality` as a *generic* inferred from a
// literal value alongside an explicit `F` on the same call collapses to the
// wide `Cardinality` union instead of the literal given — same failure mode
// as `SF`'s default, documented above — so the literal has to be each
// overload's own discriminant, not an inferred type parameter. `MF` stays a
// wide, cardinality-agnostic default throughout: unlike the general creator
// above, there's no value to narrow it from here.
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: 'one';
  },
): SpecificInjectionToken2FactoryCall<F, MF, 'one'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: 'zero-or-one';
  },
): SpecificInjectionToken2FactoryCall<F, MF, 'zero-or-one'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: 'zero-or-many';
  },
): SpecificInjectionToken2FactoryCall<F, MF, 'zero-or-many'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: 'one-or-many';
  },
): SpecificInjectionToken2FactoryCall<F, MF, 'one-or-many'>;
export function getInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality?: undefined;
  },
): SpecificInjectionToken2FactoryCall<F, MF, Cardinality>;

// ---- Slots-bag creator overloads ----
//
// The creator accepts the named-slots bag as the sole type argument — the
// favoured form whenever a token's slots need spelling at all (a generic
// contract, a custom consumption factory, explicit meta shapes):
//
//   getInjectionToken2<{
//     singleFactory: <T>(value: T) => T;
//     manyFactory: <T>(value: T) => T[];
//     singleMetaFactory: <T>(value: T) => InjectionInstanceWithMeta<T>;
//     manyMetaFactory: <T>(value: T) => InjectionInstanceWithMeta<T>[];
//   }>({ id: 'some-id', cardinality: 'zero-or-many' })();
//
// This replaces the cast idiom for explicit with-meta slots: the slots are
// pure type-level anchors with no runtime counterpart, so stamping them
// from the bag is exactly as honest as the cast was, without the cast.
//
// The creator bag carries only what cannot be inferred, so two slots the
// annotation bags accept are rejected here: `cardinality` comes from the
// runtime option — a per-overload literal discriminant below, exactly like
// the positional creator and for the same reason (a C *inferred* from the
// option's literal alongside an explicit type argument widens to the whole
// union) — and `specificTokenFactory` comes from the trailing call, its
// type inferred from the factory value, same as the positional creator.
type Token2CreatorExactSlots<Bag> = Token2ExactSlots<Bag> & {
  cardinality?: never;
  specificTokenFactory?: never;
};

// The gate each per-cardinality overload puts on its runtime `cardinality`
// option: the overload's own literal — unless the bag spells a manyFactory
// whose shape disagrees with that cardinality's consumption shape, in which
// case the overload admits nothing, mirroring the positional creator's
// per-cardinality MF gating. For 'zero-or-one' that includes REQUIRING
// `undefined` in the manyFactory's result, not merely permitting it — the
// factory is handed back verbatim, and a 'zero-or-one' token yields nothing
// when no implementation is registered — same as the positional creator's
// 'zero-or-one' arm.
type Token2CreatorCardinality<Bag, C extends Cardinality> = Bag extends {
  singleFactory: infer F extends Factory;
}
  ? Bag extends { manyFactory: infer MF extends Factory }
    ? MF extends DefaultConsumptionFactory<C, F>
      ? C extends 'zero-or-one'
        ? undefined extends ReturnType<MF>
          ? C
          : never
        : C
      : never
    : C
  : never;

// What the bag creator's trailing call hands back: the same resolution the
// annotation forms produce (built on InjectionToken2Base directly, since a
// computed bag intersection cannot be proven against InjectionToken2's own
// self-referential bound), with the overload's cardinality and the trailing
// call's factory — or undefined — filling the slots the creator bag does
// not carry. An omitted manyFactory defaults to the cardinality's own
// consumption shape, like the positional creator's per-cardinality
// overloads.
// An omitted manyFactory defaults per cardinality: the overload's literal
// picks its consumption shape, and the wide-C case (the no-cardinality
// speciality overload) falls back to the positional creator's own wide
// default, so a leaf declared through either form is the identical type.
type Token2FromSlots<Bag, C extends Cardinality, SF> = (
  Bag extends { manyFactory: infer MF extends Factory }
    ? MF
    : Cardinality extends C
    ?
        | ManyFactory<Token2SingleFactorySlot<Bag>>
        | MaybeResultFactory<Token2SingleFactorySlot<Bag>>
    : DefaultConsumptionFactory<C, Token2SingleFactorySlot<Bag>>
) extends infer MF extends Factory
  ? InjectionToken2Base<
      Token2SingleFactorySlot<Bag>,
      MF,
      C,
      Token2SingleMetaFactorySlot<Bag>,
      Token2ManyMetaFactorySlot<Bag, MF>
    > &
      (SF extends undefined
        ? { readonly __abstract?: never }
        : { readonly __abstract: true; for: SF })
  : never;

// The trailing call's SF bound is correlated with the bag's own contract —
// `.for()` must produce leaves of the very contract the root declares, like
// the positional InjectionToken2FactoryCall. Unlike the token ALIASES'
// uncorrelated bounds (unprovable through the extractors at generic call
// sites), these interfaces only ever instantiate with a concrete Bag — a
// creator call site — where the extractor resolves and the correlation is
// checkable.
export interface InjectionToken2FactoryCallFromSlots<
  Bag,
  C extends Cardinality,
> {
  (): Token2FromSlots<Bag, C, undefined>;

  <
    SF extends (
      ...args: any[]
    ) => SpecificInjectionToken2<Token2SingleFactorySlot<Bag>, any, any, any>,
  >(
    specificInjectionTokenFactory: SF,
  ): Token2FromSlots<Bag, C, SF>;
}

export interface SpecificInjectionToken2FactoryCallFromSlots<
  Bag,
  C extends Cardinality,
> {
  (): Token2FromSlots<Bag, C, undefined> & { speciality: any };

  <
    SF extends (
      ...args: any[]
    ) => SpecificInjectionToken2<Token2SingleFactorySlot<Bag>, any, any, any>,
  >(
    specificInjectionTokenFactory: SF,
  ): Token2FromSlots<Bag, C, SF> & { speciality: any };
}

export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: Token2CreatorCardinality<Bag, 'one'>;
  },
): InjectionToken2FactoryCallFromSlots<Bag, 'one'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: Token2CreatorCardinality<Bag, 'zero-or-one'>;
  },
): InjectionToken2FactoryCallFromSlots<Bag, 'zero-or-one'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: Token2CreatorCardinality<Bag, 'zero-or-many'>;
  },
): InjectionToken2FactoryCallFromSlots<Bag, 'zero-or-many'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    cardinality: Token2CreatorCardinality<Bag, 'one-or-many'>;
  },
): InjectionToken2FactoryCallFromSlots<Bag, 'one-or-many'>;

// The speciality-carrying bag overloads mirror the positional speciality
// overloads, including the no-cardinality variant for leaves that inherit
// their arity from the `.for()` of the general token that produced them.
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: Token2CreatorCardinality<Bag, 'one'>;
  },
): SpecificInjectionToken2FactoryCallFromSlots<Bag, 'one'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: Token2CreatorCardinality<Bag, 'zero-or-one'>;
  },
): SpecificInjectionToken2FactoryCallFromSlots<Bag, 'zero-or-one'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: Token2CreatorCardinality<Bag, 'zero-or-many'>;
  },
): SpecificInjectionToken2FactoryCallFromSlots<Bag, 'zero-or-many'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality: Token2CreatorCardinality<Bag, 'one-or-many'>;
  },
): SpecificInjectionToken2FactoryCallFromSlots<Bag, 'one-or-many'>;
export function getInjectionToken2<Bag extends Token2CreatorExactSlots<Bag>>(
  options: GetInjectionToken2OptionsWithoutFactory & {
    speciality: any;
    cardinality?: undefined;
  },
): SpecificInjectionToken2FactoryCallFromSlots<Bag, Cardinality>;

// ---- Per-cardinality annotation aliases ----
//
// Hand-written annotations would otherwise have to spell the middle slots to
// reach the trailing cardinality. `undefined` for the factory slot, not
// `any`: these annotate a concrete (non-abstract, no `.for()`) token of a
// given cardinality — the shape a plain `getInjectionToken2(options)()` call
// produces, e.g. the tokens exported by the extension-for-mobx package. `any`
// would make the alias satisfy *both* branches of `InjectionToken2`'s
// conditional simultaneously, which fails narrow positions that require
// `SpecificFactory extends undefined` (e.g. `di.inject`/`di.inject2`) — see
// the comment on `InjectionToken2` for why a wide position needs `any`
// specifically, not this alias.

export type SingleInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F>,
> = InjectionToken2<F, MF, undefined, 'one'>;

export type MaybeInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = MaybeResultFactory<F>,
> = InjectionToken2<F, MF, undefined, 'zero-or-one'>;

export type ManyInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F>,
> = InjectionToken2<F, MF, undefined, 'zero-or-many'>;

export type NonEmptyManyInjectionToken2<
  F extends Factory,
  MF extends AnyConsumptionFactory<F> = NonEmptyManyFactory<F>,
> = InjectionToken2<F, MF, undefined, 'one-or-many'>;

// "Any DI alias" — any injectable or any token (v1 or v2). InjectableBunch
// is excluded because it's a registration bundle, not a single alias.
export type Alias1 =
  | Injectable<any, any, any>
  | InjectionToken<any, any, any>;

export type Alias2<F extends Factory = Factory> =
  | Injectable2<F>
  | InjectionToken2<F, any, any>;

export type Alias = Alias1 | Alias2;

// ---- DiContainerForInjection2 (new-style minimalDi) ----

export interface DiContainerForInjection2 {
  inject: Inject2;
  injectMany: InjectMany2;
  injectMaybe: InjectMaybe2;
  injectWithMeta: InjectWithMeta2;
  injectManyWithMeta: InjectManyWithMeta2;
  injectMaybeWithMeta: InjectMaybeWithMeta2;

  register(...injectables: (Alias | InjectableBunch)[]): void;

  deregister(...injectables: (Alias | InjectableBunch)[]): void;

  sourceNamespace: string | undefined;

  purge: Purge;

  hasRegistrations: HasRegistrations2;

  registeredInLocalScope: (alias: Alias) => boolean;

  registeredInLocalScopeSubtree: (alias: Alias) => boolean;

  getNumberOfRegistrations: (alias: Alias) => number;

  getNumberOfInstances: () => Record<string, number>;
}

export interface HasRegistrations2 {
  <F extends Factory>(
    alias: Injectable2<F> | InjectionToken2<F, any, any, any>,
  ): boolean;
  <I extends TI, TI, P>(
    alias: Injectable<I, TI, P> | InjectionToken<TI, P>,
  ): boolean;
}

// Factory-returning injectMaybe — accepts only tokens declared 'zero-or-one'
// and returns the token's maybe-factory verbatim, so a generic factory keeps
// its generic. On the root container this is `injectMaybe2`, alongside the
// other factory-returning members; inside an `instantiate` it is `injectMaybe`,
// where every member is factory-returning.
export interface InjectMaybe2 {
  <F extends Factory, MF extends (...args: Parameters<F>) => ReturnType<F> | undefined>(
    alias: InjectionToken2<F, MF, undefined, 'zero-or-one'>,
  ): MF;
}

// The with-meta sibling of injectMaybe2: returns the token's with-meta
// consumption template verbatim — for a 'zero-or-one' token that defaults to
// `(...args) => InjectionInstanceWithMeta<R> | undefined`, derived from the
// maybe-factory (the WMF slot is cardinality-shaped, like the MF slot it
// derives from).
export interface InjectMaybeWithMeta2 {
  <F extends Factory, WMF>(
    alias: InjectionToken2<F, any, undefined, 'zero-or-one', any, WMF>,
  ): WMF;
}

// Factory-returning injectMany — v2 returns the token's many-factory (generics
// preserved), v1 returns a synthesized many-factory. Only the two
// many-cardinalities are accepted.
export interface InjectMany2 {
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
  ): MF;
  <I>(alias: InjectionToken<I>): () => I[];
  <I, P>(alias: InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => I[];
}

// Helper: transforms a factory's return type to InjectionInstanceWithMeta<R>
// For non-generic factories this auto-derives correctly.
// For generic factories, TypeScript loses the generic (returns unknown).
// In that case, users should use inject/injectMany (non-meta) for generic types.
export type ToWithMetaFactory<F> = F extends (...args: infer P) => infer R
  ? (...args: P) => InjectionInstanceWithMeta<R>
  : never;

export type ToWithMetaManyFactory<F> = F extends (...args: infer P) => infer R
  ? (...args: P) => InjectionInstanceWithMeta<R>[]
  : never;

export interface InjectWithMeta2 {
  <F extends Factory>(alias: Injectable2<F>): ToWithMetaFactory<F>;
  // Returns the token's with-meta template verbatim, so an explicitly
  // declared generic shape survives; the default is ToWithMetaFactory<F>.
  <F extends Factory, WF>(
    alias: InjectionToken2<F, any, undefined, 'one', WF>,
  ): WF;
  <I>(alias: Injectable<I, any> | InjectionToken<I>): () => InjectionInstanceWithMeta<I>;
  <I, P>(alias: Injectable<I, any, P> | InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>;
}

export interface InjectManyWithMeta2 {
  // Returns the token's with-meta many-template verbatim, so an explicitly
  // declared generic shape survives; the default derives from the token's
  // many-factory, which is what lets a custom multi-factory narrow it.
  <F extends Factory, WMF>(
    alias: InjectionToken2<
      F,
      any,
      any,
      'zero-or-many' | 'one-or-many',
      any,
      WMF
    >,
  ): WMF;
  <I>(alias: InjectionToken<I>): () => InjectionInstanceWithMeta<I>[];
  <I, P>(alias: InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>[];
}
