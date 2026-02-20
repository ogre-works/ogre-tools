import { lifecycleEnum } from '@ogre-tools/injectable';

export const checkForUnsupportedAsyncTransient = injectable => {
  if (
    injectable.lifecycle === lifecycleEnum.transient &&
    injectable.instantiate.constructor.name === 'AsyncFunction'
  ) {
    throw new Error(
      `Tried to useInject, but the injectable "${injectable.id}" was an async transient, which is not supported until React 19 and use-hook`,
    );
  }
};
