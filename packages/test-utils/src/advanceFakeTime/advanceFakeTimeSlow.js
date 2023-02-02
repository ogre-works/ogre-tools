import flushPromises from '../flushPromises/flushPromises';

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
