/// <reference types="jest" />

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

export type Instantiate2<T, T2> = {
  (di: DiContainerForInjection, param: T): T2;
};

export interface InjectionToken<InjectionInstance, InstantiationParam> {
  template: InjectionInstance;
  instantiationParameter: InstantiationParam;
  key: Symbol;
  id: string;
}

export type InstantiateWithDi<T, T2> = (
  di: DiContainerForInjection,
  param: T,
) => T2;

export type InstantiateWithoutDi<T, T2> = (param: T) => T2;

export type InjectTemplate<T extends InstantiateWithDi<unknown, unknown>> = T;

export interface InjectionToken2<
  T extends InstantiateWithDi<unknown, unknown>,
> {
  instantiateTemplate: T;
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

export interface Injectable2<TInjectionToken2 extends InjectionToken2<any>> {
  readonly id: string;
  readonly causesSideEffects?: boolean;
  readonly injectionToken?: TInjectionToken2;

  readonly instantiateFor: (
    di: DiContainerForInjection,
  ) => TInjectionToken2['instantiateTemplate'];

  readonly lifecycle: ILifecycle2<any>;
  readonly decorable?: boolean;
  readonly tags?: any[];
  readonly scope?: boolean;
}

type InjectableLifecycle<InstantiationParam> = InstantiationParam extends void
  ? {
      lifecycle?: ILifecycle<void>;
    }
  : {
      lifecycle: ILifecycle<InstantiationParam>;
    };

type GetInjectableOptions<
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance,
  InstantiationParam,
> = InjectableLifecycle<InstantiationParam> &
  Omit<
    Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>,
    'lifecycle'
  >;

// Todo: indirection?
type GetInjectableOptions2<TInjectionToken2 extends InjectionToken2<any>> =
  Injectable2<TInjectionToken2>;

export function getInjectable<
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance,
  InstantiationParam = void,
>(
  options: GetInjectableOptions<
    InjectionInstance,
    InjectionTokenInstance,
    InstantiationParam
  >,
): Injectable<InjectionInstance, InjectionTokenInstance, InstantiationParam>;

export function getInjectable2<TInjectionToken2 extends InjectionToken2<any>>(
  options: GetInjectableOptions2<TInjectionToken2>,
): Injectable2<TInjectionToken2>;

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
}): InjectionToken<InjectionInstance, InstantiationParam>;

export function getInjectionToken2<
  T extends InstantiateWithoutDi<any, any>,
>(options: { id: string }): InjectionToken2<T>;

export type InjectWithoutParameter = <InjectionInstance>(
  key:
    | Injectable<InjectionInstance, unknown>
    | InjectionToken<InjectionInstance, void>,
) => InjectionInstance;

export type InjectWithParameter = <InjectionInstance, InstantiationParam>(
  key:
    | Injectable<InjectionInstance, unknown, InstantiationParam>
    | InjectionToken<InjectionInstance, InstantiationParam>,
  param: InstantiationParam,
) => InjectionInstance;

export type Inject = InjectWithoutParameter & InjectWithParameter;

export type InjectWithTokenFor = <T extends InjectionToken2<any>>(
  token: T,
) => T['instantiateTemplate'];

export type InjectWithInjectableFor = <T extends Injectable2<any>>(
  injectable: T,
) => ReturnType<T['instantiateFor']>;

export type InjectFor = InjectWithTokenFor & InjectWithInjectableFor;

// Todo: implement InjectWithoutParameter2
export type Inject2 = <T extends InjectionToken2<any>>(
  token: T,
  parameter: Parameters<T['instantiateTemplate']>[1],
) => ReturnType<T['instantiateTemplate']>;

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
  inject2: Inject2;
  injectFor: InjectFor;
  injectWithMeta: InjectWithMeta;
  injectFactory: InjectFactory;
  injectMany: InjectMany;
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

export interface ILifecycle2<
  TInstantiateWithDi extends InstantiateWithDi<unknown, unknown>,
> {
  // Todo: solve
  getInstanceKey: any;
}

declare const storedInstanceKey: unique symbol;
declare const nonStoredInstanceKey: unique symbol;

export const lifecycleEnum: {
  singleton: {
    getInstanceKey: (di: DiContainer) => typeof storedInstanceKey;
  };

  keyedSingleton<InstantiationParam>(
    options: ILifecycle<InstantiationParam>,
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
