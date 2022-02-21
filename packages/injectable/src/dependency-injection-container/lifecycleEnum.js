export const nonStoredInstanceKey = Symbol('non-stored-instance-key');

export default {
  singleton: {
    name: 'Singleton',
    getInstanceKey: () => 'singleton',
  },

  keyedSingleton: ({ getInstanceKey }) => ({ name: 'Keyed', getInstanceKey }),

  transient: {
    name: 'Transient',
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
