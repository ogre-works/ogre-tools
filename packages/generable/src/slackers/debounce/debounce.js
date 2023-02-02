import curry from 'lodash/fp/curry';
import getResolvablePromise from '../../shared/getResolvablePromise/getResolvablePromise';

export default curry((debounceMilliseconds, iterable) => {
  let debouncedValue = getResolvablePromise();

  const setDebouncedValue = internalDebounce(debounceMilliseconds, value => {
    debouncedValue.resolve({ value, done: false });
    debouncedValue = getResolvablePromise();
  });

  const setUndebouncedReturn = () => {
    debouncedValue.resolve({ done: true });
  };

  const startDebouncingValues = async iterable => {
    let iterableHadValues = false;

    for await (const value of iterable) {
      iterableHadValues = true;
      setDebouncedValue(value);
    }

    if (iterableHadValues) {
      await debouncedValue;
    }

    setUndebouncedReturn();
  };

  return (async function* () {
    startDebouncingValues(iterable);

    while (true) {
      const { value, done } = await debouncedValue;

      if (!done) {
        yield value;
      } else {
        return;
      }
    }
  })();
});

const internalDebounce = (debounceMilliseconds, func) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), debounceMilliseconds);
  };
};
