import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';

describe('purging-of-instances, given injectable and registered', () => {
  let di;
  let someInjectable;

  beforeEach(() => {
    di = createContainer('irrelevant');

    someInjectable = getInjectable({
      id: 'irrelevant',

      instantiate: () => ({
        some: 'instance',
      }),
    });

    di.register(someInjectable);
  });

  it('when injecting twice, instance is the same', () => {
    const injected1 = di.inject(someInjectable);
    const injected2 = di.inject(someInjectable);

    expect(injected1).toBe(injected2);
  });

  it('given injected, and all is purged, but injectable is re-registered, when injecting again, instance is not the same', () => {
    const injected1 = di.inject(someInjectable);

    di.purgeAllButOverrides();
    di.register(someInjectable);

    const injected2 = di.inject(someInjectable);

    expect(injected1).not.toBe(injected2);
  });

  it('given overridden injectable, and given injected, and all is purged, but injectable is re-registered, when injecting again, override is not purged and thus instance remains overridden', () => {
    di.override(someInjectable, () => 'some-overridden-value');

    di.purgeAllButOverrides();

    di.register(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-overridden-value');
  });
});
