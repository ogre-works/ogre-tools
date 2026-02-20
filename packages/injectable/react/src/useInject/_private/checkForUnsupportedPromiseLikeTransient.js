import { lifecycleEnum } from '@ogre-tools/injectable';
import { isPromise } from '@ogre-tools/fp';

export const checkForUnsupportedPromiseLikeTransient = (
  injectable,
  maybePromise,
) => {
  if (
    injectable.lifecycle === lifecycleEnum.transient &&
    isPromise(maybePromise)
  ) {
    throw new Error(
      `Tried to useInject, but the injectable "${injectable.id}" was an async transient, which is not supported until React 19 and use-hook`,
    );
  }
};
