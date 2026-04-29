import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';
import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const withInjectionDecoratorsFor =
  ({ injectMany, decoratorCache, getTagKeyedDecorators }) =>
  toBeDecorated =>
  ({ alias, instantiationParameters, injectingInjectable }) => {
    // When decoratorCache.injection is null, a decorator was registered or
    // deregistered — invalidate all per-alias cached compositions.
    if (decoratorCache.injection === null) {
      decoratorCache.injection = true;
      decoratorCache.injectionByAlias = new Map();
    }

    let decorated = decoratorCache.injectionByAlias.get(alias);

    if (decorated === undefined) {
      const decorators = [
        ...injectMany({
          alias: injectionDecoratorToken.for(alias),
          instantiationParameters: [],
          injectingInjectable,
        }),
        ...(alias.injectionToken
          ? injectMany({
              alias: injectionDecoratorToken.for(alias.injectionToken),
              instantiationParameters: [],
              injectingInjectable,
            })
          : []),
        // Tag-dispatch fires only when alias is a concrete injectable.
        // Tokens don't have tags; resolving a token to its implementers and
        // unioning their tags is a deliberate non-feature here.
        ...(isInjectionToken(alias)
          ? []
          : getTagKeyedDecorators({
              token: injectionDecoratorToken,
              injectable: alias,
              injectingInjectable,
            })),
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
      return toBeDecorated({
        alias,
        instantiationParameters,
        injectingInjectable,
      });
    }

    return decorated(...instantiationParameters);
  };
