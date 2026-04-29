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

export interface DiContainer extends DiContainerForInjection {
  inject2: Inject2;
  injectMany2: InjectMany2;
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
  template: InjectionInstance;
  instantiationParameter: InstantiationParam;
  key: Symbol;
  id: string;
  for: SpecificInjectionTokenFactory;
  maxCacheSize?: number;
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

export type GetInjectableOptionsWithoutInstantiationParameter<I extends TI, TI> = Omit<Injectable<I, TI>, "lifecycle" | "instantiate"> & {
  readonly instantiate: (di: DiContainerForInjection, param: void) => I;
  readonly lifecycle?: Lifecycle;
}

export type GetInjectableOptionsWithInstantiationParameter<I extends TI, TI, P> = Omit<Injectable<I, TI, P>, "instantiate"> & {
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
  specificInjectionTokenFactory?: SpecificInjectionTokenFactory;
  target?: object;
  maxCacheSize?: number;
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
}): SpecificInjectionToken<
  InjectionInstance,
  InstantiationParam,
  SpecificInjectionTokenFactory
>;

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

export type InjectInjectable2 = <F extends Factory>(
  alias: Injectable2<F> | InjectionToken2<F>,
  ...params: Parameters<F>
) => ReturnType<F>;

export type Inject = InjectWithoutParameter & InjectWithParameter & InjectInjectable2;

// Factory-returning inject — handles all aliases (v1 and v2).
// v2 aliases return the native factory F; v1 aliases return a synthesized factory.
export interface Inject2 {
  <F extends Factory>(alias: Injectable2<F>): F;
  <F extends Factory>(alias: InjectionToken2<F>): F;
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
  <F extends Factory>(
    alias: InjectionToken2<F> | AbstractInjectionToken2<F>,
    ...params: Parameters<F>
  ): ReturnType<F>[];

  <InjectionInstance>(
    alias:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance>,
  ): InjectionInstance[];

  <InjectionInstance, InstantiationParam>(
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
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
  <F extends Factory>(
    alias: InjectionToken2<F> | AbstractInjectionToken2<F>,
    ...params: Parameters<F>
  ): InjectionInstanceWithMeta<ReturnType<F>>[];

  <InjectionInstance>(
    alias:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance>,
  ): InjectionInstanceWithMeta<InjectionInstance>[];

  <InjectionInstance, InstantiationParam>(
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>[];
}

export interface InjectWithMeta {
  <F extends Factory>(
    alias: Injectable2<F> | InjectionToken2<F>,
    ...params: Parameters<F>
  ): InjectionInstanceWithMeta<ReturnType<F>>;

  <InjectionInstance>(
    alias:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance>,
  ): InjectionInstanceWithMeta<InjectionInstance>;

  <InjectionInstance, InstantiationParam>(
    alias:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
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

export const injectionDecoratorToken: AbstractInjectionToken2<
  Factory,
  ManyFactory,
  InjectionDecoratorSpecificFactory
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

export interface InstantiationDecoratorSpecificFactory {
  <F extends Factory>(
    target: Alias2<F>,
  ): SpecificInjectionToken2<InstantiationDecoratorForInjectable2<F>>;

  <InjectionInstance, InstantiationParam = void>(
    target: Injectable<InjectionInstance, any, InstantiationParam> | InjectionToken<InjectionInstance, InstantiationParam>,
  ): SpecificInjectionToken2<() => (instantiate: Instantiate<any, any>) => Instantiate<any, any>>;

  // Tag-keyed dispatch: an instantiation decorator targeting a string tag
  // fires for every injectable whose `tags` array contains that tag.
  // Weak typing is intentional — the tag is a documentation string.
  (tag: string): SpecificInjectionToken2<() => (instantiate: Instantiate<any, any>) => Instantiate<any, any>>;
}

export const instantiationDecoratorToken: AbstractInjectionToken2<
  Factory,
  ManyFactory,
  InstantiationDecoratorSpecificFactory
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

export const registrationDecoratorToken: AbstractInjectionToken2<
  Factory,
  ManyFactory,
  RegistrationDecoratorSpecificFactory
>;

export const deregistrationDecoratorToken: AbstractInjectionToken2<
  Factory,
  ManyFactory,
  RegistrationDecoratorSpecificFactory
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

export const instancePurgeCallbackToken: AbstractInjectionToken2<
  Factory,
  ManyFactory,
  InstancePurgeCallbackSpecificFactory
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

export function createContainer(
  containerId: string,
  options?: {
    /**
     * Enable per-inject injection decorators (injectables registered against
     * `injectionDecoratorToken.for(...)`).
     *
     * Disabled by default because the decorator wrapper adds overhead to every
     * `inject` call, even when no decorators are registered. Enable only when
     * the container needs to intercept every inject (e.g. for logging,
     * metrics, or cross-cutting concerns that must see cached-singleton reads).
     *
     * Instantiation decorators (`instantiationDecoratorToken`) are always
     * available — they run per-instantiation and are unaffected by this flag.
     *
     * @default false
     */
    injectionDecorators?: boolean;
  },
): DiContainer;

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
  readonly injectionToken?: InjectionToken2<F>;
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly tags?: string[];
  readonly maxCacheSize?: number;
}

export function getInjectable2<F extends Factory>(options: {
  readonly id: string;
  readonly instantiate: (di: DiContainerForInjection2) => F;
  readonly injectionToken?: InjectionToken2<F>;
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly tags?: string[];
  readonly maxCacheSize?: number;
}): Injectable2<F>;

export type ManyFactory<F extends Factory = Factory> = F extends (...args: infer P) => infer R
  ? (...args: P) => R[]
  : never;

export interface InjectionToken2<
  F extends Factory = Factory,
  MF extends (...args: Parameters<F>) => ReturnType<F>[] = ManyFactory<F>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<F, MF> = (
    id: string,
  ) => SpecificInjectionToken2<F, MF>,
> {
  // Brand that excludes AbstractInjectionToken2 (which has `readonly __abstract: true`).
  // Sites that need to accept both must spell out the union explicitly:
  // `InjectionToken2<F> | AbstractInjectionToken2<F>`.
  readonly __abstract?: never;
  template: F;
  manyTemplate: MF;
  key: Symbol;
  id: string;
  for: SpecificFactory;
  maxCacheSize?: number;
}

export interface SpecificInjectionToken2<
  F extends Factory = Factory,
  MF extends (...args: Parameters<F>) => ReturnType<F>[] = ManyFactory<F>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<F, MF> = (
    id: string,
  ) => SpecificInjectionToken2<F, MF>,
> extends InjectionToken2<F, MF, SpecificFactory> {
  speciality: any;
}

export function getInjectionToken2<
  F extends Factory,
  MF extends (...args: Parameters<F>) => ReturnType<F>[] = ManyFactory<F>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<F, MF> = (
    id: string,
  ) => SpecificInjectionToken2<F, MF>,
>(options: {
  id: string;
  specificInjectionTokenFactory?: SpecificFactory;
  target?: object;
  maxCacheSize?: number;
}): InjectionToken2<F, MF, SpecificFactory>;

export function getSpecificInjectionToken2<
  F extends Factory,
  MF extends (...args: Parameters<F>) => ReturnType<F>[] = ManyFactory<F>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<F, MF> = (
    id: string,
  ) => SpecificInjectionToken2<F, MF>,
>(options: {
  id: string;
  speciality: any;
}): SpecificInjectionToken2<F, MF, SpecificFactory>;

export interface AbstractInjectionToken2<
  F extends Factory = Factory,
  MF extends (...args: Parameters<F>) => ReturnType<F>[] = ManyFactory<F>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<F, MF> | AbstractInjectionToken2<F, MF> = (
    id: string,
  ) => SpecificInjectionToken2<F, MF>,
> {
  readonly __abstract: true;
  template: F;
  manyTemplate: MF;
  key: Symbol;
  id: string;
  for: SpecificFactory;
  maxCacheSize?: number;
}

export function getAbstractInjectionToken2<
  F extends Factory,
  MF extends (...args: Parameters<F>) => ReturnType<F>[] = ManyFactory<F>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<F, MF> | AbstractInjectionToken2<F, MF> = (
    id: string,
  ) => SpecificInjectionToken2<F, MF>,
>(options: {
  id: string;
  specificInjectionTokenFactory?: SpecificFactory;
  target?: object;
  maxCacheSize?: number;
}): AbstractInjectionToken2<F, MF, SpecificFactory>;

// "Any DI alias" — any injectable or any token (v1 or v2). InjectableBunch
// is excluded because it's a registration bundle, not a single alias.
export type Alias1 =
  | Injectable<any, any, any>
  | InjectionToken<any, any, any>;

export type Alias2<F extends Factory = Factory> =
  | Injectable2<F>
  | InjectionToken2<F>
  | AbstractInjectionToken2<F>;

export type Alias = Alias1 | Alias2;

// ---- DiContainerForInjection2 (new-style minimalDi) ----

export interface DiContainerForInjection2 {
  inject: Inject2;
  injectMany: InjectMany2;
  injectWithMeta: InjectWithMeta2;
  injectManyWithMeta: InjectManyWithMeta2;

  register(...injectables: (Alias | InjectableBunch)[]): void;

  deregister(...injectables: (Alias | InjectableBunch)[]): void;

  sourceNamespace: string | undefined;

  purge: Purge;

  hasRegistrations: HasRegistrations2;

  getNumberOfInstances: () => Record<string, number>;
}

export interface HasRegistrations2 {
  <F extends Factory, MF extends (...args: Parameters<F>) => ReturnType<F>[]>(
    alias: Injectable2<F> | InjectionToken2<F, MF> | AbstractInjectionToken2<F, MF>,
  ): boolean;
  <I extends TI, TI, P>(
    alias: Injectable<I, TI, P> | InjectionToken<TI, P>,
  ): boolean;
}

// Factory-returning injectMany — v2 returns ManyFactory (generics preserved), v1 returns synthesized many-factory
export interface InjectMany2 {
  <F extends Factory, MF extends (...args: Parameters<F>) => ReturnType<F>[]>(alias: InjectionToken2<F, MF> | AbstractInjectionToken2<F, MF>): MF;
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
  <F extends Factory>(alias: InjectionToken2<F>): ToWithMetaFactory<F>;
  <I>(alias: Injectable<I, any> | InjectionToken<I>): () => InjectionInstanceWithMeta<I>;
  <I, P>(alias: Injectable<I, any, P> | InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>;
}

export interface InjectManyWithMeta2 {
  <F extends Factory>(alias: InjectionToken2<F> | AbstractInjectionToken2<F>): ToWithMetaManyFactory<F>;
  <I>(alias: InjectionToken<I>): () => InjectionInstanceWithMeta<I>[];
  <I, P>(alias: InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>[];
}
