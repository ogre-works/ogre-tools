import { createContainer, getInjectable } from '@ogre-tools/injectable';
import { getSafeFrom, pipeline } from '@ogre-tools/fp';
import { fromPairs, keys, map } from 'lodash/fp';
import autoRegisterFor from './autoRegister';
import { getInjectableBunch } from '@ogre-tools/injectable';

const nonCappedMap = map.convert({ cap: false });

describe('autoRegister', () => {
  let autoRegister;
  let fsStub;
  let pathStub;

  beforeEach(() => {
    fsStub = {
      readdirSync: jest.fn(),
      statSync: jest.fn(),
    };

    const resolvePathFake = (...args) =>
      args.filter(x => !['./', '.'].includes(x)).join('/');

    pathStub = {
      resolve: resolvePathFake,
    };

    autoRegister = autoRegisterFor({
      fs: fsStub,
      path: pathStub,
    });
  });

  it('given file with injectable as export and auto-registered, when an injectable in bunch is injected, does so', () => {
    const injectableStub = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-injected-instance',
    });

    const requireStub = {
      context: getSafeFrom({
        'some-directory/': getRequireContextStub({
          default: injectableStub,
        }),
      }),
    };

    const di = createContainer('some-container');

    autoRegister({
      di,

      targetModule: {
        require: requireStub,
      },

      getRequireContexts: () => [
        requireStub.context('some-directory/', true, /\.injectable\.js$/),
      ],
    });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given file with same injectable exported multiple times, and auto-registered, when the injectable is injected, does so', () => {
    const injectableStub = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-injected-instance',
    });

    const requireStub = {
      context: getSafeFrom({
        'some-directory/': getRequireContextStub({
          default: injectableStub,
          someNamedExport: injectableStub,
        }),
      }),
    };

    const di = createContainer('some-container');

    autoRegister({
      di,

      targetModule: {
        require: requireStub,
      },

      getRequireContexts: () => [
        requireStub.context('some-directory/', true, /\.injectable\.js$/),
      ],
    });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-injected-instance');
  });

  it('given file with injectable bunch as export and auto-registered, when an injectable in bunch is injected, does so', () => {
    const someInjectableBunch = getInjectableBunch({
      someInjectable: getInjectable({
        id: 'irrelevant',
        instantiate: () => 'some-injected-instance',
      }),
    });

    const requireStub = {
      context: getSafeFrom({
        'some-directory/': getRequireContextStub({
          default: someInjectableBunch,
        }),
      }),
    };

    const di = createContainer('some-container');

    autoRegister({
      di,

      targetModule: {
        require: requireStub,
      },

      getRequireContexts: () => [
        requireStub.context('some-directory/', true, /\.injectable\.js$/),
      ],
    });

    const actual = di.inject(someInjectableBunch.someInjectable);

    expect(actual).toBe('some-injected-instance');
  });

  it('given file with empty injectable bunch as export, when auto-registered, throws', () => {
    const someInjectableBunch = getInjectableBunch({});

    const requireContextStub = Object.assign(
      () => ({
        someExport: someInjectableBunch,
      }),

      {
        keys: () => ['./some.injectable.js'],
      },
    );
    const requireStub = {
      context: getSafeFrom({
        'some-directory/': requireContextStub,
      }),
    };

    const di = createContainer('some-container');

    expect(() => {
      autoRegister({
        di,

        targetModule: {
          require: requireStub,
        },

        getRequireContexts: () => [
          requireStub.context('some-directory/', true, /\.injectable\.js$/),
        ],
      });
    }).toThrow(
      'Tried to register injectables from "./some.injectable.js", but there were none"',
    );
  });

  it('given webpack, injects', () => {
    const injectableStub = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const requireStub = {
      // Note: this is only present with Webpack.
      context: getSafeFrom({
        'some-directory/': getRequireContextStub({
          default: injectableStub,
        }),
      }),
    };

    const di = createContainer('some-container');

    autoRegister({
      di,
      targetModule: { require: requireStub, path: '/some-module-path' },

      getRequireContexts: () => [
        requireStub.context('some-directory/', true, /\.injectable\.js$/),
      ],
    });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-instance');
  });

  it('given no-webpack and maximal require contexts, injects', () => {
    const injectableStub = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const requireStub = getSafeFrom({
      '/some-module-path/some-directory/some-file.injectable.js': {
        default: injectableStub,
      },
    });

    fsStub.readdirSync.mockImplementation(
      getSafeFrom({
        '/some-module-path': ['some-directory', 'some-irrelevant-directory'],

        '/some-module-path/some-directory': [
          'some-file.injectable.js',
          'some-irrelevant-file.js',
        ],

        '/some-module-path/some-irrelevant-directory': [],
      }),
    );

    fsStub.statSync.mockImplementation(
      getSafeFrom({
        '/some-module-path/some-directory': { isDirectory: () => true },

        '/some-module-path/some-irrelevant-directory': {
          isDirectory: () => true,
        },

        '/some-module-path/some-directory/some-file.injectable.js': {
          isDirectory: () => false,
        },

        '/some-module-path/some-directory/some-irrelevant-file.js': {
          isDirectory: () => false,
        },
      }),
    );

    const di = createContainer('some-container');

    autoRegister({
      di,
      targetModule: { require: requireStub, path: '/some-module-path' },

      getRequireContexts: () => [
        // Note: the 3 arguments here make the context maximal.
        requireStub.context('./', true, /\.injectable\.js$/),
      ],
    });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-instance');
  });

  it('given no-webpack and minimal require contexts, injects', () => {
    const injectableStub = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const requireStub = getSafeFrom({
      '/some-module-path/some-file.injectable.js': {
        default: injectableStub,
      },
    });

    fsStub.readdirSync.mockImplementation(
      getSafeFrom({
        '/some-module-path': [
          'some-file.injectable.js',
          'some-irrelevant-directory',
        ],
      }),
    );

    fsStub.statSync.mockImplementation(
      getSafeFrom({
        '/some-module-path/some-file.injectable.js': {
          isDirectory: () => false,
        },

        '/some-module-path/some-irrelevant-directory': {
          isDirectory: () => true,
        },
      }),
    );

    const di = createContainer('some-container');

    autoRegister({
      di,
      targetModule: { require: requireStub, path: '/some-module-path' },

      getRequireContexts: () => [
        // Note: the no arguments here make the context minimal.
        requireStub.context(),
      ],
    });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-instance');
  });

  it('given operating in already built package, injects', () => {
    const injectableStub = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const di = createContainer('some-container');

    autoRegister({
      di,
      // Note: require being undefined in module implies package being already built.
      targetModule: { require: undefined, path: '/some-module-path' },

      getRequireContexts: () => [
        // Note: in packages that are already built, require contexts are inlined.
        getRequireContextStub({ default: injectableStub }),
      ],
    });

    const actual = di.inject(injectableStub);

    expect(actual).toBe('some-instance');
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

    const requireStub = {
      context: getSafeFrom({
        'some-directory/': requireContextStub,
      }),
    };

    expect(() =>
      autoRegister({
        di,

        targetModule: { require: requireStub },

        getRequireContexts: () => [
          requireStub.context('some-directory/', true, /\.injectable\.js$/),
        ],
      }),
    ).toThrowError(
      'Tried to register injectables from "./some.injectable.js", but there were none',
    );
  });

  it('given no matching injectable files, when auto-registering, throws', () => {
    const requireContextStub = Object.assign(
      () => ({
        someExport: 'irrelevant',
      }),

      {
        keys: () => [],
      },
    );

    const di = createContainer('some-container');

    const requireStub = {
      context: getSafeFrom({
        'some-directory/': requireContextStub,
      }),
    };

    expect(() =>
      autoRegister({
        di,

        targetModule: { require: requireStub },

        getRequireContexts: () => [
          requireStub.context('some-directory/', true, /\.injectable\.js$/),
        ],
      }),
    ).toThrowError(
      'Tried to auto-register injectables, but no matching files were found',
    );
  });

  it('given file with both injectable and non-injectable exports, given auto-registered, when injecting one of the injectables, does so', () => {
    const injectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const requireStub = {
      context: getSafeFrom({
        'some-directory/': getRequireContextStub({
          someExport: injectable,
          someOtherExport: 'not-an-injectable',
        }),
      }),
    };

    const di = createContainer('some-container');

    autoRegister({
      di,

      targetModule: {
        require: requireStub,
      },

      getRequireContexts: () => [
        requireStub.context('some-directory/', true, /\.injectable\.js$/),
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
