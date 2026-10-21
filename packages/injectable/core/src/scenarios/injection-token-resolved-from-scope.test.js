import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import {
  deregistrationCallbackToken,
  registrationCallbackToken,
} from '../dependency-injection-container/tokens';

describe('injection-token-resolved-from-scope', () => {
  let di;
  let someToken;
  let someInjectable;

  beforeEach(() => {
    di = createContainer('some-container');

    someToken = getInjectionToken2({
      id: 'some-token',
      cardinality: 'zero-or-many',
    })(specifier =>
      getInjectionToken2({
        id: `some-token-${specifier}`,
        speciality: specifier,
        cardinality: 'one',
      })(),
    );

    someInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: di => () => ({ scopeIds: di.scopeIds }),
      injectionToken: ({ scopeIds }) => someToken.for(scopeIds.join(':')),
    });
  });

  describe('given injectable2 with an injection token resolved from the scope, registered at container level', () => {
    beforeEach(() => {
      di.register(someInjectable);
    });

    it('is registered under the token resolved with no scope ids', () => {
      expect(di.hasRegistrations(someToken.for(''))).toBe(true);
    });

    it('is injectable through the resolved token', () => {
      expect(di.inject(someToken.for('')).scopeIds).toEqual([]);
    });

    it('when deregistered, is no longer registered under the token', () => {
      di.deregister(someInjectable);

      expect(di.hasRegistrations(someToken.for(''))).toBe(false);
    });
  });

  describe('given the same injectable2 registered by two scopes', () => {
    beforeEach(() => {
      const someScopeInjectable = getInjectable2({
        id: 'some-scope',
        instantiate: di => () => di.register(someInjectable),
      });

      const someOtherScopeInjectable = getInjectable2({
        id: 'some-other-scope',
        instantiate: di => () => di.register(someInjectable),
      });

      di.register(someScopeInjectable, someOtherScopeInjectable);
      di.inject(someScopeInjectable);
    });

    it('is registered under the token of its scope', () => {
      expect(di.hasRegistrations(someToken.for('some-scope'))).toBe(true);
    });

    it('resolves the same scope ids the injectable itself sees', () => {
      expect(di.inject(someToken.for('some-scope')).scopeIds).toEqual([
        'some-scope',
      ]);
    });

    it('is not registered under the token of the other scope', () => {
      expect(di.hasRegistrations(someToken.for('some-other-scope'))).toBe(
        false,
      );
    });

    it('when deregistered and registered again by the other scope, resolves afresh', () => {
      di.deregister(someInjectable);

      // A different owner registers it now.
      const someOtherScopeInjectable = getInjectable2({
        id: 'yet-another-scope',
        instantiate: di => () => di.register(someInjectable),
      });

      di.register(someOtherScopeInjectable);
      di.inject(someOtherScopeInjectable);

      expect([
        di.hasRegistrations(someToken.for('some-scope')),
        di.hasRegistrations(someToken.for('yet-another-scope')),
      ]).toEqual([false, true]);
    });
  });

  it('given nested scopes, resolves with every scope id, outermost first', () => {
    const someInnerScopeInjectable = getInjectable2({
      id: 'some-inner-scope',
      instantiate: di => () => di.register(someInjectable),
    });

    const someOuterScopeInjectable = getInjectable2({
      id: 'some-outer-scope',
      instantiate: di => () => di.register(someInnerScopeInjectable),
    });

    di.register(someOuterScopeInjectable);
    di.inject(someOuterScopeInjectable);
    di.inject(someInnerScopeInjectable);

    expect(
      di.hasRegistrations(someToken.for('some-outer-scope:some-inner-scope')),
    ).toBe(true);
  });

  it('given a scope owned by a v1 injectable, resolves with it as a scope like any other', () => {
    const someScopeInjectable = getInjectable({
      id: 'some-v1-scope',
      instantiate: di => di.register(someInjectable),
    });

    di.register(someScopeInjectable);
    di.inject(someScopeInjectable);

    expect(di.hasRegistrations(someToken.for('some-v1-scope'))).toBe(true);
  });

  it('given the resolved token has cardinality one, when two scopes resolve to the same token, the second registration throws', () => {
    const someInjectableResolvingToConstantToken = getInjectable2({
      id: 'some-constant-injectable',
      instantiate: () => () => 'irrelevant',
      injectionToken: () => someToken.for('constant'),
    });

    const someOtherInjectableResolvingToConstantToken = getInjectable2({
      id: 'some-other-constant-injectable',
      instantiate: () => () => 'irrelevant',
      injectionToken: () => someToken.for('constant'),
    });

    di.register(someInjectableResolvingToConstantToken);

    expect(() => {
      di.register(someOtherInjectableResolvingToConstantToken);
    }).toThrow(
      'Tried to register injectable "some-other-constant-injectable" with injection token "some-token/some-token-constant", but its cardinality "one" allows at most one registration and "some-constant-injectable" is already registered.',
    );
  });

  it('given the resolver returns something other than a token, when registered, throws', () => {
    const someBrokenInjectable = getInjectable2({
      id: 'some-broken-injectable',
      instantiate: () => () => 'irrelevant',
      injectionToken: () => 'not-a-token',
    });

    expect(() => {
      di.register(someBrokenInjectable);
    }).toThrow(
      'Tried to register injectable "some-broken-injectable", but its injection token resolver returned something that is not an injection token.',
    );
  });

  it('given a registration callback, when registered by a scope, the callback receives the resolved token', () => {
    const registrationCallbackMock = jest.fn();

    di.register(
      getInjectable({
        id: 'some-registration-callback',
        instantiate: () => registrationCallbackMock,
        injectionToken: registrationCallbackToken,
      }),
    );

    const someScopeInjectable = getInjectable2({
      id: 'some-scope',
      instantiate: di => () => di.register(someInjectable),
    });

    di.register(someScopeInjectable);
    di.inject(someScopeInjectable);

    expect(registrationCallbackMock).toHaveBeenCalledWith(
      someInjectable,
      someToken.for('some-scope'),
    );
  });

  it('given a deregistration callback, when deregistered, the callback receives the token it was registered under', () => {
    const deregistrationCallbackMock = jest.fn();

    di.register(
      getInjectable({
        id: 'some-deregistration-callback',
        instantiate: () => deregistrationCallbackMock,
        injectionToken: deregistrationCallbackToken,
      }),
    );

    di.register(someInjectable);
    di.deregister(someInjectable);

    expect(deregistrationCallbackMock).toHaveBeenCalledWith(
      someInjectable,
      someToken.for(''),
      'some-injectable',
    );
  });

  it('given a callable token, such as a token component, when registered, treats it as the token itself', () => {
    const callableToken = getInjectionToken2({
      id: 'some-callable-token',
      target: () => 'irrelevant',
      cardinality: 'one',
    })();

    const someInjectableWithCallableToken = getInjectable2({
      id: 'some-injectable-with-callable-token',
      instantiate: () => () => 'some-instance',
      injectionToken: callableToken,
    });

    di.register(someInjectableWithCallableToken);

    expect(di.inject(callableToken)).toBe('some-instance');
  });
});
