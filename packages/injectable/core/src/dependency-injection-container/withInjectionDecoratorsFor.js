import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, decoratorCache }) =>
  toBeDecorated =>
  ({ alias, instantiationParameters, injectingInjectable }) => {
    if (alias.decorable === false) {
      return toBeDecorated({ alias, instantiationParameters, injectingInjectable });
    }

    // When decoratorCache.injection is null, a decorator was registered or
    // deregistered — invalidate all per-alias cached compositions.
    if (decoratorCache.injection === null) {
      decoratorCache.injection = true;
      decoratorCache.injectionByAlias = new Map();
    }

    let decorated = decoratorCache.injectionByAlias.get(alias);

    if (decorated === undefined) {
      const aliasToken = injectionDecoratorToken.for(alias);
      const parentToken = alias.injectionToken
        ? injectionDecoratorToken.for(alias.injectionToken)
        : null;

      const decorators = [
        ...injectMany({
          alias: aliasToken,
          instantiationParameters: [],
          injectingInjectable,
        }),
        ...(parentToken && parentToken !== aliasToken
          ? injectMany({
              alias: parentToken,
              instantiationParameters: [],
              injectingInjectable,
            })
          : []),
      ];

      if (decorators.length > 0) {
        const boundInject = (...params) =>
          toBeDecorated({
            alias,
            instantiationParameters: params,
            injectingInjectable,
          });

        decorated = flow(...decorators)(boundInject);
      } else {
        decorated = null;
      }

      decoratorCache.injectionByAlias.set(alias, decorated);
    }

    if (decorated === null) {
      return toBeDecorated({ alias, instantiationParameters, injectingInjectable });
    }

    return decorated(...instantiationParameters);
  };
