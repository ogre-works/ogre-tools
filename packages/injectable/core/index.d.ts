/// <reference types="jest" />

import { SetOptional, SetReturnType } from 'type-fest';

export type Override = <
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance,
  InstantiationParam,
>(
  injectable:
    | InjectionToken<InjectionInstance, InstantiationParam>
    | Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>,
  instantiateStub: Instantiate<InjectionInstance, InstantiationParam>,
) => void;

export interface DiContainer extends DiContainerForInjection {
  purge: (injectableKey: Injectable<any, any, any>) => void;

  permitSideEffects: (
    injectableKey: InjectionToken<any, any> | Injectable<any, any, any>,
  ) => void;

  override: Override;
  earlyOverride: Override;

  unoverride(alias: InjectionToken<any, any> | Injectable<any, any, any>): void;

  register(...injectables: Injectable<any, any, any>[]): void;

  deregister(...injectables: Injectable<any, any, any>[]): void;
  preventSideEffects: () => void;
}

export type Instantiate<InjectionInstance, InstantiationParam> = {
  (
    di: DiContainerForInjection,
    param: InstantiationParam extends void ? void : InstantiationParam,
  ): InjectionInstance;
};

export type Instantiate2<T extends any[], T2> = {
  (...instantiationParameters: T): T2;
};

export type InstantiateWithoutFactory<T extends Instantiate2<any, any>> = {
  (di: DiContainerForInjection, param: Parameters<T>[0]): ReturnType<T>;
};

export type InstantiateWithFactory<T extends Instantiate2<any, any>> = {
  (param: Parameters<T>[1]): ReturnType<T>;
};

export interface InjectionToken<InjectionInstance, InstantiationParam> {
  template: InjectionInstance;
  instantiationParameter: InstantiationParam;
  key: Symbol;
  id: string;
}

export interface InjectionToken2<
  T extends Instantiate2<any, any>,
  T2 extends WithArrayAsReturnValue<T> = WithArrayAsReturnValue<T>,
> {
  instantiateTemplate: T;
  instantiateManyTemplate: T2;
  key: Symbol;
  id: string;
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
  readonly lifecycle: ILifecycle<InstantiationParam>;
  readonly decorable?: boolean;
  readonly tags?: any[];
  readonly scope?: boolean;
}

export type Injectable2<
  TInstantiateWithToken extends Instantiate2<any, any>,
  TInstantiateManyWithToken extends WithArrayAsReturnValue<TInstantiateWithToken>,
  TInstantiateWithInjectable extends Instantiate2<any, any>,
  TGetInstanceKey extends SetReturnType<TInstantiateWithInjectable, any>,
> = {
  readonly id: string;
  readonly causesSideEffects?: boolean;
  readonly injectionToken?: InjectionToken2<
    TInstantiateWithToken,
    TInstantiateManyWithToken
  >;

  readonly instantiateFor: (
    di: DiContainerForInjection,
  ) => TInstantiateWithInjectable;

  readonly decorable?: boolean;
  readonly tags?: any[];
  readonly scope?: boolean;

  readonly lifecycle: {
    readonly getInstanceKey: (di: DiContainerForInjection) => TGetInstanceKey;
  };
};

type WithSometimesOptionalLifecycle<
  TInstantiateWithInjectable extends TInstantiateWithToken,
  TInstantiateWithToken extends Instantiate2<any, any>,
  TInstantiateManyWithToken extends WithArrayAsReturnValue<TInstantiateWithToken>,
  TGetInstanceKey extends SetReturnType<TInstantiateWithInjectable, any>,
> = Parameters<TInstantiateWithInjectable>[0] extends void
  ? SetOptional<
      Injectable2<
        TInstantiateWithToken,
        TInstantiateManyWithToken,
        TInstantiateWithInjectable,
        TGetInstanceKey
      >,
      'lifecycle'
    >
  : Injectable2<
      TInstantiateWithToken,
      TInstantiateManyWithToken,
      TInstantiateWithInjectable,
      TGetInstanceKey
    >;

type SometimesOptionalLifecycle<
  TInstantiateWithInjectable extends Instantiate2<any, any>,
  TGetInstanceKey extends SetReturnType<TInstantiateWithInjectable, any>,
> = Parameters<TInstantiateWithInjectable>[0] extends void
  ? {
      readonly lifecycle?: {
        readonly getInstanceKey: (
          di: DiContainerForInjection,
        ) => TGetInstanceKey;
      };
    }
  : {
      readonly lifecycle: {
        readonly getInstanceKey: (
          di: DiContainerForInjection,
        ) => TGetInstanceKey;
      };
    };

// Override for instantiate factory, and support for generics.
export function getInjectable<
  TInstantiateWithToken extends Instantiate2<any, any>,
  TInstantiateManyWithToken extends WithArrayAsReturnValue<TInstantiateWithToken>,
  TInstantiateWithInjectable extends TInstantiateWithToken,
  TGetInstanceKey extends SetReturnType<TInstantiateWithInjectable, any>,
>(
  options: Injectable2<
    TInstantiateWithInjectable,
    TInstantiateWithToken,
    TInstantiateManyWithToken,
    TGetInstanceKey
  > &
    SometimesOptionalLifecycle<TInstantiateWithInjectable, TGetInstanceKey>,
): Injectable2<
  TInstantiateWithToken,
  TInstantiateManyWithToken,
  TInstantiateWithInjectable,
  TGetInstanceKey
>;

// Override for normal instantiate, and no support for generics.
export function getInjectable<
  TInstantiateWithToken extends Instantiate2<any, any>,
  TInstantiateManyWithToken extends WithArrayAsReturnValue<TInstantiateWithToken>,
  TInstantiateWithoutFactory extends InstantiateWithoutFactory<TInstantiateWithToken>,
  TGetInstanceKey extends SetReturnType<TInstantiateWithInjectable, any>,
  TInstantiateWithInjectable extends InstantiateWithFactory<TInstantiateWithoutFactory>,
>(
  options: Omit<
    Injectable2<
      TInstantiateWithToken,
      TInstantiateManyWithToken,
      TInstantiateWithInjectable,
      TGetInstanceKey
    >,
    'instantiateFor'
  > & {
    instantiate: TInstantiateWithoutFactory;
  } & SometimesOptionalLifecycle<TInstantiateWithInjectable, TGetInstanceKey>,
): Injectable2<
  TInstantiateWithToken,
  TInstantiateManyWithToken,
  TInstantiateWithInjectable,
  TGetInstanceKey
>;

type InjectableBunch<InjectableConfig> = {
  [Key in keyof InjectableConfig]: InjectableConfig[Key] extends Injectable<
    infer InjectionInstance,
    infer InjectionTokenInstance,
    infer InstantiationParam
  >
    ? Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>
    : never;
};

export function getInjectableBunch<Type>(bunch: Type): InjectableBunch<Type>;

export function getInjectionToken<
  InjectionInstance,
  InstantiationParam = void,
>(options: {
  id: string;
}): InjectionToken2<
  Instantiate2<
    InstantiationParam extends void ? [] : [InstantiationParam],
    InjectionInstance
  >
>;

export type WithArrayAsReturnValue<T extends Instantiate2<any, any>> =
  SetReturnType<T, ReturnType<T>[]>;

export function getInjectionToken2<
  T extends Instantiate2<any, any>,
  T2 extends WithArrayAsReturnValue<T> = WithArrayAsReturnValue<T>,
>(options: { id: string }): InjectionToken2<T, T2>;

export type InjectWithInjectable = <T extends Injectable2<any, any, any, any>>(
  injectable: T,
  ...params: Parameters<T['instantiateFor']>
) => ReturnType<T['instantiateFor']>;

export type InjectWithToken = <
  T extends InjectionToken2<Instantiate2<any, any>, Instantiate2<any, any>>,
>(
  token: T,
  ...params: Parameters<T['instantiateTemplate']>
) => T['instantiateTemplate'];

export type Inject = InjectWithInjectable & InjectWithToken;

export type InjectWithInjectableFor = <
  T extends Injectable2<any, any, any, any>,
>(
  injectable: T,
) => ReturnType<T['instantiateFor']>;

export type InjectWithTokenFor = <
  T extends InjectionToken2<Instantiate2<any, any>, Instantiate2<any, any>>,
>(
  token: T,
) => T['instantiateTemplate'];

export type InjectFor = InjectWithInjectableFor & InjectWithTokenFor;

export type InjectManyFor = <
  T extends InjectionToken2<Instantiate2<any, any>, Instantiate2<any, any>>,
>(
  token: T,
) => T['instantiateManyTemplate'];

export type InjectFactory = <InjectionInstance, InstantiationParam extends {}>(
  alias:
    | Injectable<InjectionInstance, unknown, InstantiationParam>
    | InjectionToken<InjectionInstance, InstantiationParam>,
) => (param: InstantiationParam) => InjectionInstance;

export type GetInstances = <InjectionInstance>(
  alias:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance, void>,
) => InjectionInstance[];

export type SpecificInjectWithoutParameter<InjectionInstance> = (
  key:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance, void>,
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
  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown, void>
      | InjectionToken<InjectionInstance, void>,
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
  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown, void>
      | InjectionToken<InjectionInstance, void>,
  ): InjectionInstanceWithMeta<InjectionInstance>[];

  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>[];
}

interface InjectWithMeta {
  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown, void>
      | InjectionToken<InjectionInstance, void>,
  ): InjectionInstanceWithMeta<InjectionInstance>;

  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstanceWithMeta<InjectionInstance>;
}

interface ContextItem {
  injectable: Injectable<any, any, any>;
  instantiationParameter: unknown;
}

export interface DiContainerForInjection {
  inject: Inject;
  injectFor: InjectFor;
  injectWithMeta: InjectWithMeta;
  injectFactory: InjectFactory;
  injectMany: InjectMany;
  injectManyFor: InjectManyFor;
  injectManyWithMeta: InjectManyWithMeta;
  register(...injectables: Injectable<any, any, any>[]): void;
  deregister(...injectables: Injectable<any, any, any>[]): void;
  context: ContextItem[];
  getInstances: GetInstances;
  sourceNamespace: string | undefined;
}

export interface ILifecycle<InstantiationParam> {
  getInstanceKey: (di: DiContainer, params: InstantiationParam) => any;
}

export interface ILifecycle2<TParameter> {
  // Todo: solve
  getInstanceKey: any;
}

declare const storedInstanceKey: unique symbol;
declare const nonStoredInstanceKey: unique symbol;

export type Singleton = {
  getInstanceKey: (
    di: DiContainerForInjection,
  ) => (param: void) => typeof storedInstanceKey;
};

export type Transient = {
  getInstanceKey: (
    di: DiContainerForInjection,
  ) => () => typeof nonStoredInstanceKey;
};

export type KeyedSingleton<TGetInstanceKey> = {
  getInstanceKey: (di: DiContainerForInjection) => TGetInstanceKey;
};

export const lifecycleEnum: {
  singleton: Singleton;

  keyedSingleton: <InstantiationParam>(
    options: ILifecycle<InstantiationParam>,
  ) => typeof options;

  transient: Transient;
};

export const lifecycleEnum2: {
  singleton: Singleton;

  keyedSingleton: <TGetInstanceKey>(
    options: KeyedSingleton<TGetInstanceKey>,
  ) => typeof options;

  transient: Transient;
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
    | InjectionToken<InjectionInstance, InstantiationParam>
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
  InjectionTargetDecorator<any, any, any>,
  void
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
    | InjectionToken<InjectionInstance, InstantiationParam>
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
  InstantiationTargetDecorator<any, any, any>,
  void
>;

export const registrationCallbackToken: RegistrationCallback;
export const deregistrationCallbackToken: RegistrationCallback;
export const isInjectable: (
  thing: unknown,
) => thing is Injectable<unknown, unknown, unknown>;
export const isInjectionToken: (
  thing: unknown,
) => thing is InjectionToken<unknown, unknown>;

export function createContainer(
  containerId: string,
  options?: { detectCycles?: boolean },
): DiContainer;

export function getKeyedSingletonCompositeKey<T extends [...unknown[]]>(
  ...keys: T
): { keys: T };
