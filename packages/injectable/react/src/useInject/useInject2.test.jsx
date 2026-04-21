import React from 'react';
import { render } from '@testing-library/react';
import {
  createContainer,
  getInjectable,
  getInjectable2,
  getInjectionToken2,
  lifecycleEnum,
} from '@lensapp/injectable';
import { DiContextProvider } from '../withInjectables/withInjectables';
import { useInject2 } from './useInject2';

describe('useInject2', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer('some-container');
    di.preventSideEffects();
    mount = node =>
      render(<DiContextProvider value={di}>{node}</DiContextProvider>);
  });

  it('given a v2 injectable with no params, returns a factory whose invocation produces the instance', () => {
    const someInjectable2 = getInjectable2({
      id: 'no-params',
      instantiate: () => () => 42,
    });

    di.register(someInjectable2);

    const SomeComponent = () => {
      const factory = useInject2(someInjectable2);

      return <div data-testid="value">{factory()}</div>;
    };

    const rendered = mount(<SomeComponent />);

    expect(rendered.getByTestId('value').textContent).toBe('42');
  });

  it('given a v2 injectable with variadic params, returns a factory that accepts those params at invocation', () => {
    const someInjectable2 = getInjectable2({
      id: 'with-params',
      instantiate: () => (greeting, name) => `${greeting}, ${name}`,
    });

    di.register(someInjectable2);

    const SomeComponent = () => {
      const factory = useInject2(someInjectable2);

      return <div data-testid="value">{factory('hello', 'world')}</div>;
    };

    const rendered = mount(<SomeComponent />);

    expect(rendered.getByTestId('value').textContent).toBe('hello, world');
  });

  it('given a v1 injectable with no params, synthesizes a zero-arg factory', () => {
    const someV1Injectable = getInjectable({
      id: 'v1-no-params',
      instantiate: () => 'v1-instance',
    });

    di.register(someV1Injectable);

    const SomeComponent = () => {
      const factory = useInject2(someV1Injectable);

      return <div data-testid="value">{factory()}</div>;
    };

    const rendered = mount(<SomeComponent />);

    expect(rendered.getByTestId('value').textContent).toBe('v1-instance');
  });

  it('given a v1 injectable with a param, synthesizes a one-arg factory', () => {
    const someV1Injectable = getInjectable({
      id: 'v1-with-param',
      instantiate: (_di, param) => `v1-${param}`,
      lifecycle: lifecycleEnum.transient,
    });

    di.register(someV1Injectable);

    const SomeComponent = () => {
      const factory = useInject2(someV1Injectable);

      return <div data-testid="value">{factory('foo')}</div>;
    };

    const rendered = mount(<SomeComponent />);

    expect(rendered.getByTestId('value').textContent).toBe('v1-foo');
  });

  it('given a non-abstract injectionToken2, returns a factory resolving to the registered implementation', () => {
    const someInjectionToken2 = getInjectionToken2({
      id: 'some-token-2',
    });

    const someImpl = getInjectable2({
      id: 'some-impl',
      injectionToken: someInjectionToken2,
      instantiate: () => name => `impl(${name})`,
    });

    di.register(someImpl);

    const SomeComponent = () => {
      const factory = useInject2(someInjectionToken2);

      return <div data-testid="value">{factory('arg')}</div>;
    };

    const rendered = mount(<SomeComponent />);

    expect(rendered.getByTestId('value').textContent).toBe('impl(arg)');
  });

  it('the factory identity is stable across re-renders for the same alias', () => {
    const someInjectable2 = getInjectable2({
      id: 'stable',
      instantiate: () => () => 'ok',
    });

    di.register(someInjectable2);

    const factoryRefs = [];

    const SomeComponent = () => {
      const factory = useInject2(someInjectable2);
      factoryRefs.push(factory);

      return <div>{factory()}</div>;
    };

    const rendered = mount(<SomeComponent />);
    rendered.rerender(
      <DiContextProvider value={di}>
        <SomeComponent />
      </DiContextProvider>,
    );

    expect(factoryRefs.length).toBeGreaterThanOrEqual(2);
    expect(factoryRefs[0]).toBe(factoryRefs[1]);
  });
});
