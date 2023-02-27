import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './createContainer';

export const withInjectionDecoratorsFor =
  ({ injectMany }) =>
  toBeDecorated =>
  (alias, ...args) => {
    if (alias.decorable === false) {
      return toBeDecorated(alias, ...args);
    }

    const [, oldContext] = args;

    const newContext = [...oldContext, { injectable: alias }];

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = injectMany(
      injectionDecoratorToken,
      undefined,
      newContext,
    )
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, ...args);
  };
