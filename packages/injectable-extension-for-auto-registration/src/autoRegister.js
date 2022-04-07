import conforms from 'lodash/fp/conforms';
import isString from 'lodash/fp/isString';
import isFunction from 'lodash/fp/isFunction';
import { pipeline } from '@ogre-tools/fp';
import tap from 'lodash/fp/tap';
import forEach from 'lodash/fp/forEach';
import flatMap from 'lodash/fp/flatMap';

const hasInjectableSignature = conforms({
  id: isString,
  instantiate: isFunction,
});

const getFileNameAndDefaultExport = requireContext =>
  requireContext.keys().map(key => [key, requireContext(key).default]);

const registerInjectableFor =
  di =>
  ([, injectable]) =>
    di.register(injectable);

const verifyInjectable = ([fileName, injectable]) => {
  if (!injectable) {
    throw new Error(
      `Tried to register injectable from ${fileName}, but no default export`,
    );
  }

  if (!hasInjectableSignature(injectable)) {
    throw new Error(
      `Tried to register injectable from ${fileName}, but default export is of wrong shape`,
    );
  }
};

export default ({ di, requireContexts }) => {
  pipeline(
    requireContexts,
    flatMap(getFileNameAndDefaultExport),
    tap(forEach(verifyInjectable)),
    forEach(registerInjectableFor(di)),
  );
};
