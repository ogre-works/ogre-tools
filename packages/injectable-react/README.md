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
it('given an injectable is registered, when injected, injects', () => {
  const TestComponent = ({ someDependency, ...props}) = <div {...props}>Some content</div>;

  const di = createContainer();

  di.register({
    id: 'some-id',
    getDependencies: di => ({someDependency: 'some-value' }),
    instantiate: di => props = <div {...props}>Some content</div>,
  });

  const actual = mount(<Inject component={} />);

  expect(actual).toBe('some-instance');
});
```

## Documentation

Check unit tests for documentation.
