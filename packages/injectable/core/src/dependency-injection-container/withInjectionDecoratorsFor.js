import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './tokens';

export const withInjectionDecoratorsFor =
  ({ injectMany, checkForCycles, setDependee, dependenciesByDependencyMap }) =>
  toBeDecorated =>
  (alias, oldContext, source) =>
  (...parameters) => {
    if (dependenciesByDependencyMap.get(alias)) {
      setDependee({ dependency: alias, dependee: source });
      checkForCycles(alias);
    } else {
      setDependee({ dependency: alias, dependee: source });
    }

    if (alias.decorable === false) {
      return toBeDecorated(alias, oldContext, source)(...parameters);
    }

    const newContext = [...oldContext, { injectable: alias }];

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = injectMany(injectionDecoratorToken, newContext, source)
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, oldContext, source)(...parameters);
  };
