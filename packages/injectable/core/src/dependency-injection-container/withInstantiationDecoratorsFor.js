import flow from './fastFlow';
import { instantiationDecoratorToken } from './tokens';

export const withInstantiationDecoratorsFor =
  ({ injectable, getApplicableDecorators }) =>
  toBeDecorated => {
    // Decorators always look up against the original injectable so that
    // an imperative override (di.override / di.earlyOverride) is wrapped
    // by any decorators registered against the original target — composing
    // decorators rely on this.
    const target = injectable.overriddenInjectable || injectable;

    const decorators = getApplicableDecorators({
      decoratorToken: instantiationDecoratorToken,
      target,
      injectingInjectable: injectable,
    });

    if (decorators.length === 0) {
      return toBeDecorated;
    }

    return flow(...decorators)(toBeDecorated);
  };
