/// <reference types="react" />
declare module '@ogre-tools/injectable-react' {
  import type { DependencyInjectionContainer } from '@ogre-tools/injectable';

  interface DependencyInjectionContainerProviderProps {
    di: DependencyInjectionContainer;
  }

  export const DiContextProvider: React.Provider<DependencyInjectionContainerProviderProps>;

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
