import getInjectable from '../getInjectable/getInjectable';
import { injectionDecoratorToken } from './tokens';

export const decorateFor =
  ({ registerSingle }) =>
  (alias, decorator) => {
    const decoratorInjectable = getInjectable({
      id: `${alias.id}-decorator-${Math.random()}`,
      injectionToken: injectionDecoratorToken,
      decorable: false,

      instantiate: () => ({
        decorate: decorator,
        target: alias,
      }),
    });

    registerSingle(decoratorInjectable, []);
  };

export const decorateFunctionFor =
  ({ decorate }) =>
  (alias, decorator) => {
    decorate(
      alias,
      toBeDecorated =>
        (...instantiation) =>
          decorator(toBeDecorated(...instantiation)),
    );
  };
