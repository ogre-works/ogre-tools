/// <reference types="react" />
declare module '@ogre-tools/injectable-react' {
  import type { DependencyInjectionContainer } from '@ogre-tools/injectable';
  import { IComputedValue } from 'mobx';

  interface DependencyInjectionContainerProviderProps {
    di: DependencyInjectionContainer;
  }

  export const DiContextProvider: React.Provider<DependencyInjectionContainerProviderProps>;

  export function withInjectables<Dependencies, Props = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: {
      getProps: (
        di: DependencyInjectionContainer,
        props: Props,
      ) => Props & Dependencies;
    },
  ): React.ForwardRefExoticComponent<
    Props & React.RefAttributes<any> & { children?: React.ReactNode }
  >;

  export function withInjectables<Dependencies, Props = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: {
      getProps: (
        di: DependencyInjectionContainer,
        props: Props,
      ) => PromiseLike<Props & Dependencies>;

      getPlaceholder: () => JSX.Element;
    },
  ): React.ForwardRefExoticComponent<
    Props & React.RefAttributes<any> & { children?: React.ReactNode }
  >;

  export function asyncComputed<T>(getObservablePromise: () => Promise<T>): {
    value: IComputedValue<T>;
    pending: IComputedValue<boolean>;
    invalidate: () => void;
  };
}
