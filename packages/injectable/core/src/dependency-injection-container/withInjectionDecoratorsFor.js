import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, setDependee, decoratorCache }) =>
  toBeDecorated =>
  (alias, parameter, source, sourceChainNode) => {
    setDependee(alias, source);

    if (alias.decorable === false) {
      return toBeDecorated(alias, parameter, source, sourceChainNode);
    }

    // Populate cache if invalidated
    if (decoratorCache.injection === null) {
      decoratorCache.injection = injectMany(
        injectionDecoratorToken,
        undefined,
        source,
        null,
      );
    }

    // Fast path: no injection decorators registered
    if (decoratorCache.injection.length === 0) {
      return toBeDecorated(alias, parameter, source, sourceChainNode);
    }

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = decoratorCache.injection
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, parameter, source, sourceChainNode);
  };
