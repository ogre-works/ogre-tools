import {
  AbstractInjectionToken2,
  DiContainer,
  Factory,
  InjectionInstanceWithMeta,
  InjectionToken,
  InjectionToken2,
} from '@ogre-tools/injectable';
import { IComputedValue } from 'mobx';

export function registerMobX(di: DiContainer): void;

type ComputedInjectMany = {
  // InjectionToken2 / AbstractInjectionToken2: variadic, returns IComputedValue of instance array
  <F extends Factory>(
    injectionToken: InjectionToken2<F> | AbstractInjectionToken2<F>,
    ...params: Parameters<F>
  ): IComputedValue<ReturnType<F>[]>;

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
  // InjectionToken2 / AbstractInjectionToken2: variadic, returns IComputedValue of instance-with-meta array
  <F extends Factory>(
    injectionToken: InjectionToken2<F> | AbstractInjectionToken2<F>,
    ...params: Parameters<F>
  ): IComputedValue<InjectionInstanceWithMeta<ReturnType<F>>[]>;

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
  // InjectionToken2: variadic, returns IComputedValue of instance or undefined
  <F extends Factory>(
    injectionToken: InjectionToken2<F>,
    ...params: Parameters<F>
  ): IComputedValue<ReturnType<F> | undefined>;

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

// Factory-shape variants: `di.inject(X, token)` returns the bound callable
// (and `di.inject2(X)(token)` equivalently). The callable is the token's
// ManyFactory for ComputedInjectMany2 — generics on the token propagate.
// For WithMeta2 / Maybe2 there is no ManyFactory sibling on InjectionToken2,
// so they synthesize from Parameters<F> / ReturnType<F> (same limitation as
// InjectManyWithMeta2 / InjectWithMeta2 in the core package).

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
    injectionToken: InjectionToken2<F, MF> | AbstractInjectionToken2<F, MF>,
  ): MF;
};

export const computedInjectMany2InjectionToken: InjectionToken2<ComputedInjectMany2>;

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

  <F extends Factory>(
    injectionToken: InjectionToken2<F> | AbstractInjectionToken2<F>,
  ): (...params: Parameters<F>) => InjectionInstanceWithMeta<ReturnType<F>>[];
};

export const computedInjectManyWithMeta2InjectionToken: InjectionToken2<ComputedInjectManyWithMeta2>;

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

  <F extends Factory>(
    injectionToken: InjectionToken2<F>,
  ): (...params: Parameters<F>) => ReturnType<F> | undefined;
};

export const computedInjectMaybe2InjectionToken: InjectionToken2<ComputedInjectMaybe2>;
