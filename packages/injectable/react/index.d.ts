/// <reference types="react" />
import {
  DiContainer,
  DiContainerForInjection,
  Factory,
  Injectable,
  Injectable2,
  InjectionToken,
  InjectionToken2Base,
  SpecificInjectionToken,
} from '@ogre-tools/injectable';

// A hook injects a single implementation, so a token it is given must be
// declared 'one'; the many-cardinalities go through `di.injectMany`. Pinned
// to `undefined` (not `any`) for the factory slot: a token with a factory is
// abstract, and a hook can't render an abstract token — see the comment on
// core's `InjectionToken2`.
export function useInject<F extends Factory>(
  injectable: Injectable2<F> | (InjectionToken2Base<F, any, 'one'> & { readonly __abstract?: never }),
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
  injectable: Injectable2<F> | (InjectionToken2Base<F, any, 'one'> & { readonly __abstract?: never }),
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
  alias: (InjectionToken2Base<F, any, 'one'> & { readonly __abstract?: never }),
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
    injectionToken?: InjectionToken2Base<() => Component, any> & {
      readonly __abstract?: never;
    };
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

// Defaults to `any`, not a concrete factory shape: a bare
// `InjectionTokenComponent2<Component>` means "a token component, abstract
// or not" — see the comment on core's `InjectionToken2`. The factory's
// return type is bounded by `SpecificInjectionTokenComponent2<Component, any>`
// (declared below): every `.for()` factory must return something with
// `speciality`, same as core's `InjectionToken2` — enforced here so
// `buildTokenComponent`'s memoization-by-speciality always has something to
// key on.
//
// The `Component &` intersection only applies when not abstract: the
// runtime object is technically still a callable function either way (the
// same `target: ComponentForReact` is assigned regardless of whether a
// factory was given — see `buildTokenComponent`), but an abstract token
// component must not type-check as `React.ComponentType` — rendering it
// throws at runtime (`useInject` rejects abstract tokens). This must stay a
// naked conditional for the same distribute-over-`any` reason documented on
// core's `InjectionToken2`.
export type InjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends
    | undefined
    | ((...args: any[]) => SpecificInjectionTokenComponent2<Component, any>) = any,
> = SpecificFactory extends undefined
  ? Component &
      InjectionToken2Base<() => Component, () => Component[], 'one'> & {
        readonly __abstract?: never;
      }
  : InjectionToken2Base<() => Component, () => Component[], 'one'> & {
      readonly __abstract: true;
      for: SpecificFactory;
    };

// Defaults to no factory: the speciality-carrying overload of
// `getInjectionTokenComponent2` below builds these as leaves, with no
// further `.for()` of their own, unless given one explicitly — mirroring
// core's `SpecificInjectionToken2`. Built from `InjectionTokenComponent2`
// rather than repeating its conditional: when `SpecificFactory` is
// `undefined` this is the directly-renderable concrete leaf, `Component &
// ...token... & {speciality}`; otherwise it's the abstract,
// not-a-`Component` branch plus `speciality` — a specific token component
// that is itself a family root for nested specificity.
export type SpecificInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
  SpecificFactory extends
    | undefined
    | ((...args: any[]) => SpecificInjectionTokenComponent2<Component, any>) = undefined,
> = InjectionTokenComponent2<Component, SpecificFactory> & { speciality: any };

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
// rather than one optional parameter, and `SpecificFactory` must not have a
// default either — in a multi-level `.for()` family a default erases a
// nested generic factory's type parameters to `any` (see the comment on
// core's `InjectionToken2FactoryCallFromSlots`).
export interface InjectionTokenComponent2FactoryCall<
  Component extends React.ComponentType<any>,
> {
  (): InjectionTokenComponent2<Component, undefined>;

  <
    SpecificFactory extends (
      ...args: any[]
    ) => SpecificInjectionTokenComponent2<Component, any>,
  >(
    specificInjectionTokenFactory: SpecificFactory,
  ): InjectionTokenComponent2<Component, SpecificFactory>;
}

// A single, non-curried call — `Component` is the only type parameter here,
// so there's nothing for its explicit type argument to force a default on.
// `getInjectionTokenComponent2<Component>(options)()` uses the default
// `.for(id)` factory; `getInjectionTokenComponent2<Component>(options)(specificInjectionTokenFactory)`
// keeps a generic factory's own signature intact. Declared before the
// explicit-SF escape hatch below: TS overload resolution commits to the
// first overload whose generics resolve at all (falling back to constraints
// when nothing forces inference), so with the explicit-SF overload first, a
// call giving neither `<Component>` nor `<Component, SpecificFactory>` (e.g.
// `getInjectionTokenComponent2({...})()`) would wrongly resolve
// `SpecificFactory` to that overload's own constraint instead of `undefined`.
export declare function getInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component>,
): InjectionTokenComponent2FactoryCall<Component>;

// getInjectionTokenComponent2<Component, SpecificFactory>(options)(specificInjectionTokenFactory?):
// the explicit-SF escape hatch, flattened (options first, factory an
// optional trailing call) rather than curried: since `SpecificFactory` is
// already fixed explicitly, nothing on the options call needs inferring
// from it. Needed for a `.for()` factory whose return type
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

// Mirrors `InjectionTokenComponent2FactoryCall`, narrowed to
// `SpecificInjectionTokenComponent2`: returned by the `speciality`-carrying
// overload of `getInjectionTokenComponent2` below, which folds what used to
// be the separate `getSpecificInjectionTokenComponent2` creator into
// `getInjectionTokenComponent2` itself.
export interface SpecificInjectionTokenComponent2FactoryCall<
  Component extends React.ComponentType<any>,
> {
  (): SpecificInjectionTokenComponent2<Component, undefined>;

  <
    SpecificFactory extends (
      ...args: any[]
    ) => SpecificInjectionTokenComponent2<Component, any>,
  >(
    specificInjectionTokenFactory: SpecificFactory,
  ): SpecificInjectionTokenComponent2<Component, SpecificFactory>;
}

// getInjectionTokenComponent2<Component>(options) where options carries
// `speciality`: builds a specific token component directly, folding in what
// used to be the separate getSpecificInjectionTokenComponent2 creator —
// buildTokenComponent already threads `speciality` through to core's
// getInjectionToken2 regardless of which overload is called, so this needed
// no runtime change, only a type declaration. Unlike the old
// getSpecificInjectionTokenComponent2, this also accepts a factory (curried,
// same as every other getInjectionTokenComponent2 call), so a specific token
// component can itself be a family root for nested specificity — which
// makes it abstract too, same as any other factory-bearing token component
// (see the comment on `InjectionTokenComponent2`). Unlike core's equivalent
// speciality overload, this needs no cardinality-literal split: a
// component's cardinality is hardcoded to `'one'`, so there's no generic
// cardinality inference here to collapse.
export declare function getInjectionTokenComponent2<
  Component extends React.ComponentType<any>,
>(
  options: InjectionTokenComponentOptionsWithoutFactory<Component> & {
    speciality: any;
  },
): SpecificInjectionTokenComponent2FactoryCall<Component>;

export const DiContextProvider: React.Provider<DiContainer | DiContainerForInjection>;

// The container the nearest DiContextProvider holds. For a hook that has to
// inject aliases decided by its caller, and therefore cannot be an injectable
// declaring them as consumptions.
export function useDi(): DiContainerForInjection;

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
