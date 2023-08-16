/* c8 ignore next */
import flushPromises from '../flushPromises/flushPromises';

/* c8 ignore next */
export default async milliseconds => {
  let now = global.Date.now();
  global.Date.now = () => now;

  do {
    await flushPromises();
    now++;
    jest.advanceTimersByTime(1);
    await flushPromises();
  } while (milliseconds--);
};
