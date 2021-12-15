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

  export const getInjectedComponent: <
    TComponent extends React.ElementType<{ dependencies: object }> = any,
    TComponentProps extends {
      dependencies: object;
    } = React.ComponentProps<TComponent>,
    TProps extends object = Omit<TComponentProps, 'dependencies'>,
  >(
    Component: TComponent,

    options: {
      getPlaceholder?: () => JSX.Element;

      getProps: (
        di: DependencyInjectionContainer,
        props: TProps,
      ) => React.ComponentProps<TComponent>;
    },
  ) => React.FC<TProps>;
}
