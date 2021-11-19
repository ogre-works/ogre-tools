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

  export const Inject: <TInjectable extends Injectable<any>>({
    injectableKey,
    getPlaceholder,
  }: Parameters<TInjectable['instantiate']>[1] & {
    injectableKey: TInjectable;
    getPlaceholder?: () => JSX.Element | null;
  }) => JSX.Element;
}
