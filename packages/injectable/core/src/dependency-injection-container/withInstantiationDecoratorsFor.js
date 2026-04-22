import flow from './fastFlow';
import { instantiationDecoratorToken } from './tokens';

export const withInstantiationDecoratorsFor = ({
  injectMany,
  injectable,
}) =>
  toBeDecorated => {
    if (injectable.decorable === false) {
      return toBeDecorated;
    }

    const aliasToken = instantiationDecoratorToken.for(injectable);
    const parentToken = injectable.injectionToken
      ? instantiationDecoratorToken.for(injectable.injectionToken)
      : null;

    const decorators = [
      ...injectMany({
        alias: aliasToken,
        instantiationParameters: [],
        injectingInjectable: injectable,
      }),
      ...(parentToken && parentToken !== aliasToken
        ? injectMany({
            alias: parentToken,
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
