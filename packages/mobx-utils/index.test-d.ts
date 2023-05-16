import { expectType } from 'tsd';
import { asyncComputed } from './index';
import { IComputedValue } from 'mobx';

// asyncComputed, given showing latest value and specified pending value, typing is ok.
const instance1 = asyncComputed({
  getValueFromObservedPromise: () => Promise.resolve('some-value'),
  valueWhenPending: 'some-initial-value',
  betweenUpdates: 'show-latest-value',
});

expectType<{
  value: IComputedValue<string>;
  invalidate: () => void;
  pending: IComputedValue<boolean>;
}>(instance1);

// asyncComputed, given showing latest value but no specified pending value, typing is ok.
const instance2 = asyncComputed({
  getValueFromObservedPromise: () => Promise.resolve('some-value'),
  betweenUpdates: 'show-latest-value',
});

expectType<{
  value: IComputedValue<string | undefined>;
  invalidate: () => void;
  pending: IComputedValue<boolean>;
}>(instance2);

// asyncComputed, given showing pending value between updates and specified pending value, typing is ok.
const instance3 = asyncComputed({
  getValueFromObservedPromise: () => Promise.resolve('some-value'),
  valueWhenPending: 'some-initial-value',
  betweenUpdates: 'show-pending-value',
});

expectType<{
  value: IComputedValue<string>;
  invalidate: () => void;
  pending: IComputedValue<boolean>;
}>(instance1);

// asyncComputed, given showing pending value between updates, but no specified pending value, typing is ok.
const instance4 = asyncComputed({
  getValueFromObservedPromise: () => Promise.resolve('some-value'),
  betweenUpdates: 'show-pending-value',
});

expectType<{
  value: IComputedValue<string | undefined>;
  invalidate: () => void;
  pending: IComputedValue<boolean>;
}>(instance2);
