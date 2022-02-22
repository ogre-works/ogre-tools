/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
  type InferFromInjectable<T> = T extends NormalInjectable<
    infer TInstance,
    infer TInstantiationParameter
  >
    ? [TInstance, TInstantiationParameter]
    : never;

  type ValueType =
    | string
    | number
    | boolean
    | symbol
    | bigint
    | object
    | Array<any>;

  export type TentativeTuple<T> = T extends ValueType ? [T] : [undefined?];

  export interface DiContainer extends DiContainerForInjection<false> {
    purge: (injectableKey: NormalInjectable<any, any>) => void;

    runSetups: () => Promise<void>;

    override<TInjectable extends NormalInjectable<unknown, unknown>>(
      injectable: TInjectable,
      instantiateStub: (
        di: DiContainerForInstantiate,
        ...instantiationParameter: TentativeTuple<
          InferFromInjectable<TInjectable>[1]
        >
      ) => InferFromInjectable<TInjectable>[0],
    ): void;

    register(injectable: NormalInjectable<any, any>): void;
    register(injectable: InjectionTokenInjectable<any>): void;
    preventSideEffects: () => void;
  }

  export interface DiContainerForSetup extends DiContainerForInjection<true> {}

  export interface DiContainerForInstantiate
    extends DiContainerForInjection<false> {}

  type InjectionToken<TInstance, TInstantiationParameter> = {
    template: TInstance;
    instantiationParameter: TInstantiationParameter;
    key: Symbol;
  };

  interface CommonInjectable {
    id: string;
    setup?: (di: DiContainerForSetup) => void | Promise<void>;
    causesSideEffects?: boolean;
    lifecycle?: ILifecycle;
  }

  interface InjectionTokenInjectable<
    TInjectionToken extends InjectionToken<unknown, unknown>,
  > extends CommonInjectable {
    injectionToken: TInjectionToken;

    instantiate: (
      di: DiContainerForInstantiate,
      instantiationParameter: InferFromToken<TInjectionToken>[1],
    ) => InferFromToken<TInjectionToken>[0];
  }

  interface NormalInjectable<TInstance, TInstantiationParameter>
    extends CommonInjectable {
    instantiate: (
      di: DiContainerForInstantiate,
      instantiationParameter: TInstantiationParameter,
    ) => TInstance;
  }

  export function getInjectable<
    TInjectionToken extends InjectionToken<unknown, unknown>,
  >(
    options: InjectionTokenInjectable<TInjectionToken>,
  ): InjectionTokenInjectable<TInjectionToken>;

  export function getInjectable<TInstance, TInstantiationParameter>(
    options: NormalInjectable<TInstance, TInstantiationParameter>,
  ): NormalInjectable<TInstance, TInstantiationParameter>;

  export function getInjectionToken<TInstance, TInstantiationParameter = void>({
    id: string,
  }): InjectionToken<TInstance, TInstantiationParameter>;

  interface DiContainerForInjection<TReturnAsPromise extends boolean> {
    inject<TInjectable extends NormalInjectable<unknown, unknown>>(
      injectableKey: TInjectable,
      ...instantiationParameter: TentativeTuple<
        InferFromInjectable<TInjectable>[1]
      >
    ): TReturnAsPromise extends true
      ? Promise<InferFromInjectable<TInjectable>[0]>
      : InferFromInjectable<TInjectable>[0];

    inject<TInjectionToken extends InjectionToken<unknown, unknown>>(
      injectionToken: TInjectionToken,
      ...instantiationParameter: TentativeTuple<
        TInjectionToken['instantiationParameter']
      >
    ): TReturnAsPromise extends true
      ? Promise<TInjectionToken['template']>
      : TInjectionToken['template'];

    injectMany<TInjectionToken extends InjectionToken<unknown, unknown>>(
      injectionToken: TInjectionToken,
      ...instantiationParameter: TentativeTuple<
        TInjectionToken['instantiationParameter']
      >
    ): TReturnAsPromise extends true
      ? Promise<TInjectionToken['template'][]>
      : TInjectionToken['template'][];
  }

  type InferFromToken<T> = T extends InjectionToken<
    infer TInstance,
    infer TInstantiationParameter
  >
    ? [TInstance, TInstantiationParameter]
    : never;

  export interface ILifecycle {
    getInstanceKey: (di: DiContainer, param: unknown) => string | number;
  }

  export const lifecycleEnum: {
    singleton: ILifecycle;

    keyedSingleton: <TInstantiationParameter>(keyedSingletonOptions: {
      getInstanceKey: (
        di: DiContainer,
        instantiationParameter: TInstantiationParameter,
      ) => string | number;
    }) => ILifecycle;

    transient: ILifecycle;
  };

  export function createContainer(...getRequireContexts: any[]): DiContainer;

  export function registerErrorMonitoring(di: DiContainer);

  export const errorMonitorInjectionToken: InjectionToken<
    (error: {
      context: { id: string; instantiationParameter: any }[];
      error: any;
    }) => void | Promise<void>,
    void
  >;

  export function registerDependencyGraphing(di: DiContainer);

  export const plantUmlDependencyGraphInjectable: InjectionToken<string, void>;
}
