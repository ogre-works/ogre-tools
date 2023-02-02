export const getPromiseStatus: (promise: Promise<unknown>) => Promise<{
  fulfilled: boolean;
}>;

export const flushPromises: () => Promise<void>;

export const advanceFakeTime: (milliseconds: number) => Promise<void>;
export const advanceFakeTimeSlow: (milliseconds: number) => Promise<void>;
