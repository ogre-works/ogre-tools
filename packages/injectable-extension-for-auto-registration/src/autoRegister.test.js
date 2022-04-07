import { createContainer, getInjectable } from '@ogre-tools/injectable';
import { pipeline } from '@ogre-tools/fp';
import map from 'lodash/fp/map';
import fromPairs from 'lodash/fp/fromPairs';
import keys from 'lodash/fp/keys';
import autoRegister from './autoRegister';

const nonCappedMap = map.convert({ cap: false });

describe('autoRegister', () => {
  it('injects auto-registered injectable without sub-injectables', () => {
    const injectableStub = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-injected-instance',
    });

    const di = createContainer();

    const someRequireContext = getRequireContextStub(injectableStub);

    autoRegister({ di, requireContexts: [someRequireContext] });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given injectable file with no default export, when auto-registering, throws with name of faulty file', () => {
    const requireContextStub = Object.assign(
      () => ({
        notDefault: 'irrelevant',
      }),

      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer();

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).toThrowError(
      'Tried to register injectable from ./some.injectable.js, but no default export',
    );
  });

  it('given injectable file with default export without id, when auto-registering, throws with name of faulty file', () => {
    const requireContextStub = Object.assign(
      () => ({
        default: 'irrelevant',
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer();

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).toThrowError(
      'Tried to register injectable from ./some.injectable.js, but default export is of wrong shape',
    );
  });

  it('given injectable file with default export with in but without instantiate, when auto-registering, throws with name of faulty file', () => {
    const requireContextStub = Object.assign(
      () => ({
        default: {
          id: 'irrelevant',
        },
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer();

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).toThrowError(
      'Tried to register injectable from ./some.injectable.js, but default export is of wrong shape',
    );
  });

  it('given injectable file with default export of correct shape, when auto-registering, does not throw', () => {
    const requireContextStub = Object.assign(
      () => ({
        default: {
          id: 'some-injectable-id',
          instantiate: () => {},
        },
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer();

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).not.toThrow();
  });

  it('injects auto-registered injectable with a another auto-registered child-injectable', () => {
    const childInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-child-instance',
    });

    const parentInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer();

    autoRegister({
      di,

      requireContexts: [
        getRequireContextStub(childInjectable),
        getRequireContextStub(parentInjectable),
      ],
    });

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });
});

const getRequireContextStub = (...injectables) => {
  const contextDictionary = pipeline(
    injectables,
    map(injectable => ({ default: injectable })),

    nonCappedMap((file, index) => [
      `stubbed-require-context-key-${index}`,
      file,
    ]),

    fromPairs,
  );

  return Object.assign(contextKey => contextDictionary[contextKey], {
    keys: () => keys(contextDictionary),
  });
};
