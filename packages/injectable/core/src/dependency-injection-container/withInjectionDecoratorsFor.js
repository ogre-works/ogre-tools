import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './createContainer';

export const withInjectionDecoratorsFor =
  ({ injectMany, checkForCycles, setDependency }) =>
  toBeDecorated =>
  (alias, parameter, oldContext, source) => {
    setDependency({ dependency: alias, depender: source });

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
