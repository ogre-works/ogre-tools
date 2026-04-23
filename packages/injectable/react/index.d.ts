/// <reference types="react" />
import {
  AbstractInjectionToken2,
  DiContainer,
  DiContainerForInjection,
  Injectable,
  Injectable2,
  InjectionToken,
  InjectionToken2,
  SpecificInjectionToken,
  SpecificInjectionToken2,
} from '@ogre-tools/injectable';

export function useInject<F extends (...args: any[]) => any>(
  injectable:
    | Injectable2<F>
    | (InjectionToken2<F> & { readonly __abstract?: never }),
  ...params: Parameters<F>
): Awaited<ReturnType<F>>;

export function useInject<TReturnValue>(
  injectable: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): Awaited<TReturnValue>;

export function useInject<TReturnValue, TInstantiationParameter>(
  injectable:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
  instantiationParameter: TInstantiationParameter,
): Awaited<TReturnValue>;

export function useInjectDeferred<F extends (...args: any[]) => any>(
  injectable:
    | Injectable2<F>
    | (InjectionToken2<F> & { readonly __abstract?: never }),
  ...params: Parameters<F>
): Awaited<ReturnType<F>>;

export function useInjectDeferred<TReturnValue>(
  injectable: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): Awaited<TReturnValue>;

export function useInjectDeferred<TReturnValue, TInstantiationParameter>(
  injectable:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
  instantiationParameter: TInstantiationParameter,
): Awaited<TReturnValue>;

export function useInject2<F extends (...args: any[]) => any>(
  alias: Injectable2<F>,
): F;
export function useInject2<F extends (...args: any[]) => any>(
  alias: InjectionToken2<F> & { readonly __abstract?: never },
): F;
export function useInject2<TReturnValue>(
  alias: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): () => TReturnValue;
export function useInject2<TReturnValue, TInstantiationParameter>(
  alias:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
): (
  ...params: TInstantiationParameter extends any[]
    ? TInstantiationParameter
    : [TInstantiationParameter]
) => TReturnValue;


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
    injectionToken?: InjectionToken<Component>;
  },
): InjectableComponent<Component>;

export type InjectableComponent2<Component extends React.ComponentType<any>> =
  Component & Injectable2<() => Component>;

type ExcludedKeys2 = 'aliasType' | 'instantiate' | 'decorable' | 'injectionToken';

export declare function getInjectableComponent2<
  Component extends React.ComponentType<any>
>(
  injectable: Omit<Injectable2<() => Component>, ExcludedKeys2> & {
    id: string;
    Component: Component;
    PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
    injectionToken?: InjectionToken2<() => Component> & { readonly __abstract?: never };
  },
): InjectableComponent2<Component>;

export type SpecificInjectionTokenComponent<
  Component extends React.ComponentType<any>,
> = Component & SpecificInjectionToken2<() => Component>;

export type InjectionTokenComponent<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent<Component>,
> = Component & InjectionToken2<() => Component, () => Component[], SpecificFactory>;

export declare function getInjectionTokenComponent<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent<Component>,
>(options: {
  id: string;
  PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
  decorable?: boolean;
  specificInjectionTokenFactory?: SpecificFactory;
}): InjectionTokenComponent<Component, SpecificFactory>;

export type SpecificInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
> = Component & SpecificInjectionToken2<() => Component>;

export type InjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent2<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent2<Component>,
> = Component & InjectionToken2<() => Component, () => Component[], SpecificFactory>;

export declare function getInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent2<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent2<Component>,
>(options: {
  id: string;
  PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
  decorable?: boolean;
  specificInjectionTokenFactory?: SpecificFactory;
}): InjectionTokenComponent2<Component, SpecificFactory>;

export type AbstractInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent2<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent2<Component>,
> = AbstractInjectionToken2<() => Component, () => Component[], SpecificFactory>;

export declare function getAbstractInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent2<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent2<Component>,
>(options: {
  id: string;
  PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
  decorable?: boolean;
  specificInjectionTokenFactory?: SpecificFactory;
}): AbstractInjectionTokenComponent2<Component, SpecificFactory>;

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
