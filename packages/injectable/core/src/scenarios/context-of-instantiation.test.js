import { get } from 'lodash/fp';
import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  instantiationDecoratorToken,
  injectionDecoratorToken,
} from '../dependency-injection-container/tokens';

describe('createContainer.context-of-instantiation', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  it('given injectable, when injected, has context', () => {
    let actualContext;

    const someInjectable = getInjectable({
      id: 'some-injectable',

      instantiate: di => {
        actualContext = di.context;
      },
    });

    di.register(someInjectable);

    di.inject(someInjectable);

    expect(actualContext.map(get('injectable.id'))).toEqual([
      'some-container',
      'some-injectable',
    ]);
  });

  it('given injectable with token, when injected as singular using the token, has context', () => {
    let actualContext;

    const someToken = getInjectionToken({ id: 'some-injection-token' });

    const someInjectable = getInjectable({
      id: 'some-injectable',

      instantiate: di => {
        actualContext = di.context;
      },

      injectionToken: someToken,
    });

    di.register(someInjectable);

    di.inject(someToken);

    expect(actualContext.map(get('injectable.id'))).toEqual([
      'some-container',
      'some-injectable',
    ]);
  });

  it('given injectable with token, when injected as many using the token, has context', () => {
    let actualContext;

    const someToken = getInjectionToken({ id: 'some-injection-token' });

    const someInjectable = getInjectable({
      id: 'some-injectable',

      instantiate: di => {
        actualContext = di.context;
      },

      injectionToken: someToken,
    });

    di.register(someInjectable);

    di.injectMany(someToken);

    expect(actualContext.map(get('injectable.id'))).toEqual([
      'some-container',
      'some-injection-token',
      'some-injectable',
    ]);
  });

  it('given parent and child injectable, when parent is injected, child has context', () => {
    let actualChildContext;

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: di => {
        actualChildContext = di.context;
      },
    });

    const someParentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: di => {
        di.inject(someChildInjectable);
      },
    });

    di.register(someParentInjectable, someChildInjectable);

    di.inject(someParentInjectable);

    expect(actualChildContext.map(get('injectable.id'))).toEqual([
      'some-container',
      'some-parent-injectable',
      'some-child-injectable',
    ]);
  });

  it('given parent and child injectable with tokens, when injections are done as singular, child has context', () => {
    let actualChildContext;

    const someChildToken = getInjectionToken({
      id: 'some-child-injection-token',
    });

    const someParentToken = getInjectionToken({
      id: 'some-parent-injection-token',
    });

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: di => {
        actualChildContext = di.context;
      },

      injectionToken: someChildToken,
    });

    const someParentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: di => {
        di.inject(someChildToken);
      },

      injectionToken: someParentToken,
    });

    di.register(someParentInjectable, someChildInjectable);

    di.inject(someParentToken);

    expect(actualChildContext.map(get('injectable.id'))).toEqual([
      'some-container',
      // Todo: a token should be here?
      'some-parent-injectable',
      // Todo: a token should be here as well?
      'some-child-injectable',
    ]);
  });

  it('given parent and child injectable with tokens, when injections are done as many, child has context', () => {
    let actualChildContext;

    const someChildToken = getInjectionToken({
      id: 'some-child-injection-token',
    });

    const someParentToken = getInjectionToken({
      id: 'some-parent-injection-token',
    });

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: di => {
        actualChildContext = di.context;
      },

      injectionToken: someChildToken,
    });

    const someParentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: di => {
        di.injectMany(someChildToken);
      },

      injectionToken: someParentToken,
    });

    di.register(someParentInjectable, someChildInjectable);

    di.injectMany(someParentToken);

    expect(actualChildContext.map(get('injectable.id'))).toEqual([
      'some-container',
      'some-parent-injection-token',
      'some-parent-injectable',
      'some-child-injection-token',
      'some-child-injectable',
    ]);
  });

  it('given async parent and child injectable with tokens, when injections are done as many, child has context', async () => {
    let actualChildContext;

    const someChildToken = getInjectionToken({
      id: 'some-child-injection-token',
    });

    const someParentToken = getInjectionToken({
      id: 'some-parent-injection-token',
    });

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: async di => {
        await new Promise(resolve => resolve());
        actualChildContext = di.context;
      },

      injectionToken: someChildToken,
    });

    const someParentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: async di => {
        await di.injectMany(someChildToken);
      },

      injectionToken: someParentToken,
    });

    di.register(someParentInjectable, someChildInjectable);

    await di.injectMany(someParentToken);

    expect(actualChildContext.map(get('injectable.id'))).toEqual([
      'some-container',
      'some-parent-injection-token',
      'some-parent-injectable',
      'some-child-injection-token',
      'some-child-injectable',
    ]);
  });

  describe('given an instantiation decorator and a decorated injectable, when injected', () => {
    let contextOfDecorator;
    let contextOfInjectable;

    beforeEach(() => {
      const someInjectable = getInjectable({
        id: 'some-injectable',

        instantiate: di => {
          contextOfInjectable = di.context;
        },
      });

      const someDecorator = getInjectable({
        id: 'some-decorator',

        instantiate: di => {
          contextOfDecorator = di.context;

          return {
            decorate:
              toBeDecorated =>
              (...args) =>
                toBeDecorated(...args),
          };
        },

        injectionToken: instantiationDecoratorToken,

        decorable: false,
      });

      di.register(someInjectable, someDecorator);

      di.inject(someInjectable);
    });

    it('decorator has context', () => {
      expect(contextOfDecorator.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-injectable',
        'instantiate-decorator-token',
        'some-decorator',
      ]);
    });

    it('decorated injectable has context without knowledge of decorator', () => {
      expect(contextOfInjectable.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-injectable',
      ]);
    });
  });

  describe('given an injection decorator and a decorated injectable, when injected', () => {
    let contextOfDecorator;
    let contextOfInjectable;

    beforeEach(() => {
      const someInjectable = getInjectable({
        id: 'some-injectable',

        instantiate: di => {
          contextOfInjectable = di.context;
        },
      });

      const someDecorator = getInjectable({
        id: 'some-decorator',

        instantiate: di => {
          contextOfDecorator = di.context;

          return {
            decorate:
              toBeDecorated =>
              (...args) =>
                toBeDecorated(...args),
          };
        },

        injectionToken: injectionDecoratorToken,

        decorable: false,
      });

      di.register(someInjectable, someDecorator);

      di.inject(someInjectable);
    });

    it('decorator has context', () => {
      expect(contextOfDecorator.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-injectable',
        'injection-decorator-token',
        'some-decorator',
      ]);
    });

    it('decorated injectable has context without knowledge of decorator', () => {
      expect(contextOfInjectable.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-injectable',
      ]);
    });
  });

  describe('given an injection decorators for parent and child, when parent is injected', () => {
    let contextOfParentDecorator;
    let contextOfChildDecorator;
    let contextOfParentInjectable;
    let contextOfChildInjectable;

    beforeEach(() => {
      const someChildInjectable = getInjectable({
        id: 'some-child-injectable',

        instantiate: di => {
          contextOfChildInjectable = di.context;
        },
      });

      const someParentInjectable = getInjectable({
        id: 'some-parent-injectable',

        instantiate: di => {
          di.inject(someChildInjectable);
          contextOfParentInjectable = di.context;
        },
      });

      const someParentDecorator = getInjectable({
        id: 'some-parent-decorator',

        instantiate: di => {
          contextOfParentDecorator = di.context;

          return {
            decorate:
              toBeDecorated =>
              (...args) =>
                toBeDecorated(...args),
          };
        },

        target: someParentInjectable,

        injectionToken: injectionDecoratorToken,

        decorable: false,
      });

      const someChildDecorator = getInjectable({
        id: 'some-child-decorator',

        instantiate: di => {
          contextOfChildDecorator = di.context;

          return {
            decorate:
              toBeDecorated =>
              (...args) =>
                toBeDecorated(...args),
          };
        },

        target: someChildInjectable,

        injectionToken: injectionDecoratorToken,

        decorable: false,
      });

      di.register(
        someParentInjectable,
        someParentDecorator,
        someChildInjectable,
        someChildDecorator,
      );

      di.inject(someParentInjectable);
    });

    it('parent decorator has root as context without knowledge of other decorators', () => {
      expect(contextOfParentDecorator.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-parent-injectable',
        'injection-decorator-token',
        'some-parent-decorator',
      ]);
    });

    it('child decorator has root as context without knowledge of other decorators', () => {
      expect(contextOfChildDecorator.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-parent-injectable',
        'injection-decorator-token',
        'some-child-decorator',
      ]);
    });

    it('parent injectable has context without knowledge of decorators', () => {
      expect(contextOfParentInjectable.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-parent-injectable',
      ]);
    });

    it('child injectable has context without knowledge of decorators', () => {
      expect(contextOfChildInjectable.map(get('injectable.id'))).toEqual([
        'some-container',
        'some-parent-injectable',
        'some-child-injectable',
      ]);
    });
  });
});
