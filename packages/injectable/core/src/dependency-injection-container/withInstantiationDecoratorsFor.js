import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import { instantiationDecoratorToken } from './createContainer';
import flow from './fastFlow';

export const withInstantiationDecoratorsFor = ({ injectMany, injectable }) => {
  const isRelevantDecorator = isRelevantDecoratorFor(injectable);

  return toBeDecorated =>
    (...args) => {
      if (injectable.decorable === false) {
        return toBeDecorated(...args);
      }

      const [{ context }] = args;

      const decorators = injectMany(
        instantiationDecoratorToken,
        undefined,
        context,
        injectable,
      )
        .filter(isRelevantDecorator)
        .map(x => x.decorate);

      const decorated = flow(...decorators)(toBeDecorated);

      return decorated(...args);
    };
};
