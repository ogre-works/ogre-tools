import * as React from 'react';
import { getElementComponent } from './element-component';
import { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';

import { Discover, discoverFor } from '@lensapp/discoverable';

import { getPlugin, Plugin } from './plugin/plugin';
import { useEffect, useRef } from 'react';

describe('element', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
  });

  afterEach(() => {
    expect(console.error).not.toHaveBeenCalled();
  });

  describe('given no plugins, when rendered with native HTML-props', () => {
    let rendered: RenderResult;

    beforeEach(() => {
      const Div = getElementComponent('div');

      rendered = render(<Div data-some-native-html-prop-test />);
    });

    it('renders', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it('renders the native HTML-prop', () => {
      const discover = discoverFor(() => rendered);

      expect(() => {
        discover.getSingleElement('some-native-html-prop');
      }).not.toThrow();
    });
  });

  describe('given plugin', () => {
    let somePlugin: Plugin<{ $somePluginProp: string }>;

    beforeEach(() => {
      somePlugin = getPlugin(({ $somePluginProp }) => ({
        className: $somePluginProp,
        $somePluginProp: undefined,
      }));
    });

    describe('given plugin and plugin-specific props, when rendered', () => {
      let rendered: RenderResult;

      beforeEach(() => {
        const Div = getElementComponent('div', somePlugin);

        rendered = render(
          <Div
            data-some-element-test
            $somePluginProp="some-plugin-prop-value"
          />,
        );
      });

      it('renders', () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it('is influenced by the plugin', () => {
        const discover = discoverFor(() => rendered);

        const element = discover.getSingleElement('some-element');

        // @ts-ignore
        expect(element.discovered).toHaveClass('some-plugin-prop-value');
      });
    });
  });

  describe('given a plugin depending on another, when rendered', () => {
    let rendered: RenderResult;

    beforeEach(() => {
      const somePlugin1 = getPlugin<{ $somePlugin1Input?: string }>(props => ({
        title: `plugin1(${props.$somePlugin1Input})`,
        $somePlugin1Input: undefined,
      }));

      const somePlugin2 = getPlugin<
        { $somePlugin2Input?: string },
        [typeof somePlugin1]
      >(props => ({
        $somePlugin1Input: `plugin2(${props.$somePlugin2Input})`,
        $somePlugin2Input: undefined,
      }));

      const Div = getElementComponent('div', somePlugin2, somePlugin1);

      rendered = render(
        <Div
          data-some-element-test
          $somePlugin2Input="some-plugin-prop-value"
        />,
      );
    });

    it('renders', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it('renders collaborated outcome of plugins', () => {
      const discover = discoverFor(() => rendered);

      const element = discover.getSingleElement('some-element');

      // @ts-ignore
      expect(element.discovered).toHaveAttribute(
        'title',
        'plugin1(plugin2(some-plugin-prop-value))',
      );
    });
  });

  it('given hook ref, when rendered, works', () => {
    const Div = getElementComponent('div');

    const TestComponent = () => {
      const testRef = React.useRef(null);

      useEffect(() => {
        testRef.current.classList.add('some-class-from-ref');
      });

      return <Div ref={testRef} data-some-element-test />;
    };

    const rendered = render(<TestComponent />);

    const discover = discoverFor(() => rendered);

    expect(
      discover
        .getSingleElement('some-element')
        .discovered.classList.contains('some-class-from-ref'),
    ).toBe(true);
  });

  it('given functional ref, when rendered, works', () => {
    const Div = getElementComponent('div');

    const rendered = render(
      <Div
        ref={node => {
          node?.classList.add('some-class-from-ref');
        }}
        data-some-element-test
      />,
    );

    const discover = discoverFor(() => rendered);

    expect(
      discover
        .getSingleElement('some-element')
        .discovered.classList.contains('some-class-from-ref'),
    ).toBe(true);
  });

  describe('given multiple plugins with ref', () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(() => {
      const somePlugin1 = getPlugin<{ $somePlugin1Input?: boolean }>(
        (props: any): any => {
          const ref = useRef(null);

          useEffect(() => {
            ref.current.classList.add('some-class-from-hook-ref');
          }, []);

          return {
            $somePlugin1Input: undefined,
            ref,
          };
        },
      );

      const somePlugin2 = getPlugin<{ $somePlugin2Input?: boolean }>(
        (props): any => ({
          $somePlugin2Input: undefined,

          ref: node => {
            node?.classList.add('some-class-from-functional-ref');
          },
        }),
      );

      const Div = getElementComponent('div', somePlugin2, somePlugin1);

      rendered = render(
        <Div data-some-element-test $somePlugin1Input $somePlugin2Input />,
      );

      discover = discoverFor(() => rendered);
    });

    it('functional refs work', () => {
      expect(
        discover
          .getSingleElement('some-element')
          .discovered.classList.contains('some-class-from-functional-ref'),
      ).toBe(true);
    });

    it('non functional refs work', () => {
      expect(
        discover
          .getSingleElement('some-element')
          .discovered.classList.contains('some-class-from-hook-ref'),
      ).toBe(true);
    });
  });

  describe('given plugins that override output of previous plugin, when rendered', () => {
    let discover: Discover;
    let rendered: RenderResult;

    beforeEach(() => {
      const somePlugin1 = getPlugin(() => ({
        title: 'irrelevant',
      }));

      const somePlugin2 = getPlugin(() => ({
        title: 'some-plugin-2-value',
      }));

      const Div = getElementComponent('div', somePlugin1, somePlugin2);

      rendered = render(<Div data-some-element-test />);

      discover = discoverFor(() => rendered);
    });

    it('renders only the influence of last plugin', () => {
      const element = discover.getSingleElement('some-element').discovered;

      // @ts-ignore
      expect(element).toHaveAttribute('title', 'some-plugin-2-value');
    });

    it('renders', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });
  });

  describe('given plugins that contribute to same prop, when rendered', () => {
    let discover: Discover;
    let rendered: RenderResult;

    beforeEach(() => {
      const somePlugin1 = getPlugin(({ title }) => ({
        title: `plugin1(${title})`,
      }));

      const somePlugin2 = getPlugin(({ title }) => ({
        title: `plugin2(${title})`,
      }));

      const Div = getElementComponent('div', somePlugin1, somePlugin2);

      rendered = render(<Div title="some-prop-value" data-some-element-test />);

      discover = discoverFor(() => rendered);
    });

    it('renders all contributions in order', () => {
      const element = discover.getSingleElement('some-element').discovered;

      // @ts-ignore
      expect(element).toHaveAttribute(
        'title',
        'plugin2(plugin1(some-prop-value))',
      );
    });

    it('renders', () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });
  });

  it('given wrong type for a plugin-prop value, when rendering, typing is not ok', () => {
    const somePlugin = getPlugin<{ $somePluginProp: number }>(() => ({
      $somePluginProp: undefined,
    }));

    const Div = getElementComponent('div', somePlugin);

    // @ts-expect-error
    void render(<Div $somePluginProp="some-not-a-number" />);
  });

  it('given plugin not cleaning up for itself, typing is not ok', () => {
    // @ts-expect-error
    void getPlugin<{ $somePluginProp?: number }>(() => ({
      // Notice: this is "not cleaned up":
      // $somePluginProp: undefined,
    }));
  });

  it("given a plugin-prop which doesn't clean up after its input prop, when rendering, logs error", () => {
    console.error
      // @ts-ignore
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {});

    // @ts-expect-error
    const somePlugin = getPlugin<{ $somePluginProp: string }>(() => ({}));

    const Div = getElementComponent('div', somePlugin);

    void render(<Div $somePluginProp="some-string" />);

    expect(console.error).toHaveBeenCalledTimes(2);

    // @ts-ignore
    console.error.mockClear();
  });

  it('given wrong type for a native prop value, when rendering, typing is not ok', () => {
    const Div = getElementComponent('div');

    // @ts-expect-error
    void render(<Div href="some-string" />);
  });
});
