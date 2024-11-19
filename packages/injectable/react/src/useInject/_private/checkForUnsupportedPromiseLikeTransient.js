import { lifecycleEnum } from '@lensapp/injectable';
import { isPromise } from '@lensapp/fp';

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
