import React from 'react';
import asyncFn from '@async-fn/jest';
import Inject, { DiContextProvider } from './Inject';
import enzyme from 'enzyme';
import { setImmediate as flushMicroTasks } from 'timers';
import { createContainer } from '@ogre-tools/injectable';

const flushPromises = () => new Promise(flushMicroTasks);

const getDiForUnitTesting = createContainer;

const enzymeUpdate = async (component) => {
  component.setProps();

  await flushPromises();

  component.find('Observer').forEach((Observer) => Observer.update());
};

const mountFor = (di) => (node, ...rest) =>
  enzyme.mount(<DiContextProvider value={{ di }}>{node}</DiContextProvider>, {
    ...rest,
  });

describe('Inject', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = getDiForUnitTesting();

    mount = mountFor(di);
  });

  it('given a Component is registered, when Inject is rendered for the Component, renders with dependencies', () => {
    const TestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const di = createContainer();

    di.register({
      id: 'some-id',
      getDependencies: () => ({ someDependency: 'some-value' }),
      instantiate: TestComponent,
    });

    const actual = mount(
      <DiContextProvider value={{ di }}>
        <Inject Component={TestComponent} />
      </DiContextProvider>,
    );

    expect(actual).toHaveText('Some content: "some-value"');
  });

  it('given two level function component with synchronous dependencies, works', () => {
    const SyncComponent = () => (props) => (
      <div {...props}>Some sync component content</div>
    );

    di.register({
      id: 'irrelevant',
      getDependencies: () => ({}),
      instantiate: SyncComponent,
    });

    const component = mount(
      <Inject Component={SyncComponent} data-some-prop-test />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  describe('given two level function component with asynchronous dependencies without placeholder', () => {
    let component;
    let someMock;

    beforeEach(() => {
      const AsyncComponent = ({ someDependency }) => (props) => (
        <div {...props}>{someDependency}</div>
      );

      someMock = asyncFn();

      di.register({
        id: 'irrelevant',
        getDependencies: () => ({ someDependency: someMock() }),
        instantiate: AsyncComponent,
      });

      component = mount(
        <Inject Component={AsyncComponent} data-some-prop-test />,
      );
    });

    it('does not render component yet', () => {
      expect(component).toMatchHtmlSnapshot();
    });

    it('when async thing resolves, renders component', async () => {
      await someMock.resolve('some-dependency-value');

      await enzymeUpdate(component);

      expect(component).toMatchHtmlSnapshot();
    });
  });

  it('given two level function component with asynchronous dependencies with placeholder, when dependency has not resolved yet, renders placeholder', () => {
    const AsyncComponent = ({ someDependency }) => (props) => (
      <div {...props}>{someDependency}</div>
    );

    di.register({
      id: 'irrelevant',
      getDependencies: () => ({
        someDependency: new Promise(() => {}),
      }),
      instantiate: AsyncComponent,
    });

    const component = mount(
      <Inject
        Component={AsyncComponent}
        getPlaceholder={() => <div data-placeholder-test>some-placeholder</div>}
        data-some-prop-test
      />,
    );

    expect(component.find('[data-placeholder-test]')).toExist();
  });

  it('given instantiation parameter and one level function component with synchronous dependencies, works', () => {
    const SyncComponent = ({
      dependencyValue,
      someInstantiation,
      ...props
    }) => (
      <div
        data-dependency-value={dependencyValue}
        data-instantiation-parameter={someInstantiation}
        {...props}
      >
        Some sync component content
      </div>
    );

    di.register({
      id: 'irrelevant',
      getDependencies: () => ({
        dependencyValue: 'some-synchronous-value',
      }),

      instantiate: SyncComponent,
    });

    const component = mount(
      <Inject
        Component={SyncComponent}
        instantiationParameter={{ someInstantiation: 'parameter' }}
        data-some-prop-test
      />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  it('given instantiation parameter and one level function component with asynchronous dependencies, works', () => {
    const SyncComponent = ({
      dependencyValue,
      someInstantiation,
      ...props
    }) => (
      <div
        data-dependency-value={dependencyValue}
        data-instantiation-parameter={someInstantiation}
        {...props}
      >
        Some sync component content
      </div>
    );

    di.register({
      id: 'irrelevant',
      getDependencies: () => ({
        dependencyValue: Promise.resolve('some-asynchronous-value'),
      }),

      instantiate: SyncComponent,
    });

    const component = mount(
      <Inject
        Component={SyncComponent}
        instantiationParameter={{ someInstantiation: 'parameter' }}
        data-some-prop-test
      />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  it('given no instantiation parameter and one level function component with synchronous dependencies, works', () => {
    const SyncComponent = ({ dependencyValue, ...props }) => (
      <div data-dependency-value={dependencyValue} {...props}>
        Some sync component content
      </div>
    );

    di.register({
      id: 'irrelevant',
      getDependencies: () => ({
        dependencyValue: 'some-synchronous-value',
      }),

      instantiate: SyncComponent,
    });

    const component = mount(
      <Inject Component={SyncComponent} data-some-prop-test />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  it('given no instantiation parameter and one level function component with asynchronous dependencies, works', () => {
    const SyncComponent = ({ dependencyValue, ...props }) => (
      <div data-dependency-value={dependencyValue} {...props}>
        Some sync component content
      </div>
    );

    di.register({
      id: 'irrelevant',
      getDependencies: () => ({
        dependencyValue: Promise.resolve('some-asynchronous-value'),
      }),

      instantiate: SyncComponent,
    });

    const component = mount(
      <Inject Component={SyncComponent} data-some-prop-test />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  it('given anonymous function as instantiate, works', () => {
    const SyncComponentFor = ({ dependencyValue, instantiationParameter }) => ({
      ...props
    }) => (
      <div
        data-dependency-value={dependencyValue}
        data-instantiation-parameter={instantiationParameter.some}
        {...props}
      >
        Some sync component content
      </div>
    );

    di.register({
      id: 'irrelevant',

      instantiate: (di, instantiationParameter) =>
        SyncComponentFor({
          dependencyValue: di.inject('some-dependency-alias'),
          instantiationParameter,
        }),

      aliases: [SyncComponentFor],
    });

    di.register({
      id: 'irrelevant',

      instantiate: () => 'some-dependency-value',

      aliases: ['some-dependency-alias'],
    });

    const component = mount(
      <Inject
        Component={SyncComponentFor}
        instantiationParameter={{ some: 'instantiation-value' }}
        data-some-prop-test
      />,
    );

    expect(component).toMatchHtmlSnapshot();
  });
});
