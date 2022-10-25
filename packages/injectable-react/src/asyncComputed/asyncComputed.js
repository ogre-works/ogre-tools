import { noop } from 'lodash/fp';
import { computed, createAtom, observable, runInAction, untracked } from 'mobx';

const neutralizeObsoletePromiseSymbol = Symbol.for(
  'neutralize-obsolete-promise',
);

export default ({ getValueFromObservedPromise, valueWhenPending }) => {
  const invalidateAtom = createAtom('invalidate');

  const pendingBox = observable.box(false);

  let neutralizeObsoletePromise = noop;

  const syncValueBox = observable.box(valueWhenPending, {
    name: 'sync-value-box-for-async-computed',
    deep: false,
  });

  const computedPromise = computed(
    () => {
      if (untracked(() => pendingBox.get()) === true) {
        neutralizeObsoletePromise();
      }

      invalidateAtom.reportObserved();

      runInAction(() => {
        pendingBox.set(true);
        syncValueBox.set(valueWhenPending);
      });

      return Promise.race([
        getValueFromObservedPromise(),

        new Promise(resolve => {
          neutralizeObsoletePromise = () =>
            resolve(neutralizeObsoletePromiseSymbol);
        }),
      ]);
    },
    {
      name: 'computed-promise-for-async-computed',
    },
  );

  const originalComputed = computed(
    () => {
      computedPromise.get().then(syncValue => {
        if (syncValue !== neutralizeObsoletePromiseSymbol) {
          runInAction(() => {
            pendingBox.set(false);
            syncValueBox.set(syncValue);
          });
        }
      });

      return syncValueBox.get();
    },

    {
      name: 'computed-promise-result-for-async-computed',
      keepAlive: true,
    },
  );

  return {
    value: originalComputed,

    invalidate: () => {
      runInAction(() => {
        invalidateAtom.reportChanged();
        pendingBox.set(true);
        syncValueBox.set(valueWhenPending);
      });
    },

    pending: computed(() => {
      originalComputed.get();

      return pendingBox.get();
    }),
  };
};
