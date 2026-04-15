import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { registrationDecoratorToken } from './tokens';

export const withRegistrationDecoratorsFor =
  ({ injectMany }) =>
  (toBeDecorated, injectable, context, source) => {
    if (injectable.decorable === false) {
      return toBeDecorated;
    }

    const decorators = injectMany(
      registrationDecoratorToken,
      undefined,
      context,
      source,
    )
      .filter(isRelevantDecoratorFor(injectable))
      .map(x => x.decorate);

    return flow(...decorators)(toBeDecorated);
  };
