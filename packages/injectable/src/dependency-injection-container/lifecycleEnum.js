export const nonStoredInstanceKey = Symbol('non-stored-instance-key');

export default {
  singleton: {
    getInstanceKey: () => 'singleton',
  },

  transient: {
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
