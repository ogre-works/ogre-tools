import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { instantiationDecoratorToken } from './tokens';

export const withInstantiationDecoratorsFor = ({
  injectMany,
  injectable,
  decoratorCache,
}) => {
  const isRelevantDecorator = isRelevantDecoratorFor(injectable);

  return toBeDecorated =>
    (...args) => {
      if (injectable.decorable === false) {
        return toBeDecorated(...args);
      }

      // Populate cache if invalidated
      if (decoratorCache.instantiation === null) {
        decoratorCache.instantiation = injectMany(
          instantiationDecoratorToken,
          undefined,
          injectable,
          null,
        );
      }

      // Fast path: no instantiation decorators registered
      if (decoratorCache.instantiation.length === 0) {
        return toBeDecorated(...args);
      }

      const decorators = decoratorCache.instantiation
        .filter(isRelevantDecorator)
        .map(x => x.decorate);

      const decorated = flow(...decorators)(toBeDecorated);

      return decorated(...args);
    };
};
