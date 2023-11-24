export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    id: 'singleton',

    getInstanceKey:
      di =>
      (...parameters) => {
        if (parameters.length) {
          const injectableId = di.context.at(-1).injectable.id;

          throw new Error(
            `Tried to inject singleton "${injectableId}", but illegally to singletons, instantiationParameters were provided: "${parameters}".`,
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
