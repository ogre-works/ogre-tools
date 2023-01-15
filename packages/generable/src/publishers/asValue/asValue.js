import getResolvablePromise from '../../shared/getResolvablePromise/getResolvablePromise';

export default iterable => {
  let next = getResolvablePromise();
  let untilNextIsConsumed = getResolvablePromise();

  let currentValue;
  let currentValueExists;
  let returnValue;
  let returnValueExists;
  let iteratingHasStarted = false;

  const produceNext = async ({ value, done }) => {
    next.resolve({
      value,
      done,
    });

    untilNextIsConsumed = getResolvablePromise();
    await untilNextIsConsumed;

    next = getResolvablePromise();
  };

  const doYield = async value =>
    await produceNext({
      value,
      done: false,
    });

  const doReturn = value => {
    produceNext({
      value,
      done: true,
    });
  };

  const consumeNext = async () => {
    const { value, done } = await next;

    untilNextIsConsumed.resolve();

    return { value, done };
  };

  return {
    async *[Symbol.asyncIterator]() {
      if (!iteratingHasStarted) {
        iteratingHasStarted = true;
        startIteration(iterable, doYield, doReturn);
      }

      if (returnValueExists) {
        return returnValue;
      }

      if (currentValueExists) {
        yield currentValue;
      }

      while (true) {
        const { value, done } = await consumeNext();

        if (done) {
          returnValueExists = true;
          returnValue = value;
          return value;
        } else {
          currentValueExists = true;
          currentValue = value;
          yield value;
        }
      }
    },
  };
};

const startIteration = async (iterable, doYield, doReturn) => {
  for await (const i of iterable) {
    await doYield(i);
  }

  doReturn();
};
