import React from 'react';
import asyncFn from '@async-fn/jest';
import Inject, { DiContextProvider } from './Inject';
import enzyme from 'enzyme';
import { setImmediate as flushMicroTasks } from 'timers';
import { createContainer, lifecycleEnum } from '@ogre-tools/injectable';

const flushPromises = () => new Promise(flushMicroTasks);

const enzymeUpdate = async component => {
  component.setProps();

  await flushPromises();

  component.find('Observer').forEach(Observer => Observer.update());
};

const mountFor =
  di =>
  (node, ...rest) =>
    enzyme.mount(<DiContextProvider value={{ di }}>{node}</DiContextProvider>, {
      ...rest,
    });

describe('Inject', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer();

    mount = mountFor(di);
  });

  it('given component, when rendering Inject, renders component with injected dependencies', () => {
    const TestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    di.register({
      id: 'irrelevant',

      lifecycle: lifecycleEnum.transient,

      getDependencies: () => ({
        someDependency: 'some-synchronous-dependency-value',
      }),

      instantiate: (dependencies, props) => (
        <TestComponent {...dependencies} {...props} />
      ),

      aliases: [TestComponent],
    });

    const component = mount(
      <Inject Component={TestComponent} data-some-prop-test />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  it('given nested Injects, renders', () => {
    const RootTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>
        Some root content: "{someDependency}"
        <Inject
          injectableKey={NestedTestComponent}
          data-some-nested-prop-test
        />
      </div>
    );

    di.register({
      id: 'irrelevant',

      lifecycle: lifecycleEnum.transient,

      getDependencies: () => ({
        someDependency: 'some-root-dependency-value',
      }),

      instantiate: (dependencies, props) => (
        <RootTestComponent {...dependencies} {...props} />
      ),

      aliases: [RootTestComponent],
    });

    const NestedTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some nested content: "{someDependency}"</div>
    );

    di.register({
      id: 'irrelevant',

      lifecycle: lifecycleEnum.transient,

      getDependencies: () => ({
        someDependency: 'some-nested-dependency-value',
      }),

      instantiate: (dependencies, props) => (
        <NestedTestComponent {...dependencies} {...props} />
      ),

      aliases: [NestedTestComponent],
    });

    const component = mount(
      <Inject Component={RootTestComponent} data-some-root-prop-test />,
    );

    expect(component).toMatchHtmlSnapshot();
  });

  describe('given no placeholder and nested Injects with an async dependency', () => {
    let component;
    let asyncDependencyMock;

    beforeEach(() => {
      asyncDependencyMock = asyncFn();

      component = getAsyncComponent({
        di,
        asyncDependencyMock,
        placeholder: undefined,
      });
    });

    it('renders with default placeholder', () => {
      expect(component).toMatchHtmlSnapshot();
    });

    it('when the async dependency resolves, renders', async () => {
      await asyncDependencyMock.resolve('some-async-dependency-value');
      await enzymeUpdate(component);

      expect(component).toMatchHtmlSnapshot();
    });
  });

  describe('given placeholder and nested Injects with an async dependency', () => {
    let component;
    let asyncDependencyMock;

    beforeEach(() => {
      asyncDependencyMock = asyncFn();

      component = getAsyncComponent({
        di,
        asyncDependencyMock,
        placeholder: 'some-placeholder',
      });
    });

    it('renders with the placeholder', () => {
      expect(component).toMatchHtmlSnapshot();
    });

    it('when the async dependency resolves, renders', async () => {
      await asyncDependencyMock.resolve('some-async-dependency-value');
      await enzymeUpdate(component);

      expect(component).toMatchHtmlSnapshot();
    });
  });

  it('given non-transient injectable, when rendering, throws', () => {
    const TestComponent = () => 'irrelevant';

    di.register({
      id: 'irrelevant',

      lifecycle: lifecycleEnum.singleton,

      getDependencies: () => ({}),

      instantiate: (dependencies, props) => (
        <TestComponent {...dependencies} {...props} />
      ),

      aliases: [TestComponent],
    });

    jest
      .spyOn(console, 'error')
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {});

    expect(() => {
      mount(<Inject Component={TestComponent} />);
    }).toThrow('Tried to inject non-transient injectable in UI');
  });
});

const getAsyncComponent = ({ di, asyncDependencyMock, placeholder }) => {
  const RootTestComponent = ({ someDependency, ...props }) => (
    <div {...props}>
      Some root content: "{someDependency}"
      <Inject
        {...(placeholder ? { getPlaceholder: () => placeholder } : {})}
        injectableKey={NestedAsyncTestComponent}
        data-some-nested-prop-test
      />
    </div>
  );

  di.register({
    id: 'irrelevant',

    lifecycle: lifecycleEnum.transient,

    getDependencies: () => ({
      someDependency: 'some-root-dependency-value',
    }),

    instantiate: (dependencies, props) => (
      <RootTestComponent {...dependencies} {...props} />
    ),

    aliases: [RootTestComponent],
  });

  const NestedAsyncTestComponent = ({ someDependency, ...props }) => (
    <div {...props}>Some async content: "{someDependency}"</div>
  );

  di.register({
    id: 'irrelevant',

    lifecycle: lifecycleEnum.transient,

    getDependencies: () => ({
      someDependency: asyncDependencyMock(),
    }),

    instantiate: (dependencies, props) => (
      <NestedAsyncTestComponent {...dependencies} {...props} />
    ),

    aliases: [NestedAsyncTestComponent],
  });

  const mount = mountFor(di);

  return mount(
    <Inject Component={RootTestComponent} data-some-root-prop-test />,
  );
};
