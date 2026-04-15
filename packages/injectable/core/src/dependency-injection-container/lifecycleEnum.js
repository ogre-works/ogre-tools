export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    id: 'singleton',

    getInstanceKey: (di, instantiationParameter) => {
      if (instantiationParameter) {
        throw new Error(
          `Tried to inject a singleton, but illegally to singletons, an instantiationParameter was provided: "${instantiationParameter}".`,
        );
      }

      return storedInstanceKey;
    },
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
