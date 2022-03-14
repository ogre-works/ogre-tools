export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    name: 'Singleton',
    shortName: 'S',
    color: 'lightGreen',
    getInstanceKey: () => storedInstanceKey,
  },

  keyedSingleton: ({ getInstanceKey }) => ({
    name: 'Keyed',
    shortName: 'K',
    color: 'pink',
    getInstanceKey,
  }),

  transient: {
    name: 'Transient',
    shortName: 'T',
    color: 'orchid',
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
