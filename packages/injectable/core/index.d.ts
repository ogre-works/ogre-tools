/// <reference types="jest" />
export interface DiContainer extends DiContainerForInjection {
  purge: (injectableKey: Injectable<any, any, any>) => void;

  permitSideEffects: (injectableKey: Injectable<any, any, any>) => void;

  override<
    InjectionInstance extends InjectionTokenInstance,
    InjectionTokenInstance,
    InstantiationParam,
  >(
    injectable:
      | InjectionToken<InjectionInstance, InstantiationParam>
      | Injectable<
          InjectionInstance,
          InjectionTokenInstance,
          InstantiationParam
        >,
    instantiateStub: Instantiate<InjectionInstance, InstantiationParam>,
  ): void;

  unoverride(injectable: Injectable<any, any, any>): void;

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

export interface InjectionToken<InjectionInstance, InstantiationParam> {
  template: InjectionInstance;
  instantiationParameter: InstantiationParam;
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

export function getInjectionToken<
  InjectionInstance,
  InstantiationParam = void,
>(options: {
  id: string;
}): InjectionToken<InjectionInstance, InstantiationParam>;

interface InjectWithoutParameter {
  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown>
      | InjectionToken<InjectionInstance, void>,
  ): InjectionInstance;
}

interface InjectWithParameter {
  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstance;
}

type Inject = InjectWithoutParameter & InjectWithParameter;

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

interface ContextItem {
  injectable: Injectable<any, any, any>;
  instantiationParameter: unknown;
}

export interface DiContainerForInjection {
  inject: Inject;
  injectMany: InjectMany;
  injectManyWithMeta: InjectManyWithMeta;
  register(...injectables: Injectable<any, any, any>[]): void;
  deregister(...injectables: Injectable<any, any, any>[]): void;
  context: ContextItem[];
}

export interface ILifecycle<InstantiationParam> {
  getInstanceKey: (di: DiContainer, params: InstantiationParam) => any;
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

export type InjectionTargetDecorator<InjectionInstance> = {
  decorate: (instance: InjectionInstance) => InjectionInstance;
};

export type InstantiationTargetDecorator<
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

export const createInstantiationTargetDecorator: <
  InjectionInstance extends InjectionTokenInstance,
  InjectionTokenInstance = InjectionInstance,
  InstantiationParam = void,
>(
  desc: InstantiationTargetDecorator<
    InjectionInstance,
    InjectionTokenInstance,
    InstantiationParam
  >,
) => InstantiationTargetDecorator<
  InjectionInstance,
  InjectionTokenInstance,
  InstantiationParam
>;

export const injectionDecoratorToken: InjectionToken<
  InjectionTargetDecorator<any>,
  void
>;

export const instantiationDecoratorToken: InjectionToken<
  InstantiationTargetDecorator<any, any, any>,
  void
>;

export const registrationCallbackToken: RegistrationCallback;
export const deregistrationCallbackToken: RegistrationCallback;
export const isInjectable: (thing: any) => boolean;
export const isInjectionToken: (thing: any) => boolean;

export function createContainer(containerId: string): DiContainer;
