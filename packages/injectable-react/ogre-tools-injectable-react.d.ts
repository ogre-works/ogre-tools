/// <reference types="react" />
declare module '@ogre-tools/injectable-react' {
  import type {
    DependencyInjectionContainer,
    Injectable,
  } from '@ogre-tools/injectable';

  interface DependencyInjectionContainerProviderProps {
    di: DependencyInjectionContainer;
  }

  export const DiContextProvider: React.Provider<DependencyInjectionContainerProviderProps>;

  export const Inject: <
    TInjectable extends Injectable<
      TInstance,
      TDependencies,
      TInstantiationParameter
    >,
    TInstance,
    TDependencies extends object,
    TInstantiationParameter,
  >({
    injectableKey: TInjectable,
    getPlaceholder,
  }: Parameters<TInjectable['instantiate']>[1] & {
    injectableKey: TInjectable;
    getPlaceholder?: () => JSX.Element | null;
  }) => JSX.Element;

  interface InjectedComponentOptions {
    getPlaceholder: () => JSX.Element;
  }

  export function getInjectedComponent<
    TInjectable extends Injectable<TInstance, TDependencies, TProps>,
    TInstance,
    TDependencies extends object,
    TProps,
  >(
    injectableKey: TInjectable,
    options?: InjectedComponentOptions,
  ): React.FC<Parameters<TInjectable['instantiate']>[1]>;
}
