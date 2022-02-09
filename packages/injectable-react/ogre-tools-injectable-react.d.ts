/// <reference types="react" />
declare module '@ogre-tools/injectable-react' {
  import type { DiContainer } from '@ogre-tools/injectable';
  import { IComputedValue } from 'mobx';

  interface DiContainerProviderProps {
    di: DiContainer;
  }

  export const DiContextProvider: React.Provider<DiContainerProviderProps>;

  export function withInjectables<Dependencies, Props = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: {
      getProps: (di: DiContainer, props: Props) => Props & Dependencies;
    },
  ): React.ForwardRefExoticComponent<
    Props & React.RefAttributes<any> & { children?: React.ReactNode }
  >;

  export function withInjectables<Dependencies, Props = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: {
      getProps: (
        di: DiContainer,
        props: Props,
      ) => PromiseLike<Props & Dependencies>;

      getPlaceholder: () => JSX.Element;
    },
  ): React.ForwardRefExoticComponent<
    Props & React.RefAttributes<any> & { children?: React.ReactNode }
  >;

  export type IAsyncComputed<T> = {
    value: IComputedValue<T>;
    pending: IComputedValue<boolean>;
    invalidate: () => void;
  };

  export function asyncComputed<T>(
    getObservablePromise: () => Promise<T>,
    pendingValue?: T,
  ): IAsyncComputed<T>;
}
