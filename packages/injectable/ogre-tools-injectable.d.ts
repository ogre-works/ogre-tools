/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
  type InferFromInjectable<T> = T extends Injectable<
    unknown,
    infer TInstance,
    infer TInstantiationParameter
  >
    ? [TInstance, TInstantiationParameter]
    : never;

  type TentativeTuple<T> = T extends undefined ? [undefined?] : [T];

  export interface DependencyInjectionContainer {
    inject<TInjectable extends Injectable<unknown, unknown, unknown>>(
      injectableKey: TInjectable,
      ...instantiationParameter: TentativeTuple<
        InferFromInjectable<TInjectable>[1]
      >
    ): InferFromInjectable<TInjectable>[0];

    inject<TInjectionToken extends InjectionToken<unknown, unknown>>(
      injectionToken: TInjectionToken,
      ...instantiationParameter: TentativeTuple<
        TInjectionToken['instantiationParameter']
      >
    ): TInjectionToken['template'];

    injectMany<TInjectionToken extends InjectionToken<unknown, unknown>>(
      injectionToken: TInjectionToken,
      ...instantiationParameter: TentativeTuple<
        TInjectionToken['instantiationParameter']
      >
    ): TInjectionToken['template'][];

    purge: (injectableKey: Injectable<any, any, any>) => void;

    runSetups: () => Promise<void>;

    override<TInjectable extends Injectable<unknown, unknown, unknown>>(
      injectable: TInjectable,
      instantiateStub: (
        di: DependencyInjectionContainer,
        ...instantiationParameter: TentativeTuple<
          InferFromInjectable<TInjectable>[1]
        >
      ) => InferFromInjectable<TInjectable>[0],
    ): void;
  }

  export interface ConfigurableDependencyInjectionContainer
    extends DependencyInjectionContainer {
    register(injectable: Injectable<any, any, any>): void;
    preventSideEffects: () => void;
  }

  type InjectionToken<TInstance, TInstantiationParameter> = {
    template: TInstance;
    instantiationParameter: TInstantiationParameter;
    key: Symbol;
  };

  export function getInjectionToken<TInstance, TInstantiationParameter = void>({
    id: string,
  }): InjectionToken<TInstance, TInstantiationParameter>;

  export interface ILifecycle<TInstantiationParameter> {
    getInstanceKey: (
      di: DependencyInjectionContainer,
      param: TInstantiationParameter,
    ) => string | number;
  }

  export interface Injectable<
    TInjectionToken,
    TInstance,
    TInstantiationParameter,
  > {
    id: string;
    setup?: (di: DependencyInjectionContainer) => void | Promise<void>;
    causesSideEffects?: boolean;
    lifecycle?: ILifecycle<TInstantiationParameter>;
    injectionToken?: TInjectionToken;

    instantiate: (
      di: DependencyInjectionContainer,
      instantiationParameter: TInstantiationParameter,
    ) => TInstance;
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

  interface Singleton extends ILifecycle<never> {}

  interface Transient extends ILifecycle<never> {}

  interface KeyedSingleton<TInstantiationParameter>
    extends ILifecycle<TInstantiationParameter> {}

  export const lifecycleEnum: {
    singleton: Singleton;

    keyedSingleton: <TInstantiationParameter>(keyedSingletonOptions: {
      getInstanceKey: (
        di: DependencyInjectionContainer,
        instantiationParameter: TInstantiationParameter,
      ) => string | number;
    }) => KeyedSingleton<TInstantiationParameter>;

    transient: Transient;
  };

  export function createContainer(
    ...getRequireContexts: any[]
  ): ConfigurableDependencyInjectionContainer;
}
