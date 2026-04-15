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
        undefined,
        injectingInjectable,
      );
    }

    // Fast path: no injection decorators registered
    if (decoratorCache.injection.length === 0) {
      return toBeDecorated(alias, parameter, injectingInjectable);
    }

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = decoratorCache.injection
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, parameter, injectingInjectable);
  };
