import React from 'react';
import enzyme from 'enzyme';
import { setImmediate as flushMicroTasks } from 'timers';
import { createContainer, lifecycleEnum } from '@ogre-tools/injectable';
import getInjectedComponent from './getInjectedComponent';
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

describe('getInjectedComponent', () => {
  let di;
  let mount;

  beforeEach(() => {
    di = createContainer();

    mount = mountFor(di);
  });

  it('given injected component, when rendered, renders with dependencies', () => {
    di.register({
      id: 'some-injectable-id',

      lifecycle: lifecycleEnum.transient,

      getDependencies: () => ({
        someDependency: 'some-dependency-value',
      }),

      instantiate: (dependencies, props) => (
        <DumbTestComponent {...dependencies} {...props} />
      ),
    });

    const DumbTestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const SmartTestComponent = getInjectedComponent('some-injectable-id');

    const component = mount(<SmartTestComponent data-some-prop-test />);

    expect(component).toMatchHtmlSnapshot();
  });

  describe('given async dependency, a placeholder and injected component, when rendered', () => {
    let component;
    let asyncDependencyMock;

    beforeEach(async () => {
      asyncDependencyMock = asyncFn();

      di.register({
        id: 'some-injectable-id',

        lifecycle: lifecycleEnum.transient,

        getDependencies: () => ({
          someDependency: asyncDependencyMock(),
        }),

        instantiate: (dependencies, props) => (
          <DumbTestComponent {...dependencies} {...props} />
        ),
      });

      const DumbTestComponent = ({ someDependency, ...props }) => (
        <div {...props}>Some content: "{someDependency}"</div>
      );

      const SmartTestComponent = getInjectedComponent('some-injectable-id', {
        getPlaceholder: () => <div data-placeholder-test />,
      });

      component = mount(<SmartTestComponent data-some-prop-test />);
    });

    it('renders', () => {
      expect(component).toMatchHtmlSnapshot();
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

      it('has no placeholder', () => {
        expect(component.find('[data-placeholder-test]')).not.toExist();
      });
    });
  });
});
