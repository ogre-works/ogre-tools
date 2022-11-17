import { IComputedValue } from 'mobx';

export type IAsyncComputed<T> = {
  value: IComputedValue<T>;
  pending: IComputedValue<boolean>;
  invalidate: () => void;
};

type AsyncComputedParams<T> = {
  getValueFromObservedPromise: () => Promise<T>;
  valueWhenPending?: T;
  betweenUpdates?: 'show-pending-value' | 'show-latest-value';
};

export function asyncComputed<T>(
  configuration: AsyncComputedParams<T>,
): IAsyncComputed<T>;
