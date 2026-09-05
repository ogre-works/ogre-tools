import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { instantiationDecoratorToken } from '../dependency-injection-container/tokens';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('access-to-own-identity', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('given injectable2 registered at container level', () => {
    let someInjectable;

    beforeEach(() => {
      someInjectable = getInjectable2({
        id: 'some-injectable',
        instantiate: di => () => ({
          id: di.id,
          scopeIds: di.scopeIds,
          scopedId: di.scopedId,
        }),
      });

      di.register(someInjectable);
    });

    it('when instantiated, knows its own id', () => {
      expect(di.inject(someInjectable).id).toBe('some-injectable');
    });

    it('when instantiated, has no scope ids', () => {
      expect(di.inject(someInjectable).scopeIds).toEqual([]);
    });

    it('when instantiated, its scoped id is just its own id', () => {
      expect(di.inject(someInjectable).scopedId).toEqual([
        'some-injectable',
      ]);
    });
  });

  describe('given injectable2 registered within nested scopes', () => {
    let someInjectable;

    beforeEach(() => {
      someInjectable = getInjectable2({
        id: 'some-injectable',
        instantiate: di => () => ({
          scopeIds: di.scopeIds,
          scopedId: di.scopedId,
        }),
      });

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
    });

    it('when instantiated, knows the ids of its scopes, outermost first', () => {
      expect(di.inject(someInjectable).scopeIds).toEqual([
        'some-outer-scope',
        'some-inner-scope',
      ]);
    });

    it('when instantiated, its scoped id ends with its own id', () => {
      expect(di.inject(someInjectable).scopedId).toEqual([
        'some-outer-scope',
        'some-inner-scope',
        'some-injectable',
      ]);
    });

    it('when the scope ids are read again, arrays are fresh instead of shared', () => {
      const someInstance = di.inject(someInjectable);

      someInstance.scopeIds.push('some-mutation');

      di.purge(someInjectable);

      expect(di.inject(someInjectable).scopeIds).toEqual([
        'some-outer-scope',
        'some-inner-scope',
      ]);
    });
  });

  it('given injectable2 registered within a scope owned by a v1 injectable, when instantiated, the v1 owner counts as a scope like any other', () => {
    const someInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: di => () => di.scopedId,
    });

    const someScopeInjectable = getInjectable({
      id: 'some-scope',
      instantiate: di => di.register(someInjectable),
    });

    di.register(someScopeInjectable);
    di.inject(someScopeInjectable);

    expect(di.inject(someInjectable)).toEqual([
      'some-scope',
      'some-injectable',
    ]);
  });

  it('given injectable2 deregistered from one scope and registered within another, when instantiated, the scope ids follow', () => {
    const someInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: di => () => di.scopedId,
    });

    const someScopeInjectable = getInjectable2({
      id: 'some-scope',
      instantiate: di => () => ({
        register: di.register,
        deregister: di.deregister,
      }),
    });

    const someOtherScopeInjectable = getInjectable2({
      id: 'some-other-scope',
      instantiate: di => () => di.register(someInjectable),
    });

    di.register(someScopeInjectable, someOtherScopeInjectable);

    const someScope = di.inject(someScopeInjectable);

    someScope.register(someInjectable);
    someScope.deregister(someInjectable);
    di.inject(someOtherScopeInjectable);

    expect(di.inject(someInjectable)).toEqual([
      'some-other-scope',
      'some-injectable',
    ]);
  });

  describe('given injectable2 registered within a scope, and overridden', () => {
    let someInjectable;

    beforeEach(() => {
      someInjectable = getInjectable2({
        id: 'some-injectable',
        instantiate: () => () => 'irrelevant',
      });

      const someScopeInjectable = getInjectable2({
        id: 'some-scope',
        instantiate: di => () => di.register(someInjectable),
      });

      di.register(someScopeInjectable);
      di.inject(someScopeInjectable);

      di.override2(someInjectable, di => () => ({
        id: di.id,
        scopedId: di.scopedId,
      }));
    });

    it('when instantiated, the override sees the identity of the original', () => {
      expect(di.inject(someInjectable)).toEqual({
        id: 'some-injectable',
        scopedId: ['some-scope', 'some-injectable'],
      });
    });
  });

  it('given injectables sharing an id, registered in different scopes, when instantiated, the scoped ids tell them apart', () => {
    const someInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: di => () => di.scopedId.join('/'),
    });

    const someOtherInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: di => () => di.scopedId.join('/'),
    });

    const someScopeInjectable = getInjectable2({
      id: 'some-scope',
      instantiate: di => () => di.register(someInjectable),
    });

    const someOtherScopeInjectable = getInjectable2({
      id: 'some-other-scope',
      instantiate: di => () => di.register(someOtherInjectable),
    });

    di.register(someScopeInjectable, someOtherScopeInjectable);
    di.inject(someScopeInjectable);
    di.inject(someOtherScopeInjectable);

    expect([
      di.inject(someInjectable),
      di.inject(someOtherInjectable),
    ]).toEqual([
      'some-scope/some-injectable',
      'some-other-scope/some-injectable',
    ]);
  });

  it('given injectable2 early-overridden before being registered within a scope, when instantiated, the override sees the identity of the original', () => {
    const someInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: () => () => 'irrelevant',
    });

    const someScopeInjectable = getInjectable2({
      id: 'some-scope',
      instantiate: di => () => di.register(someInjectable),
    });

    di.earlyOverride2(someInjectable, di => () => di.scopedId);
    di.register(someScopeInjectable);
    di.inject(someScopeInjectable);

    expect(di.inject(someInjectable)).toEqual([
      'some-scope',
      'some-injectable',
    ]);
  });

  describe('given instantiation decorator targeting a token, and implementations registered in different scopes', () => {
    let someInjectable;
    let someOtherInjectable;

    beforeEach(() => {
      const someInjectionToken = getInjectionToken2({
        id: 'some-injection-token',
        cardinality: 'zero-or-many',
      })();

      someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someInjectionToken,
        instantiate: () => () => 'some-instance',
      });

      someOtherInjectable = getInjectable2({
        id: 'some-other-injectable',
        injectionToken: someInjectionToken,
        instantiate: () => () => 'some-other-instance',
      });

      const decoratorInjectable = getInjectable2({
        id: 'some-decorator',
        injectionToken: instantiationDecoratorToken.for(someInjectionToken),
        instantiate:
          () =>
          () =>
          instantiate =>
          di =>
          (...params) =>
            `${di.scopedId.join(':')}(${instantiate(di)(...params)})`,
      });

      const someScopeInjectable = getInjectable2({
        id: 'some-scope',
        instantiate: di => () => di.register(someInjectable),
      });

      const someOtherScopeInjectable = getInjectable2({
        id: 'some-other-scope',
        instantiate: di => () => di.register(someOtherInjectable),
      });

      di.register(
        decoratorInjectable,
        someScopeInjectable,
        someOtherScopeInjectable,
      );

      di.inject(someScopeInjectable);
      di.inject(someOtherScopeInjectable);
    });

    it('when instantiated, the decorator sees the identity of what it decorates, not its own', () => {
      expect([
        di.inject(someInjectable),
        di.inject(someOtherInjectable),
      ]).toEqual([
        'some-scope:some-injectable(some-instance)',
        'some-other-scope:some-other-injectable(some-other-instance)',
      ]);
    });
  });

  it('given v1 injectable, when instantiated, the identity is not exposed, as the v1 di is unchanged', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: di => ({
        id: di.id,
        scopeIds: di.scopeIds,
        scopedId: di.scopedId,
      }),
      lifecycle: lifecycleEnum.singleton,
    });

    di.register(someInjectable);

    expect(di.inject(someInjectable)).toEqual({
      id: undefined,
      scopeIds: undefined,
      scopedId: undefined,
    });
  });
});
