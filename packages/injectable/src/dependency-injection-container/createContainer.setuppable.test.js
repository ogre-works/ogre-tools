import asyncFn from '@async-fn/jest';
import lifecycleEnum from './lifecycleEnum';
import getInjectable from '../getInjectable/getInjectable';
import getPromiseStatus from '../test-utils/getPromiseStatus/getPromiseStatus';
import getDi from '../test-utils/getDiForUnitTesting';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('createContainer.setuppable', () => {
  it('given setuppables with a dependency cycle when injecting single, when setupped, throws most complex cycle in system', () => {
    const someRootSetuppable = getInjectable({
      id: 'some-root-injectable',
      setup: async di => {
        await di.inject(someSetuppable);
      },

      instantiate: () => 'irrelevant',
    });

    const someSetuppable = getInjectable({
      id: 'some-parent-injectable',
      setup: async di => {
        await di.inject(someOtherSetuppable);
      },

      instantiate: () => 'irrelevant',
    });

    const someOtherSetuppable = getInjectable({
      id: 'some-child-injectable',
      setup: async di => {
        await di.inject(someSetuppable);
      },
      instantiate: () => 'irrelevant',
    });

    const di = getDi(someRootSetuppable, someSetuppable, someOtherSetuppable);

    return expect(di.runSetups()).rejects.toThrow(
      'Cycle of setuppables encountered: "some-root-injectable" -> "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  xit('given setuppables with a dependency cycle when injecting many, when setupped, throws most complex cycle in system', async () => {
    const someToken = getInjectionToken({ id: 'some-token' });
    const someSetuppable = getInjectable({
      id: 'some-injectable',
      setup: async di => {
        await di.injectMany(someOtherToken);
      },

      instantiate: () => 'irrelevant',

      injectionToken: someToken,
    });

    const someOtherToken = getInjectionToken({ id: 'some-other-token' });
    const someOtherSetuppable = getInjectable({
      id: 'some-other-injectable',
      setup: async di => {
        await di.injectMany(someToken);
      },

      instantiate: () => 'irrelevant',

      injectionToken: someOtherToken,
    });

    const di = getDi(someSetuppable, someOtherSetuppable);

    return expect(di.runSetups()).rejects.toThrow(
      'Cycle of setuppables encountered: "some-root-injectable" -> "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given setup for injectable, when setups are ran, runs the setup with a ways to inject', async () => {
    let instanceFromSetup;

    const someSetuppable = getInjectable({
      id: 'some-setuppable',

      setup: async di => {
        instanceFromSetup = {
          single: await di.inject(someInjectable, 'some-parameter'),
          many: await di.injectMany(someInjectionToken, 'some-parameter'),
        };
      },

      instantiate: () => 'irrelavent',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      lifecycle: lifecycleEnum.transient,
      instantiate: (di, parameter) => `some-single-instance: "${parameter}"`,
    });

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someTokenInjectable = getInjectable({
      id: 'some-token-injectable',
      lifecycle: lifecycleEnum.transient,
      instantiate: (di, parameter) => `some-of-many-instances: "${parameter}"`,
      injectionToken: someInjectionToken,
    });

    const di = getDi(someSetuppable, someInjectable, someTokenInjectable);

    await di.runSetups();

    expect(instanceFromSetup).toEqual({
      single: 'some-single-instance: "some-parameter"',
      many: ['some-of-many-instances: "some-parameter"'],
    });
  });

  it('given multiple async setuppables and setups are ran, when setups resolve, setup resolves', async () => {
    const someSetuppable = getInjectable({
      id: 'some-injectable',
      setup: asyncFn(),

      instantiate: () => 'irrelavent',
    });

    const someOtherSetuppable = getInjectable({
      id: 'some-other-injectable',
      setup: asyncFn(),

      instantiate: () => 'irrelavent',
    });

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();
    someOtherSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(true);
  });

  it('given multiple async setuppables and DI-setups are ran, when only some of the setups resolve, DI-setup does not resolve', async () => {
    const someSetuppable = getInjectable({
      id: 'some-injectable',
      setup: asyncFn(),

      instantiate: () => 'irrelavent',
    });

    const someOtherSetuppable = {
      id: 'some-other-injectable',
      setup: asyncFn(),

      instantiate: () => 'irrelavent',
    };

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(false);
  });

  it('given injectable with setup but setups have not been ran, when injected, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      setup: () => {},
      instantiate: () => {},
    });

    const di = getDi(someInjectable);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject setuppable "some-injectable" before setups are ran.',
    );
  });

  it('given injectable with setup that injects itself, when running setups, does not throw', async () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',

      setup: async di => {
        const instance = await di.inject(someInjectable);

        instance.someProperty = 'some-value';
      },

      instantiate: () => ({}),
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    const actual = di.inject(someInjectable);

    expect(actual).toEqual({ someProperty: 'some-value' });
  });

  it('given setuppable that injects other setuppable that injects itself, when running setups, does not throw', async () => {
    let instanceFromChildSetup;

    const someInjectable = getInjectable({
      id: 'some-injectable',

      setup: async di => {
        await di.inject(someChildInjectable);
      },

      instantiate: () => ({}),
    });

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',

      setup: async di => {
        instanceFromChildSetup = await di.inject(someChildInjectable);
      },

      instantiate: () => 'some-value',
    });

    const di = getDi(someInjectable, someChildInjectable);

    await di.runSetups();

    expect(instanceFromChildSetup).toBe('some-value');
  });

  describe.skip('given setuppables that inject non-setuppables that inject setuppables, when running setups', () => {
    let setupMockResolve;
    let runSetupsPromise;

    beforeEach(() => {
      const setupMock = jest.fn().mockImplementation(() => new Promise((resolve) => setupMockResolve = resolve));

      const someSetuppable = getInjectable({
        id: 'some-setuppable',

        setup: async di => {
          await di.inject(someNonSetuppable);
        },

        instantiate: () => {},
      });

      const someOtherSetuppable = getInjectable({
        id: 'some-other-setuppable',

        setup: async di => {
          await di.inject(someChildSetuppable);
        },

        instantiate: () => {},
      });

      let foo;

      const someChildSetuppable = getInjectable({
        id: 'some-child-setuppable',
        setup: async () => {
          await setupMock();
          foo = {
            bar: 1,
          };
        },
        instantiate: () => foo,
      });

      const someNonSetuppable = getInjectable({
        id: 'some-non-setuppable',
        instantiate: di => di.inject(someChildSetuppable).bar,
      });

      const di = getDi(
        someSetuppable,
        someOtherSetuppable,
        someChildSetuppable,
        someNonSetuppable,
      );

      runSetupsPromise = di.runSetups();
    });

    it('runs setup successfully', async () => {
      setupMockResolve();

      expect(await runSetupsPromise).toBeUndefined();
    });
  });

  describe('given setuppables that inject other setuppable, when running setups', () => {
    let runSetupsPromise;
    let setupMock;
    let parentSetupPromise;

    beforeEach(() => {
      setupMock = asyncFn();

      const someSetuppable = getInjectable({
        id: 'some-setuppable',

        setup: async di => {
          parentSetupPromise = di.inject(someChildSetuppable);
          await parentSetupPromise;
        },

        instantiate: () => {},
      });

      const someOtherSetuppable = getInjectable({
        id: 'some-other-setuppable',

        setup: async di => {
          await di.inject(someChildSetuppable);
        },

        instantiate: () => {},
      });

      const someChildSetuppable = getInjectable({
        id: 'some-child-setuppable',
        setup: setupMock,
        instantiate: () => {},
      });

      const di = getDi(
        someSetuppable,
        someOtherSetuppable,
        someChildSetuppable,
      );

      runSetupsPromise = di.runSetups();
    });

    it('runs setup only once', async () => {
      expect(setupMock).toHaveBeenCalledTimes(1);
    });

    it('given the setup for the child resolves, setups resolves', async () => {
      await setupMock.resolve();

      const actual = await runSetupsPromise;

      expect(actual).toBeUndefined();
    });

    it('given the setup for the child has not resolved yet, setups do not resolve', async () => {
      const promiseStatus = await getPromiseStatus(runSetupsPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });

    it('given the setup for the child has not resolved yet, setup for parent does not resolve', async () => {
      const promiseStatus = await getPromiseStatus(parentSetupPromise);

      expect(promiseStatus.fulfilled).toBe(false);
    });
  });
});
