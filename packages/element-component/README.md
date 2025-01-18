# Component Element

A way to introduce re-usable props in React.

## Usage

```tsx
const somePlugin = getPlugin((props: ({ $somePluginProp}) => ({ title: props.$somePluginProp })));

const SomeComponentElement = getComponentElement("div", somePlugin);

render(<SomeComponentElement $somePluginProp="some-value" />);

// -> <div title="some-value" />
```
