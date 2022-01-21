import tap from 'lodash/fp/tap';
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
    getRelatedInjectable({
      injectables,
      alias,
    }).lifecycle;

  const privateDi = {
    inject: (alias, instantiationParameter, context = []) => {
      const originalInjectable = getRelatedInjectable({
        injectables,
        alias,
        context,
      });

      const overriddenInjectable = getOverridingInjectable({
        overridingInjectables,
        alias,
      });

      const injectable = overriddenInjectable || originalInjectable;

      const injectableIsBeingSetupped = pipeline(
        context,
        includes(`setup(${injectable.id})`),
      );

      if (
        !setupsHaveBeenRan &&
        injectable.setup &&
        !injectableIsBeingSetupped
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
        di: privateDi,
        instanceMap,
        context,
      });
    },

    injectMany: (alias, instantiationParameter, context = []) =>
      pipeline(
        getRelatedInjectables({ injectables, alias }),

        map(injectable =>
          privateDi.inject(injectable, instantiationParameter, context),
        ),
      ),

    register: injectable => {
      if (!injectable.id) {
        throw new Error('Tried to register injectable without ID.');
      }

      injectables.push({
        ...injectable,

        lifecycle: injectable.lifecycle || lifecycleEnum.singleton,

        permitSideEffects: function () {
          this.causesSideEffects = false;
        },
      });
    },

    override: (alias, instantiateStub) => {
      const originalInjectable = pipeline(
        injectables,
        find(isRelatedTo(alias)),
      );

      if (!originalInjectable) {
        throw new Error(
          `Tried to override "${alias.id}" which is not registered.`,
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
        reject(isRelatedTo(alias)),
      );
    },

    reset: () => {
      overridingInjectables = [];
    },

    runSetups: async () =>
      pipeline(
        injectables,
        filter('setup'),

        map(async injectable => {
          await injectable.setup({
            inject: (alias, parameter) =>
              privateDi.inject(alias, parameter, [`setup(${injectable.id})`]),
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
      getRelatedInjectable({ injectables, alias }).permitSideEffects();
    },

    getLifecycle,

    purge: alias => {
      const injectable = getRelatedInjectable({
        injectables,
        alias,
      });

      getLifecycle(alias).purge({ injectable, instanceMap });
    },
  };

  listOfGetRequireContexts.forEach(getRequireContextForInjectables => {
    autoRegisterInjectables({ getRequireContextForInjectables, di: privateDi });
  });

  const publicDi = {
    ...privateDi,
    inject: (alias, parameter) => privateDi.inject(alias, parameter),
    injectMany: (alias, parameter) => privateDi.injectMany(alias, parameter),
  };

  return publicDi;
};

const autoRegisterInjectables = ({ getRequireContextForInjectables, di }) => {
  const requireContextForInjectables = getRequireContextForInjectables();

  pipeline(
    requireContextForInjectables,
    invoke('keys'),
    map(requireContextForInjectables),
    map('default'),
    forEach(di.register),
  );
};

const isRelatedTo = alias => injectable =>
  injectable.id === alias.id ||
  (injectable.injectionToken && injectable.injectionToken === alias);

const getRelatedInjectable = ({ injectables, alias, context }) => {
  const relatedInjectables = getRelatedInjectables({ injectables, alias });

  if (relatedInjectables.length === 0) {
    const errorContextString = [...context, alias.id].join('" -> "');

    throw new Error(
      `Tried to inject non-registered injectable "${errorContextString}".`,
    );
  }

  if (relatedInjectables.length > 1) {
    throw new Error(
      `Tried to inject single injectable for injection token "${
        alias.id
      }" but found multiple injectables: "${relatedInjectables
        .map(relatedInjectable => relatedInjectable.id)
        .join('", "')}"`,
    );
  }

  return first(relatedInjectables);
};

const getRelatedInjectables = ({ injectables, alias }) =>
  pipeline(injectables, filter(isRelatedTo(alias)));

const getOverridingInjectable = ({ overridingInjectables, alias }) =>
  pipeline(overridingInjectables, findLast(isRelatedTo(alias)));
