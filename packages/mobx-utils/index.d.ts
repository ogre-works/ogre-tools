import { IComputedValue } from 'mobx';
import type { IEqualsComparer } from 'mobx';

/**
 * @deprecated Along with {@link asyncComputed}. Nothing in this type says who
 * keeps the value alive, which is exactly the problem.
 */
export type IAsyncComputed<TValue, TPending> = {
  value: IComputedValue<TValue | TPending>;
  pending: IComputedValue<boolean>;
  invalidate: () => void;
};

type AsyncComputedParams<TValue, TPending> = {
  getValueFromObservedPromise: () => Promise<TValue>;
  valueWhenPending?: TValue | TPending;
  betweenUpdates?: 'show-pending-value' | 'show-latest-value';
  equals?: IEqualsComparer<TValue | TPending>;
};

/**
 * @deprecated Use a subscribable instead: something live exactly while it has
 * subscribers, subscribed from a `useEffect` so React owns the disposal, kept
 * alive across a grace period so a remount does not refetch, and resolving a
 * promise for its first populated value.
 *
 * `asyncComputed` decides when to load from MobX observation
 * (`onBecameObserved`/`onBecameUnobserved`), which was sound when a React
 * render meant a mount. Modern React no longer reports it faithfully:
 * concurrent rendering may render a tree that never commits, so the load runs
 * for output that is discarded; StrictMode mounts, unmounts and remounts
 * deliberately, so the value is refetched under a component that never left
 * the screen; and a suspended subtree or a swapped-in spinner unmounts the one
 * observer keeping the data alive, right as it was about to arrive.
 */
export function asyncComputed<TValue, TPending = undefined>(
  configuration: AsyncComputedParams<TValue, TPending>,
): IAsyncComputed<TValue, TPending>;
