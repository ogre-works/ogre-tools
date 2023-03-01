import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './createContainer';

export const withInjectionDecoratorsFor =
  ({ injectMany, dependersMap, checkForCycles }) =>
  toBeDecorated =>
  (alias, parameter, oldContext, injectingInjectable) => {
    if (!dependersMap.has(alias)) {
      dependersMap.set(alias, new Set());
    }

    dependersMap.get(alias).add(injectingInjectable);

    checkForCycles(alias);

    if (alias.decorable === false) {
      return toBeDecorated(alias, parameter, oldContext, injectingInjectable);
    }

    const newContext = [...oldContext, { injectable: alias }];

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = injectMany(
      injectionDecoratorToken,
      undefined,
      newContext,
      injectingInjectable,
    )
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, parameter, oldContext, injectingInjectable);
  };
