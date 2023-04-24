# Linkable

A substitute for `$ npm link` which mimics behaviour of `$ npm pack` by using symlinks. 

This is useful, because npm link creates symlinks for the entire module directory, thus making different dependencies discovered wrongly from the local `node_modules` of linking target. This leads to multiple instances of things that are not designed to have multiple instances, eg. `peerDependencies`.

The downside is that `linkable` creates the symlinks naively without respect for whatever the logic of `npm link` may be.

Linking of files and directories are supported, but adding new files will require new run of linkable for symlinks to appear.

## Usage

1. `$ npm install --save-dev @ogre-tools/linkable`
2. Add `scripts: { "postinstall": "linkable" }` to `package.json`
3. `$ npm install`
4. A configuration file emerges: `.linkable.json`
5. Add the configuration file to `.gitignore`
6. Edit the configuration to your preference of paths to local module directories under development, eg.:

```json
[
  "../some-module",
  "/some-directory/some-other-module"
]
```

7. Subsequent runs of `$ npm install` will now create symlinks in `node_modules` to whatever is in `package.json` property `files` of "some-module" and "some-other-module".
