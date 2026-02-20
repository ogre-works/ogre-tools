import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getCompositeKey } from '../getCompositeKey/getCompositeKey';

describe('createContainer.keyed-singleton', () => {
  describe('given key from instantiation parameter', () => {
    let di;
    let injectable;

    beforeEach(() => {
      injectable = getInjectable({
        id: 'irrelevant',
        instantiate: () => ({}),

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, instantiationParameter) => instantiationParameter,
        }),
      });

      di = createContainer('some-container');

      di.register(injectable);
    });

    it('when injected multiple times with same key, injects same instance', () => {
      const actual1 = di.inject(injectable, 'some-key');
      const actual2 = di.inject(injectable, 'some-key');

      expect(actual1).toBe(actual2);
    });

    it('when injected multiple times with same composite key, injects same instance', () => {
      const someReferenceKey1 = {};
      const someReferenceKey2 = {};

      const actual1 = di.inject(
        injectable,

        getCompositeKey(
          someReferenceKey1,
          'some-primitive-key',
          someReferenceKey2,
        ),
      );

      const actual2 = di.inject(
        injectable,

        getCompositeKey(
          someReferenceKey1,
          'some-primitive-key',
          someReferenceKey2,
        ),
      );

      expect(actual1).toBe(actual2);
    });

    it('when injected multiple times with different key, injects different instance', () => {
      const actual1 = di.inject(injectable, 'some-key');
      const actual2 = di.inject(injectable, 'some-other-key');

      expect(actual1).not.toBe(actual2);
    });

    it('given injected multiple times with different key, when injected again with same key, injects same instance', () => {
      const actual1 = di.inject(injectable, 'some-key');
      di.inject(injectable, 'some-other-key');

      const actual2 = di.inject(injectable, 'some-key');

      expect(actual1).toBe(actual2);
    });

    it('when injected multiple times with different length of composite key, injects different instances', () => {
      const actual1 = di.inject(
        injectable,
        getCompositeKey(
          'some-string',
          'some-other-string',
          'some-primitive-key',
        ),
      );

      const actual2 = di.inject(
        injectable,
        getCompositeKey('some-string', 'some-other-string'),
      );

      expect(actual1).not.toBe(actual2);
      expect(actual1).toEqual({});
      expect(actual2).toEqual({});
    });
  });

  it('given keyed singleton and keyed by another injected value, when injected multiple times with same resulting key, injects same instance', () => {
    const mainInjectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, instantiationParameter) =>
          di.inject(keyInjectable, instantiationParameter),
      }),
    });

    const keyInjectable = getInjectable({
      id: 'some-other-injectable-id',

      instantiate: (di, instantiationParameter) =>
        `some-injected-key: ${instantiationParameter}`,

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(mainInjectable, keyInjectable);

    const actual1 = di.inject(
      mainInjectable,
      'some-instantiation-parameter-for-injected-key',
    );

    const actual2 = di.inject(
      mainInjectable,
      'some-instantiation-parameter-for-injected-key',
    );

    expect(actual1).toBe(actual2);
  });

  it('given keyed singleton and keyed by another injected value, when injected multiple times with different resulting key, injects different instance', () => {
    const mainInjectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, instantiationParameter) =>
          di.inject(keyInjectable, instantiationParameter),
      }),
    });

    const keyInjectable = getInjectable({
      id: 'some-other-injectable-id',

      instantiate: (di, instantiationParameter) =>
        `some-injected-key: ${instantiationParameter}`,

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(mainInjectable, keyInjectable);

    const actual1 = di.inject(
      mainInjectable,
      'some-instantiation-parameter-for-injected-key',
    );

    const actual2 = di.inject(
      mainInjectable,
      'some-other-instantiation-parameter-for-injected-key',
    );

    expect(actual1).not.toBe(actual2);
  });

  it('given multiple keyed singletons, when injected with same key, injects different instances', () => {
    const injectable1 = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (_, instantiationParameter) => instantiationParameter,
      }),
    });

    const injectable2 = getInjectable({
      id: 'some-other-injectable-id',
      instantiate: () => ({}),

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (_, instantiationParameter) => instantiationParameter,
      }),
    });

    const di = createContainer('some-container');

    di.register(injectable1, injectable2);

    const actual1 = di.inject(injectable1, 'some-instance-key');
    const actual2 = di.inject(injectable2, 'some-instance-key');

    expect(actual1).not.toBe(actual2);
  });
});
