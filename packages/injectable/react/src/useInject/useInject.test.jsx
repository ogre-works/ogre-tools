import { noop } from 'lodash/fp';
import { observable, runInAction } from 'mobx';
import { Observer } from 'mobx-react';
import React, { Suspense, useEffect } from 'react';
import { act, render } from '@testing-library/react';

import {
  createContainer,
  getInjectable,
  getKeyedSingletonCompositeKey,
  lifecycleEnum,
} from '@lensapp/injectable';

import asyncFn from '@async-fn/jest';
import registerInjectableReact from '../registerInjectableReact/registerInjectableReact';
import { DiContextProvider } from '../withInjectables/withInjectables';
import { useInjectDeferred, useInject } from './useInject';
import { flushPromises } from '@lensapp/ogre-test-utils';
import { isPromise } from '@lensapp/fp';

describe('useInject', () => {
  let di;
  let mount;
  let onErrorWhileRenderingMock;

  beforeEach(() => {
    di = createContainer('some-container');
    onErrorWhileRenderingMock = jest.fn();

    jest.spyOn(di, 'inject');

    registerInjectableReact(di);

    mount = mountFor(di, onErrorWhileRenderingMock);
  });

  describe('given a sync injectable, when rendered', () => {
    let rendered;
    let someRelatedPropState;
    let someUnrelatedPropState;
    let onMountMock;
    let syncInstantiateMock;
    let someRelatedSyncInjectable;

    beforeEach(() => {
      onMountMock = jest.fn();

      syncInstantiateMock = jest.fn(
        (di, param) => `instance-of-some-sync-injectable(${param})`,
      );

      someRelatedSyncInjectable = getInjectable({
        id: 'some-related-sync-injectable',
        instantiate: syncInstantiateMock,
        lifecycle: lifecycleEnum.transient,
      });

      const SomeComponentUsingSyncInject = ({
        'some-prop': someProp,
        'some-unrelated-prop': someUnrelatedProp,
      }) => {
        const someInstance = useInject(someRelatedSyncInjectable, someProp);

        useEffect(() => {
          onMountMock();
        }, []);

        return (
          <div
            data-some-related-instance-test={someInstance}
            data-some-unrelated-prop-test={someUnrelatedProp}
          />
        );
      };

      di.register(someRelatedSyncInjectable);

      someRelatedPropState = observable.box('some-initial-prop-value');

      someUnrelatedPropState = observable.box(
        'some-initial-unrelated-prop-value',
      );

      rendered = mount(
        <Observer>
          {() => (
            <SomeComponentUsingSyncInject
              some-prop={someRelatedPropState.get()}
              some-unrelated-prop={someUnrelatedPropState.get()}
            />
          )}
        </Observer>,
      );
    });

    it('renders', () => {
      expect(rendered.baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <div
              data-some-related-instance-test="instance-of-some-sync-injectable(some-initial-prop-value)"
              data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
            />
          </div>
        </body>
      `);
    });

    describe('when an unrelated prop changes', () => {
      beforeEach(() => {
        syncInstantiateMock.mockClear();
        di.inject.mockClear();

        act(() => {
          runInAction(() => {
            someUnrelatedPropState.set('some-new-unrelated-prop-value');
          });
        });
      });

      it('does not inject', () => {
        expect(di.inject).not.toHaveBeenCalled();
      });

      it('renders', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-some-related-instance-test="instance-of-some-sync-injectable(some-initial-prop-value)"
                data-some-unrelated-prop-test="some-new-unrelated-prop-value"
              />
            </div>
          </body>
        `);
      });
    });

    describe('when a related prop changes', () => {
      beforeEach(() => {
        syncInstantiateMock.mockClear();
        di.inject.mockClear();

        act(() => {
          runInAction(() => {
            someRelatedPropState.set('some-new-prop-value');
          });
        });
      });

      it('renders', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-some-related-instance-test="instance-of-some-sync-injectable(some-new-prop-value)"
                data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
              />
            </div>
          </body>
        `);
      });
    });
  });

  describe('given an async injectable, and deferring to show latest value between updates, when rendered', () => {
    let rendered;
    let someRelatedPropState;
    let someUnrelatedPropState;
    let someAsyncInstantiateMock;
    let SomeComponentUsingAsyncInject;
    let onMountMock;
    let someAsyncInjectable;

    beforeEach(() => {
      onMountMock = jest.fn();

      someAsyncInstantiateMock = asyncFn();

      someAsyncInjectable = getInjectable({
        id: 'some-async-injectable',
        instantiate: someAsyncInstantiateMock,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, param) => param,
        }),
      });

      SomeComponentUsingAsyncInject = ({
        'some-prop': someProp,
        'some-unrelated-prop': someUnrelatedProp,
      }) => {
        const someInstance = useInjectDeferred(someAsyncInjectable, someProp);

        useEffect(() => {
          onMountMock();
        }, []);

        return (
          <div
            data-some-related-prop-test={someInstance}
            data-some-unrelated-prop-test={someUnrelatedProp}
          />
        );
      };

      di.register(someAsyncInjectable);

      someRelatedPropState = observable.box('some-initial-prop-value');

      someUnrelatedPropState = observable.box(
        'some-initial-unrelated-prop-value',
      );

      rendered = mount(
        <Suspense fallback={<div data-testid="some-suspense" />}>
          <Observer>
            {() => (
              <SomeComponentUsingAsyncInject
                some-prop={someRelatedPropState.get()}
                some-unrelated-prop={someUnrelatedPropState.get()}
              />
            )}
          </Observer>
        </Suspense>,
      );
    });
    it('is suspended', () => {
      const actuallySuspended = !!rendered.queryByTestId('some-suspense');

      expect(actuallySuspended).toBe(true);
    });

    it('does not mount yet', () => {
      expect(onMountMock).not.toHaveBeenCalled();
    });

    it('calls to inject the async injectable', () => {
      expect(
        di.inject.mock.calls.filter(
          ([injectable]) => injectable === someAsyncInjectable,
        ),
      ).toEqual([[someAsyncInjectable, 'some-initial-prop-value']]);
    });

    it('renders as suspended', async () => {
      expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-testid="some-suspense"
              />
            </div>
          </body>
        `);
    });

    describe('when the async instantiation resolves', () => {
      beforeEach(async () => {
        onMountMock.mockClear();
        someAsyncInstantiateMock.mockClear();
        di.inject.mockClear();

        await act(async () => {
          await someAsyncInstantiateMock.resolve('some-async-value');
        });
      });

      it('is no longer suspended', () => {
        const actuallySuspended = !!rendered.queryByTestId('some-suspense');

        expect(actuallySuspended).toBe(false);
      });

      it('mounts', () => {
        expect(onMountMock).toHaveBeenCalled();
      });

      it('renders as non-suspended', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
            <body>
              <div>
                <div
                  data-some-related-prop-test="some-async-value"
                  data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                />
              </div>
            </body>
          `);
      });

      it('the related promise does not appear mutated', () => {
        const actualPromise = di.inject(
          someAsyncInjectable,
          'some-initial-prop-value',
        );

        const actualMutatedProperties =
          Object.getOwnPropertyNames(actualPromise);
        expect(actualMutatedProperties).toEqual([]);
      });

      describe('when a prop related to async injection changes', () => {
        beforeEach(() => {
          someAsyncInstantiateMock.mockClear();
          onMountMock.mockClear();

          act(() => {
            runInAction(() => {
              someRelatedPropState.set('some-new-prop-value');
            });
          });
        });

        it('is still not suspended, as the stale value is still shown', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(false);
        });

        it('still renders as having the old async value', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-async-value"
                    data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                  />
                </div>
              </body>
            `);
        });

        describe('when the new async value resolves', () => {
          beforeEach(async () => {
            await act(async () => {
              await someAsyncInstantiateMock.resolve('some-new-async-value');
            });
          });

          it('is still not suspended', () => {
            const actuallySuspended = !!rendered.queryByTestId('some-suspense');

            expect(actuallySuspended).toBe(false);
          });

          it('renders as having the new async value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
                <body>
                  <div>
                    <div
                      data-some-related-prop-test="some-new-async-value"
                      data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                    />
                  </div>
                </body>
              `);
          });

          describe('when a prop related to async injection changes back to its initial value', () => {
            beforeEach(async () => {
              someAsyncInstantiateMock.mockClear();
              onMountMock.mockClear();
              di.inject.mockClear();

              await act(async () => {
                runInAction(() => {
                  someRelatedPropState.set('some-initial-prop-value');
                });
              });
            });

            it('is still not suspended', () => {
              const actuallySuspended =
                !!rendered.queryByTestId('some-suspense');

              expect(actuallySuspended).toBe(false);
            });

            it('immediately renders as having the previous async value', () => {
              expect(rendered.baseElement).toMatchInlineSnapshot(`
                  <body>
                    <div>
                      <div
                        data-some-related-prop-test="some-async-value"
                        data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                      />
                    </div>
                  </body>
                `);
            });
          });
        });

        describe('given the async instantiation has not resolved yet, but a prop related to async injection still changes', () => {
          beforeEach(() => {
            someAsyncInstantiateMock.mockClear();
            onMountMock.mockClear();
            di.inject.mockClear();

            act(() => {
              runInAction(() => {
                someRelatedPropState.set('some-fast-prop-value');
              });
            });
          });

          it('is still not suspended', () => {
            const actuallySuspended = !!rendered.queryByTestId('some-suspense');

            expect(actuallySuspended).toBe(false);
          });

          it('calls to inject the new async injectable', () => {
            expect(
              di.inject.mock.calls.filter(
                ([injectable]) => injectable === someAsyncInjectable,
              ),
            ).toEqual([[someAsyncInjectable, 'some-fast-prop-value']]);
          });

          it('still renders as having the old async value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
                              <body>
                                <div>
                                  <div
                                    data-some-related-prop-test="some-async-value"
                                    data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                                  />
                                </div>
                              </body>
                          `);
          });

          describe('when the fast async value resolves', () => {
            beforeEach(async () => {
              await act(async () => {
                await someAsyncInstantiateMock.resolveSpecific(
                  ([, param]) => param === 'some-fast-prop-value',
                  'some-fast-async-value',
                );
              });
            });

            it('is still not suspended', () => {
              const actuallySuspended =
                !!rendered.queryByTestId('some-suspense');

              expect(actuallySuspended).toBe(false);
            });

            it('renders as having the new fast value', () => {
              expect(rendered.baseElement).toMatchInlineSnapshot(`
                                  <body>
                                    <div>
                                      <div
                                        data-some-related-prop-test="some-fast-async-value"
                                        data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                                      />
                                    </div>
                                  </body>
                              `);
            });

            describe('when the slow, now irrelevant async value resolves', () => {
              beforeEach(async () => {
                await act(async () => {
                  await someAsyncInstantiateMock.resolveSpecific(
                    ([, param]) => param === 'some-new-prop-value',
                    'irrelevant',
                  );
                });
              });

              it('still renders as having the fast value', () => {
                expect(rendered.baseElement).toMatchInlineSnapshot(`
                                  <body>
                                    <div>
                                      <div
                                        data-some-related-prop-test="some-fast-async-value"
                                        data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                                      />
                                    </div>
                                  </body>
                              `);
              });
            });
          });
        });
      });

      describe('when a prop unrelated to async injection changes', () => {
        beforeEach(() => {
          onMountMock.mockClear();
          di.inject.mockClear();

          act(() => {
            runInAction(() => {
              someUnrelatedPropState.set('some-new-unrelated-prop-value');
            });
          });
        });

        it('is still not suspended', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(false);
        });

        it('still renders as non-suspended', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-async-value"
                    data-some-unrelated-prop-test="some-new-unrelated-prop-value"
                  />
                </div>
              </body>
            `);
        });
      });
    });

    describe('given the async instantiation has not resolved yet, but a prop related to async injection still changes', () => {
      beforeEach(() => {
        someAsyncInstantiateMock.mockClear();
        onMountMock.mockClear();
        di.inject.mockClear();

        act(() => {
          runInAction(() => {
            someRelatedPropState.set('some-fast-prop-value');
          });
        });
      });

      it('is still suspended', () => {
        const actuallySuspended = !!rendered.queryByTestId('some-suspense');

        expect(actuallySuspended).toBe(true);
      });

      it('weirdly, does not call to inject the new async injectable yet, because the old call needs to resolve before the new component can be rendered', () => {
        expect(di.inject).not.toHaveBeenCalledWith(
          someAsyncInjectable,
          expect.anything(),
        );
      });

      it('still renders as suspended', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
                              <body>
                                <div>
                                  <div
                                    data-testid="some-suspense"
                                  />
                                </div>
                              </body>
                          `);
      });

      describe('when the slow, obsolete async instantiation resolves', () => {
        beforeEach(async () => {
          someAsyncInstantiateMock.mockClear();
          di.inject.mockClear();

          await act(async () => {
            await someAsyncInstantiateMock.resolveSpecific(
              ([, param]) => param === 'some-initial-prop-value',
              'irrelevant',
            );
          });
        });

        it('calls to inject the "fast" async instance', () => {
          expect(
            di.inject.mock.calls.filter(
              ([injectable]) => injectable === someAsyncInjectable,
            ),
          ).toEqual([[someAsyncInjectable, 'some-fast-prop-value']]);
        });

        it('remains suspended, as the new injection is still pending', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(true);
        });

        it('renders as suspended', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-testid="some-suspense"
                  />
                </div>
              </body>
            `);
        });

        describe('when the fast async value resolves', () => {
          beforeEach(async () => {
            await act(async () => {
              await someAsyncInstantiateMock.resolveSpecific(
                ([, param]) => param === 'some-fast-prop-value',
                'some-fast-async-value',
              );
            });
          });

          it('renders as having the fast value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
                                  <body>
                                    <div>
                                      <div
                                        data-some-related-prop-test="some-fast-async-value"
                                        data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                                      />
                                    </div>
                                  </body>
                              `);
          });
        });
      });
    });
  });

  describe('given an async injectable, and suspending between updates, when rendered', () => {
    let rendered;
    let someRelatedPropState;
    let someUnrelatedPropState;
    let someAsyncInstantiateMock;
    let SomeComponentUsingAsyncInject;
    let onMountMock;
    let someAsyncInjectable;

    beforeEach(() => {
      onMountMock = jest.fn();

      someAsyncInstantiateMock = asyncFn();

      someAsyncInjectable = getInjectable({
        id: 'some-async-injectable',
        instantiate: someAsyncInstantiateMock,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, param) => param,
        }),
      });

      SomeComponentUsingAsyncInject = ({
        'some-prop': someProp,
        'some-unrelated-prop': someUnrelatedProp,
      }) => {
        const someInstance = useInject(someAsyncInjectable, someProp);

        useEffect(() => {
          onMountMock();
        }, []);

        return (
          <div
            data-some-related-prop-test={someInstance}
            data-some-unrelated-prop-test={someUnrelatedProp}
          />
        );
      };

      di.register(someAsyncInjectable);

      someRelatedPropState = observable.box('some-initial-prop-value');

      someUnrelatedPropState = observable.box(
        'some-initial-unrelated-prop-value',
      );

      rendered = mount(
        <Suspense fallback={<div data-testid="some-suspense" />}>
          <Observer>
            {() => (
              <SomeComponentUsingAsyncInject
                some-prop={someRelatedPropState.get()}
                some-unrelated-prop={someUnrelatedPropState.get()}
              />
            )}
          </Observer>
        </Suspense>,
      );
    });

    it('is suspended', () => {
      const actuallySuspended = !!rendered.queryByTestId('some-suspense');

      expect(actuallySuspended).toBe(true);
    });

    it('does not mount yet', () => {
      expect(onMountMock).not.toHaveBeenCalled();
    });

    it('calls to inject the async injectable', () => {
      expect(
        di.inject.mock.calls.filter(
          ([injectable]) => injectable === someAsyncInjectable,
        ),
      ).toEqual([[someAsyncInjectable, 'some-initial-prop-value']]);
    });

    it('renders as suspended', async () => {
      expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-testid="some-suspense"
              />
            </div>
          </body>
        `);
    });

    describe('when the async instantiation resolves', () => {
      beforeEach(async () => {
        onMountMock.mockClear();
        someAsyncInstantiateMock.mockClear();
        di.inject.mockClear();

        await act(async () => {
          await someAsyncInstantiateMock.resolve('some-async-value');
        });
      });

      it('is no longer suspended', () => {
        const actuallySuspended = !!rendered.queryByTestId('some-suspense');

        expect(actuallySuspended).toBe(false);
      });

      it('mounts', () => {
        expect(onMountMock).toHaveBeenCalled();
      });

      it('renders as non-suspended', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
            <body>
              <div>
                <div
                  data-some-related-prop-test="some-async-value"
                  data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                />
              </div>
            </body>
          `);
      });

      it('the related promise does not appear mutated', () => {
        const actualPromise = di.inject(
          someAsyncInjectable,
          'some-initial-prop-value',
        );

        const actualMutatedProperties =
          Object.getOwnPropertyNames(actualPromise);

        expect(actualMutatedProperties).toEqual([]);
      });

      describe('when a prop related to async injection changes', () => {
        beforeEach(() => {
          someAsyncInstantiateMock.mockClear();
          onMountMock.mockClear();

          act(() => {
            runInAction(() => {
              someRelatedPropState.set('some-new-prop-value');
            });
          });
        });

        it('becomes suspended again', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(true);
        });

        it('renders as suspended (but with hidden stale state because of react)', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
            <body>
              <div>
                <div
                  data-some-related-prop-test="some-async-value"
                  data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                  style="display: none;"
                />
                <div
                  data-testid="some-suspense"
                />
              </div>
            </body>
          `);
        });

        describe('when the new async value resolves', () => {
          beforeEach(async () => {
            await act(async () => {
              await someAsyncInstantiateMock.resolve('some-new-async-value');
            });
          });

          it('becomes not suspended', () => {
            const actuallySuspended = !!rendered.queryByTestId('some-suspense');

            expect(actuallySuspended).toBe(false);
          });

          it('renders as having the new async value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-new-async-value"
                    data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                    style=""
                  />
                </div>
              </body>
            `);
          });

          describe('when a prop related to async injection changes back to its initial value', () => {
            beforeEach(async () => {
              someAsyncInstantiateMock.mockClear();
              onMountMock.mockClear();
              di.inject.mockClear();

              await act(async () => {
                runInAction(() => {
                  someRelatedPropState.set('some-initial-prop-value');
                });
              });
            });

            it('is still not suspended', () => {
              const actuallySuspended =
                !!rendered.queryByTestId('some-suspense');

              expect(actuallySuspended).toBe(false);
            });

            it('immediately renders as having the previous async value', () => {
              expect(rendered.baseElement).toMatchInlineSnapshot(`
                <body>
                  <div>
                    <div
                      data-some-related-prop-test="some-async-value"
                      data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                      style=""
                    />
                  </div>
                </body>
              `);
            });
          });
        });

        describe('given the async instantiation has not resolved yet, but a prop related to async injection still changes', () => {
          beforeEach(() => {
            someAsyncInstantiateMock.mockClear();
            onMountMock.mockClear();
            di.inject.mockClear();

            act(() => {
              runInAction(() => {
                someRelatedPropState.set('some-fast-prop-value');
              });
            });
          });

          it('is still suspended', () => {
            const actuallySuspended = !!rendered.queryByTestId('some-suspense');

            expect(actuallySuspended).toBe(true);
          });

          it('calls to inject the new async injectable', () => {
            expect(
              di.inject.mock.calls.filter(
                ([injectable]) => injectable === someAsyncInjectable,
              ),
            ).toEqual([[someAsyncInjectable, 'some-fast-prop-value']]);
          });

          it('still renders as suspended', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-async-value"
                    data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                    style="display: none;"
                  />
                  <div
                    data-testid="some-suspense"
                  />
                </div>
              </body>
            `);
          });

          describe('when the fast async value resolves', () => {
            beforeEach(async () => {
              await act(async () => {
                await someAsyncInstantiateMock.resolveSpecific(
                  ([, param]) => param === 'some-fast-prop-value',
                  'some-fast-async-value',
                );
              });
            });

            it('becomes not suspended', () => {
              const actuallySuspended =
                !!rendered.queryByTestId('some-suspense');

              expect(actuallySuspended).toBe(false);
            });

            it('renders as having the new fast value', () => {
              expect(rendered.baseElement).toMatchInlineSnapshot(`
                <body>
                  <div>
                    <div
                      data-some-related-prop-test="some-fast-async-value"
                      data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                      style=""
                    />
                  </div>
                </body>
              `);
            });

            describe('when the slow, now irrelevant async value resolves', () => {
              beforeEach(async () => {
                await act(async () => {
                  await someAsyncInstantiateMock.resolveSpecific(
                    ([, param]) => param === 'some-new-prop-value',
                    'irrelevant',
                  );
                });
              });

              it('still renders as having the fast value', () => {
                expect(rendered.baseElement).toMatchInlineSnapshot(`
                  <body>
                    <div>
                      <div
                        data-some-related-prop-test="some-fast-async-value"
                        data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                        style=""
                      />
                    </div>
                  </body>
                `);
              });
            });
          });
        });
      });

      describe('when a prop unrelated to async injection changes', () => {
        beforeEach(() => {
          onMountMock.mockClear();
          di.inject.mockClear();

          act(() => {
            runInAction(() => {
              someUnrelatedPropState.set('some-new-unrelated-prop-value');
            });
          });
        });

        it('is still not suspended', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(false);
        });

        it('still renders as non-suspended', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-async-value"
                    data-some-unrelated-prop-test="some-new-unrelated-prop-value"
                  />
                </div>
              </body>
            `);
        });
      });
    });

    describe('given the async instantiation has not resolved yet, but a prop related to async injection still changes', () => {
      beforeEach(() => {
        someAsyncInstantiateMock.mockClear();
        onMountMock.mockClear();
        di.inject.mockClear();

        act(() => {
          runInAction(() => {
            someRelatedPropState.set('some-fast-prop-value');
          });
        });
      });

      it('is still suspended', () => {
        const actuallySuspended = !!rendered.queryByTestId('some-suspense');

        expect(actuallySuspended).toBe(true);
      });

      it('weirdly, does not call to inject the new async injectable yet, because the old call needs to resolve before the new component can be rendered', () => {
        expect(di.inject).not.toHaveBeenCalledWith(
          someAsyncInjectable,
          expect.anything(),
        );
      });

      it('still renders as suspended', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
                              <body>
                                <div>
                                  <div
                                    data-testid="some-suspense"
                                  />
                                </div>
                              </body>
                          `);
      });

      describe('when the slow, obsolete async instantiation resolves', () => {
        beforeEach(async () => {
          someAsyncInstantiateMock.mockClear();
          di.inject.mockClear();

          await act(async () => {
            await someAsyncInstantiateMock.resolveSpecific(
              ([, param]) => param === 'some-initial-prop-value',
              'irrelevant',
            );
          });
        });

        it('calls to inject the "fast" async instance', () => {
          expect(
            di.inject.mock.calls.filter(
              ([injectable]) => injectable === someAsyncInjectable,
            ),
          ).toEqual([[someAsyncInjectable, 'some-fast-prop-value']]);
        });

        it('remains suspended, as the new injection is still pending', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(true);
        });

        it('renders as suspended', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-testid="some-suspense"
                  />
                </div>
              </body>
            `);
        });

        describe('when the fast async value resolves', () => {
          beforeEach(async () => {
            await act(async () => {
              await someAsyncInstantiateMock.resolveSpecific(
                ([, param]) => param === 'some-fast-prop-value',
                'some-fast-async-value',
              );
            });
          });

          it('renders as having the fast value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
                                  <body>
                                    <div>
                                      <div
                                        data-some-related-prop-test="some-fast-async-value"
                                        data-some-unrelated-prop-test="some-initial-unrelated-prop-value"
                                      />
                                    </div>
                                  </body>
                              `);
          });
        });
      });
    });
  });

  describe('given multiple components for the same async injectable keyed singleton', () => {
    let rendered;
    let someRelatedPropState;
    let someAsyncInstantiateMock;
    let SomeComponentUsingAsyncInject;
    let someAsyncInjectable;

    beforeEach(() => {
      someAsyncInstantiateMock = asyncFn();

      someAsyncInjectable = getInjectable({
        id: 'some-async-injectable',
        instantiate: someAsyncInstantiateMock,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, param) => param,
        }),
      });

      SomeComponentUsingAsyncInject = ({ 'some-prop': someProp }) => {
        const someInstance = useInjectDeferred(someAsyncInjectable, someProp);

        return <div data-some-related-prop-test={someInstance} />;
      };

      di.register(someAsyncInjectable);

      someRelatedPropState = observable.box('some-initial-prop-value');

      rendered = mount(
        <Suspense fallback={<div data-testid="some-suspense" />}>
          <Observer>
            {() => (
              <>
                <SomeComponentUsingAsyncInject
                  some-prop={someRelatedPropState.get()}
                />

                <SomeComponentUsingAsyncInject
                  some-prop={someRelatedPropState.get()}
                />

                <SomeComponentUsingAsyncInject
                  some-prop={someRelatedPropState.get()}
                />
              </>
            )}
          </Observer>
        </Suspense>,
      );
    });

    it('is suspended', () => {
      const actuallySuspended = !!rendered.queryByTestId('some-suspense');

      expect(actuallySuspended).toBe(true);
    });

    it('calls to inject the async injectable for each component', () => {
      expect(
        di.inject.mock.calls.filter(
          ([injectable]) => injectable === someAsyncInjectable,
        ),
      ).toEqual([
        [someAsyncInjectable, 'some-initial-prop-value'],
        [someAsyncInjectable, 'some-initial-prop-value'],
        [someAsyncInjectable, 'some-initial-prop-value'],
      ]);
    });

    it('renders as suspended', async () => {
      expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-testid="some-suspense"
              />
            </div>
          </body>
        `);
    });

    describe('when the async dependency resolves', () => {
      beforeEach(async () => {
        someAsyncInstantiateMock.mockClear();

        await act(async () => {
          await someAsyncInstantiateMock.resolve('some-async-value');
        });
      });

      it('is no longer suspended', () => {
        const actuallySuspended = !!rendered.queryByTestId('some-suspense');

        expect(actuallySuspended).toBe(false);
      });

      it('renders as non-suspended', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
            <body>
              <div>
                <div
                  data-some-related-prop-test="some-async-value"
                />
                <div
                  data-some-related-prop-test="some-async-value"
                />
                <div
                  data-some-related-prop-test="some-async-value"
                />
              </div>
            </body>
          `);
      });

      describe('when a prop related to async injection changes', () => {
        beforeEach(() => {
          someAsyncInstantiateMock.mockClear();
          di.inject.mockClear();

          act(() => {
            runInAction(() => {
              someRelatedPropState.set('some-new-prop-value');
            });
          });
        });

        it('is still not suspended', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(false);
        });

        it('calls to inject the async injectable for each component', () => {
          expect(
            di.inject.mock.calls.filter(
              ([injectable]) => injectable === someAsyncInjectable,
            ),
          ).toEqual([
            [someAsyncInjectable, 'some-new-prop-value'],
            [someAsyncInjectable, 'some-new-prop-value'],
            [someAsyncInjectable, 'some-new-prop-value'],
          ]);
        });

        it('still renders as having the old async values', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-async-value"
                  />
                  <div
                    data-some-related-prop-test="some-async-value"
                  />
                  <div
                    data-some-related-prop-test="some-async-value"
                  />
                </div>
              </body>
            `);
        });

        describe('when the new async value resolves', () => {
          beforeEach(async () => {
            await act(async () => {
              await someAsyncInstantiateMock.resolve('some-new-async-value');
            });
          });

          it('is still not suspended', () => {
            const actuallySuspended = !!rendered.queryByTestId('some-suspense');

            expect(actuallySuspended).toBe(false);
          });

          it('renders as having the new async value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
                <body>
                  <div>
                    <div
                      data-some-related-prop-test="some-new-async-value"
                    />
                    <div
                      data-some-related-prop-test="some-new-async-value"
                    />
                    <div
                      data-some-related-prop-test="some-new-async-value"
                    />
                  </div>
                </body>
              `);
          });
        });
      });
    });
  });

  describe('given an async injectable keyed singleton with a composite key, when rendered', () => {
    let rendered;
    let somePropState;
    let someAsyncInstantiateMock;
    let SomeComponentUsingAsyncInject;
    let someAsyncInjectableWithCompositeKey;

    beforeEach(() => {
      someAsyncInstantiateMock = asyncFn();

      someAsyncInjectableWithCompositeKey = getInjectable({
        id: 'some-async-injectable-with-composite-key',
        instantiate: someAsyncInstantiateMock,

        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (di, param) =>
            getKeyedSingletonCompositeKey(
              'irrelevant-part-of-composite-key',
              param.somePartOfCompositeKey,
            ),
        }),
      });

      SomeComponentUsingAsyncInject = ({ 'some-prop': someProp }) => {
        const someInstance = useInjectDeferred(
          someAsyncInjectableWithCompositeKey,
          someProp,
        );

        return <div data-some-related-prop-test={someInstance} />;
      };

      di.register(someAsyncInjectableWithCompositeKey);

      somePropState = observable.box({
        somePartOfCompositeKey: 'some-initial-part-of-composite-key',
      });

      rendered = mount(
        <Suspense fallback={<div data-testid="some-suspense" />}>
          <Observer>
            {() => {
              const somePropWhichCannotBeKeyedByReferenceBetweenRenders = {
                ...somePropState.get(),
              };

              return (
                <>
                  <SomeComponentUsingAsyncInject
                    some-prop={
                      somePropWhichCannotBeKeyedByReferenceBetweenRenders
                    }
                  />
                </>
              );
            }}
          </Observer>
        </Suspense>,
      );
    });

    it('is suspended', () => {
      const actuallySuspended = !!rendered.queryByTestId('some-suspense');

      expect(actuallySuspended).toBe(true);
    });

    it('calls to inject the async injectable', () => {
      expect(
        di.inject.mock.calls.filter(
          ([injectable]) => injectable === someAsyncInjectableWithCompositeKey,
        ),
      ).toEqual([
        [
          someAsyncInjectableWithCompositeKey,
          {
            somePartOfCompositeKey: 'some-initial-part-of-composite-key',
          },
        ],
      ]);
    });

    it('renders as suspended', async () => {
      expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-testid="some-suspense"
              />
            </div>
          </body>
        `);
    });

    describe('when the async instantiation resolves', () => {
      beforeEach(async () => {
        someAsyncInstantiateMock.mockClear();
        di.inject.mockClear();

        await act(async () => {
          await someAsyncInstantiateMock.resolve('some-async-value');
        });
      });

      it('is no longer suspended', () => {
        const actuallySuspended = !!rendered.queryByTestId('some-suspense');

        expect(actuallySuspended).toBe(false);
      });

      it('renders as non-suspended', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-some-related-prop-test="some-async-value"
              />
            </div>
          </body>
        `);
      });

      describe('when a prop related to async injection changes', () => {
        beforeEach(() => {
          someAsyncInstantiateMock.mockClear();
          di.inject.mockClear();

          act(() => {
            runInAction(() => {
              somePropState.set({
                somePartOfCompositeKey: 'some-new-part-of-composite-key',
              });
            });
          });
        });

        it('is still not suspended', () => {
          const actuallySuspended = !!rendered.queryByTestId('some-suspense');

          expect(actuallySuspended).toBe(false);
        });

        it('calls to inject the async injectable', () => {
          expect(
            di.inject.mock.calls.filter(
              ([injectable]) =>
                injectable === someAsyncInjectableWithCompositeKey,
            ),
          ).toEqual([
            [
              someAsyncInjectableWithCompositeKey,
              {
                somePartOfCompositeKey: 'some-new-part-of-composite-key',
              },
            ],
          ]);
        });

        it('still renders as having the old async values', () => {
          expect(rendered.baseElement).toMatchInlineSnapshot(`
            <body>
              <div>
                <div
                  data-some-related-prop-test="some-async-value"
                />
              </div>
            </body>
          `);
        });

        describe('when the new async value resolves', () => {
          beforeEach(async () => {
            await act(async () => {
              await someAsyncInstantiateMock.resolve('some-new-async-value');
            });
          });

          it('is still not suspended', () => {
            const actuallySuspended = !!rendered.queryByTestId('some-suspense');

            expect(actuallySuspended).toBe(false);
          });

          it('renders as having the new async value', () => {
            expect(rendered.baseElement).toMatchInlineSnapshot(`
              <body>
                <div>
                  <div
                    data-some-related-prop-test="some-new-async-value"
                  />
                </div>
              </body>
            `);
          });
        });
      });
    });
  });

  describe('given a variable injectable, when rendered', () => {
    let rendered;
    let someVariableInjectableState;
    let someOtherInjectable;

    beforeEach(() => {
      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'some-other-instance',
      });

      di.register(someInjectable, someOtherInjectable);

      const SomeComponentUsingSyncInject = ({
        'variable-injectable': variableInjectable,
      }) => {
        const someInstance = useInject(variableInjectable);
        return <div data-some-instance-test={someInstance} />;
      };

      someVariableInjectableState = observable.box(someInjectable, {
        deep: false,
      });

      rendered = mount(
        <Observer>
          {() => (
            <SomeComponentUsingSyncInject
              variable-injectable={someVariableInjectableState.get()}
            />
          )}
        </Observer>,
      );
    });

    it('renders', () => {
      expect(rendered.baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <div
              data-some-instance-test="some-instance"
            />
          </div>
        </body>
      `);
    });

    describe('when the variable injectable changes', () => {
      beforeEach(() => {
        act(() => {
          runInAction(() => {
            someVariableInjectableState.set(someOtherInjectable);
          });
        });
      });

      it('renders the instance of the changed injectable', () => {
        expect(rendered.baseElement).toMatchInlineSnapshot(`
          <body>
            <div>
              <div
                data-some-instance-test="some-other-instance"
              />
            </div>
          </body>
        `);
      });
    });
  });

  describe('given a transient async injectable (illegal before React 19 and use-hook), when rendered', () => {
    let rendered;

    beforeEach(() => {
      const someAsyncTransientInjectable = getInjectable({
        id: 'some-async-transient',
        instantiate: async () => 'irrelevant',
        lifecycle: lifecycleEnum.transient,
      });

      di.register(someAsyncTransientInjectable);

      const SomeComponentUsingInject = () => {
        useInject(someAsyncTransientInjectable);

        return <div>Irrelevant</div>;
      };

      withSuppressedConsoleError(() => {
        rendered = mount(<SomeComponentUsingInject />);
      });
    });

    it('does not inject', () => {
      expect(di.inject).not.toHaveBeenCalled();
    });

    it('throws while rendering', () => {
      expect(onErrorWhileRenderingMock).toHaveBeenCalledWith(
        'Tried to useInject, but the injectable "some-async-transient" was an async transient, which is not supported until React 19 and use-hook',
      );
    });
  });

  describe('given a transient promise-like injectable (illegal before React 19 and use-hook), when rendered', () => {
    let rendered;

    beforeEach(() => {
      const someAsyncTransientInjectable = getInjectable({
        id: 'some-async-transient',
        instantiate: () => Promise.resolve('irrelevant'),
        lifecycle: lifecycleEnum.transient,
      });

      di.register(someAsyncTransientInjectable);

      const SomeComponentUsingInject = () => {
        useInject(someAsyncTransientInjectable);

        return <div>Irrelevant</div>;
      };

      withSuppressedConsoleError(() => {
        rendered = mount(<SomeComponentUsingInject />);
      });
    });

    it('does inject the bad injectable 4 times (why? Unknown. Maybe for throwing inside useState or something.)', () => {
      expect(di.inject).toHaveBeenCalledTimes(4);
    });

    it('throws while rendering', () => {
      expect(onErrorWhileRenderingMock).toHaveBeenCalledWith(
        'Tried to useInject, but the injectable "some-async-transient" was an async transient, which is not supported until React 19 and use-hook',
      );
    });
  });

  describe('given an async injectable which rejects at instantiation, when rendered', () => {
    let rendered;

    beforeEach(async () => {
      const someAsyncRejectingInjectable = getInjectable({
        id: 'some-async-rejection',

        instantiate: async () => {
          throw new Error('some error');
        },
      });

      di.register(someAsyncRejectingInjectable);

      const SomeComponentUsingSyncInject = () => {
        useInject(someAsyncRejectingInjectable);

        return <div>Irrelevant</div>;
      };

      rendered = mount(<SomeComponentUsingSyncInject />);

      await act(async () => {
        withSuppressedConsoleError(async () => {
          // Flush the async rejection.
          await flushPromises();
        });
      });
    });

    it('throws while rendering', () => {
      expect(onErrorWhileRenderingMock).toHaveBeenCalledWith('some error');
    });
  });
});

const mountFor = (di, onRenderingError) => node =>
  render(
    <ErrorBoundary onError={onRenderingError}>
      <DiContextProvider value={{ di }}>{node}</DiContextProvider>
    </ErrorBoundary>,
  );

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return <div>Some error in rendering prevented render</div>;
    }

    return this.props.children;
  }
}

const withSuppressedConsoleError = toBeSuppressed => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);
  const supressed = toBeSuppressed();

  if (isPromise(supressed)) {
    supressed.finally(() => consoleErrorSpy.mockRestore());
  } else {
    consoleErrorSpy.mockRestore();
  }
};
