import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, checkForCycles, setDependee }) =>
  toBeDecorated =>
  (alias, parameter, oldContext, source) => {
    setDependee({ dependency: alias, dependee: source });

    checkForCycles(alias);

    if (alias.decorable === false) {
      return toBeDecorated(alias, parameter, oldContext, source);
    }

    const newContext = [...oldContext, { injectable: alias }];

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = injectMany(
      injectionDecoratorToken,
      undefined,
      newContext,
      source,
    )
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, parameter, oldContext, source);
  };
