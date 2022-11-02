# Dependency graphing for Injectable in Ogre Tools

## Usage

```
$ npm install @ogre-tools/injectable
$ npm install @ogre-tools/injectable-extensions-for-dependency-graphing

...

import { createContainer } from '@ogre-tools/injectable';  
import { registerDependencyGraphing, plantUmlDependencyGraphInjectable } from '@ogre-tools/injectable-extensions-for-dependency-graphing';

const di = di.createContainer();
registerDependencyGraphing(di);

...do injections to populate graph...

const graph = di.inject(plantUmlDependencyGraphInjectable);

console.log(graph)  
```


## Documentation

Check unit tests for documentation.
