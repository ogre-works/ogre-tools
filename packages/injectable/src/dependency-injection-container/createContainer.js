import conforms from 'lodash/fp/conforms';
import every from 'lodash/fp/every';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import findLast from 'lodash/fp/findLast';
import first from 'lodash/fp/first';
import forEach from 'lodash/fp/forEach';
import get from 'lodash/fp/get';
import includes from 'lodash/fp/includes';
import invoke from 'lodash/fp/invoke';
import lifecycleEnum from './lifecycleEnum';
import map from 'lodash/fp/map';
import reject from 'lodash/fp/reject';
import { pipeline } from '@ogre-tools/fp';

export default (...listOfGetRequireContexts) => {
  let injectables = [];
  let overridingInjectables = [];
  let sideEffectsArePrevented = false;
  let setupsHaveBeenRan = false;

  const getLifecycle = injectableKey =>
    getInjectable({
      injectables,
      alias: injectableKey,
      di,
    }).lifecycle;

  const di = {
    inject: (alias, instantiationParameter) => {
      const originalInjectable = getInjectable({
        injectables,
        alias,
        di,
      });

      const overriddenInjectable = getOverridingInjectable({
        overridingInjectables,
        alias,
      });

      const injectable = overriddenInjectable || originalInjectable;

      if (
        !setupsHaveBeenRan &&
        injectable.setup &&
        !injectable.isBeingSetupped
      ) {
        throw new Error(
          `Tried to inject setuppable "${injectable.id}" before setups are ran.`,
        );
      }

      if (sideEffectsArePrevented && injectable.causesSideEffects) {
        throw new Error(
          `Tried to inject "${injectable.id}" when side-effects are prevented.`,
        );
      }

      return injectable.lifecycle.getInstance({
        injectable,
        instantiationParameter,
        di,
      });
    },

    register: injectable => {
      if (!injectable.id) {
        throw new Error('Tried to register injectable without ID.');
      }

      injectables.push({
        ...injectable,

        aliases: [
          injectable,
          injectable.id,
          injectable.instantiate,
          ...(injectable.injectionToken ? [injectable.injectionToken] : []),
          ...(injectable.aliases || []),
        ],

        lifecycle: injectable.lifecycle || lifecycleEnum.singleton,

        permitSideEffects: function () {
          this.causesSideEffects = false;
        },
      });
    },

    override: (alias, instantiateStub) => {
      const originalInjectable = pipeline(
        injectables,
        find(getRelatedInjectables(alias)),
      );

      if (!originalInjectable) {
        throw new Error(
          `Tried to override "${alias.toString()}" which is not registered.`,
        );
      }

      overridingInjectables.push({
        ...originalInjectable,
        causesSideEffects: false,
        instantiate: instantiateStub,
      });
    },

    unoverride: alias => {
      overridingInjectables = pipeline(
        overridingInjectables,
        reject(getRelatedInjectables(alias)),
      );
    },

    reset: () => {
      overridingInjectables = [];
    },

    runSetups: () => {
      pipeline(
        injectables,

        map(originalInjectable => {
          const overridingInjectable = getOverridingInjectable({
            overridingInjectables,
            alias: originalInjectable.id,
          });

          return overridingInjectable
            ? overridingInjectable
            : originalInjectable;
        }),

        filter('setup'),
        forEach(injectable => {
          injectable.isBeingSetupped = true;
          injectable.setup(di);
          injectable.isBeingSetupped = false;
        }),
      );

      setupsHaveBeenRan = true;
    },

    preventSideEffects: () => {
      sideEffectsArePrevented = true;
    },

    permitSideEffects: alias => {
      getInjectable({ injectables, alias, di }).permitSideEffects();
    },

    getLifecycle,

    purge: injectableKey => {
      const injectable = getInjectable({
        injectables,
        di,
        alias: injectableKey,
      });

      getLifecycle(injectableKey).purge(injectable);
    },
  };

  listOfGetRequireContexts.forEach(getRequireContextForInjectables => {
    autoRegisterInjectables({ getRequireContextForInjectables, di });
  });

  return di;
};

const getRelatedInjectables = alias => conforms({ aliases: includes(alias) });

const autoRegisterInjectables = ({ getRequireContextForInjectables, di }) => {
  const requireContextForInjectables = getRequireContextForInjectables();

  pipeline(
    requireContextForInjectables,
    invoke('keys'),
    map(key => {
      const injectableExport = requireContextForInjectables(key).default;

      return {
        id: key,
        ...injectableExport,
        aliases: [injectableExport, ...(injectableExport.aliases || [])],
      };
    }),

    forEach(injectable => di.register(injectable)),
  );
};

const getInjectable = ({ injectables, alias, di }) => {
  const relatedInjectables = pipeline(
    injectables,
    filter(getRelatedInjectables(alias)),
  );

  if (relatedInjectables.length === 0) {
    throw new Error(
      `Tried to inject non-registered injectable "${alias.toString()}".`,
    );
  }

  if (relatedInjectables.length > 1 && !viabilityIsOk(relatedInjectables)) {
    throw new Error(
      `Tried to inject one of multiple injectables with no way to demonstrate viability for "${relatedInjectables
        .map(get('id'))
        .join('", "')}"`,
    );
  }

  const viableInjectables = pipeline(
    relatedInjectables,
    filter(injectable =>
      injectable.viability ? injectable.viability(di) : true,
    ),
  );

  if (relatedInjectables.length === 1 && viableInjectables.length === 0) {
    throw new Error(
      `Tried to inject injectable with no viability for "${relatedInjectables[0].id}"`,
    );
  }

  if (viableInjectables.length === 0) {
    throw new Error(
      `Tried to inject one of multiple injectables with no viability within "${relatedInjectables
        .map(get('id'))
        .join('", "')}"`,
    );
  }

  if (viableInjectables.length !== 1) {
    throw new Error(
      `Tried to inject one of multiple injectables with non-singular viability within "${relatedInjectables
        .map(get('id'))
        .join('", "')}"`,
    );
  }

  return first(viableInjectables);
};

const viabilityIsOk = every('viability');

const getOverridingInjectable = ({ overridingInjectables, alias }) =>
  pipeline(overridingInjectables, findLast(getRelatedInjectables(alias)));
