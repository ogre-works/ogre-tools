import flushPromises from '../flushPromises/flushPromises';

export default async milliseconds => {
  const now = global.Date.now();
  global.Date.now = () => now + milliseconds;
  jest.advanceTimersByTime(milliseconds);
  await flushPromises();
};
