import {
  conforms,
  flatMap,
  forEach,
  isFunction,
  isString,
  tap,
} from 'lodash/fp';
import { pipeline } from '@ogre-tools/fp';
import { isInjectable } from '@ogre-tools/injectable';

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
