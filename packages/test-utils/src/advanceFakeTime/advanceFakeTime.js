/* c8 ignore next */
import flushPromises from '../flushPromises/flushPromises';

/* c8 ignore next */
export default async milliseconds => {
  const now = global.Date.now();
  global.Date.now = () => now + milliseconds;
  jest.advanceTimersByTime(milliseconds);
  await flushPromises();
};
