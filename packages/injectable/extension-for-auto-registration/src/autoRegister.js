import {
  flatMap,
  forEach,
  tap,
  uniq,
  values,
  filter,
  overSome,
} from 'lodash/fp';

import { pipeline } from '@lensapp/fp';

import {
  isInjectable,
  isInjectableBunch,
  toFlatInjectables,
} from '@lensapp/injectable';

import requireContextFake from './requireContextFake';

const toInjectables = module =>
  pipeline(
    module,
    values,
    filter(overSome([isInjectable, isInjectableBunch])),
    toFlatInjectables,
    uniq,
  );

const getFileNameAndModule = requireContext =>
  requireContext.keys().map(key => [key, requireContext(key)]);

const registerInjectableFor =
  di =>
  ([, module]) => {
    di.register(...toInjectables(module));
  };

const verifyFiles = fileNamesAndModules => {
  if (fileNamesAndModules.length === 0) {
    throw new Error(
      'Tried to auto-register injectables, but no matching files were found',
    );
  }
};

const verifyInjectables = ([[fileName, module]]) => {
  const injectables = toInjectables(module);

  if (injectables.length === 0) {
    throw new Error(
      `Tried to register injectables from "${fileName}", but there were none"`,
    );
  }
};

export default ({ fs, path }) =>
  ({ di, targetModule, getRequireContexts }) => {
    if (targetModule.require && !targetModule.require.context) {
      targetModule.require.context = requireContextFake({
        targetModule: targetModule,
        fs,
        path,
      });
    }

    pipeline(
      getRequireContexts(),
      flatMap(getFileNameAndModule),
      tap(verifyFiles),
      tap(verifyInjectables),
      forEach(registerInjectableFor(di)),
    );
  };
