# Dependency injection for React in Ogre Tools

A brutal component for injecting components that use injectable.

## Usage

```
$ npm install @ogre-tools/injectable
$ npm install @ogre-tools/injectable-react
...

import { createContainer } from '@ogre-tools/injectable';
import { Inject } from '@ogre-tools/injectable-react';
```

## Usage

```
  it('given a Component is registered, when Inject is rendered for the Component, renders with dependencies', () => {
    const TestComponent = ({ someDependency, ...props }) => (
      <div {...props}>Some content: "{someDependency}"</div>
    );

    const di = createContainer();

    di.register({
      id: 'some-id',
      getDependencies: () => ({ someDependency: 'some-value' }),
      instantiate: TestComponent,
    });

    const actual = mount(
      <DiContextProvider value={{ di }}>
        <Inject Component={TestComponent} />
      </DiContextProvider>,
    );

    expect(actual).toHaveText('Some content: "some-value"');
  });
```

## Documentation

Check unit tests for documentation.
