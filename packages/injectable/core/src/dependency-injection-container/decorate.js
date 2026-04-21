import getInjectable2 from '../getInjectable2/getInjectable2';
import { injectionDecoratorToken } from './tokens';

export const decorateFor =
  ({ registerSingle }) =>
  (alias, decorator) => {
    const decoratorInjectable = getInjectable2({
      id: `${alias.id}-decorator-${Math.random()}`,
      injectionToken: injectionDecoratorToken.for(alias),
      decorable: false,

      instantiate: () => () => decorator,
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
