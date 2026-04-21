/// <reference types="jest" />

type OverrideOldStyle = <
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance,
  InstantiationParam,
>(
  injectable:
    | InjectionToken<InjectionInstance, InstantiationParam>
    | Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>,
  instantiateStub: Instantiate<InjectionInstance, InstantiationParam>,
) => void;

export type OverrideInjectable2 = <F extends (...args: any[]) => any>(
  alias: Injectable2<F> | InjectionToken2<F>,
  instantiateStub: (di: DiContainerForInjection2) => F,
) => void;

export type Override = OverrideInjectable2 & OverrideOldStyle;

export interface DiContainer extends DiContainerForInjection {
  purge: Purge;
  purgeAllButOverrides: () => void;

  preventSideEffects: () => void;
  permitSideEffects: (
    injectableKey: InjectionToken<any, any> | Injectable<any, any, any> | InjectionToken2<any> | Injectable2<any>,
  ) => void;

  override: Override;
  earlyOverride: Override;
  unoverride<F extends (...args: any[]) => any>(alias: Injectable2<F> | InjectionToken2<F>): void;
  unoverride(alias: InjectionToken<any, any> | Injectable<any, any, any>): void;

  register(
    ...injectables: (Injectable<any, any, any> | Injectable2<any> | InjectableBunch<any>)[]
  ): void;

  deregister(
    ...injectables: (Injectable<any, any, any> | Injectable2<any> | InjectableBunch<any>)[]
  ): void;

  getNumberOfInstances: () => Record<string, number>;
}

export type Instantiate<InjectionInstance, InstantiationParam = void> = (di: DiContainerForInjection, param: InstantiationParam) => InjectionInstance;

export interface InjectionToken<
  InjectionInstance,
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
  InjectionInstance,
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
  InjectionInstance extends InjectionTokenInstance,
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
  readonly decorable?: boolean;
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

export type InjectableBunch<InjectableConfig extends object> = InjectableConfig;

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
  key:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance>,
) => InjectionInstance;

export type InjectWithParameter = <InjectionInstance, InstantiationParam>(
  key:
    | Injectable<InjectionInstance, unknown, InstantiationParam>
    | InjectionToken<InjectionInstance, InstantiationParam>,
  param: InstantiationParam,
) => InjectionInstance;

export type InjectInjectable2 = <F extends (...args: any[]) => any>(
  key: Injectable2<F> | (InjectionToken2<F> & { readonly __abstract?: never }),
  ...params: Parameters<F>
) => ReturnType<F>;

export type Inject = InjectInjectable2 & InjectWithoutParameter & InjectWithParameter;

type TuplePrefix<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [] | [First, ...TuplePrefix<Rest>]
  : [];

type PurgeAll = () => void;

type PurgeInjectable2 = <F extends (...args: any[]) => any>(
  alias: Injectable2<F> | InjectionToken2<F>,
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

export type InjectFactory = <InjectionInstance, InstantiationParam>(
  alias:
    | Injectable<InjectionInstance, unknown, InstantiationParam>
    | InjectionToken<InjectionInstance, InstantiationParam>,
) => InstantiationParam extends void ? (() => InjectionInstance) : ((param: InstantiationParam) => InjectionInstance);

export type SpecificInjectWithoutParameter<InjectionInstance> = (
  key:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance>,
) => InjectionInstance;

export type SpecificInjectWithParameter<InjectionInstance, InstantiationParam> =
  (
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ) => InjectionInstance;

export type SpecificInject<InjectionInstance, InstantiationParam> =
  InstantiationParam extends void
    ? SpecificInjectWithoutParameter<InjectionInstance>
    : SpecificInjectWithParameter<InjectionInstance, InstantiationParam>;

interface InjectMany {
  <F extends (...args: any[]) => any>(
    key: InjectionToken2<F> & { readonly __abstract?: never },
    ...params: Parameters<F>
  ): ReturnType<F>[];

  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance>,
  ): InjectionInstance[];

  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstance[];
}

type Meta = {
  id: string;
};

export type InjectionInstanceWithMeta<InjectionInstance> = {
  instance: InjectionInstance;
  meta: Meta;
};

interface InjectManyWithMeta {
  <F extends (...args: any[]) => any>(
    key: InjectionToken2<F> & { readonly __abstract?: never },
    ...params: Parameters<F>
  ): InjectionInstanceWithMeta<ReturnType<F>>[];

  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance>,
  ): InjectionInstanceWithMeta<InjectionInstance>[];

  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>[];
}

interface InjectWithMeta {
  <F extends (...args: any[]) => any>(
    key: Injectable2<F> | (InjectionToken2<F> & { readonly __abstract?: never }),
    ...params: Parameters<F>
  ): InjectionInstanceWithMeta<ReturnType<F>>;

  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance>,
  ): InjectionInstanceWithMeta<InjectionInstance>;

  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>;
}

export interface DiContainerForInjection {
  inject: Inject;
  injectWithMeta: InjectWithMeta;
  injectFactory: InjectFactory;
  injectMany: InjectMany;
  injectManyWithMeta: InjectManyWithMeta;

  inject2: Inject2;
  injectMany2: InjectMany2;
  injectWithMeta2: InjectWithMeta2;
  injectManyWithMeta2: InjectManyWithMeta2;

  register(
    ...injectables: (Injectable<any, any, any> | Injectable2<any> | InjectableBunch<any>)[]
  ): void;

  deregister(
    ...injectables: (Injectable<any, any, any> | Injectable2<any> | InjectableBunch<any>)[]
  ): void;

  sourceNamespace: string | undefined;

  purge: Purge;

  hasRegistrations: (
    alias: InjectionToken<any, any, any> | Injectable<any, any, any> | InjectionToken2<any> | Injectable2<any>,
  ) => boolean;

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

export type SpecificInjectionTargetDecorator<
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance = InjectionInstance,
  InstantiationParam = void,
> = {
  decorate: (
    inject: SpecificInject<InjectionInstance, InstantiationParam>,
  ) => SpecificInject<InjectionInstance, InstantiationParam>;
  target:
    | InjectionToken<InjectionInstance, InstantiationParam, any>
    | Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>;
};

export type GeneralInjectionTargetDecorator = {
  decorate: (
    inject: SpecificInject<unknown, unknown>,
  ) => SpecificInject<unknown, unknown>;
};

export type InjectionTargetDecorator<
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance = InjectionInstance,
  InstantiationParam = void,
> =
  | GeneralInjectionTargetDecorator
  | SpecificInjectionTargetDecorator<
      InjectionInstance,
      InjectionTokenInstance,
      InstantiationParam
    >;

export interface CreateInjectionTargetDecorator {
  <
    InjectionInstance extends InjectionTokenInstance,
    InjectionTokenInstance = InjectionInstance,
    InstantiationParam = void,
  >(
    desc: SpecificInjectionTargetDecorator<
      InjectionInstance,
      InjectionTokenInstance,
      InstantiationParam
    >,
  ): SpecificInjectionTargetDecorator<
    InjectionInstance,
    InjectionTokenInstance,
    InstantiationParam
  >;
  (desc: GeneralInjectionTargetDecorator): GeneralInjectionTargetDecorator;
}

export const createInjectionTargetDecorator: CreateInjectionTargetDecorator;

/**
 * This is used for decorating the injection of injectables.
 * If a target is used then only the injections related to that alias (either injectable or injectionToken) will be decorated by an implementation of this token.
 * This kind of decorator does not respect the lifecycle of the injectables but instead is called on every call to `di.inject`
 */
export const injectionDecoratorToken: InjectionToken<
  InjectionTargetDecorator<any, any, any>
>;

export type SpecificInstantiationTargetDecorator<
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance = InjectionInstance,
  InstantiationParam = void,
> = {
  decorate: (
    instantiate: Instantiate<InjectionInstance, InstantiationParam>,
  ) => Instantiate<InjectionInstance, InstantiationParam>;

  target:
    | InjectionToken<InjectionInstance, InstantiationParam, any>
    | Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>;
};

export type GeneralInstantiationTargetDecorator = {
  decorate: (
    instantiate: Instantiate<unknown, unknown>,
  ) => Instantiate<unknown, unknown>;
};

export type InstantiationTargetDecorator<
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance = InjectionInstance,
  InstantiationParam = void,
> =
  | GeneralInstantiationTargetDecorator
  | SpecificInstantiationTargetDecorator<
      InjectionInstance,
      InjectionTokenInstance,
      InstantiationParam
    >;

export interface CreateInstantiationTargetDecorator {
  <
    InjectionInstance extends InjectionTokenInstance,
    InjectionTokenInstance = InjectionInstance,
    InstantiationParam = void,
  >(
    desc: SpecificInstantiationTargetDecorator<
      InjectionInstance,
      InjectionTokenInstance,
      InstantiationParam
    >,
  ): SpecificInstantiationTargetDecorator<
    InjectionInstance,
    InjectionTokenInstance,
    InstantiationParam
  >;
  (
    desc: GeneralInstantiationTargetDecorator,
  ): GeneralInstantiationTargetDecorator;
}

export const createInstantiationTargetDecorator: CreateInstantiationTargetDecorator;

/**
 * This is used for decorating the instantiation of injectables.
 * If a target is used then only the instantiations related to that alias (either injectable or injectionToken) will be decorated by an implementation of this token.
 * This kind of decorator respects the lifecycle of the injectables.
 */
export const instantiationDecoratorToken: InjectionToken<
  InstantiationTargetDecorator<any, any, any>
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

export type InstancePurgeCallbackForInjectable2<
  Factory extends (...args: any[]) => any,
> = () => (payload: { instance: ReturnType<Factory> }) => Factory;

export interface InstancePurgeCallbackSpecificFactory {
  <Factory extends (...args: any[]) => any>(
    target: Injectable2<Factory> | InjectionToken2<Factory>,
  ): SpecificInjectionToken2<InstancePurgeCallbackForInjectable2<Factory>>;
}

export const instancePurgeCallbackToken: AbstractInjectionToken2<
  (...args: any[]) => any,
  (...args: any[]) => any[],
  InstancePurgeCallbackSpecificFactory
>;

export const isInjectable: (
  thing: unknown,
) => thing is Injectable<unknown, unknown, unknown>;
export const isInjectableBunch: (
  thing: unknown,
) => thing is InjectableBunch<any>;
export const isInjectionToken: (
  thing: unknown,
) => thing is InjectionToken<unknown, unknown>;

export function createContainer(
  containerId: string,
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

export interface Injectable2<Factory extends (...args: any[]) => any> {
  readonly aliasType: 'injectable2';
  readonly id: string;
  readonly instantiate: (di: DiContainerForInjection2) => Factory;
  readonly injectionToken?: InjectionToken2<Factory> & { readonly __abstract?: never };
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly decorable?: boolean;
  readonly tags?: any[];
  readonly maxCacheSize?: number;
}

export function getInjectable2<Factory extends (...args: any[]) => any>(options: {
  readonly id: string;
  readonly instantiate: (di: DiContainerForInjection2) => Factory;
  readonly injectionToken?: InjectionToken2<Factory> & { readonly __abstract?: never };
  readonly transient?: boolean;
  readonly causesSideEffects?: boolean;
  readonly decorable?: boolean;
  readonly tags?: any[];
  readonly maxCacheSize?: number;
}): Injectable2<Factory>;

type AutoManyFactory<F> = F extends (...args: infer P) => infer R
  ? (...args: P) => R[]
  : never;

export interface InjectionToken2<
  Factory extends (...args: any[]) => any,
  ManyFactory extends (...args: Parameters<Factory>) => ReturnType<Factory>[] = AutoManyFactory<Factory>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<Factory, ManyFactory> = (
    id: string,
  ) => SpecificInjectionToken2<Factory, ManyFactory>,
> {
  template: Factory;
  manyTemplate: ManyFactory;
  key: Symbol;
  id: string;
  for: SpecificFactory;
  maxCacheSize?: number;
}

export interface SpecificInjectionToken2<
  Factory extends (...args: any[]) => any,
  ManyFactory extends (...args: Parameters<Factory>) => ReturnType<Factory>[] = AutoManyFactory<Factory>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<Factory, ManyFactory> = (
    id: string,
  ) => SpecificInjectionToken2<Factory, ManyFactory>,
> extends InjectionToken2<Factory, ManyFactory, SpecificFactory> {
  speciality: any;
}

export function getInjectionToken2<
  Factory extends (...args: any[]) => any,
  ManyFactory extends (...args: Parameters<Factory>) => ReturnType<Factory>[] = AutoManyFactory<Factory>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<Factory, ManyFactory> = (
    id: string,
  ) => SpecificInjectionToken2<Factory, ManyFactory>,
>(options: {
  id: string;
  specificInjectionTokenFactory?: SpecificFactory;
  target?: object;
  decorable?: boolean;
  maxCacheSize?: number;
}): InjectionToken2<Factory, ManyFactory, SpecificFactory>;

export function getSpecificInjectionToken2<
  Factory extends (...args: any[]) => any,
  ManyFactory extends (...args: Parameters<Factory>) => ReturnType<Factory>[] = AutoManyFactory<Factory>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<Factory, ManyFactory> = (
    id: string,
  ) => SpecificInjectionToken2<Factory, ManyFactory>,
>(options: {
  id: string;
  speciality: any;
}): SpecificInjectionToken2<Factory, ManyFactory, SpecificFactory>;

export interface AbstractInjectionToken2<
  Factory extends (...args: any[]) => any,
  ManyFactory extends (...args: Parameters<Factory>) => ReturnType<Factory>[] = AutoManyFactory<Factory>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<Factory, ManyFactory> | AbstractInjectionToken2<Factory, ManyFactory> = (
    id: string,
  ) => SpecificInjectionToken2<Factory, ManyFactory>,
> {
  readonly __abstract: true;
  template: Factory;
  manyTemplate: ManyFactory;
  key: Symbol;
  id: string;
  for: SpecificFactory;
  maxCacheSize?: number;
}

export function getAbstractInjectionToken2<
  Factory extends (...args: any[]) => any,
  ManyFactory extends (...args: Parameters<Factory>) => ReturnType<Factory>[] = AutoManyFactory<Factory>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<Factory, ManyFactory> | AbstractInjectionToken2<Factory, ManyFactory> = (
    id: string,
  ) => SpecificInjectionToken2<Factory, ManyFactory>,
>(options: {
  id: string;
  specificInjectionTokenFactory?: SpecificFactory;
  target?: object;
  decorable?: boolean;
  maxCacheSize?: number;
}): AbstractInjectionToken2<Factory, ManyFactory, SpecificFactory>;

// ---- DiContainerForInjection2 (new-style minimalDi) ----

export interface DiContainerForInjection2 {
  inject: Inject;
  injectMany: InjectMany;
  injectWithMeta: InjectWithMeta;
  injectManyWithMeta: InjectManyWithMeta;

  inject2: Inject2;
  injectMany2: InjectMany2;
  injectWithMeta2: InjectWithMeta2;
  injectManyWithMeta2: InjectManyWithMeta2;

  register(
    ...injectables: (Injectable2<any> | Injectable<any, any, any> | InjectableBunch<any>)[]
  ): void;

  deregister(
    ...injectables: (Injectable2<any> | Injectable<any, any, any> | InjectableBunch<any>)[]
  ): void;

  sourceNamespace: string | undefined;

  purge: Purge;

  hasRegistrations: HasRegistrations2;

  getNumberOfInstances: () => Record<string, number>;
}

interface HasRegistrations2 {
  <F extends (...args: any[]) => any, MF extends (...args: Parameters<F>) => ReturnType<F>[]>(
    alias: Injectable2<F> | InjectionToken2<F, MF> | AbstractInjectionToken2<F, MF>,
  ): boolean;
  <I extends TI, TI, P>(
    alias: Injectable<I, TI, P> | InjectionToken<TI, P>,
  ): boolean;
}

// Factory-returning inject — works for v1 (synthesized factory) and v2 (native factory with generics preserved)
interface Inject2 {
  <F extends (...args: any[]) => any>(alias: Injectable2<F>): F;
  <F extends (...args: any[]) => any>(alias: InjectionToken2<F> & { readonly __abstract?: never }): F;
  <I>(alias: Injectable<I, any> | InjectionToken<I>): () => I;
  <I, P>(alias: Injectable<I, any, P> | InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => I;
}

// Factory-returning injectMany — v2 returns ManyFactory (generics preserved), v1 returns synthesized many-factory
interface InjectMany2 {
  <F extends (...args: any[]) => any, MF extends (...args: Parameters<F>) => ReturnType<F>[]>(alias: InjectionToken2<F, MF> & { readonly __abstract?: never }): MF;
  <I>(alias: InjectionToken<I>): () => I[];
  <I, P>(alias: InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => I[];
}

// Helper: transforms a factory's return type to InjectionInstanceWithMeta<R>
// For non-generic factories this auto-derives correctly.
// For generic factories, TypeScript loses the generic (returns unknown).
// In that case, users should use inject/injectMany (non-meta) for generic types.
type ToWithMetaFactory<F> = F extends (...args: infer P) => infer R
  ? (...args: P) => InjectionInstanceWithMeta<R>
  : never;

type ToWithMetaManyFactory<F> = F extends (...args: infer P) => infer R
  ? (...args: P) => InjectionInstanceWithMeta<R>[]
  : never;

interface InjectWithMeta2 {
  <F extends (...args: any[]) => any>(alias: Injectable2<F>): ToWithMetaFactory<F>;
  <F extends (...args: any[]) => any>(alias: InjectionToken2<F> & { readonly __abstract?: never }): ToWithMetaFactory<F>;
  <I>(alias: Injectable<I, any> | InjectionToken<I>): () => InjectionInstanceWithMeta<I>;
  <I, P>(alias: Injectable<I, any, P> | InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>;
}

interface InjectManyWithMeta2 {
  <F extends (...args: any[]) => any>(alias: InjectionToken2<F> & { readonly __abstract?: never }): ToWithMetaManyFactory<F>;
  <I>(alias: InjectionToken<I>): () => InjectionInstanceWithMeta<I>[];
  <I, P>(alias: InjectionToken<I, P>): (...params: P extends any[] ? P : [P]) => InjectionInstanceWithMeta<I>[];
}
