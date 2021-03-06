import React from 'react';
import enzyme from 'enzyme';
import { setImmediate as flushMicroTasks } from 'timers';

import {
  createContainer,
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from '@ogre-tools/injectable';

import withInjectables from './withInjectables';
import asyncFn from '@async-fn/jest';
import { DiContextProvider } from '@ogre-tools/injectable-react';

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

describe('withInjectables', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer('some-container');

    mount = mountFor(di);
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

    const component = mount(<SmartTestComponent data-some-prop-test />);

    expect(component).toMatchHtmlSnapshot();
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
    it(scenario.name, () => {
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

  describe('given component, placeholder and async dependencies, when rendered', () => {
    let component;
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

        getPlaceholder: () => <div data-placeholder-test />,
      });

      component = mount(<SmartTestComponent data-some-prop-test />);
    });

    it('renders as placeholder', () => {
      expect(component).toMatchHtmlSnapshot();
    });

    it('does not render component yet', () => {
      expect(component.find('DumbTestComponent')).not.toExist();
    });

    it('has placeholder', () => {
      expect(component.find('[data-placeholder-test]')).toExist();
    });

    describe('when the dependency resolves', () => {
      beforeEach(async () => {
        await asyncDependencyMock.resolve('some-async-value');
        await enzymeUpdate(component);
      });

      it('renders', () => {
        expect(component).toMatchHtmlSnapshot();
      });

      it('has component with async content', () => {
        expect(component).toHaveText('Some content: "some-async-value"');
      });

      it('has component', () => {
        expect(component.find('DumbTestComponent')).toExist();
      });

      it('no longer has placeholder', () => {
        expect(component.find('[data-placeholder-test]')).not.toExist();
      });
    });
  });

  describe('given component, no placeholder and async dependencies, when rendered', () => {
    let component;
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

      component = mount(<SmartTestComponent data-some-prop-test />);
    });

    it('renders as null', () => {
      expect(component).toBeEmptyRender();
    });

    describe('when the dependency resolves', () => {
      beforeEach(async () => {
        await asyncDependencyMock.resolve('some-async-value');
        await enzymeUpdate(component);
      });

      it('renders', () => {
        expect(component).toMatchHtmlSnapshot();
      });

      it('has component with async content', () => {
        expect(component).toHaveText('Some content: "some-async-value"');
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

    const component = mount(
      <SmartTestComponent ref={ref} data-some-prop-test />,
    );

    await asyncDependencyMock.resolve('some-async-value');
    await enzymeUpdate(component);

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

    const component = mount(
      <SmartTestComponent
        data-some-prop-test
        someInstantiationParameter="some-instantiation-parameter-value"
      />,
    );

    expect(component).toMatchHtmlSnapshot();
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
