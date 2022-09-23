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

    const di = createContainer('some-container');

    const someRequireContext = getRequireContextStub({
      default: injectableStub,
    });

    autoRegister({ di, requireContexts: [someRequireContext] });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given injectable file with no injectables, when auto-registering, throws', () => {
    const requireContextStub = Object.assign(
      () => ({
        someExport: 'irrelevant',
      }),

      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer('some-container');

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).toThrowError(
      'Tried to register injectables from "./some.injectable.js", but there were none',
    );
  });

  it('given injectable file with default export without id, when auto-registering, throws', () => {
    const injectable = getInjectable({ instantiate: () => {} });

    const requireContextStub = Object.assign(
      () => ({
        default: injectable,
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer('some-container');

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).toThrowError(
      'Tried to register injectables from "./some.injectable.js", but export "default" is of wrong shape',
    );
  });

  it('given injectable file with an id but without instantiate, when auto-registering, throws', () => {
    const injectable = getInjectable({ id: 'irrelevant' });

    const requireContextStub = Object.assign(
      () => ({
        default: injectable,
      }),
      {
        keys: () => ['./some.injectable.js'],
      },
    );

    const di = createContainer('some-container');

    expect(() =>
      autoRegister({ di, requireContexts: [requireContextStub] }),
    ).toThrowError(
      'Tried to register injectables from "./some.injectable.js", but export "default" is of wrong shape',
    );
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

    const di = createContainer('some-container');

    autoRegister({
      di,

      requireContexts: [
        getRequireContextStub({ default: childInjectable }),
        getRequireContextStub({ default: parentInjectable }),
      ],
    });

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  it('given file with both injectable and non-injectable exports, given auto-registered, when injecting one of the injectables, does so', () => {
    const injectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const di = createContainer('some-container');

    autoRegister({
      di,

      requireContexts: [
        getRequireContextStub({
          someExport: injectable,
          someOtherExport: 'not-an-injectable',
        }),
      ],
    });

    const actual = di.inject(injectable);

    expect(actual).toBe('some-instance');
  });
});

const getRequireContextStub = (...modules) => {
  const contextDictionary = pipeline(
    modules,

    nonCappedMap((module, index) => [
      `stubbed-require-context-key-${index}`,
      module,
    ]),

    fromPairs,
  );

  return Object.assign(contextKey => contextDictionary[contextKey], {
    keys: () => keys(contextDictionary),
  });
};
