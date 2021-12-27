import React from 'react';
import enzyme from 'enzyme';
import { setImmediate as flushMicroTasks } from 'timers';
import { createContainer, lifecycleEnum } from '@ogre-tools/injectable';
import withInjectables from './withInjectables';
import { DiContextProvider } from '../index';
import asyncFn from '@async-fn/jest';

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
    di = createContainer();

    mount = mountFor(di);
  });

  it('given component and sync dependencies, when rendered, renders with dependencies', () => {
    di.register({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: () => 'some-injectable-value',
    });

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, props) => ({
        someDependency: di.inject('some-injectable-id'),
        ...props,
      }),
    });

    const component = mount(<SmartTestComponent data-some-prop-test />);

    expect(component).toMatchHtmlSnapshot();
  });

  describe('given component, placeholder and async dependencies, when rendered', () => {
    let component;
    let asyncDependencyMock;

    beforeEach(async () => {
      asyncDependencyMock = asyncFn();

      di.register({
        id: 'some-injectable-id',

        lifecycle: lifecycleEnum.transient,

        instantiate: () => asyncDependencyMock(),
      });

      const DumbTestComponent = ({ someDependency, ...props }) => (
        <div {...props}>Some content: "{someDependency}"</div>
      );

      const SmartTestComponent = withInjectables(DumbTestComponent, {
        getProps: async (di, props) => ({
          someDependency: await di.inject('some-injectable-id'),
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

      di.register({
        id: 'some-injectable-id',

        lifecycle: lifecycleEnum.transient,

        instantiate: () => asyncDependencyMock(),
      });

      const DumbTestComponent = ({ someDependency, ...props }) => (
        <div {...props}>Some content: "{someDependency}"</div>
      );

      const SmartTestComponent = withInjectables(DumbTestComponent, {
        getProps: async (di, props) => ({
          someDependency: await di.inject('some-injectable-id'),
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

  it('given component, props and a dependency using instantiation parameter, when rendered, renders with the dependency having props as instantiation parameter', () => {
    di.register({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      instantiate: (_, instantiationParameter) =>
        `some-injectable-value: ${instantiationParameter}`,
    });

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = withInjectables(DumbTestComponent, {
      getProps: (di, { someInstantiationParameter, ...props }) => ({
        someDependency: di.inject(
          'some-injectable-id',
          someInstantiationParameter,
        ),

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
