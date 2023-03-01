import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './createContainer';
import { getCycleFor } from './getCycleFor';

export const withInjectionDecoratorsFor =
  ({ injectMany, dependersMap, getNamespacedId }) =>
  toBeDecorated =>
  (alias, parameter, oldContext, injectingInjectable) => {
    if (!dependersMap.has(alias)) {
      dependersMap.set(alias, new Set());
    }

    dependersMap.get(alias).add(injectingInjectable);

    const cycle = getCycleFor(dependersMap)(alias);

    if (cycle)
      throw new Error(
        `Cycle of injectables encountered: "${cycle
          .map(getNamespacedId)
          .join('" -> "')}"`,
      );

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
