import flushPromises from '../flushPromises/flushPromises';

export default async promise => {
  const status = { fulfilled: false };

  promise.finally(() => {
    status.fulfilled = true;
  });

  await flushPromises();

  return status;
};
