import * as React from 'react';
import { ComponentType } from 'react';
import { getElementComponent } from './element-component';
import { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';

import { Discover, discoverFor } from '@lensapp/discoverable';

import { getPlugin, Plugin } from './plugin/plugin';
import {
  getPropsFromPlugins,
  PluginsResult,
  WrapperEntry,
} from './get-props-from-plugins';
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
      const testRef = React.useRef<HTMLDivElement>(null);

      useEffect(() => {
        testRef.current!.classList.add('some-class-from-ref');
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

  it('given functional ref, when rendered, when rerendered with a different prop changed, does not call again', () => {
    const Div = getElementComponent('div');
    const someRef = jest.fn();

    const rendered = render(<Div ref={someRef} data-some-element-test />);

    someRef.mockClear();
    rendered.rerender(<Div ref={someRef} />);

    expect(someRef).not.toHaveBeenCalled();
  });

  describe('given multiple plugins with ref', () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(() => {
      const somePlugin1 = getPlugin<{ $somePlugin1Input?: boolean }>(() => {
        const ref = useRef<HTMLElement>(null);

        useEffect(() => {
          ref.current!.classList.add('some-class-from-hook-ref');
        }, []);

        return {
          $somePlugin1Input: undefined,
          ref,
        };
      });

      const somePlugin2 = getPlugin<{ $somePlugin2Input?: boolean }>(() => ({
        $somePlugin2Input: undefined,

        ref: node => {
          node?.classList.add('some-class-from-functional-ref');
        },
      }));

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

  describe('given plugin returning $wrapper', () => {
    it('wraps the element with the wrapper component', () => {
      const WrapperComponent = ({
        someWrapperProp,
        children,
      }: {
        someWrapperProp: string;
        children: React.ReactElement;
      }) => (
        <div data-wrapper-test data-wrapper-prop={someWrapperProp}>
          {children}
        </div>
      );

      const somePlugin = getPlugin<{ $somePluginProp?: string }>(
        ({ $somePluginProp }) => ({
          $somePluginProp: undefined,

          ...($somePluginProp
            ? {
                $wrapper: {
                  Component: WrapperComponent,
                  props: { someWrapperProp: $somePluginProp },
                },
              }
            : {}),
        }),
      );

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(
        <Div data-some-element-test $somePluginProp="some-value" />,
      );

      const discover = discoverFor(() => rendered);

      expect(() => {
        discover.getSingleElement('wrapper');
      }).not.toThrow();

      const wrapper = discover.getSingleElement('wrapper').discovered;

      // @ts-ignore
      expect(wrapper).toHaveAttribute('data-wrapper-prop', 'some-value');
    });

    it('does not wrap when plugin does not return $wrapper', () => {
      const WrapperComponent = ({
        children,
      }: {
        children: React.ReactElement;
      }) => <div data-wrapper-test>{children}</div>;

      const somePlugin = getPlugin<{ $somePluginProp?: string }>(
        ({ $somePluginProp }) => ({
          $somePluginProp: undefined,

          ...($somePluginProp
            ? {
                $wrapper: {
                  Component: WrapperComponent,
                  props: {},
                },
              }
            : {}),
        }),
      );

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test />);

      const discover = discoverFor(() => rendered);

      expect(() => {
        discover.getSingleElement('wrapper');
      }).toThrow();
    });

    it('wrapper receives contributeRef and can access the element via useState', () => {
      let capturedElement: HTMLElement | null = null;

      const WrapperComponent = ({
        contributeRef,
        children,
      }: {
        contributeRef: (cb: (node: HTMLElement | null) => void) => void;
        children: React.ReactElement;
      }) => {
        const [element, setElement] = React.useState<HTMLElement | null>(null);
        contributeRef(setElement);

        capturedElement = element;

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => ({
        $somePluginProp: undefined,
        $wrapper: {
          Component: WrapperComponent,
          props: {},
        },
      }));

      const Div = getElementComponent('div', somePlugin);

      render(<Div data-some-element-test $somePluginProp />);

      expect(capturedElement).toBeInstanceOf(HTMLDivElement);
    });

    it('wrapper can use contributeRef element for hook-based side effects', () => {
      const WrapperComponent = ({
        contributeRef,
        children,
      }: {
        contributeRef: (cb: (node: HTMLElement | null) => void) => void;
        children: React.ReactElement;
      }) => {
        const [element, setElement] = React.useState<HTMLElement | null>(null);
        contributeRef(setElement);

        useEffect(() => {
          element?.classList.add('some-class-from-wrapper-hook');
        }, [element]);

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => ({
        $somePluginProp: undefined,
        $wrapper: {
          Component: WrapperComponent,
          props: {},
        },
      }));

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      const discover = discoverFor(() => rendered);

      expect(
        discover
          .getSingleElement('some-element')
          .discovered.classList.contains('some-class-from-wrapper-hook'),
      ).toBe(true);
    });

    it('multiple plugins returning $wrapper apply wrappers in order', () => {
      const OuterWrapper = ({ children }: { children: React.ReactElement }) => (
        <div data-outer-wrapper-test>{children}</div>
      );

      const InnerWrapper = ({ children }: { children: React.ReactElement }) => (
        <div data-inner-wrapper-test>{children}</div>
      );

      const plugin1 = getPlugin<{ $plugin1?: boolean }>(() => ({
        $plugin1: undefined,
        $wrapper: { Component: InnerWrapper, props: {} },
      }));

      const plugin2 = getPlugin<{ $plugin2?: boolean }>(() => ({
        $plugin2: undefined,
        $wrapper: { Component: OuterWrapper, props: {} },
      }));

      const Div = getElementComponent('div', plugin1, plugin2);

      const rendered = render(<Div data-some-element-test $plugin1 $plugin2 />);

      const discover = discoverFor(() => rendered);

      const outerWrapper =
        discover.getSingleElement('outer-wrapper').discovered;
      const innerWrapper =
        discover.getSingleElement('inner-wrapper').discovered;

      expect(outerWrapper.contains(innerWrapper)).toBe(true);
    });

    it('wrapper can use contributeProps to add props to the element', () => {
      const WrapperComponent = ({
        contributeProps,
        children,
      }: {
        contributeProps: (props: Record<string, unknown>) => void;
        children: React.ReactElement;
      }) => {
        contributeProps({ title: 'from-wrapper' });

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => ({
        $somePluginProp: undefined,
        $wrapper: {
          Component: WrapperComponent,
          props: {},
        },
      }));

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      const discover = discoverFor(() => rendered);

      // @ts-ignore
      expect(
        discover.getSingleElement('some-element').discovered,
      ).toHaveAttribute('title', 'from-wrapper');
    });

    it('wrapper can use contributeProps to add event handlers to the element', () => {
      const onClickSpy = jest.fn();

      const WrapperComponent = ({
        contributeProps,
        children,
      }: {
        contributeProps: (props: Record<string, unknown>) => void;
        children: React.ReactElement;
      }) => {
        contributeProps({ onClick: onClickSpy });

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => ({
        $somePluginProp: undefined,
        $wrapper: {
          Component: WrapperComponent,
          props: {},
        },
      }));

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      const discover = discoverFor(() => rendered);
      const element = discover.getSingleElement('some-element').discovered;

      element.click();

      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });

    it('contributeProps overrides plugin props', () => {
      const WrapperComponent = ({
        contributeProps,
        children,
      }: {
        contributeProps: (props: Record<string, unknown>) => void;
        children: React.ReactElement;
      }) => {
        contributeProps({ title: 'from-wrapper' });

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => ({
        $somePluginProp: undefined,
        title: 'from-plugin',
        $wrapper: {
          Component: WrapperComponent,
          props: {},
        },
      }));

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      const discover = discoverFor(() => rendered);

      // @ts-ignore
      expect(
        discover.getSingleElement('some-element').discovered,
      ).toHaveAttribute('title', 'from-wrapper');
    });

    it('multiple wrappers contributing same event handler composes them', () => {
      const calls: string[] = [];

      const Wrapper1 = ({
        contributeProps,
        children,
      }: {
        contributeProps: (props: Record<string, unknown>) => void;
        children: React.ReactElement;
      }) => {
        contributeProps({
          onClick: () => {
            calls.push('wrapper1');
          },
        });

        return <>{children}</>;
      };

      const Wrapper2 = ({
        contributeProps,
        children,
      }: {
        contributeProps: (props: Record<string, unknown>) => void;
        children: React.ReactElement;
      }) => {
        contributeProps({
          onClick: () => {
            calls.push('wrapper2');
          },
        });

        return <>{children}</>;
      };

      const plugin1 = getPlugin<{ $plugin1?: boolean }>(() => ({
        $plugin1: undefined,
        $wrapper: { Component: Wrapper1, props: {} },
      }));

      const plugin2 = getPlugin<{ $plugin2?: boolean }>(() => ({
        $plugin2: undefined,
        $wrapper: { Component: Wrapper2, props: {} },
      }));

      const Div = getElementComponent('div', plugin1, plugin2);

      const rendered = render(<Div data-some-element-test $plugin1 $plugin2 />);

      const discover = discoverFor(() => rendered);
      const element = discover.getSingleElement('some-element').discovered;

      element.click();

      expect(calls).toEqual(['wrapper2', 'wrapper1']);
    });

    it('contributeProps composes wrapper handler with plugin handler', () => {
      const calls: string[] = [];

      const WrapperComponent = ({
        contributeProps,
        children,
      }: {
        contributeProps: (props: Record<string, unknown>) => void;
        children: React.ReactElement;
      }) => {
        contributeProps({
          onClick: () => {
            calls.push('wrapper');
          },
        });

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => ({
        $somePluginProp: undefined,
        onClick: () => {
          calls.push('plugin');
        },
        $wrapper: {
          Component: WrapperComponent,
          props: {},
        },
      }));

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      const discover = discoverFor(() => rendered);
      const element = discover.getSingleElement('some-element').discovered;

      element.click();

      expect(calls).toEqual(['plugin', 'wrapper']);
    });

    it('toggling $wrapper between present and absent does not crash', () => {
      const hookCallCounts = { current: 0 };

      const WrapperComponent = ({
        children,
      }: {
        children: React.ReactElement;
      }) => {
        hookCallCounts.current++;
        React.useState(0);

        return <>{children}</>;
      };

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(
        ({ $somePluginProp }) => ({
          $somePluginProp: undefined,

          ...($somePluginProp
            ? {
                $wrapper: {
                  Component: WrapperComponent,
                  props: {},
                },
              }
            : {}),
        }),
      );

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      expect(hookCallCounts.current).toBeGreaterThan(0);

      hookCallCounts.current = 0;

      rendered.rerender(<Div data-some-element-test />);

      expect(hookCallCounts.current).toBe(0);

      const discover = discoverFor(() => rendered);

      expect(() => {
        discover.getSingleElement('some-element');
      }).not.toThrow();
    });

    it('$wrapper coexists with ref from the same plugin', () => {
      const WrapperComponent = ({
        children,
      }: {
        children: React.ReactElement;
      }) => <div data-wrapper-test>{children}</div>;

      const somePlugin = getPlugin<{ $somePluginProp?: boolean }>(() => {
        const ref = useRef<HTMLElement>(null);

        useEffect(() => {
          ref.current!.classList.add('some-class-from-plugin-ref');
        }, []);

        return {
          $somePluginProp: undefined,
          ref,
          $wrapper: { Component: WrapperComponent, props: {} },
        };
      });

      const Div = getElementComponent('div', somePlugin);

      const rendered = render(<Div data-some-element-test $somePluginProp />);

      const discover = discoverFor(() => rendered);

      expect(
        discover
          .getSingleElement('some-element')
          .discovered.classList.contains('some-class-from-plugin-ref'),
      ).toBe(true);

      expect(() => {
        discover.getSingleElement('wrapper');
      }).not.toThrow();
    });
  });
});

describe('getPropsFromPlugins', () => {
  const assertType = <T,>(_value: T): void => undefined;

  it('given no plugins, when called, runs the chain', () => {
    const result = getPropsFromPlugins({ title: 'x' });

    expect(result.props).toEqual({ title: 'x' });
    expect(result.refs).toEqual([]);
    expect(result.wrappers).toEqual([]);
  });

  it('given a prop-transforming plugin, when called, returns transformed props', () => {
    const somePlugin = getPlugin<{ $somePluginProp: string }>(
      ({ $somePluginProp }) => ({
        className: $somePluginProp,
        $somePluginProp: undefined,
      }),
    );

    const result = getPropsFromPlugins(
      { $somePluginProp: 'some-value' },
      somePlugin,
    );

    expect(result.props).toEqual({ className: 'some-value' });
  });

  it('typing: no-plugins overload preserves TProps on result.props', () => {
    const result = getPropsFromPlugins({ title: 'x', $foo: 1 });

    assertType<PluginsResult<{ title: string; $foo: number }>>(result);
    assertType<{ title: string; $foo: number }>(result.props);
  });

  it('typing: with-plugins overload accepts plugin-tuple-derived input shape', () => {
    const somePlugin = getPlugin<{ $somePluginProp: string }>(
      ({ $somePluginProp }) => ({
        className: $somePluginProp,
        $somePluginProp: undefined,
      }),
    );

    const result = getPropsFromPlugins(
      { $somePluginProp: 'some-value' },
      somePlugin,
    );

    assertType<PluginsResult>(result);
    assertType<WrapperEntry[]>(result.wrappers);
  });

  it('typing: with-plugins overload rejects input missing required plugin prop', () => {
    const somePlugin = getPlugin<{ $somePluginProp: string }>(
      ({ $somePluginProp }) => ({
        className: $somePluginProp,
        $somePluginProp: undefined,
      }),
    );

    // @ts-expect-error — $somePluginProp is required
    void getPropsFromPlugins({}, somePlugin);
  });

  it('typing: with-plugins overload rejects wrong-typed plugin-prop value', () => {
    const somePlugin = getPlugin<{ $somePluginProp: number }>(() => ({
      $somePluginProp: undefined,
    }));

    void getPropsFromPlugins(
      // @ts-expect-error — value must be a number
      { $somePluginProp: 'not-a-number' },
      somePlugin,
    );
  });

  it('typing: WrapperEntry is generic-friendly with default and narrowed variants', () => {
    const defaultWrapper: WrapperEntry = {
      Component: (() => null) as ComponentType<any>,
      props: { foo: 'bar' },
    };

    assertType<WrapperEntry>(defaultWrapper);

    const TypedWrapperComponent: ComponentType<{ label: string }> = ({
      label,
    }) => <span>{label}</span>;

    const typedWrapper: WrapperEntry<{ label: string }> = {
      Component: TypedWrapperComponent,
      props: { label: 'x' },
    };

    assertType<WrapperEntry<{ label: string }>>(typedWrapper);

    // @ts-expect-error — props.label must be a string
    const _badWrapper: WrapperEntry<{ label: string }> = {
      Component: TypedWrapperComponent,
      props: { label: 1 },
    };
    void _badWrapper;
  });
});
