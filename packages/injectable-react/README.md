# Dependency injection for React in Ogre Tools

A brutal component for injecting components that use injectable.

## Usage

```
$ npm install @ogre-tools/injectable
$ npm install @ogre-tools/injectable-react
...

import { withInjectables } from '@ogre-tools/injectable-react';
```

## Usage

```
it('given a Component is registered, when Inject is rendered for the Component, renders with dependencies', () => {
  const di = createContainer();

  const NonInjectedTestComponent = ({ someDependency, ...props }) => (
    <div {...props}>Some content: "{someDependency}"</div>
  );

  const TestComponent = withInjectables(NonInjectedTestComponent, {
    getProps: (di, props) => ({
      someDependency: 'some-value',
      ...props,
    }),
  });

  const actual = mount(
    <DiContextProvider value={{ di }}>
      <TestComponent some-prop="some-other-prop" />
    </DiContextProvider>,
  );

  expect(actual).toHaveText('Some content: "some-value"');
});
```

## Documentation

Check unit tests for documentation.
