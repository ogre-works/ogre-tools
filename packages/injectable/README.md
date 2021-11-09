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
  
  di.register({
    id: 'some-id',
    instantiate: () => 'some-instance',
  });

  const actual = di.inject('some-id');

  expect(actual).toBe('some-instance');
});
```

## Documentation
Check unit tests for documentation.
