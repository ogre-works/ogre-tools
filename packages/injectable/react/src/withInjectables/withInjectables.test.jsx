import React from 'react';
import { setImmediate as flushMicroTasks } from 'timers';
import { render } from '@testing-library/react';
import { act } from '@testing-library/react';

import {
  createContainer,
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from '@ogre-tools/injectable';

import withInjectables, { DiContextProvider } from './withInjectables';
import asyncFn from '@async-fn/jest';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import registerInjectableReact from '../registerInjectableReact/registerInjectableReact';

const flushPromises = () => new Promise(flushMicroTasks);

const mountFor =
  di =>
  (node, ...rest) =>
    render(<DiContextProvider value={{ di }}>{node}</DiContextProvider>, {
      ...rest,
    });

describe('withInjectables', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer('some-container');

    registerInjectableReact(di);

    mount = mountFor(di);
  });

  it('given async dependency, placeholder and parent component, when parent component rerenders, does not remount component with the dependency', async () => {
    const componentDidMountMock = jest.fn();

    const injectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: async () => await Promise.resolve('some-injectable-value'),
    });

    di.register(injectable);

    class DumbTestComponent extends React.Component {
      componentDidMount() {
        componentDidMountMock();
      }

      render() {
        let { someDependency, ...props } = this.props;

        return <div {...props}>Some content: "{someDependency}"</div>;
      }
    }

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getPlaceholder: () => <div />,

      getProps: async (di, props) => ({
        someDependency: await di.inject(injectable),
        ...props,
      }),
    });

    const SomeParentComponent = observer(({ someObservable }) => (
      <div>
        {someObservable.get()}

        <SmartTestComponent data-some-prop-test />
      </div>
    ));

    const someObservable = observable.box('some-value');

    mount(<SomeParentComponent someObservable={someObservable} />);

    await act(() => {
      runInAction(() => {
        someObservable.set('some-other-value');
      });
    });

    expect(componentDidMountMock).toHaveBeenCalledTimes(1);
  });

  it('given sync dependency and parent component, when parent component rerenders, does not remount component with the dependency', () => {
    const componentDidMountMock = jest.fn();

    const injectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => 'some-injectable-value',
    });

    di.register(injectable);

    class DumbTestComponent extends React.Component {
      componentDidMount() {
        componentDidMountMock();
      }

      render() {
        let { someDependency, ...props } = this.props;

        return <div {...props}>Some content: "{someDependency}"</div>;
      }
    }

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, props) => ({
        someDependency: di.inject(injectable),
        ...props,
      }),
    });

    const SomeParentComponent = observer(({ someObservable }) => (
      <div>
        {someObservable.get()}

        <SmartTestComponent data-some-prop-test />
      </div>
    ));

    const someObservable = observable.box('some-value');

    mount(<SomeParentComponent someObservable={someObservable} />);

    act(() => {
      runInAction(() => {
        someObservable.set('some-other-value');
      });
    });

    expect(componentDidMountMock).toHaveBeenCalledTimes(1);
  });

  it('given component and sync dependencies, when rendered, renders with dependencies', () => {
    const injectable = getInjectable({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: () => 'some-injectable-value',
    });

    di.register(injectable);

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, props) => ({
        someDependency: di.inject(injectable),
        ...props,
      }),
    });

    const rendered = mount(<SmartTestComponent data-some-prop-test />);

    expect(rendered.baseElement).toMatchSnapshot();
  });

  it('given component and sync dependencies, when rendered without provider, renders to null', () => {
    const injectable = getInjectable({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: () => 'some-injectable-value',
    });

    di.register(injectable);

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, props) => ({
        someDependency: di.inject(injectable),
        ...props,
      }),
    });

    const rendered = render(<SmartTestComponent data-some-prop-test />);

    expect(rendered.baseElement).toMatchSnapshot();
  });

  [
    {
      name: 'given anonymous component and a dependency cycle, when rendered, throws context for a uniquely generated component name and cycle',
      getComponent: () => () => 'irrelevant',
      injectOrInjectMany: 'inject',

      expectedError:
        'Cycle of injectables encountered: "some-container" -> "anonymous-component-0" -> "some-injectable-id" -> "some-other-injectable-id" -> "some-injectable-id"',
    },

    {
      name: 'given named component and a dependency cycle, when rendered, throws context for the component and cycle',

      getComponent: () =>
        function SomeNamedComponent() {
          return 'irrelevant';
        },

      injectOrInjectMany: 'inject',

      expectedError:
        'Cycle of injectables encountered: "some-container" -> "SomeNamedComponent" -> "some-injectable-id" -> "some-other-injectable-id" -> "some-injectable-id"',
    },

    {
      name: 'given component with display name and a dependency cycle, when rendered, throws context for the component and cycle',

      getComponent: () => {
        const Component = () => 'irrelevant';
        Component.displayName = 'some-component-display-name';
        return Component;
      },

      injectOrInjectMany: 'inject',

      expectedError:
        'Cycle of injectables encountered: "some-container" -> "some-component-display-name" -> "some-injectable-id" -> "some-other-injectable-id" -> "some-injectable-id"',
    },

    {
      name: 'given class component and a dependency cycle, when rendered, throws context for the component and cycle',

      getComponent: () =>
        class SomeClassComponent extends React.Component {
          render() {
            return 'irrelevant';
          }
        },

      injectOrInjectMany: 'inject',

      expectedError:
        'Cycle of injectables encountered: "some-container" -> "SomeClassComponent" -> "some-injectable-id" -> "some-other-injectable-id" -> "some-injectable-id"',
    },

    {
      name: 'given component, a dependency cycle and injecting a token, when rendered, throws context for the component and cycle',

      getComponent: () => () => 'irrelevant',

      injectUsing: 'injectionToken',

      expectedError:
        'Cycle of injectables encountered: "some-container" -> "anonymous-component-0" -> "some-injection-token" -> "some-injectable-id" -> "some-other-injectable-id" -> "some-injectable-id"',
    },
  ].forEach(scenario => {
    xit(scenario.name, () => {
      const someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      const injectable = getInjectable({
        id: 'some-injectable-id',
        instantiate: di => di.inject(otherInjectable),
        injectionToken: someInjectionToken,
      });

      const otherInjectable = getInjectable({
        id: 'some-other-injectable-id',
        instantiate: di => di.inject(injectable),
      });

      di.register(injectable, otherInjectable);

      const DumbTestComponent = scenario.getComponent();

      const SmartTestComponent = withInjectables(DumbTestComponent, {
        getProps: (di, props) => ({
          someDependency:
            scenario.injectUsing === 'injectionToken'
              ? di.injectMany(someInjectionToken)
              : di.inject(injectable),
          ...props,
        }),
      });

      const onErrorMock = jest.fn();

      const storedConsoleError = console.error;
      console.error = () => {};

      mount(
        <ErrorBoundary onError={onErrorMock}>
          <SmartTestComponent data-some-prop-test />
        </ErrorBoundary>,
      );

      console.error = storedConsoleError;

      expect(onErrorMock).toHaveBeenCalledWith(scenario.expectedError);
    });
  });

  it('given anonymous component, injecting a token, when rendered, works', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const injectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => 42,
      injectionToken: someInjectionToken,
    });

    di.register(injectable);

    const SmartTestComponent = withInjectables(() => 'irrelevant', {
      getProps: (di, props) => ({
        someDependency: di.injectMany(someInjectionToken),
        ...props,
      }),
    });

    const rendered = mount(<SmartTestComponent data-some-prop-test />);

    expect(rendered.baseElement).toMatchSnapshot();
  });

  it('given component, and rendered, when re-rendered, works', () => {
    const someObservable = observable.box(24);

    const injectable = getInjectable({
      id: 'some-injectable-id',
      instantiate: () => someObservable,
    });

    di.register(injectable);

    const SmartTestComponent = withInjectables(() => 'irrelevant', {
      getProps: (di, props) => ({
        someObservable: di.inject(injectable),
        ...props,
      }),
    });

    const TestComponent = observer(() => (
      <SmartTestComponent data-some-prop-test={someObservable.get()} />
    ));

    const rendered = mount(<TestComponent />);

    act(() => {
      runInAction(() => {
        someObservable.set(42);
      });
    });

    expect(rendered.baseElement).toMatchSnapshot();
  });

  describe('given component, placeholder and async dependencies, when rendered', () => {
    let rendered;
    let asyncDependencyMock;

    beforeEach(async () => {
      asyncDependencyMock = asyncFn();

      const injectable = getInjectable({
        id: 'some-injectable-id',

        lifecycle: lifecycleEnum.transient,

        instantiate: () => asyncDependencyMock(),
      });

      di.register(injectable);

      const DumbTestComponent = ({ someDependency, ...props }) => (
        <div data-testid="some-dumb-test-component" {...props}>
          Some content: "{someDependency}"
        </div>
      );

      const SmartTestComponent = withInjectables(DumbTestComponent, {
        getProps: async (di, props) => ({
          someDependency: await di.inject(injectable),
          ...props,
        }),

        getPlaceholder: () => <div data-testid="some-placeholder" />,
      });

      rendered = mount(<SmartTestComponent data-some-prop-test />);
    });

    it('renders as placeholder', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it('does not render component yet', () => {
      expect(
        rendered.queryByTestId('some-dumb-test-component'),
      ).not.toBeInTheDocument();
    });

    it('has placeholder', () => {
      expect(rendered.queryByTestId('some-placeholder')).toBeInTheDocument();
    });

    describe('when the dependency resolves', () => {
      beforeEach(async () => {
        await act(async () => {
          await asyncDependencyMock.resolve('some-async-value');
        });
      });

      it('renders', () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it('has component with async content', () => {
        expect(rendered.baseElement).toHaveTextContent(
          'Some content: "some-async-value"',
        );
      });

      it('has component', () => {
        expect(
          rendered.queryByTestId('some-dumb-test-component'),
        ).toBeInTheDocument();
      });

      it('no longer has placeholder', () => {
        expect(
          rendered.queryByTestId('some-placeholder'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('given component with props, placeholder and async dependencies, when rendered', () => {
    let rendered;
    let asyncDependencyMock;

    beforeEach(async () => {
      asyncDependencyMock = asyncFn();

      const injectable = getInjectable({
        id: 'some-injectable-id',

        lifecycle: lifecycleEnum.transient,

        instantiate: () => asyncDependencyMock(),
      });

      di.register(injectable);

      const DumbTestComponent = ({ someDependency, ...props }) => (
        <div data-testid="some-dumb-test-component" {...props}>
          Some content: "{someDependency}"
        </div>
      );

      const SmartTestComponent = withInjectables(DumbTestComponent, {
        getProps: async (di, props) => ({
          someDependency: await di.inject(injectable),
          ...props,
        }),

        getPlaceholder: props => (
          <div data-testid={`some-placeholder-with-props(${props.someProp})`} />
        ),
      });

      rendered = mount(
        <SmartTestComponent data-some-prop-test someProp="some-prop-value" />,
      );
    });

    it('renders as placeholder using the props', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it('has placeholder using props', () => {
      expect(
        rendered.queryByTestId('some-placeholder-with-props(some-prop-value)'),
      ).toBeInTheDocument();
    });
  });

  describe('given component, no placeholder and async dependencies, when rendered', () => {
    let rendered;
    let asyncDependencyMock;

    beforeEach(async () => {
      asyncDependencyMock = asyncFn();

      const injectable = getInjectable({
        id: 'some-injectable-id',

        lifecycle: lifecycleEnum.transient,

        instantiate: () => asyncDependencyMock(),
      });

      di.register(injectable);

      const DumbTestComponent = ({ someDependency, ...props }) => (
        <div {...props}>Some content: "{someDependency}"</div>
      );

      const SmartTestComponent = withInjectables(DumbTestComponent, {
        getProps: async (di, props) => ({
          someDependency: await di.inject(injectable),
          ...props,
        }),
      });

      rendered = mount(<SmartTestComponent data-some-prop-test />);
    });

    it('renders as null', () => {
      expect(rendered.container).toBeEmptyDOMElement();
    });

    describe('when the dependency resolves', () => {
      beforeEach(async () => {
        await act(() => asyncDependencyMock.resolve('some-async-value'));
      });

      it('renders', () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it('has component with async content', () => {
        expect(rendered.baseElement).toHaveTextContent(
          'Some content: "some-async-value"',
        );
      });
    });
  });

  it('given class component with sync dependencies, when rendered with ref, forwards ref', () => {
    const injectable = getInjectable({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: () => 'some-injectable-value',
    });

    di.register(injectable);

    class DumbTestComponent extends React.Component {
      someProperty = 'some-property-accessed-with-ref';

      render() {
        const { someDependency, ...props } = this.props;

        return <div {...props}>Some content: "{someDependency}"</div>;
      }
    }

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, props) => ({
        someDependency: di.inject(injectable),
        ...props,
      }),
    });

    const ref = React.createRef();

    mount(<SmartTestComponent ref={ref} data-some-prop-test />);

    expect(ref.current.someProperty).toBe('some-property-accessed-with-ref');
  });

  it('given class component and async dependencies, when rendered with ref', async () => {
    const asyncDependencyMock = asyncFn();

    const injectable = getInjectable({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: () => asyncDependencyMock(),
    });

    di.register(injectable);

    class DumbTestComponent extends React.Component {
      someProperty = 'some-property-accessed-with-ref';

      render() {
        const { someDependency, ...props } = this.props;

        return <div {...props}>Some content: "{someDependency}"</div>;
      }
    }

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: async (di, props) => ({
        someDependency: await di.inject(injectable),
        ...props,
      }),
    });

    const ref = React.createRef();

    mount(<SmartTestComponent ref={ref} data-some-prop-test />);

    await act(() => asyncDependencyMock.resolve('some-async-value'));

    expect(ref.current.someProperty).toBe('some-property-accessed-with-ref');
  });

  it('given component, props and a dependency using instantiation parameter, when rendered, renders with the dependency having props as instantiation parameter', () => {
    const injectable = getInjectable({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: (_, instantiationParameter) =>
        `some-injectable-value: ${instantiationParameter}`,
    });

    di.register(injectable);

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, { someInstantiationParameter, ...props }) => ({
        someDependency: di.inject(injectable, someInstantiationParameter),

        ...props,
      }),
    });

    const rendered = mount(
      <SmartTestComponent
        data-some-prop-test
        someInstantiationParameter="some-instantiation-parameter-value"
      />,
    );

    expect(rendered.baseElement).toMatchSnapshot();
  });
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
