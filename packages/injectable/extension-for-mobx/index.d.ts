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
