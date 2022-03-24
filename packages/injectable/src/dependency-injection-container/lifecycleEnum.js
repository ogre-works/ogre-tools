export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    id: 'singleton',
    getInstanceKey: () => storedInstanceKey,
  },

  keyedSingleton: ({ getInstanceKey }) => ({
    id: 'keyedSingleton',
    getInstanceKey,
  }),

  transient: {
    id: 'transient',
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
