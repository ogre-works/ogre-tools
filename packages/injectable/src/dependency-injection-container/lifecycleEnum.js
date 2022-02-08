export const nonStoredInstanceKey = Symbol('non-stored-instance-key');

export default {
  singleton: {
    getInstanceKey: () => 'singleton',
  },

  keyedSingleton: ({ getInstanceKey }) => ({ getInstanceKey }),

  transient: {
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
