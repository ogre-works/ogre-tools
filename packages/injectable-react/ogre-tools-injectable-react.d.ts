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

  export const withInjectables: <Dependencies, Props = {}>(
    Component: React.ComponentType<Dependencies & Props>,

    options: {
      getPlaceholder?: () => JSX.Element;

      getProps: (
        di: DependencyInjectionContainer,
        props: Props,
      ) => Props & Dependencies;
    },
  ) => React.FC<Props>;
}
