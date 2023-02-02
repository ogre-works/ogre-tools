import curry from 'lodash/fp/curry';
import getResolvablePromise from '../../shared/getResolvablePromise/getResolvablePromise';

export default curry((bufferSize, iterable) => {
  const nexts = new Set([getResolvablePromise()]);
  nexts.bufferSize = bufferSize;

  let returnValue;
  let bufferHasReturned;

  const produceNext = produceNewNextFor(nexts);

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

  patchIterableToBuffer(iterable, doYield, doReturn);

  return {
    async *[Symbol.asyncIterator]() {
      if (bufferHasReturned) {
        return returnValue;
      }

      while (true) {
        const { value, done } = await consumeNextBeingServed(nexts);

        if (done) {
          bufferHasReturned = true;
          returnValue = value;
          return value;
        } else {
          yield value;
        }
      }
    },
  };
});

const patchIterableToBuffer = async (iterable, doYield, doReturn) => {
  for await (const i of iterable) {
    await doYield(i);
  }

  doReturn();
};

const produceNewNextFor =
  nexts =>
  async ({ value, done }) => {
    const unresolvedNext = last(nexts);

    unresolvedNext.resolve({
      value,
      done,
    });

    if (nexts.size > nexts.bufferSize) {
      nexts.untilBufferHasRoom = getResolvablePromise();
      await nexts.untilBufferHasRoom;
    }

    nexts.add(getResolvablePromise());
  };

const last = iterable => [...iterable].slice(-1)[0];

const consumeNextBeingServed = async nexts => {
  const [nextBeingServed] = nexts;

  const { value, done } = await nextBeingServed;

  nexts.delete(nextBeingServed);

  if (nexts.untilBufferHasRoom && nexts.size <= nexts.bufferSize) {
    nexts.untilBufferHasRoom.resolve();
  }

  return { value, done };
};
