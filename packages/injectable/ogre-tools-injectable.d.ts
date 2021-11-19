declare module '@ogre-tools/injectable' {
  type Awaited<TMaybePromise> = TMaybePromise extends PromiseLike<infer TValue>
    ? TValue
    : TMaybePromise;

  export interface DependencyInjectionContainer {
    inject: <
      TInjectable extends Injectable<TInstance, TDependencies>,
      TInstance,
      TDependencies extends object,
      TMaybePromiseInstance = ReturnType<TInjectable['instantiate']>,
    >(
      injectableKey: TInjectable,
    ) => TMaybePromiseInstance extends PromiseLike<any>
      ? Awaited<TMaybePromiseInstance>
      : TMaybePromiseInstance;
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
    TInstantiationParameter extends object = {},
  > {
    id?: string;

    getDependencies: (
      di?: DependencyInjectionContainer,
    ) => TDependencies | Promise<TDependencies>;

    lifecycle?: lifecycleEnum;

    instantiate: (
      dependencies: TDependencies,
      instantiationParameter: TInstantiationParameter,
    ) => Promise<TInstance> | TInstance;

    causesSideEffects?: boolean;
  }

  export enum lifecycleEnum {
    singleton,
    transient,
    scopedTransient,
  }

  export function createContainer(
    ...getRequireContexts: any[]
  ): ConfigurableDependencyInjectionContainer;
}
