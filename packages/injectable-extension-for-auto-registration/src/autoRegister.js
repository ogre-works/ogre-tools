import conforms from 'lodash/fp/conforms';
import isString from 'lodash/fp/isString';
import isFunction from 'lodash/fp/isFunction';
import { pipeline } from '@ogre-tools/fp';
import tap from 'lodash/fp/tap';
import { injectableSymbol } from '@ogre-tools/injectable';
import forEach from 'lodash/fp/forEach';
import flatMap from 'lodash/fp/flatMap';

const hasInjectableSignature = conforms({
  id: isString,
  instantiate: isFunction,
});

const getFileNameAndModule = requireContext =>
  requireContext.keys().map(key => [key, requireContext(key)]);

const registerInjectableFor =
  di =>
  ([, module]) => {
    di.register(...Object.values(module).filter(isInjectable));
  };

const verifyInjectables = ([[fileName, module]]) => {
  const injectables = Object.entries(module).filter(([, exported]) =>
    isInjectable(exported),
  );

  if (injectables.length === 0) {
    throw new Error(
      `Tried to register injectables from "${fileName}", but there were none"`,
    );
  }

  injectables.forEach(([propertyName, injectable]) => {
    if (!hasInjectableSignature(injectable)) {
      throw new Error(
        `Tried to register injectables from "${fileName}", but export "${propertyName}" is of wrong shape`,
      );
    }
  });
};

export default ({ di, requireContexts }) => {
  pipeline(
    requireContexts,
    flatMap(getFileNameAndModule),
    tap(verifyInjectables),
    forEach(registerInjectableFor(di)),
  );
};

const isInjectable = exported => exported?.aliasType === injectableSymbol;
