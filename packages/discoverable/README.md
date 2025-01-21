# Discoverable

A test-utility to control HTML-elements using data-attributes.

## Usage

```tsx
import { render } from '@testing-library/react';
import { discoverFor } from '@lensapp/discoverable';

const rendered = render(
  <div>
    <div
      data-some-attribute-test="some-value"
      some-other-attribute-test="some-other-value"
    />
    
    <div data-some-unrelated-attribute-test="irrelevant" />
  </div>,
);

const discover = discoverFor(() => rendered);

const discovered = discover.getSingleElement(
  'some-attribute',
  'some-value',
).getAttribute("some-other-attribute");

// discovered === "some-other-value"
```
