import createContainer from '../dependency-injection-container/createContainer';
import getInjectable2 from '../getInjectable2/getInjectable2';
import lifecycleEnum2 from '../dependency-injection-container/lifecycleEnum2';

describe('injection-using-api2', () => {
  let di;

  beforeEach(() => {
    di = createContainer('irrelevant');
  });

  describe('given injectable2 singleton', () => {
    let someSingleton;

    beforeEach(() => {
      someSingleton = getInjectable2({
        id: 'some-injectable',
        instantiate: di => () => 'some-instance',
      });

      di.register(someSingleton);
    });

    it('when injected using API1.0, does so', () => {
      const actual = di.inject(someSingleton);

      expect(actual).toBe('some-instance');
    });

    it('when injected using API2.0, does so', () => {
      const actual = di.inject2(someSingleton)();

      expect(actual).toBe('some-instance');
    });
  });

  describe('given injectable2 keyedSingleton', () => {
    let someKeyedSingleton;

    beforeEach(() => {
      someKeyedSingleton = getInjectable2({
        id: 'some-injectable',

        instantiate:
          di =>
          (...parameters) =>
            `some-instance(${parameters.join(', ')})`,

        lifecycle: lifecycleEnum2.keyedSingleton({
          getInstanceKey: di => param1 => param1,
        }),
      });

      di.register(someKeyedSingleton);
    });

    it('when injected using API1.0 and the instantiation parameter, does so', () => {
      const actual = di.inject(someKeyedSingleton, 'some-parameter');

      expect(actual).toBe('some-instance(some-parameter)');
    });

    it('when injected using API2.0, and multiple instantiation parameters, does so', () => {
      const actual = di.inject2(someKeyedSingleton)(
        'some-parameter-1',
        'some-parameter-2',
      );

      expect(actual).toBe('some-instance(some-parameter-1, some-parameter-2)');
    });
  });
});
