# Error monitoring for Injectable in Ogre Tools

## Usage

```
$ npm install @ogre-tools/injectable
$ npm install @ogre-tools/injectable-extensions-for-error-monitoring

...

import { createContainer } from '@ogre-tools/injectable';  
import { registerErrorMonitoring, errorMonitorInjectionToken } from '@ogre-tools/injectable-extensions-for-error-monitoring';

const di = di.createContainer();
registerErrorMonitoring(di);

const customErrorMonitor = getInjectable({
  id: 'custom-error-monitor',
  injectionToken: errorMonitorInjectionToken,
  instantiate: () => error => console.error(error),
});

di.register(customErrorMonitor);

// sync and async errors in .instantiate() and injected functions are now logged using console.error().
```

## Documentation

Check unit tests for documentation.
