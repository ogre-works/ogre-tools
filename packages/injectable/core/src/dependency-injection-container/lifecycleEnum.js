export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    id: 'singleton',

    getInstanceKey: (di, ...args) => {
      if (args.length > 0) {
        throw new Error(
          `Tried to inject a singleton, but illegally to singletons, instantiationParameters were provided: "${args}".`,
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
