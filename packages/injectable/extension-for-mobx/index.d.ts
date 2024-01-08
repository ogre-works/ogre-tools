import {
  DiContainer,
  Injectable,
  InjectionInstanceWithMeta,
  InjectionToken,
} from '@lensapp/injectable';
import { IComputedValue } from 'mobx';

export function registerMobX(di: DiContainer): void;

export const computedInjectManyInjectable: Injectable<
  <
    TInjectionToken extends InjectionToken<any, any>,
    TInstance extends TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => IComputedValue<TInstance[]>,
  unknown
>;

export const computedInjectManyWithMetaInjectable: Injectable<
  <
    TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta extends TInjectionToken extends InjectionToken<
      infer T,
      any
    >
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
    ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
  ) => IComputedValue<TInstanceWithMeta[]>,
  unknown
>;
