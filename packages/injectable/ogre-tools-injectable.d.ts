/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
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

    register<
      InjectionInstance extends InjectionTokenInstance,
      InjectionTokenInstance,
      InstantiationParam,
    >(
      ...injectables: Injectable<
        InjectionInstance,
        InjectionTokenInstance,
        InstantiationParam
      >[]
    ): void;
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
  >({ id: string }): InjectionToken<InjectionInstance, InstantiationParam>;

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

  export interface DiContainerForInjection {
    inject: Inject;
    injectMany: InjectMany;

    register<
      InjectionInstance extends InjectionTokenInstance,
      InjectionTokenInstance,
      InstantiationParam,
    >(
      ...injectables: Injectable<
        InjectionInstance,
        InjectionTokenInstance,
        InstantiationParam
      >[]
    ): void;
  }

  export interface ILifecycle<InstantiationParam> {
    getInstanceKey: (di: DiContainer, params: InstantiationParam) => any;
  }

  const storedInstanceKey: unique symbol;
  const nonStoredInstanceKey: unique symbol;

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

  export interface RequireContext {
    keys(): string[];
    (key: string): any;
  }

  export function createContainer(
    ...getRequireContexts: (() => RequireContext)[]
  ): DiContainer;
}
