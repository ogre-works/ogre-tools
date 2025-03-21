import {
  DiContainer,
  Injectable,
  InjectionInstanceWithMeta,
  InjectionToken,
} from '@lensapp/injectable';
import { IComputedValue } from 'mobx';

export function registerMobX(di: DiContainer): void;

type ComputedInjectMany = <
  TInjectionToken extends InjectionToken<any, any>,
  TInstance extends TInjectionToken extends InjectionToken<infer T, any>
    ? T
    : never,
>(
  injectionToken: TInjectionToken,
  ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
) => IComputedValue<TInstance[]>;

type ComputedInjectManyWithMeta = <
  TInjectionToken extends InjectionToken<any, any>,
  TInstanceWithMeta extends TInjectionToken extends InjectionToken<infer T, any>
    ? InjectionInstanceWithMeta<T>
    : never,
>(
  injectionToken: TInjectionToken,
  ...param: TInjectionToken extends InjectionToken<any, infer T> ? [T] : []
) => IComputedValue<TInstanceWithMeta[]>;

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
