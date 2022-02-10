/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
  type InferFromInjectable<T> = T extends Injectable<
    unknown,
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
    purge: (injectableKey: Injectable<any, any, any>) => void;

    runSetups: () => Promise<void>;

    override<TInjectable extends Injectable<unknown, unknown, unknown>>(
      injectable: TInjectable,
      instantiateStub: (
        di: DiContainerForInstantiate,
        ...instantiationParameter: TentativeTuple<
          InferFromInjectable<TInjectable>[1]
        >
      ) => InferFromInjectable<TInjectable>[0],
    ): void;

    register(injectable: Injectable<any, any, any>): void;
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

  export function getInjectionToken<TInstance, TInstantiationParameter = void>({
    id: string,
  }): InjectionToken<TInstance, TInstantiationParameter>;

  export interface Injectable<
    TInjectionToken,
    TInstance,
    TInstantiationParameter,
  > {
    id: string;
    setup?: (di: DiContainerForSetup) => void | Promise<void>;
    causesSideEffects?: boolean;
    lifecycle?: ILifecycle;
    injectionToken?: TInjectionToken;

    instantiate: (
      di: DiContainerForInstantiate,
      instantiationParameter: TInstantiationParameter,
    ) => TInstance;
  }

  interface DiContainerForInjection<TReturnAsPromise extends boolean> {
    inject<TInjectable extends Injectable<unknown, unknown, unknown>>(
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

  export function getInjectable<
    TInjectionToken extends InjectionToken<TInstance, TInstantiationParameter>,
    TInstance = TInjectionToken extends InjectionToken<any, any>
      ? InferFromToken<TInjectionToken>[0]
      : unknown,
    TInstantiationParameter = TInjectionToken extends InjectionToken<any, any>
      ? InferFromToken<TInjectionToken>[1]
      : unknown,
  >(
    options: Injectable<TInjectionToken, TInstance, TInstantiationParameter>,
  ): Injectable<TInjectionToken, TInstance, TInstantiationParameter>;

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

  export const errorMonitorToken: InjectionToken<
    (error: {
      context: { id: string; instantiationParameter: any }[];
      error: any;
    }) => void | Promise<void>,
    void
  >;
}
