import tap from 'lodash/fp/tap';
import conforms from 'lodash/fp/conforms';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import findLast from 'lodash/fp/findLast';
import first from 'lodash/fp/first';
import forEach from 'lodash/fp/forEach';
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

  const instanceMap = new Map();

  const getLifecycle = alias =>
    getInjectable({
      injectables,
      alias,
    }).lifecycle;

  const privateDi = {
    inject: (alias, instantiationParameter, context = []) => {
      const originalInjectable = getInjectable({
        injectables,
        alias,
      });

      const overriddenInjectable = getOverridingInjectable({
        overridingInjectables,
        alias,
      });

      const injectable = overriddenInjectable || originalInjectable;

      const injectableIsBeingSetupped = pipeline(
        context,
        includes(`setup(${injectable.module.filename})`),
      );

      if (
        !setupsHaveBeenRan &&
        injectable.setup &&
        !injectableIsBeingSetupped
      ) {
        throw new Error(
          `Tried to inject setuppable "${injectable.module.filename}" before setups are ran.`,
        );
      }

      if (sideEffectsArePrevented && injectable.causesSideEffects) {
        throw new Error(
          `Tried to inject "${injectable.module.filename}" when side-effects are prevented.`,
        );
      }

      return injectable.lifecycle.getInstance({
        injectable,
        instantiationParameter,
        di: privateDi,
        instanceMap,
        context,
      });
    },

    register: injectable => {
      if (!injectable.module) {
        throw new Error('Tried to register injectable without module.');
      }

      injectables.push({
        ...injectable,

        aliases: [
          injectable,
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

    runSetups: async () =>
      pipeline(
        injectables,

        map(originalInjectable => {
          const overridingInjectable = getOverridingInjectable({
            overridingInjectables,
            alias: originalInjectable.module.filename,
          });

          return overridingInjectable
            ? overridingInjectable
            : originalInjectable;
        }),

        filter('setup'),

        map(async injectable => {
          await injectable.setup({
            inject: (alias, parameter) =>
              privateDi.inject(alias, parameter, [
                `setup(${injectable.module.filename})`,
              ]),
          });
        }),

        tap(() => {
          setupsHaveBeenRan = true;
        }),
      ),

    preventSideEffects: () => {
      sideEffectsArePrevented = true;
    },

    permitSideEffects: alias => {
      getInjectable({ injectables, alias }).permitSideEffects();
    },

    getLifecycle,

    purge: injectableKey => {
      const injectable = getInjectable({
        injectables,
        alias: injectableKey,
      });

      getLifecycle(injectableKey).purge({ injectable, instanceMap });
    },
  };

  listOfGetRequireContexts.forEach(getRequireContextForInjectables => {
    autoRegisterInjectables({ getRequireContextForInjectables, di: privateDi });
  });

  const publicDi = {
    ...privateDi,
    inject: (alias, parameter) => privateDi.inject(alias, parameter),
  };

  return publicDi;
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
        aliases: [injectableExport],
      };
    }),

    forEach(injectable => di.register(injectable)),
  );
};

const getInjectable = ({ injectables, alias }) => {
  const relatedInjectables = pipeline(
    injectables,
    filter(getRelatedInjectables(alias)),
  );

  if (relatedInjectables.length === 0) {
    throw new Error(
      `Tried to inject non-registered injectable "${alias.module.filename}".`,
    );
  }
  if (relatedInjectables.length > 1) {
    throw new Error(
      `Tried to inject single injectable for injection token "${
        alias.module.filename
      }" but found multiple injectables: "${relatedInjectables
        .map(relatedInjectable => relatedInjectable.module.filename)
        .join('", "')}"`,
    );
  }

  return first(relatedInjectables);
};

const getOverridingInjectable = ({ overridingInjectables, alias }) =>
  pipeline(overridingInjectables, findLast(getRelatedInjectables(alias)));
