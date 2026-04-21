import {
  DiContainer,
  Injectable,
  InjectionInstanceWithMeta,
  InjectionToken,
  InjectionToken2,
} from '@ogre-tools/injectable';
import { IComputedValue } from 'mobx';

export function registerMobX(di: DiContainer): void;

type ComputedInjectMany = {
  // InjectionToken2: variadic, returns IComputedValue of instance array
  <F extends (...args: any[]) => any>(
    injectionToken: InjectionToken2<F> & { readonly __abstract?: never },
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
  // InjectionToken2: variadic, returns IComputedValue of instance-with-meta array
  <F extends (...args: any[]) => any>(
    injectionToken: InjectionToken2<F> & { readonly __abstract?: never },
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

export const computedInjectManyInjectable: Injectable<
  ComputedInjectMany,
  unknown
>;

export const computedInjectManyInjectionToken: InjectionToken<ComputedInjectMany>;

export const computedInjectManyWithMetaInjectable: Injectable<
  ComputedInjectManyWithMeta,
  unknown
>;

export const computedInjectManyWithMetaInjectionToken: InjectionToken<ComputedInjectManyWithMeta>;

type ComputedInjectMaybe = {
  // InjectionToken2: variadic, returns IComputedValue of instance or undefined
  <F extends (...args: any[]) => any>(
    injectionToken: InjectionToken2<F> & { readonly __abstract?: never },
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

// Factory-shape variants: fn(token) returns (...params) => IComputedValue<...>
// — same relationship as di.inject vs di.inject2.

type ComputedInjectMany2 = {
  <F extends (...args: any[]) => any>(
    injectionToken: InjectionToken2<F> & { readonly __abstract?: never },
  ): (...params: Parameters<F>) => IComputedValue<ReturnType<F>[]>;

  <TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => IComputedValue<TInstance[]>;
};

export const computedInjectMany2Injectable: Injectable<
  ComputedInjectMany2,
  unknown
>;

export const computedInjectMany2InjectionToken: InjectionToken<ComputedInjectMany2>;

type ComputedInjectManyWithMeta2 = {
  <F extends (...args: any[]) => any>(
    injectionToken: InjectionToken2<F> & { readonly __abstract?: never },
  ): (...params: Parameters<F>) => IComputedValue<InjectionInstanceWithMeta<ReturnType<F>>[]>;

  <TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta extends TInjectionToken extends InjectionToken<infer T, any>
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => IComputedValue<TInstanceWithMeta[]>;
};

export const computedInjectManyWithMeta2Injectable: Injectable<
  ComputedInjectManyWithMeta2,
  unknown
>;

export const computedInjectManyWithMeta2InjectionToken: InjectionToken<ComputedInjectManyWithMeta2>;

type ComputedInjectMaybe2 = {
  <F extends (...args: any[]) => any>(
    injectionToken: InjectionToken2<F> & { readonly __abstract?: never },
  ): (...params: Parameters<F>) => IComputedValue<ReturnType<F> | undefined>;

  <TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
  ): (
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => IComputedValue<TInstance | undefined>;
};

export const computedInjectMaybe2Injectable: Injectable<
  ComputedInjectMaybe2,
  unknown
>;

export const computedInjectMaybe2InjectionToken: InjectionToken<ComputedInjectMaybe2>;
