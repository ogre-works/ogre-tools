import React from 'react';
import { setImmediate as flushMicroTasks } from 'timers';
import { act, render } from '@testing-library/react';

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
import { keys } from 'lodash/fp';

const mountFor =
  di =>
  (node, ...rest) =>
    render(<DiContextProvider value={di}>{node}</DiContextProvider>, {
      ...rest,
    });

describe('withInjectables', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer('some-container');

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

  it('normally, when rendered, gets props already as layoutEffect to probably serve unit-testability in a tragically forgotten, yet meaningful scenario', () => {
    jest.spyOn(React, 'useLayoutEffect');

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: () => ({}),
    });

    mount(<SmartTestComponent />);

    expect(React.useLayoutEffect).toHaveBeenCalled();
  });

  it('given component, when rendered, has access to full di from react context', () => {
    const DumbTestComponent = () => <div />;

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: diInGetProps => {
        expect(keys(diInGetProps)).toEqual(keys(di));
        expect(keys(diInGetProps)).not.toEqual([]);

        return {};
      },
    });

    mount(<SmartTestComponent />);

    expect.assertions(2);
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

  describe('given nested components, with async dependencies, when rendered', () => {
    let rendered;
    let someProp;
    let asyncDependencyMock;
    let mountOfDecoratedComponentMock;
    let createPlaceholderMock;

    beforeEach(async () => {
      mountOfDecoratedComponentMock = jest.fn();

      const ToBeDecoratedComponent = ({ someDependency, ...props }) => {
        React.useEffect(() => {
          mountOfDecoratedComponentMock();
        }, []);

        return (
          <div
            data-testid="some-dumb-test-component"
            data-some-dependency-test={someDependency}
            {...props}
          >
            <input type="text" data-some-input-test />
            Some content: "{someDependency}"
          </div>
        );
      };

      asyncDependencyMock = asyncFn();
      createPlaceholderMock = jest.fn();
      const SmartChildTestComponent = withInjectables(ToBeDecoratedComponent, {
        getProps: async (di, props) => ({
          someDependency: await asyncDependencyMock(),
          ...props,
        }),

        getPlaceholder: () => {
          createPlaceholderMock();

          return <div data-testid="some-placeholder" />;
        },
      });

      const DumbParentTestComponent = observer(({ someProp }) => (
        <div>
          <SmartChildTestComponent data-some-prop-test={someProp.get()} />
        </div>
      ));

      someProp = observable.box('some-initial-value');
      rendered = mount(<DumbParentTestComponent someProp={someProp} />);
    });

    it('renders as placeholder', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it('does not render component yet', () => {
      expect(
        rendered.queryByTestId('some-dumb-test-component'),
      ).not.toBeInTheDocument();
    });

    it('does not mount the decorated component yet', () => {
      expect(mountOfDecoratedComponentMock).not.toHaveBeenCalled();
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

      it('mounts the decorated component', () => {
        expect(mountOfDecoratedComponentMock).toHaveBeenCalled();
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

      it('renders', () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe('when an input is focused', () => {
        beforeEach(() => {
          act(() => {
            rendered.baseElement
              .querySelector('[data-some-input-test]')
              .focus();
          });
        });

        it('the input really is focused', () => {
          expect(
            rendered.baseElement.querySelector('[data-some-input-test]:focus'),
          ).toBeInTheDocument();
        });

        describe('when a (non-dependency) prop changes', () => {
          beforeEach(async () => {
            asyncDependencyMock.mockClear();
            mountOfDecoratedComponentMock.mockClear();
            createPlaceholderMock.mockClear();

            await act(async () => {
              runInAction(() => {
                someProp.set('some-new-value');
              });
            });

            await act(async () => {
              await asyncDependencyMock.resolve('some-async-value');
            });
          });

          it('renders the new value', () => {
            expect(
              rendered.baseElement.querySelector(
                '[data-some-prop-test=some-new-value]',
              ),
            ).toBeInTheDocument();
          });

          it('the input is still focused', () => {
            expect(
              rendered.baseElement.querySelector(
                '[data-some-input-test]:focus',
              ),
            ).toBeInTheDocument();
          });

          it('instantiates async dependencies again', () => {
            expect(asyncDependencyMock).toHaveBeenCalled();
          });

          it('does not create another placeholder', () => {
            expect(createPlaceholderMock).not.toHaveBeenCalled();
          });

          it('does not mount the decorated component again', () => {
            expect(mountOfDecoratedComponentMock).not.toHaveBeenCalled();
          });

          it('renders', () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it('still has component with the async content', () => {
            expect(rendered.baseElement).toHaveTextContent(
              'Some content: "some-async-value"',
            );
          });

          it('has no placeholder', () => {
            expect(
              rendered.queryByTestId('some-placeholder'),
            ).not.toBeInTheDocument();
          });
        });
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
