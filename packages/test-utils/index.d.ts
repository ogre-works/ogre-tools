export const getPromiseStatus: (promise: Promise<unknown>) => Promise<{
  fulfilled: boolean;
}>;

export const flushPromises: () => Promise<void>;
