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
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
    ...params: Parameters<F>
  ): ReturnType<MF>;

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
export interface ScopedInject2<Cons extends Consumption> {
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

export interface ScopedInjectMany2<Cons extends Consumption> {
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: Consumable<Cons> &
      InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
  ): MF;
  <I>(alias: Consumable<Cons> & InjectionToken<I>): () => I[];
  <I, P>(
    alias: Consumable<Cons> & InjectionToken<I, P>,
  ): (...params: P extends any[] ? P : [P]) => I[];
}

export interface ScopedInjectMaybe2<Cons extends Consumption> {
  <F extends Factory, MF extends (...args: Parameters<F>) => ReturnType<F> | undefined>(
    alias: Consumable<Cons> & InjectionToken2<F, MF, undefined, 'zero-or-one'>,
  ): MF;
}

// `instantiate`'s di. Leave the parameter unannotated so it is typed
// contextually from the `consumptions` array; annotate it with this when
// `instantiate` is written as a named function elsewhere.
export interface ConsumptionDi<Cons extends Consumption = never>
  extends Omit<
    DiContainerForInjection2,
    'inject' | 'injectMany' | 'injectMaybe' | 'injectWithMeta' | 'injectManyWithMeta'
  > {
  inject: ScopedInject2<Cons>;
  injectMany: ScopedInjectMany2<Cons>;
  injectMaybe: ScopedInjectMaybe2<Cons>;
  injectWithMeta: InjectWithMeta2;
  injectManyWithMeta: InjectManyWithMeta2;
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

export interface InjectionToken2Base<
  F extends Factory = Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
  C extends Cardinality = Cardinality,
> {
  readonly aliasType: 'injection-token2';
  template: F;
  manyTemplate: MF;
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
export type InjectionToken2<
  F extends Factory = Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
  // Defaults to `any`, not `undefined`: a bare `InjectionToken2<F>` means "a
  // token of some cardinality, abstract or not" — the same wide, don't-care
  // reading `any` gets everywhere else (`injectMany`, `Consumption`, `Alias2`).
  // Positions that must pin one state spell it out explicitly instead of
  // relying on this default.
  SpecificFactory extends
    | undefined
    | ((...args: any[]) => SpecificInjectionToken2<F, any, any, any>) = any,
  C extends Cardinality = Cardinality,
> = SpecificFactory extends undefined
  ? InjectionToken2Base<F, MF, C> & { readonly __abstract?: never }
  : InjectionToken2Base<F, MF, C> & {
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
export type SpecificInjectionToken2<
  F extends Factory = Factory,
  MF extends AnyConsumptionFactory<F> = ManyFactory<F> | MaybeResultFactory<F>,
  SpecificFactory extends
    | undefined
    | ((...args: any[]) => SpecificInjectionToken2<F, any, any, any>) = undefined,
  C extends Cardinality = Cardinality,
> = InjectionToken2<F, MF, SpecificFactory, C> & { speciality: any };

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

export type ToWithMetaManyFactory<F> = F extends (
  ...args: infer P
) => (infer R)[]
  ? (...args: P) => InjectionInstanceWithMeta<R>[]
  : F extends (...args: infer P) => infer R
  ? (...args: P) => InjectionInstanceWithMeta<R>[]
  : never;

export interface InjectWithMeta2 {
  <F extends Factory>(alias: Injectable2<F>): ToWithMetaFactory<F>;
  <F extends Factory>(alias: InjectionToken2<F, any, undefined, 'one'>): ToWithMetaFactory<F>;
  <I>(alias: Injectable<I, any> | InjectionToken<I>): () => InjectionInstanceWithMeta<I>;
  <I, P>(alias: Injectable<I, any, P> | InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>;
}

export interface InjectManyWithMeta2 {
  <F extends Factory, MF extends ManyFactory<F>>(
    alias: InjectionToken2<F, MF, any, 'zero-or-many' | 'one-or-many'>,
  ): ToWithMetaManyFactory<MF>;
  <I>(alias: InjectionToken<I>): () => InjectionInstanceWithMeta<I>[];
  <I, P>(alias: InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>[];
}
