import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('injection-using-api2', () => {
  let di;

  beforeEach(() => {
    di = createContainer('irrelevant');
  });

  describe('given singleton using instantiate factory over instantiate', () => {
    let someSingleton;

    beforeEach(() => {
      someSingleton = getInjectable({
        id: 'some-injectable',
        instantiateFactory: di => () => 'some-instance',
      });

      di.register(someSingleton);
    });

    it('when injected, does so', () => {
      const actual = di.inject(someSingleton);

      expect(actual).toBe('some-instance');
    });

    it('when injected using factory, does so', () => {
      const actual = di.injectFactory(someSingleton)();

      expect(actual).toBe('some-instance');
    });
  });

  describe('given keyedSingleton using instantiate factory over instantiate', () => {
    let someKeyedSingleton;

    beforeEach(() => {
      someKeyedSingleton = getInjectable({
        id: 'some-injectable',

        instantiateFactory:
          di =>
          (...parameters) =>
            `some-instance(${parameters.join(', ')})`,

        lifecycleFactory: {
          getInstanceKey: () => param => param,
        },
      });

      di.register(someKeyedSingleton);
    });

    it('when injected using instantiation parameter, does so', () => {
      const actual = di.inject(someKeyedSingleton, 'some-parameter');

      expect(actual).toBe('some-instance(some-parameter)');
    });

    it('when injected using factory and instantiation parameter, does so', () => {
      const actual = di.injectFactory(someKeyedSingleton)('some-parameter');

      expect(actual).toBe('some-instance(some-parameter)');
    });
  });
});
