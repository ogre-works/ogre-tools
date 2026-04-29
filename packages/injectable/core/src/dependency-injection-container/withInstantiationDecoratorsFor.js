import flow from './fastFlow';
import { instantiationDecoratorToken } from './tokens';

export const withInstantiationDecoratorsFor =
  ({ injectable, getApplicableDecorators }) =>
  toBeDecorated => {
    // Imperative override (di.override / di.earlyOverride) wins absolutely:
    // no decoration applies to its stub instantiate.
    if (injectable.overriddenInjectable) {
      return toBeDecorated;
    }

    const decorators = getApplicableDecorators({
      decoratorToken: instantiationDecoratorToken,
      target: injectable,
      injectingInjectable: injectable,
    });

    if (decorators.length === 0) {
      return toBeDecorated;
    }

    return flow(...decorators)(toBeDecorated);
  };
