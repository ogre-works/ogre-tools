import asyncFn from '@async-fn/jest';
import React, { Suspense } from 'react';
import { render } from '@testing-library/react';
import { createContainer, getInjectable } from '@lensapp/injectable';
import { DiContextProvider } from '../withInjectables/withInjectables';
import { getAbstractInjectionTokenComponent2 } from './getAbstractInjectionTokenComponent2';
import { getInjectionTokenComponent2 } from './getInjectionTokenComponent2';
import { useInjectDeferred } from '../useInject/useInject';

describe('getAbstractInjectionTokenComponent2', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer('some-container');
    di.preventSideEffects();
    mount = node =>
      render(<DiContextProvider value={di}>{node}</DiContextProvider>);
  });

  it('given a token component is created, it is an abstract injection token', () => {
    const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
      id: 'some-abstract-token-component',
    });

    expect(SomeAbstractTokenComponent.abstract).toBe(true);
  });

  it('given specifier, .for() produces a renderable component that injects from DI', () => {
    const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
      id: 'some-abstract-token-component',
    });

    const SpecificTokenComponent =
      SomeAbstractTokenComponent.for('some-specific');

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SpecificTokenComponent,
      instantiate: () => () => <div>some-specific-content</div>,
    });

    di.register(someImplementation);

    const rendered = mount(<SpecificTokenComponent />);

    expect(rendered.baseElement.textContent).toBe('some-specific-content');
  });

  it('given specifier, .for() passes props to the implementation', () => {
    const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
      id: 'some-abstract-token-component',
    });

    const SpecificTokenComponent =
      SomeAbstractTokenComponent.for('some-specific');

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SpecificTokenComponent,
      instantiate:
        () =>
        ({ someProp }) =>
          <div data-testid="content">{someProp}</div>,
    });

    di.register(someImplementation);

    const rendered = mount(
      <SpecificTokenComponent someProp="some-prop-value" />,
    );

    expect(rendered.getByTestId('content').textContent).toBe('some-prop-value');
  });

  it('given same specifier, .for() returns the same component', () => {
    const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
      id: 'some-abstract-token-component',
    });

    const specific1 = SomeAbstractTokenComponent.for('some-specific');
    const specific2 = SomeAbstractTokenComponent.for('some-specific');

    expect(specific1).toBe(specific2);
  });

  it('given PlaceholderComponent, propagates it to specific components produced by the default factory', () => {
    const someAsyncInstantiate = asyncFn();

    const someAsyncInjectable = getInjectable({
      id: 'some-async',
      instantiate: someAsyncInstantiate,
    });

    const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
      id: 'some-abstract-token-component',
      PlaceholderComponent: () => <div data-testid="some-placeholder" />,
    });

    const SpecificTokenComponent =
      SomeAbstractTokenComponent.for('some-specific');

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SpecificTokenComponent,
      instantiate: () => () => {
        useInjectDeferred(someAsyncInjectable);
        return <div>some-specific-content</div>;
      },
    });

    di.register(someImplementation, someAsyncInjectable);

    const rendered = mount(<SpecificTokenComponent />);

    expect(rendered.getByTestId('some-placeholder')).toBeInTheDocument();
  });

  describe('given custom specificInjectionTokenFactory, when .for() is called', () => {
    let customFactory;
    let SpecificTokenComponent;

    beforeEach(() => {
      customFactory = jest.fn(specId =>
        getInjectionTokenComponent2({
          id: `custom-${specId}`,
          speciality: specId,
        }),
      );

      const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
        id: 'some-abstract-token-component',
        specificInjectionTokenFactory: customFactory,
      });

      SpecificTokenComponent = SomeAbstractTokenComponent.for('some-specific');
    });

    it('the custom factory is called with the specifier', () => {
      expect(customFactory).toHaveBeenCalledWith('some-specific');
    });

    it('the resulting token has the custom id', () => {
      expect(SpecificTokenComponent.id).toContain('custom-some-specific');
    });
  });

  it('given a specific token with an implementation, when rendered without Suspense wrapper, renders the content', () => {
    const SomeAbstractTokenComponent = getAbstractInjectionTokenComponent2({
      id: 'some-abstract-token-component',
    });

    const SpecificTokenComponent =
      SomeAbstractTokenComponent.for('some-specific');

    const someImplementation = getInjectable({
      id: 'some-implementation',
      injectionToken: SpecificTokenComponent,
      instantiate: () => () => <div>some-content</div>,
    });

    di.register(someImplementation);

    const rendered = mount(
      <Suspense fallback={<div>some-fallback</div>}>
        <SpecificTokenComponent />
      </Suspense>,
    );

    expect(rendered.baseElement.textContent).toBe('some-content');
  });
});
