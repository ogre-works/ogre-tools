import {
  DiContainer,
  Factory,
  InjectionInstanceWithMeta,
  InjectionToken,
  InjectionToken2Base,
  ManyFactory,
  SingleInjectionToken2,
} from '@ogre-tools/injectable';
import { IComputedValue } from 'mobx';

export function registerMobX(di: DiContainer): void;

type ComputedInjectMany = {
  // InjectionToken2, abstract or not: variadic, returns IComputedValue of a
  // plain array element-typed by the token's many-factory, so a custom
  // multi-factory narrows it (normalized like v1 injectMany in the core)
  <F extends Factory, MF extends ManyFactory<F>>(
    injectionToken: InjectionToken2Base<F, MF, 'zero-or-many' | 'one-or-many'>,
    ...params: Parameters<F>
  ): IComputedValue<ReturnType<MF> extends (infer R)[] ? R[] : never>;

  // Old-style InjectionToken
  <TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ): IComputedValue<TInstance[]>;
};

type ComputedInjectManyWithMeta = {
  // InjectionToken2, abstract or not: variadic, returns IComputedValue of
  // instance-with-meta array, element-typed by the token's many-factory
  <F extends Factory, MF extends ManyFactory<F>>(
    injectionToken: InjectionToken2Base<F, MF, 'zero-or-many' | 'one-or-many'>,
    ...params: Parameters<F>
  ): IComputedValue<
    InjectionInstanceWithMeta<ReturnType<MF> extends (infer R)[] ? R : never>[]
  >;

  // Old-style InjectionToken
  <TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta extends TInjectionToken extends InjectionToken<infer T, any>
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ): IComputedValue<TInstanceWithMeta[]>;
};

export const computedInjectManyInjectionToken: InjectionToken<ComputedInjectMany>;

export const computedInjectManyWithMetaInjectionToken: InjectionToken<ComputedInjectManyWithMeta>;

type ComputedInjectMaybe = {
  // InjectionToken2: variadic, returns IComputedValue of the token's
  // maybe-factory result (which always includes undefined)
  <
    F extends Factory,
    MF extends (...args: Parameters<F>) => ReturnType<F> | undefined,
  >(
    injectionToken: InjectionToken2Base<F, MF, 'zero-or-one'>,
    ...params: Parameters<F>
  ): IComputedValue<ReturnType<MF>>;

  // Old-style InjectionToken
  <TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ): IComputedValue<TInstance | undefined>;
};

export const computedInjectMaybeInjectionToken: InjectionToken<ComputedInjectMaybe>;

type ComputedInjectMaybeWithMeta = {
  // InjectionToken2: variadic, returns IComputedValue of the meta-wrapped
  // instance or undefined, typed by the token's maybe-factory
  <
    F extends Factory,
    MF extends (...args: Parameters<F>) => ReturnType<F> | undefined,
  >(
    injectionToken: InjectionToken2Base<F, MF, 'zero-or-one'>,
    ...params: Parameters<F>
  ): IComputedValue<
    InjectionInstanceWithMeta<Exclude<ReturnType<MF>, undefined>> | undefined
  >;

  // Old-style InjectionToken
  <TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta extends TInjectionToken extends InjectionToken<infer T, any>
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ): IComputedValue<TInstanceWithMeta | undefined>;
};

export const computedInjectMaybeWithMetaInjectionToken: InjectionToken<ComputedInjectMaybeWithMeta>;

// Factory-shape variants: `di.inject(X, token)` returns the bound callable
// (and `di.inject2(X)(token)` equivalently). The callable is the token's
// ManyFactory for ComputedInjectMany2 — generics on the token propagate.
// WithMeta2 returns the token's with-meta many-template verbatim: by default
// that derives from the many-factory (collapsing a generic to its
// constraint), and a token that declares the slot explicitly keeps its
// generic — same mechanism as InjectManyWithMeta2 in the core package.
// Maybe2 needs none of this: a 'zero-or-one' token carries its maybe-factory,
// which is returned verbatim.

// Overload order matters on two fronts:
// 1) At call time, TS tries overloads top-to-bottom. InjectionToken (v1) has
//    a required `instantiationParameter` field that InjectionToken2 lacks,
//    so InjectionToken2 correctly falls through the v1 overload to the v2 one.
// 2) `Parameters<F>` / `ReturnType<F>` pick the LAST overload. `di.inject`
//    uses these on a token's Factory, so the v2 overload must be last for
//    `di.inject(computedInjectMany2InjectionToken, token)(...)` to infer MF.

type ComputedInjectMany2 = {
  <TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => TInstance[];

  <
    F extends Factory,
    MF extends (...args: Parameters<F>) => ReturnType<F>[],
  >(
    injectionToken: InjectionToken2Base<F, MF, 'zero-or-many' | 'one-or-many'>,
  ): MF;
};

export const computedInjectMany2InjectionToken: SingleInjectionToken2<ComputedInjectMany2>;

type ComputedInjectManyWithMeta2 = {
  <TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta extends TInjectionToken extends InjectionToken<infer T, any>
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => TInstanceWithMeta[];

  <F extends Factory, WMF>(
    injectionToken: InjectionToken2Base<
      F,
      any,
      'zero-or-many' | 'one-or-many',
      any,
      WMF
    >,
  ): WMF;
};

export const computedInjectManyWithMeta2InjectionToken: SingleInjectionToken2<ComputedInjectManyWithMeta2>;

type ComputedInjectMaybe2 = {
  <TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => TInstance | undefined;

  // Keyed on the token's own maybe-factory rather than recomputed from
  // Parameters<F> / ReturnType<F>, so a generic factory keeps its generic.
  <
    F extends Factory,
    MF extends (...args: Parameters<F>) => ReturnType<F> | undefined,
  >(
    injectionToken: InjectionToken2Base<F, MF, 'zero-or-one'>,
  ): MF;
};

export const computedInjectMaybe2InjectionToken: SingleInjectionToken2<ComputedInjectMaybe2>;

type ComputedInjectMaybeWithMeta2 = {
  <TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta extends TInjectionToken extends InjectionToken<infer T, any>
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => TInstanceWithMeta | undefined;

  // Returns the token's with-meta consumption template verbatim — for a
  // 'zero-or-one' token that is `(...args) => InjectionInstanceWithMeta<R> |
  // undefined` by default, and an explicitly declared generic slot survives.
  <F extends Factory, WMF>(
    injectionToken: InjectionToken2Base<F, any, 'zero-or-one', any, WMF>,
  ): WMF;
};

export const computedInjectMaybeWithMeta2InjectionToken: SingleInjectionToken2<ComputedInjectMaybeWithMeta2>;
