export const nonStoredInstanceKey = Symbol('non-stored-instance-key');
export const storedInstanceKey = Symbol('stored-instance-key');

export default {
  singleton: {
    id: 'singleton',

    getInstanceKey: (di, instantiationParameter) => {
      if (instantiationParameter) {
        const injectableId = di.context.at(-1).injectable.id;

        throw new Error(
          `Tried to inject singleton "${injectableId}", but illegally to singletons, an instantiationParameter was provided: "${instantiationParameter}".`,
        );
      }

      return storedInstanceKey;
    },
  },

  keyedSingleton: ({ getInstanceKey }) => ({
    id: 'keyedSingleton',
    getInstanceKey: getInstanceKey,
  }),

  transient: {
    id: 'transient',
    getInstanceKey: () => nonStoredInstanceKey,
  },
};
