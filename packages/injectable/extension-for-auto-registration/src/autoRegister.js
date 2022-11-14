import { flatMap, forEach, tap } from 'lodash/fp';
import { pipeline } from '@ogre-tools/fp';
import { isInjectable } from '@ogre-tools/injectable';
import requireContextFake from './requireContextFake';

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
};

export default ({ fs, path }) =>
  ({ di, targetModule, getRequireContexts }) => {
    if (!targetModule.require.context) {
      targetModule.require.context = requireContextFake({
        targetModule: targetModule,
        fs,
        path,
      });
    }

    pipeline(
      getRequireContexts(),
      flatMap(getFileNameAndModule),
      tap(verifyInjectables),
      forEach(registerInjectableFor(di)),
    );
  };
