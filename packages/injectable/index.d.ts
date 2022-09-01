/// <reference types="jest" />
export interface DiContainer extends DiContainerForInjection {
  purge: (injectableKey: Injectable<any, any, any>) => void;

  permitSideEffects: (injectableKey: Injectable<any, any, any>) => void;

  override<
    InjectionInstance extends InjectionTokenInstance,
    InjectionTokenInstance,
    InstantiationParam,
  >(
    injectable: Injectable<
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
  InjectionTokenInstance,
  InstantiationParam,
> {
  id: string;
  causesSideEffects?: boolean;
  injectionToken?: InjectionToken<InjectionTokenInstance, InstantiationParam>;
  instantiate: Instantiate<InjectionInstance, InstantiationParam>;
  lifecycle: ILifecycle<InstantiationParam>;
  decorable?: boolean;
  tags?: any[];
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

interface Inject {
  <InjectionInstance>(
    key:
      | Injectable<InjectionInstance, unknown, void>
      | InjectionToken<InjectionInstance, void>,
  ): InjectionInstance;

  <InjectionInstance, InstantiationParam>(
    key:
      | Injectable<InjectionInstance, unknown, InstantiationParam>
      | InjectionToken<InjectionInstance, InstantiationParam>,
    param: InstantiationParam,
  ): InjectionInstance;
}

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

interface ContextItem {
  injectable: Injectable<any, any, any>;
  instantiationParameter: unknown;
}

export interface DiContainerForInjection {
  inject: Inject;
  injectMany: InjectMany;
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

type Decorator = InjectionToken<
  { decorate: (toBeDecorated) => typeof toBeDecorated },
  unknown
>;

type TargetableDecorator = Decorator & {
  target?: Injectable<any, any, any> | InjectionToken<any, any>;
};

export const injectionDecoratorToken: TargetableDecorator;
export const instantiationDecoratorToken: TargetableDecorator;
export const registrationDecoratorToken: Decorator;
export const deregistrationDecoratorToken: Decorator;

export function createContainer(containerId: string): DiContainer;
