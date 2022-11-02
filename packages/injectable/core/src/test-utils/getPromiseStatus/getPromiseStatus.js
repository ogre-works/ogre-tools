import flushPromises from '../flushPromises';

export default async promise => {
  const status = { fulfilled: false };

  promise.finally(() => {
    status.fulfilled = true;
  });

  await flushPromises();

  return status;
};
