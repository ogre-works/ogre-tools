/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
  export interface DiContainer extends DiContainerForInjection<false> {
    purge: (injectableKey: Injectable<any, any, any>) => void;

    runSetups: () => Promise<void>;

    override<
      Instance extends InjectionInstance,
      InjectionInstance,
      InstantiationParam
    >(
      injectable: Injectable<Instance, InjectionInstance, InstantiationParam>,
      instantiateStub: Instantiate<Instance, InstantiationParam>,
    ): void;

    register<
      InjectionInstance extends Instance,
      Instance,
      InstantiationParam
    >(injectable: Injectable<InjectionInstance, Instance, InstantiationParam>): void;
    preventSideEffects: () => void;
  }

  export type Instantiate<Instance, InstantiationParam> = {
    (di: DiContainerForInstantiate, param: InstantiationParam extends void
      ? void
      : InstantiationParam
    ): Instance;
  };

  export type DiContainerForSetup = DiContainerForInjection<true>;
  export type DiContainerForInstantiate = DiContainerForInjection<false>;

  export interface InjectionToken<
    Instance,
    InstantiationParam,
  > {
    template: Instance;
    instantiationParameter: InstantiationParam;
    key: Symbol;
  }

  export type Injectable<
    Instance extends InjectionInstance,
    InjectionInstance,
    InstantiationParam,
  > = {
    id: string;
    setup?: (di: DiContainerForSetup) => void | Promise<void>;
    causesSideEffects?: boolean;
    injectionToken?: InjectionToken<InjectionInstance, InstantiationParam>;
    instantiate: Instantiate<Instance, InstantiationParam>;
  } & (
    InstantiationParam extends void
      ? ({
        lifecycle?: typeof lifecycleEnum.singleton;
      } | {
        lifecycle: typeof lifecycleEnum.singleton | typeof lifecycleEnum.transient;
      })
      : {
        lifecycle: ILifecycle<InstantiationParam, string | number | symbol>;
      }
  );

  export function getInjectable<
    Instance extends InjectionInstance,
    InjectionInstance,
    InstantiationParam = void
  >(
    options: Injectable<Instance, InjectionInstance, InstantiationParam>,
  ): typeof options;

  export function getInjectionToken<
    Instance,
    InstantiationParam = void,
  >({
    id: string,
  }): InjectionToken<Instance, InstantiationParam>;

  type AsyncReturnable<IsAsync extends boolean, Instance> = IsAsync extends true
    ? Promise<Instance>
    : Instance;

  export interface Inject<IsAsync extends boolean> {
    <Instance>(
      key: Injectable<Instance, unknown, void> | InjectionToken<Instance, void>,
    ): AsyncReturnable<IsAsync, Instance>;
    <Instance, InstantiationParam>(
      key: Injectable<Instance, unknown, InstantiationParam> | InjectionToken<Instance, InstantiationParam>,
      param: InstantiationParam,
    ): AsyncReturnable<IsAsync, Instance>;
  }

  interface DiContainerForInjection<TReturnAsPromise extends boolean> {
    inject: Inject<TReturnAsPromise>;

    injectMany<Instance, InstantiationParam = void>(
      injectionToken: InjectionToken<Instance, InstantiationParam>,
      instantiationParameter: InstantiationParam,
    ): AsyncReturnable<TReturnAsPromise, Instance[]>;
  }

  export interface ILifecycle<InstantiationParam, Key extends string | number | symbol> {
    getInstanceKey: (di: DiContainer, params: InstantiationParam) => Key;
  }

  const storedInstanceKey: unique symbol;
  const nonStoredInstanceKey: unique symbol;

  export const lifecycleEnum: {
    singleton: ILifecycle<void, typeof storedInstanceKey>;

    keyedSingleton<InstantiationParam>(
      options: ILifecycle<InstantiationParam, string | number | symbol>,
    ): typeof options;

    transient: ILifecycle<unknown, typeof nonStoredInstanceKey>;
  };

  export function createContainer(...getRequireContexts: any[]): DiContainer;

  export function registerErrorMonitoring(di: DiContainer): void;

  export const errorMonitorInjectionToken: InjectionToken<
    (error: {
      context: { id: string; instantiationParameter: any }[];
      error: any;
    }) => void | Promise<void>,
    void
  >;

  export function registerDependencyGraphing(di: DiContainer): void;

  export const plantUmlDependencyGraphInjectable: InjectionToken<string, []>;
}
