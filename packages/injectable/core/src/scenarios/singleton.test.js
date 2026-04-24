import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';

describe('createContainer.singleton', () => {
  it('given multiple containers and shared singleton, when injected from different containers, injects different instance', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di1 = createContainer('some-container');
    di1.register(someInjectable);

    const di2 = createContainer('some-container');
    di2.register(someInjectable);

    const actual1 = di1.inject(someInjectable);
    const actual2 = di2.inject(someInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given an injectable is singleton, when injected multiple times, injects singleton', () => {
    const singletonInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = createContainer('some-container');

    di.register(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);
    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is does not specify lifecycle, when injected multiple times, defaults to injecting singleton', () => {
    const injectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => ({}),
      lifecycle: undefined,
    });

    const di = createContainer('some-container');

    di.register(injectable);

    const actual1 = di.inject(injectable);
    const actual2 = di.inject(injectable);

    expect(actual1).toBe(actual2);
  });

  it('given an injectable is singleton and injected but purged, when injected, injects new instance', () => {
    const singletonInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = createContainer('some-container');

    di.register(singletonInjectable);

    const actual1 = di.inject(singletonInjectable);

    di.purge(singletonInjectable);

    const actual2 = di.inject(singletonInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given an injectable is singleton and injected but unrelated singleton is purged, when injected again, injects same instance', () => {
    const singletonInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const unrelatedSingletonInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.singleton,
    });

    const di = createContainer('some-container');

    di.register(singletonInjectable, unrelatedSingletonInjectable);

    const actual1 = di.inject(singletonInjectable);

    di.purge(unrelatedSingletonInjectable);

    const actual2 = di.inject(singletonInjectable);

    expect(actual1).toBe(actual2);
  });

  it('given a singleton and injected using an instantiation parameter, throws', () => {
    const singletonInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      lifecycle: lifecycleEnum.singleton,
    });

    const di = createContainer('some-container');

    di.register(singletonInjectable);

    expect(() => {
      di.inject(singletonInjectable, 'some-instantiation-parameter');
    }).toThrow(
      'Tried to inject singleton "some-injectable" from "some-container", but illegally to singletons, instantiationParameters were provided: "some-instantiation-parameter".',
    );
  });

  describe('given a singleton injected with only undefined args', () => {
    let singletonInjectable;
    let di;
    let instantiationCount;
    let actual1;
    let actual2;
    let actual3;

    beforeEach(() => {
      instantiationCount = 0;

      singletonInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => {
          instantiationCount++;
          return {};
        },
        lifecycle: lifecycleEnum.singleton,
      });

      di = createContainer('some-container');

      di.register(singletonInjectable);

      actual1 = di.inject(singletonInjectable, undefined);
      actual2 = di.inject(singletonInjectable, undefined);
      actual3 = di.inject(singletonInjectable);
    });

    it('when injected twice with undefined, returns the same instance', () => {
      expect(actual1).toBe(actual2);
    });

    it('when injected with undefined and then without args, returns the same instance', () => {
      expect(actual2).toBe(actual3);
    });

    it('instantiates only once', () => {
      expect(instantiationCount).toBe(1);
    });
  });
});
