import curry from 'lodash/fp/curry';

import delay from '../../../doings/delay/delay';

export default curry((regulationMilliseconds, iterable) =>
  (async function*() {
    for await (const i of iterable) {
      yield i;
      await delay(regulationMilliseconds, undefined);
    }
  })(),
);
