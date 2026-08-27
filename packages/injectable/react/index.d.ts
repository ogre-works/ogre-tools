/// <reference types="react" />
import {
  AbstractInjectionToken2,
  DiContainer,
  DiContainerForInjection,
  Factory,
  Injectable,
  Injectable2,
  InjectionToken,
  InjectionToken2,
  SpecificInjectionToken,
  SpecificInjectionToken2,
} from '@ogre-tools/injectable';

// A hook injects a single implementation, so a token it is given must be
// declared 'one'; the many-cardinalities go through `di.injectMany`.
export function useInject<F extends Factory>(
  injectable: Injectable2<F> | InjectionToken2<F, any, any, 'one'>,
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

export function useInjectDeferred<F extends Factory>(
  injectable: Injectable2<F> | InjectionToken2<F, any, any, 'one'>,
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

export function useInject2<F extends Factory>(alias: Injectable2<F>): F;
export function useInject2<F extends Factory>(
  alias: InjectionToken2<F, any, any, 'one'>,
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

type ExcludedKeys = 'instantiate' | 'lifecycle' | 'scope' | 'injectionToken' | "aliasType";

export declare function getInjectableComponent<
  Component extends React.ComponentType<any>
>(
  injectable: Omit<Injectable<Component>, ExcludedKeys> & {
    id: string;
    Component: Component;
    PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
    injectionToken?: InjectionToken<Component> | InjectionToken<React.ComponentType<
      unknown extends React.ComponentProps<Component> ? any : React.ComponentProps<Component>
    >>;
  },
): InjectableComponent<Component>;

export type InjectableComponent2<Component extends React.ComponentType<any>> =
  Component & Injectable2<() => Component>;

type ExcludedKeys2 = 'aliasType' | 'instantiate' | 'injectionToken';

export declare function getInjectableComponent2<
  Component extends React.ComponentType<any>
>(
  injectable: Omit<Injectable2<() => Component>, ExcludedKeys2> & {
    id: string;
    Component: Component;
    PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
    injectionToken?: InjectionToken2<() => Component, any, any>;
  },
): InjectableComponent2<Component>;

export type SpecificInjectionTokenComponent<
  Component extends React.ComponentType<any>,
> = Component & SpecificInjectionToken<Component>;

export type InjectionTokenComponent<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent<Component> = (
    id: string,
  ) => SpecificInjectionTokenComponent<Component>,
> = Component & InjectionToken<Component, void, SpecificFactory>;

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
  specificInjectionTokenFactory?: SpecificFactory;
  tags?: string[];
}): InjectionTokenComponent<Component, SpecificFactory>;

export type SpecificInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
> = Component &
  SpecificInjectionToken2<() => Component, () => Component[], any, 'one'>;

// Builds the specific component token a `specificInjectionTokenFactory`
// returns — mirrors `getSpecificInjectionToken2` in the core package, but
// unlike it, needs no curry: core's version defers `cardinality` to a
// second call because it's generic there and inferring it alongside an
// explicit `F`/`MF` on the same call would collapse it to the wide
// `Cardinality` union (same failure mode documented throughout this file).
// A component's cardinality is hardcoded to `'one'`
// (see `SpecificInjectionTokenComponent2` above) — nothing generic is left
// to infer, so `Component` explicit and `options` on the same call is safe.
export declare function getSpecificInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component> & {
    speciality: any;
  },
): SpecificInjectionTokenComponent2<Component>;

export type InjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends
    | undefined
    | ((...args: any[]) => SpecificInjectionTokenComponent2<Component>) = (
    id: string,
  ) => SpecificInjectionTokenComponent2<Component>,
> = Component &
  InjectionToken2<() => Component, () => Component[], SpecificFactory, 'one'>;

export interface InjectionTokenComponentOptionsWithoutFactory<
  Component extends React.ComponentType<any>,
> {
  id: string;
  PlaceholderComponent?: React.ComponentType<React.ComponentProps<Component>>;
  tags?: string[];
}

// Returned by `getInjectionTokenComponent2<Component>(options)` below.
// Calling it with no arguments gives a token with no `.for` at all — see the
// comment on core's `InjectionToken2`; calling it with a factory value keeps
// that factory's own generic signature intact in `SpecificFactory` — an
// *optional* slot (property or positional parameter) collapses a generic
// factory's signature instead, which is why this is two genuine overloads
// rather than one optional parameter.
export interface InjectionTokenComponent2FactoryCall<
  Component extends React.ComponentType<any>,
> {
  (): InjectionTokenComponent2<Component, undefined>;

  <
    SpecificFactory extends (
      ...args: any[]
    ) => SpecificInjectionTokenComponent2<Component> = (
      id: string,
    ) => SpecificInjectionTokenComponent2<Component>,
  >(
    specificInjectionTokenFactory: SpecificFactory,
  ): InjectionTokenComponent2<Component, SpecificFactory>;
}

// getInjectionTokenComponent2<Component, SpecificFactory>(options)(specificInjectionTokenFactory?):
// the explicit-SF escape hatch, mirroring the equivalent overload of
// `getInjectionToken2` in the core package — see the comment there for why
// this is flattened (options first, factory an optional trailing call)
// rather than curried. Needed for a `.for()` factory whose return type
// narrows the general contract per specifier (e.g. via `TypedSpecifierType`)
// in a way inference from a real value could never reconstruct — spelling
// `SpecificFactory` out here lets that type be declared without needing to
// construct a matching runtime value.
export declare function getInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) => SpecificInjectionTokenComponent2<Component>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component>,
): (
  specificInjectionTokenFactory?: SpecificFactory,
) => InjectionTokenComponent2<Component, SpecificFactory>;

// A single, non-curried call — `Component` is the only type parameter here,
// so there's nothing for its explicit type argument to force a default on.
// `getInjectionTokenComponent2<Component>(options)()` uses the default
// `.for(id)` factory; `getInjectionTokenComponent2<Component>(options)(specificInjectionTokenFactory)`
// keeps a generic factory's own signature intact.
export declare function getInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component>,
): InjectionTokenComponent2FactoryCall<Component>;

// `SpecificFactory` may return either a concrete `SpecificInjectionTokenComponent2`
// or another `AbstractInjectionTokenComponent2` — the latter is what lets a
// family narrow across more than one `.for()` level (each level's factory
// returning a further abstract family of its own), mirroring
// `AbstractInjectionToken2`'s own `SpecificFactory` constraint in the core
// package.
export type AbstractInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) =>
    | SpecificInjectionTokenComponent2<Component>
    | AbstractInjectionTokenComponent2<Component, any> = (
    id: string,
  ) => SpecificInjectionTokenComponent2<Component>,
> = AbstractInjectionToken2<
  () => Component,
  () => Component[],
  SpecificFactory,
  'one'
>;

// Mirrors `InjectionTokenComponent2FactoryCall` above, except there is no
// empty-call arm: an abstract token component is a family by definition, so
// it always needs a real `.for()` factory to resolve into.
export interface AbstractInjectionTokenComponent2FactoryCall<
  Component extends React.ComponentType<any>,
> {
  <
    SpecificFactory extends (
      ...args: any[]
    ) =>
      | SpecificInjectionTokenComponent2<Component>
      | AbstractInjectionTokenComponent2<Component, any> = (
      id: string,
    ) => SpecificInjectionTokenComponent2<Component>,
  >(
    specificInjectionTokenFactory: SpecificFactory,
  ): AbstractInjectionTokenComponent2<Component, SpecificFactory>;
}

// Mirrors the `getInjectionTokenComponent2` explicit-SF overload above.
export declare function getAbstractInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends (
    ...args: any[]
  ) =>
    | SpecificInjectionTokenComponent2<Component>
    | AbstractInjectionTokenComponent2<Component, any>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component>,
): (
  specificInjectionTokenFactory?: SpecificFactory,
) => AbstractInjectionTokenComponent2<Component, SpecificFactory>;

export declare function getAbstractInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component>,
): AbstractInjectionTokenComponent2FactoryCall<Component>;

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
