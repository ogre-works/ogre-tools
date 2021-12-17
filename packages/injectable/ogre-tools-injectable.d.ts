/// <reference types="jest" />
declare module '@ogre-tools/injectable' {
  export interface DependencyInjectionContainer {
    inject: <
      TInjectable extends Injectable<
        TInstance,
        TDependencies,
        TInstantiationParameter
      >,
      TInstance,
      TDependencies extends object,
      TInstantiationParameter,
      TMaybePromiseInstance = ReturnType<TInjectable['instantiate']>,
    >(
      injectableKey: TInjectable,
      ...instantiationParameter: TInstantiationParameter extends object
        ? [TInstantiationParameter]
        : [undefined?]
    ) => TMaybePromiseInstance extends PromiseLike<any>
      ? Awaited<TMaybePromiseInstance>
      : TMaybePromiseInstance;

    purge: <TInjectable extends Injectable<any, any, any>>(
      injectableKey: TInjectable,
    ) => void;

    runSetups: () => void;
  }

  export interface ConfigurableDependencyInjectionContainer
    extends DependencyInjectionContainer {
    register: (injectable: Injectable<any>) => void;
    preventSideEffects: () => void;

    override: <TInjectable extends Injectable<TInstance, any>, TInstance>(
      injectable: TInjectable,
      overrider:
        | ReturnType<TInjectable['instantiate']>
        | jest.MockInstance<
            ReturnType<TInjectable['instantiate']>,
            ReturnType<TInjectable['getDependencies']>
          >,
    ) => void;
  }

  export interface Injectable<
    TInstance,
    TDependencies extends object = {},
    TInstantiationParameter = void,
  > {
    id?: string;

    setup?: (di: DependencyInjectionContainer) => void;

    getDependencies: (
      di?: DependencyInjectionContainer,
      instantiationParameter?: TInstantiationParameter,
    ) => TDependencies | Promise<TDependencies>;

    lifecycle: lifecycleEnum;

    instantiate: (
      dependencies: TDependencies,
      instantiationParameter: TInstantiationParameter,
    ) => Promise<TInstance> | TInstance;

    causesSideEffects?: boolean;
  }

  export enum lifecycleEnum {
    singleton,
    transient,
  }

  export function createContainer(
    ...getRequireContexts: any[]
  ): ConfigurableDependencyInjectionContainer;
}
