import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, decoratorCache }) =>
  toBeDecorated =>
  ({ alias, instantiationParameters, injectingInjectable }) => {
    if (alias.decorable === false) {
      return toBeDecorated({ alias, instantiationParameters, injectingInjectable });
    }

    // Populate cache if invalidated
    if (decoratorCache.injection === null) {
      decoratorCache.injection = injectMany({
        alias: injectionDecoratorToken,
        instantiationParameters: [],
        injectingInjectable,
      });

      // Invalidate per-alias cache when the decorator list changes.
      decoratorCache.injectionByAlias = new Map();
    }

    // Fast path: no injection decorators registered
    if (decoratorCache.injection.length === 0) {
      return toBeDecorated({ alias, instantiationParameters, injectingInjectable });
    }

    // Per-alias cache: avoid filter/map/flow on every inject for the same alias.
    let decorated = decoratorCache.injectionByAlias.get(alias);

    if (decorated === undefined) {
      const isRelevantDecorator = isRelevantDecoratorFor(alias);

      const decorators = decoratorCache.injection
        .filter(isRelevantDecorator)
        .map(x => x.decorate);

      if (decorators.length > 0) {
        // User decorators consume the positional shape `(alias, param, injectingInjectable)`.
        // Adapt once: positional view forwards to the object-form inner; the composed
        // decorator is called positionally below.
        const toBeDecoratedPositional = (a, p, ii) =>
          toBeDecorated({
            alias: a,
            instantiationParameters: p,
            injectingInjectable: ii,
          });

        decorated = flow(...decorators)(toBeDecoratedPositional);
      } else {
        decorated = null;
      }

      decoratorCache.injectionByAlias.set(alias, decorated);
    }

    if (decorated === null) {
      return toBeDecorated({ alias, instantiationParameters, injectingInjectable });
    }

    return decorated(alias, instantiationParameters, injectingInjectable);
  };
