import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';

describe('registration with namespaces', () => {
  describe('given an already normally registered injectable, and in injection scope', () => {
    let rootDi;
    let someInjectionScope;
    let someOtherInjectionScope;
    let someOtherInjectionScopeInjectable;
    let someNormalInjectable;
    let someInjectableWithOverlappingId;
    let someOtherInjectableWithOverlappingId;
    let someInjectionScopeInjectable;

    beforeEach(() => {
      rootDi = createContainer('some-container');

      someNormalInjectable = getInjectable({
        id: 'some-overlapping-id',
        instantiate: () => 'some-instance-outside-of-scope',
      });

      someInjectableWithOverlappingId = getInjectable({
        id: 'some-overlapping-id',
        instantiate: () => 'some-instance-within-scope',
      });

      someOtherInjectableWithOverlappingId = getInjectable({
        id: 'some-overlapping-id',
        instantiate: () => 'irrelevant',
      });

      const someNestedInjectionScopeInjectable = getInjectable({
        id: 'some-nested-scope',
        scope: true,

        instantiate: di => ({
          lateRegister: di.register,
        }),
      });

      someInjectionScopeInjectable = getInjectable({
        id: 'some-scope',
        scope: true,

        instantiate: di => ({
          lateRegister: di.register,
        }),
      });

      someOtherInjectionScopeInjectable = getInjectable({
        id: 'some-other-scope',
        scope: true,

        instantiate: di => ({
          lateRegister: di.register,
        }),
      });

      rootDi.register(
        someNormalInjectable,
        someInjectionScopeInjectable,
        someOtherInjectionScopeInjectable,
      );

      someInjectionScope = rootDi.inject(someInjectionScopeInjectable);
    });

    it('when late-registering a new injectable with an overlapping id, does not throw', () => {
      expect(() => {
        someInjectionScope.lateRegister(someInjectableWithOverlappingId);
      }).not.toThrow();
    });

    describe('given late-registering an injectable with an overlapping id in a different scope', () => {
      beforeEach(() => {
        someInjectionScope.lateRegister(someInjectableWithOverlappingId);
      });

      it('when injecting injectable within scope, does so', () => {
        const someInstance = rootDi.inject(someInjectableWithOverlappingId);

        expect(someInstance).toBe('some-instance-within-scope');
      });

      it('when injecting injectable outside of scope, does so', () => {
        const someInstance = rootDi.inject(someNormalInjectable);

        expect(someInstance).toBe('some-instance-outside-of-scope');
      });

      it('given the injectable is de- and re-registered, when injected, does so', () => {
        rootDi.deregister(someInjectableWithOverlappingId);
        someInjectionScope.lateRegister(someInjectableWithOverlappingId);

        const someInstance = rootDi.inject(someInjectableWithOverlappingId);

        expect(someInstance).toBe('some-instance-within-scope');
      });
    });

    it('given late-registering an injectable with an overlapping id in a same scope, throws', () => {
      someInjectionScope.lateRegister(someInjectableWithOverlappingId);

      expect(() => {
        someInjectionScope.lateRegister(someOtherInjectableWithOverlappingId);
      }).toThrow(
        'Tried to register multiple injectables for ID "some-scope:some-overlapping-id"',
      );
    });

    it('when late-registering already registered injectable in a scope, still throws', () => {
      expect(() => {
        someInjectionScope.lateRegister(someNormalInjectable);
      }).toThrow(
        'Tried to register same injectable multiple times: "some-overlapping-id"',
      );
    });

    it('given injectables are late-registered in a scope, but the late-registered injectables are deregistered among their context, and late-registering the injectables again, when injecting, does so', () => {
      someInjectionScope.lateRegister(someInjectableWithOverlappingId);

      rootDi.deregister(someInjectionScopeInjectable);

      rootDi.register(someInjectionScopeInjectable);

      const someInjectionScopeAgain = rootDi.inject(
        someInjectionScopeInjectable,
      );

      someInjectionScopeAgain.lateRegister(someInjectableWithOverlappingId);

      const someInstance = rootDi.inject(someInjectableWithOverlappingId);
      expect(someInstance).toBe('some-instance-within-scope');
    });
  });

  it('given in scope, when injecting non-registered injectable, throws with namespace', () => {
    const someNonRegisteredInjectable = getInjectable({
      id: 'some-non-registered-injectable',
    });

    const someScopeInjectable = getInjectable({
      id: 'some-scope',
      scope: true,
      instantiate: di => ({
        lateRegister: di.register,
      }),
    });

    const someInjectableInScopeInjectable = getInjectable({
      id: 'some-injectable-in-scope',
      instantiate: di => ({
        inject: injectable => di.inject(injectable),
      }),
    });

    const di = createContainer('some-container');

    di.register(someScopeInjectable);

    const someScope = di.inject(someScopeInjectable);
    someScope.lateRegister(someInjectableInScopeInjectable);

    const someInjectableInScope = di.inject(someInjectableInScopeInjectable);

    expect(() => {
      someInjectableInScope.inject(someNonRegisteredInjectable);
    }).toThrow(
      'Tried to inject non-registered injectable "some-container" -> "some-scope:some-injectable-in-scope" -> "some-non-registered-injectable".',
    );
  });

  it('given side effects are prevented and in scope, when injecting, throws', () => {
    const someInjectableCausingSideEffects = getInjectable({
      id: 'some-injectable-in-scope-causing-side-effects',
      causesSideEffects: true,
    });

    const someScopeInjectable = getInjectable({
      id: 'some-scope',
      scope: true,
      instantiate: di => ({
        lateRegister: di.register,
      }),
    });

    const di = createContainer('some-container');

    di.preventSideEffects();

    di.register(someScopeInjectable);

    const someScope = di.inject(someScopeInjectable);

    someScope.lateRegister(someInjectableCausingSideEffects);

    expect(() => {
      di.inject(someInjectableCausingSideEffects);
    }).toThrow(
      'Tried to inject "some-container" -> "some-scope:some-injectable-in-scope-causing-side-effects" when side-effects are prevented.',
    );
  });

  it('given side effects are prevented and in scope, when injecting using an injection token, throws', () => {
    const someInjectionToken = getInjectionToken({ id: 'some-token' });

    const someInjectableCausingSideEffects = getInjectable({
      id: 'some-injectable-in-scope-causing-side-effects',
      causesSideEffects: true,
      injectionToken: someInjectionToken,
    });

    const someScopeInjectable = getInjectable({
      id: 'some-scope',
      scope: true,
      instantiate: di => ({
        lateRegister: di.register,
      }),
    });

    const di = createContainer('some-container');

    di.preventSideEffects();

    di.register(someScopeInjectable);

    const someScope = di.inject(someScopeInjectable);

    someScope.lateRegister(someInjectableCausingSideEffects);

    expect(() => {
      di.injectMany(someInjectionToken);
    }).toThrow(
      'Tried to inject "some-container" -> "(some-token)" -> "some-scope:some-injectable-in-scope-causing-side-effects" when side-effects are prevented.',
    );
  });
});
