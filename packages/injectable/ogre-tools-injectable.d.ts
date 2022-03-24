/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
  export interface DiContainer extends DiContainerForInjection<false> {
    purge: (injectableKey: Injectable<any, any, any>) => void;

    permitSideEffects: (injectableKey: Injectable<any, any, any>) => void;

    runSetups: () => Promise<void>;

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
      injectable: Injectable<
        InjectionInstance,
        InjectionTokenInstance,
        InstantiationParam
      >,
    ): void;
    preventSideEffects: () => void;
  }

  export type Instantiate<InjectionInstance, InstantiationParam> = {
    (
      di: DiContainerForInstantiate,
      param: InstantiationParam extends void ? void : InstantiationParam,
    ): InjectionInstance;
  };

  export type DiContainerForSetup = DiContainerForInjection<true>;
  export type DiContainerForInstantiate = DiContainerForInjection<false>;

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
    setup?: (di: DiContainerForSetup) => void | Promise<void>;
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

  type SelectiveAsync<
    IsAsync extends boolean,
    InjectionInstance,
  > = IsAsync extends true ? Promise<InjectionInstance> : InjectionInstance;

  interface Inject<IsAsync extends boolean> {
    <InjectionInstance>(
      key:
        | Injectable<InjectionInstance, unknown, void>
        | InjectionToken<InjectionInstance, void>,
    ): SelectiveAsync<IsAsync, InjectionInstance>;
    <InjectionInstance, InstantiationParam>(
      key:
        | Injectable<InjectionInstance, unknown, InstantiationParam>
        | InjectionToken<InjectionInstance, InstantiationParam>,
      param: InstantiationParam,
    ): SelectiveAsync<IsAsync, InjectionInstance>;
  }

  interface InjectMany<IsAsync extends boolean> {
    <InjectionInstance>(
      key:
        | Injectable<InjectionInstance, unknown, void>
        | InjectionToken<InjectionInstance, void>,
    ): SelectiveAsync<IsAsync, InjectionInstance[]>;

    <InjectionInstance, InstantiationParam>(
      key:
        | Injectable<InjectionInstance, unknown, InstantiationParam>
        | InjectionToken<InjectionInstance, InstantiationParam>,
      param: InstantiationParam,
    ): SelectiveAsync<IsAsync, InjectionInstance[]>;
  }

  interface DiContainerForInjection<TReturnAsPromise extends boolean> {
    inject: Inject<TReturnAsPromise>;
    injectMany: InjectMany<TReturnAsPromise>;

    register<
      InjectionInstance extends InjectionTokenInstance,
      InjectionTokenInstance,
      InstantiationParam,
    >(
      injectable: Injectable<
        InjectionInstance,
        InjectionTokenInstance,
        InstantiationParam
      >,
    ): void;
  }

  export interface ILifecycle<InstantiationParam> {
    getInstanceKey: (di: DiContainer, params: InstantiationParam) => any;
  }

  const storedInstanceKey: unique symbol;
  const nonStoredInstanceKey: unique symbol;

  export const lifecycleEnum: {
    singleton: (di: DiContainer, param: void) => typeof storedInstanceKey;

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

  interface Customizer {
    shouldCustomize: (instance: any) => boolean;
    // Todo: add proper typing
    customizeLink: (link: any) => void;
    customizeNode: (node: any) => void;
  }

  export const dependencyGraphCustomizerToken: InjectionToken<Customizer, void>;

  export function registerDependencyGraphing(di: DiContainer): void;

  export const plantUmlDependencyGraphInjectable: InjectionToken<string, void>;
}
