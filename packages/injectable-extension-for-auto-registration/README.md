# Auto-registration for Injectable in Ogre Tools

Auto register injectables from default exports of files that match a require.context.

## Usage

```
$ npm install @ogre-tools/injectable
$ npm install @ogre-tools/injectable-extension-for-auto-registration

...
  const di = createContainer();
  
  autoRegister({ 
    di, 
    
    requireContexts: [
      require.context("./some-directory", true, /\.injectable\.(ts|tsx)$/),
      require.context("./some-other-directory", true, /\.injectable\.(ts|tsx)$/),
    ],
  });
```

## Documentation

Check unit tests for documentation.
