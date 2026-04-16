import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, decoratorCache }) =>
  toBeDecorated =>
  (alias, parameter, injectingInjectable) => {
    if (alias.decorable === false) {
      return toBeDecorated(alias, parameter, injectingInjectable);
    }

    // Populate cache if invalidated
    if (decoratorCache.injection === null) {
      decoratorCache.injection = injectMany(
        injectionDecoratorToken,
        [],
        injectingInjectable,
      );

      // Invalidate per-alias cache when the decorator list changes.
      decoratorCache.injectionByAlias = new Map();
    }

    // Fast path: no injection decorators registered
    if (decoratorCache.injection.length === 0) {
      return toBeDecorated(alias, parameter, injectingInjectable);
    }

    // Per-alias cache: avoid filter/map/flow on every inject for the same alias.
    let decorated = decoratorCache.injectionByAlias.get(alias);

    if (decorated === undefined) {
      const isRelevantDecorator = isRelevantDecoratorFor(alias);

      const decorators = decoratorCache.injection
        .filter(isRelevantDecorator)
        .map(x => x.decorate);

      decorated =
        decorators.length > 0 ? flow(...decorators)(toBeDecorated) : null;

      decoratorCache.injectionByAlias.set(alias, decorated);
    }

    if (decorated === null) {
      return toBeDecorated(alias, parameter, injectingInjectable);
    }

    return decorated(alias, parameter, injectingInjectable);
  };
