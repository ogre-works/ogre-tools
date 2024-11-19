import { isPromise } from '@lensapp/fp';

const status = Symbol.for('status-of-promise-for-use-hook');
const result = Symbol.for('result-of-promise-for-use-hook');
const rejection = Symbol.for('rejection-of-promise-for-use-hook');

// Note: this is an approximated "use" for when real "use" of React 19 is not yet available.
export const use = maybePromise => {
  if (!isPromise(maybePromise)) {
    return maybePromise;
  }

  const promise = maybePromise;

  switch (promise[status]) {
    case 'fulfilled':
      return promise[result];

    case 'rejected':
      throw promise[rejection];

    case 'pending':
      throw promise;

    default:
      promise[status] = 'pending';

      promise.then(
        r => {
          promise[status] = 'fulfilled';
          promise[result] = r;
        },

        e => {
          promise[status] = 'rejected';
          promise[rejection] = e;
        },
      );

      throw promise;
  }
};
