import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { deregistrationDecoratorToken } from './tokens';

export const withDeregistrationDecoratorsFor =
  ({ injectMany }) =>
  (toBeDecorated, injectable, context, source) => {
    if (injectable.decorable === false) {
      return toBeDecorated;
    }

    const decorators = injectMany(
      deregistrationDecoratorToken,
      undefined,
      context,
      source,
    )
      .filter(isRelevantDecoratorFor(injectable))
      .map(x => x.decorate);

    return flow(...decorators)(toBeDecorated);
  };
