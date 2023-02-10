import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { injectionDecoratorToken } from './createContainer';

export const withInjectionDecoratorsFor =
  ({ injectMany, namespacedIdByInjectableMap }) =>
  toBeDecorated =>
  (alias, ...args) => {
    if (alias.decorable === false) {
      return toBeDecorated(alias, ...args);
    }

    const [, oldContext] = args;

    const injectableCausingCycle = oldContext
      .filter(contextItem => !contextItem.injectable.cannotCauseCycles)
      .find(contextItem => contextItem.injectable === alias);

    const newContext = [...oldContext, { injectable: alias }];

    if (injectableCausingCycle) {
      throw new Error(
        `Cycle of injectables encountered: "${newContext
          .map(
            x =>
              namespacedIdByInjectableMap.get(x.injectable) || x.injectable.id,
          )
          .join('" -> "')}"`,
      );
    }

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
