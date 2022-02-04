export default {
  singleton: {
    getInstanceKey: () => 'singleton',
  },

  transient: {
    getInstanceKey: () => undefined,
  },
};
