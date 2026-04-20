/// <reference types="react" />
import {
  DiContainer,
  DiContainerForInjection,
  Injectable,
  InjectionToken,
  InjectionToken2,
  SpecificInjectionToken,
  SpecificInjectionToken2,
} from '@ogre-tools/injectable';

export function useInject<TReturnValue>(
  injectable: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): Awaited<TReturnValue>;

export function useInject<TReturnValue, TInstantiationParameter>(
  injectable:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
  instantiationParameter: TInstantiationParameter,
): Awaited<TReturnValue>;

export function useInjectDeferred<TReturnValue>(
  injectable: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): Awaited<TReturnValue>;

export function useInjectDeferred<TReturnValue, TInstantiationParameter>(
  injectable:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
  instantiationParameter: TInstantiationParameter,
): Awaited<TReturnValue>;


export type InjectableComponent<Component extends React.ComponentType<any>> =
  Component & Injectable<Component>;

type ExcludedKeys = 'instantiate' | 'lifecycle' | 'scope' | 'decorable' | 'injectionToken';

export declare function getInjectableComponent<
  Component extends React.ComponentType<any>
>(
  injectable: Omit<Injectable<Component>, ExcludedKeys> & {
    id: string;
    Component: Component;
    PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
    injectionToken?: InjectionToken2<() => Component>;
  },
): InjectableComponent<Component>;

export type InjectionTokenComponent<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<() => Component> = (
    id: string,
  ) => SpecificInjectionToken2<() => Component>,
> = Component & InjectionToken2<() => Component, () => Component[], SpecificFactory>;

export declare function getInjectionTokenComponent<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionToken2<() => Component> = (
    id: string,
  ) => SpecificInjectionToken2<() => Component>,
>(options: {
  id: string;
  PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
  decorable?: boolean;
  specificInjectionTokenFactory?: SpecificFactory;
}): InjectionTokenComponent<Component, SpecificFactory>;

export const DiContextProvider: React.Provider<DiContainer | DiContainerForInjection>;

/** @deprecated Use injection hooks (`useSyncInject`, `useInjectDeferAwait`, `useInjectAsReactive`) or `getInjectableComponent` instead. */
export interface WithInjectablesSyncOptions<
  Dependencies extends object,
  Props extends object,
> {
  getProps: (di: DiContainerForInjection, props: Props) => Props & Dependencies;
}

/** @deprecated Use injection hooks (`useSyncInject`, `useInjectDeferAwait`, `useInjectAsReactive`) or `getInjectableComponent` instead. */
export interface WithInjectablesAsyncOptions<
  Dependencies extends object,
  Props extends object,
> {
  getProps: (
    di: DiContainerForInjection,
    props: Props,
  ) => Promise<Props & Dependencies>;
  getPlaceholder: React.FunctionComponent<Props>;
}

/** @deprecated Use injection hooks (`useSyncInject`, `useInjectDeferAwait`, `useInjectAsReactive`) or `getInjectableComponent` instead. */
export interface WithInjectables {
  <Dependencies extends object, Props extends object = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: WithInjectablesSyncOptions<Dependencies, Props>,
  ): React.FunctionComponent<Props>;

  <Dependencies extends object, Props extends object, Ref extends object>(
    Component: React.ForwardRefExoticComponent<
      Dependencies & Props & React.RefAttributes<Ref>
    >,
    options: WithInjectablesSyncOptions<Dependencies, Props>,
  ): React.ForwardRefExoticComponent<Props & React.RefAttributes<Ref>>;

  <Dependencies extends object, Props extends object = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: WithInjectablesAsyncOptions<Dependencies, Props>,
  ): React.FunctionComponent<Props>;

  <Dependencies extends object, Props extends object, Ref extends object>(
    Component: React.ForwardRefExoticComponent<
      Dependencies & Props & React.RefAttributes<Ref>
    >,
    options: WithInjectablesAsyncOptions<Dependencies, Props>,
  ): React.ForwardRefExoticComponent<Props & React.RefAttributes<Ref>>;
}

/** @deprecated Use injection hooks (`useSyncInject`, `useInjectDeferAwait`, `useInjectAsReactive`) or `getInjectableComponent` instead. */
export const withInjectables: WithInjectables;
