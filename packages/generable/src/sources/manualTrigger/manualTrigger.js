import getResolvablePromise from '../../shared/getResolvablePromise/getResolvablePromise';

export default () => {
  const nexts = new Set([getResolvablePromise()]);

  const produceNext = produceNextFor(nexts);

  return {
    yield: async value =>
      await produceNext({
        value,
        done: false,
      }),

    return: value => {
      produceNext({
        value,
        done: true,
      });
    },

    async *[Symbol.asyncIterator]() {
      while (true) {
        const { value, done } = await consumeNextBeingServed(nexts);

        if (done) {
          return value;
        } else {
          yield value;
        }
      }
    },
  };
};

const produceNextFor = nexts => ({ value, done }) => {
  const unresolvedNext = last(nexts);

  unresolvedNext.resolve({
    value,
    done,
  });

  nexts.add(getResolvablePromise());
};

const last = iterable => [...iterable].slice(-1)[0];

const consumeNextBeingServed = async nexts => {
  const [nextBeingServed] = nexts;

  const { value, done } = await nextBeingServed;

  nexts.delete(nextBeingServed);

  return { value, done };
};
