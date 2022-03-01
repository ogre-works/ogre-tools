export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    name: 'Singleton',
    getInstanceKey: () => storedInstanceKey,
  },

  keyedSingleton: ({ getInstanceKey }) => ({ name: 'Keyed', getInstanceKey }),

  transient: {
    name: 'Transient',
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
