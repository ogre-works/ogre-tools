import flow from './fastFlow';
import { instantiationDecoratorToken } from './tokens';

export const withInstantiationDecoratorsFor =
  ({ injectMany, injectable, getTagKeyedDecorators }) =>
  toBeDecorated => {
    // Imperative override (di.override / di.earlyOverride) wins absolutely:
    // no decoration applies to its stub instantiate.
    if (injectable.overriddenInjectable) {
      return toBeDecorated;
    }

    const decorators = [
      ...injectMany({
        alias: instantiationDecoratorToken.for(injectable),
        instantiationParameters: [],
        injectingInjectable: injectable,
      }),
      ...(injectable.injectionToken
        ? injectMany({
            alias: instantiationDecoratorToken.for(injectable.injectionToken),
            instantiationParameters: [],
            injectingInjectable: injectable,
          })
        : []),
      ...getTagKeyedDecorators({
        token: instantiationDecoratorToken,
        injectable,
        injectingInjectable: injectable,
      }),
    ];

    if (decorators.length === 0) {
      return toBeDecorated;
    }

    return flow(...decorators)(toBeDecorated);
  };
