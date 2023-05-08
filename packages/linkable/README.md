# Linkable

A substitute for `$ npm link` which extends library [yalc](https://github.com/wclr/yalc) with ability to link to multiple modules using wildcard-paths. 

Reinventing `$ npm link` is necessary, because it stumbles when symlinks created by it lead to places which have their local `node_modules`, which will unnaturally take precedence over `peerDependencies` causing poisonous multiple instances in runtime.

The downside of `linkable` is that, unlike `npm link`, `linkable` requires `linkable-push` to "refresh" the targets of linking to those linking.

## Usage

1. In linking source:
   1. `$ npm install --save-dev @ogre-tools/linkable`
   1. Add `scripts: { "postinstall": "linkable" }` to `package.json`.
   1. Add lines to `.gitignore` for new stuff related only for local development:
      1. .linkable.json
      1. .yalc
      1. yalc.lock
   1. Create a configuration file: `.linkable.json` to project root with your preference of paths to local module directories under development, eg.:
```json
[
  "../some-module",
  "/some-monorepo/packages/**"
]
```
2. In linking target:
   1. Also `$ npm install --save-dev @ogre-tools/linkable`
   1. Add `scripts: { "postbuild": "linkable-push" }` to `package.json`.
   1. `$ npm build`

3. `$ npm install` in linking source will now create "live" yalc-links to packages defined in `.linkable.json`. When the target packages are `linkable-push`:ed as result from being built, the source(s) will pick up the changes.
