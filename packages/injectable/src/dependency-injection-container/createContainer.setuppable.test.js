import asyncFn from '@async-fn/jest';
import lifecycleEnum from './lifecycleEnum';
import getInjectable from '../getInjectable/getInjectable';
import getPromiseStatus from '../test-utils/getPromiseStatus/getPromiseStatus';
import getDi from '../test-utils/getDiForUnitTesting';

describe('createContainer.setuppable', () => {
  it('given setuppables with a dependency cycle, when setupped, throws most complex cycle in system', () => {
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

  it('given setup for injectable, when setups are ran, runs the setup with a way to inject', async () => {
    let instanceFromSetup;

    const someSetuppable = getInjectable({
      id: 'some-setuppable',

      setup: async di => {
        instanceFromSetup = await di.inject(someInjectable, 'some-parameter');
      },
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      lifecycle: lifecycleEnum.transient,
      instantiate: (di, parameter) => `some-instance: "${parameter}"`,
    });

    const di = getDi(someSetuppable, someInjectable);

    await di.runSetups();

    expect(instanceFromSetup).toBe('some-instance: "some-parameter"');
  });

  it('given multiple async setuppables and setups are ran, when setups resolve, setup resolves', async () => {
    const someSetuppable = getInjectable({
      id: 'some-injectable',
      setup: asyncFn(),
    });

    const someOtherSetuppable = getInjectable({
      id: 'some-other-injectable',
      setup: asyncFn(),
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
    });

    const someOtherSetuppable = {
      id: 'some-other-injectable',
      setup: asyncFn(),
    };

    const di = getDi(someSetuppable, someOtherSetuppable);

    const runSetupsPromise = di.runSetups();

    someSetuppable.setup.resolve();

    const promiseStatus = await getPromiseStatus(runSetupsPromise);

    expect(promiseStatus.fulfilled).toBe(false);
  });

  it('given injectable with setup but no way to instantiate, when injected, throws', async () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      setup: () => {},
    });

    const di = getDi(someInjectable);

    await di.runSetups();

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      'Tried to inject "some-injectable" when instantiation is not defined.',
    );
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