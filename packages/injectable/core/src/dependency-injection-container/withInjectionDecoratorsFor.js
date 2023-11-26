import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, checkForCycles, setDependee, dependenciesByDependencyMap }) =>
  toBeDecorated =>
  (alias, parameter, oldContext, source) => {
    if (dependenciesByDependencyMap.get(alias)) {
      setDependee({ dependency: alias, dependee: source });
      checkForCycles(alias);
    } else {
      setDependee({ dependency: alias, dependee: source });
    }

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
