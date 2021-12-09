/// <reference types="react" />
declare module '@ogre-tools/injectable-react' {
  import type {
    DependencyInjectionContainer,
    Injectable,
  } from '@ogre-tools/injectable';
  import * as React from 'react';

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

  export function getInjectedComponent<
    TDependencies,
    TProps,
    TComponent extends React.ElementType<TDependencies & TProps>,
  >(
    Component: TComponent,

    options: {
      getPlaceholder?: () => JSX.Element;

      getDependencies: (di?: DependencyInjectionContainer) => TDependencies;
    },
  ): React.FC<TProps>;
}
