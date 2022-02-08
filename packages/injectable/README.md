# Dependency injection container for Ogre Tools

A brutal dependency injection container

## Usage

```
$ npm install @ogre-tools/injectable

...

import { createContainer } from '@ogre-tools/injectable';  
```

## Usage
```
it('given an injectable is registered, when injected, injects', () => {
  const di = createContainer();
  
  const someInjectable = getInjectable({
    id: 'some-id',
    instantiate: () => 'some-instance',
  });
  
  di.register(someInjectable);

  const actual = di.inject(someInjectable);

  expect(actual).toBe('some-instance');
});
```

## Documentation
Check unit tests for documentation.
