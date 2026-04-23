import asyncFn from '@async-fn/jest';
import { noop } from 'lodash/fp';
import React, { forwardRef, Suspense } from 'react';
import { render } from '@testing-library/react';
import {
  createContainer,
  getInjectable,
  isInjectionToken,
} from '@lensapp/injectable';
import { DiContextProvider } from '../withInjectables/withInjectables';
import { getInjectionTokenComponent2 } from './getInjectionTokenComponent2';
import { getInjectableComponent2 } from '../getInjectableComponent/getInjectableComponent2';
import { isPromise } from '@lensapp/fp';
import { useInjectDeferred } from '../useInject/useInject';
import { discoverFor } from '@lensapp/discoverable';

describe('getInjectionTokenComponent2', () => {
  let di;
  let mount;
  let onErrorWhileRenderingMock;
  let rendered;

  beforeEach(() => {
    di = createContainer('some-container');

    di.preventSideEffects();

    onErrorWhileRenderingMock = jest.fn();
    mount = mountFor(di, onErrorWhileRenderingMock);
  });

  it('given implementation registered, when rendered with props, does so', () => {
    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate:
        () =>
        ({ someProp }) =>
          <div>some-content: {someProp}</div>,
    });

    di.register(someImplementation);

    rendered = mount(<SomeTokenComponent someProp="some-prop-value" />);

    expect(rendered.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            some-content: 
            some-prop-value
          </div>
        </div>
      </body>
    `);
  });

  it('given implementation registered, when rendered with children, renders them', () => {
    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate:
        () =>
        ({ children }) =>
          <div>{children}</div>,
    });

    di.register(someImplementation);

    rendered = mount(<SomeTokenComponent>some-children</SomeTokenComponent>);

    expect(rendered.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            some-children
          </div>
        </div>
      </body>
    `);
  });

  it('when rendered with ref, forwards the ref', () => {
    const someRef = React.createRef();

    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate: () =>
        forwardRef((props, ref) => (
          <div data-testid="some-element" ref={ref}>
            some-content
          </div>
        )),
    });

    di.register(someImplementation);
    rendered = mount(<SomeTokenComponent ref={someRef} />);

    const someElement = rendered.getByTestId('some-element');

    expect(someRef.current).toBe(someElement);
  });

  it('given placeholder component, when rendered with ref, forwards the ref', () => {
    const someRef = React.createRef();

    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
      PlaceholderComponent: () => null,
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate: () =>
        forwardRef((props, ref) => (
          <div data-testid="some-element" ref={ref}>
            some-content
          </div>
        )),
    });

    di.register(someImplementation);
    rendered = mount(<SomeTokenComponent ref={someRef} />);

    const someElement = rendered.getByTestId('some-element');

    expect(someRef.current).toBe(someElement);
  });

  it('given overridden implementation, when rendered, renders the override', () => {
    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate: () => () => <div>some-content</div>,
    });

    di.register(someImplementation);

    di.override(SomeTokenComponent, () => () => (
      <div>some-overridden-content</div>
    ));

    rendered = mount(<SomeTokenComponent />);

    expect(rendered.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            some-overridden-content
          </div>
        </div>
      </body>
    `);
  });

  it('given placeholder-component, when rendered with something that suspends, renders the placeholder', () => {
    const instantiateMock = asyncFn();

    const someAsyncInjectable = getInjectable({
      id: 'some-async',
      instantiate: instantiateMock,
    });

    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
      PlaceholderComponent: () => <div>some-placeholder</div>,
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate: () => () => {
        const someSyncInstance = useInjectDeferred(someAsyncInjectable);

        return <div>{someSyncInstance}</div>;
      },
    });

    di.register(someImplementation, someAsyncInjectable);

    rendered = mount(<SomeTokenComponent someProp="some-prop-value" />);

    expect(rendered.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            some-placeholder
          </div>
        </div>
      </body>
    `);
  });

  it('given no placeholder-component, when rendered with something that suspends, does not capture the suspense', () => {
    const instantiateMock = asyncFn();

    const someAsyncInjectable = getInjectable({
      id: 'some-async',
      instantiate: instantiateMock,
    });

    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate: () => () => {
        const someSyncInstance = useInjectDeferred(someAsyncInjectable);

        return <div>{someSyncInstance}</div>;
      },
    });

    di.register(someImplementation, someAsyncInjectable);

    rendered = mount(
      <Suspense fallback={<div>some-non-captured-suspense</div>}>
        <SomeTokenComponent someProp="some-prop-value" />
      </Suspense>,
    );

    expect(rendered.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            some-non-captured-suspense
          </div>
        </div>
      </body>
    `);
  });

  it('given placeholder that accepts props, when the component suspends, shows the placeholder with the original props', () => {
    const someFn = asyncFn();

    const someAsyncInjectable = getInjectable({
      id: 'some-async',
      instantiate: someFn,
    });

    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
      PlaceholderComponent: ({ name }) => (
        <div data-some-placeholder-with-name-test={name} />
      ),
    });

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SomeTokenComponent,
      instantiate: () => props => {
        const someValue = useInjectDeferred(someAsyncInjectable);

        return <div data-some-value-test={someValue} />;
      },
    });

    di.register(someImplementation, someAsyncInjectable);

    rendered = render(
      <DiContextProvider value={di}>
        <SomeTokenComponent name="some-name" />
      </DiContextProvider>,
    );

    const discover = discoverFor(() => rendered);

    expect(
      discover.getSingleElement('some-placeholder-with-name', 'some-name')
        .discovered,
    ).toBeInTheDocument();
  });

  it('given different dis, and same token component, when rendered in one di, another one, and first one again, the component remains di-specific', () => {
    const di1 = createContainer('some-container-1');
    const di2 = createContainer('some-container-2');

    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    const someImplementationInDi1 = getInjectable({
      id: 'some-implementation-1',
      injectionToken: SomeTokenComponent,
      instantiate: () => props =>
        <div data-di-specific-value-test="some-value-in-di-1" {...props} />,
    });

    const someImplementationInDi2 = getInjectable({
      id: 'some-implementation-2',
      injectionToken: SomeTokenComponent,
      instantiate: () => props =>
        <div data-di-specific-value-test="some-value-in-di-2" {...props} />,
    });

    di1.register(someImplementationInDi1);
    di2.register(someImplementationInDi2);

    const rendered = render(
      <div>
        <DiContextProvider value={di1}>
          <SomeTokenComponent data-component-in-di-1-test />
        </DiContextProvider>

        <DiContextProvider value={di2}>
          <SomeTokenComponent data-component-in-di-2-test />
        </DiContextProvider>

        <DiContextProvider value={di1}>
          <SomeTokenComponent data-component-in-di-1-test />
        </DiContextProvider>
      </div>,
    );

    const discover = discoverFor(() => rendered);

    const actualDiSpecificValuesOfComponent = {
      'component-in-di-1': discover
        .queryAllElements('component-in-di-1')
        .getAttributes('di-specific-value'),

      'component-in-di-2': discover
        .queryAllElements('component-in-di-2')
        .getAttributes('di-specific-value'),
    };

    expect(actualDiSpecificValuesOfComponent).toEqual({
      'component-in-di-1': ['some-value-in-di-1', 'some-value-in-di-1'],
      'component-in-di-2': ['some-value-in-di-2'],
    });
  });

  it('given no implementation registered, when rendered, throws error', () => {
    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    withSuppressedConsoleError(() => {
      rendered = mount(<SomeTokenComponent />);
    });

    expect(onErrorWhileRenderingMock).toHaveBeenCalled();
  });

  it('given a token component is created, it is an injection token', () => {
    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    expect(isInjectionToken(SomeTokenComponent)).toBe(true);
  });

  it('given a token component is created, it has displayName related to the id', () => {
    const SomeTokenComponent = getInjectionTokenComponent2({
      id: 'some-token-component',
    });

    expect(SomeTokenComponent.displayName).toBe(
      'InjectionTokenComponent(some-token-component)',
    );
  });

  describe('.for() specific tokens', () => {
    it('given a token component, when .for() is called twice with the same specifier, returns the same object', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const specific1 = SomeTokenComponent.for('some-specific');
      const specific2 = SomeTokenComponent.for('some-specific');

      expect(specific1).toBe(specific2);
    });

    it('given a specific token with an implementation registered, when rendered, injects from DI', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const SpecificTokenComponent = SomeTokenComponent.for('some-specific');

      const someImplementation = getInjectable({
        id: 'some-implementation',
        injectionToken: SpecificTokenComponent,
        instantiate: () => () => <div>some-specific-content</div>,
      });

      di.register(someImplementation);

      rendered = mount(<SpecificTokenComponent />);

      expect(rendered.baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <div>
              some-specific-content
            </div>
          </div>
        </body>
      `);
    });

    it('given a specific token with an implementation registered, when rendered with props, passes props to implementation', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const SpecificTokenComponent = SomeTokenComponent.for('some-specific');

      const someImplementation = getInjectable({
        id: 'some-implementation',
        injectionToken: SpecificTokenComponent,
        instantiate:
          () =>
          ({ someProp }) =>
            <div>specific-content: {someProp}</div>,
      });

      di.register(someImplementation);

      rendered = mount(<SpecificTokenComponent someProp="some-prop-value" />);

      expect(rendered.baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <div>
              specific-content: 
              some-prop-value
            </div>
          </div>
        </body>
      `);
    });

    it('given a specific token, it has specificTokenOf pointing to the general token component', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const SpecificTokenComponent = SomeTokenComponent.for('some-specific');

      expect(SpecificTokenComponent.specificTokenOf).toBe(SomeTokenComponent);
    });

    it('given injectables registered under specific tokens, di.injectMany on general token finds them', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const someSpecificImplementation = getInjectable({
        id: 'some-specific-implementation',
        injectionToken: SomeTokenComponent.for('some-specific'),
        instantiate: () => () => <div>specific-content</div>,
      });

      di.register(someSpecificImplementation);

      const implementations = di.injectMany(SomeTokenComponent);

      expect(implementations).toHaveLength(1);
    });

    it('given a specific token, it has displayName with combined id', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const SpecificTokenComponent = SomeTokenComponent.for('some-specific');

      expect(SpecificTokenComponent.displayName).toBe(
        'InjectionTokenComponent(some-token-component/some-specific)',
      );
    });

    it('given a specific token, it is an injection token', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const SpecificTokenComponent = SomeTokenComponent.for('some-specific');

      expect(isInjectionToken(SpecificTokenComponent)).toBe(true);
    });
  });

  describe('interop with InjectableComponent', () => {
    it('given InjectableComponent using it as injectionToken, di.inject returns the component', () => {
      const SomeTokenComponent = getInjectionTokenComponent2({
        id: 'some-token-component',
      });

      const SomeInjectableComponent = getInjectableComponent2({
        id: 'some-injectable-component',
        Component: () => <div>some-content</div>,
        injectionToken: SomeTokenComponent,
      });

      di.register(SomeInjectableComponent);

      const InjectedComponent = di.inject(SomeTokenComponent);

      rendered = mount(<InjectedComponent />);

      expect(rendered.baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <div>
              some-content
            </div>
          </div>
        </body>
      `);
    });
  });
});

const mountFor = (di, onRenderingError) => node =>
  render(
    <ErrorBoundary onError={onRenderingError}>
      <DiContextProvider value={di}>{node}</DiContextProvider>
    </ErrorBoundary>,
  );

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
      return <div>Some error in rendering prevented render</div>;
    }

    return this.props.children;
  }
}

const withSuppressedConsoleError = toBeSuppressed => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);
  const supressed = toBeSuppressed();

  if (isPromise(supressed)) {
    supressed.finally(() => consoleErrorSpy.mockRestore());
  } else {
    consoleErrorSpy.mockRestore();
  }
};
