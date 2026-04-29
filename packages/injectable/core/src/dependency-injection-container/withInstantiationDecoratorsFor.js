import flow from './fastFlow';
import { instantiationDecoratorToken } from './tokens';

export const withInstantiationDecoratorsFor =
  ({ injectMany, injectable }) =>
  toBeDecorated => {
    const target = injectable.overriddenInjectable || injectable;

    const decorators = [
      ...injectMany({
        alias: instantiationDecoratorToken.for(target),
        instantiationParameters: [],
        injectingInjectable: injectable,
      }),
      ...(target.injectionToken
        ? injectMany({
            alias: instantiationDecoratorToken.for(target.injectionToken),
            instantiationParameters: [],
            injectingInjectable: injectable,
          })
        : []),
    ];

    if (decorators.length === 0) {
      return toBeDecorated;
    }

    return flow(...decorators)(toBeDecorated);
  };
