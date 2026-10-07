import createContainer from "../dependency-injection-container/createContainer";
import getInjectable from "../getInjectable/getInjectable";
import getInjectable2 from "../getInjectable2/getInjectable2";

describe('toplevel-instantiation-callback', () => {
let di;

  beforeEach(() => {
    di = createContainer('test-container');
  });

  describe('given a global instantiation callback has been set on the root di', () => {
    let globalInstantiationCallbackSpy;

    beforeEach(() => {
      globalInstantiationCallbackSpy = jest.fn().mockImplementation((di, id, instantiation, args) => instantiation(di, ...args));

      di.setGlobalInstantiationCallback(globalInstantiationCallbackSpy)
    });

    describe('given some injectable1 has been registered', () => {
      let someInjectable;
      beforeEach(() => {
        someInjectable = getInjectable({
          id: "some-id",
          instantiate: () => 10,
        });

        di.register(someInjectable);
      });

      describe('when injecting that injectable', () => {
        let value;

        beforeEach(() => {
          value = di.inject(someInjectable);
        });

        it('calls the global instantiation callback with the expected arguments', () => {
          expect(globalInstantiationCallbackSpy).toHaveBeenCalledWith(expect.objectContaining({ inject: expect.any(Function) }), "some-id", expect.any(Function), [])
        });

        it('returns the actual value from the instantiate', () => {
          expect(value).toBe(10);
        });

        it('when injecting again > does not call the instantiation callback again', () => {
          globalInstantiationCallbackSpy.mockClear();
          di.inject(someInjectable);
          expect(globalInstantiationCallbackSpy).not.toHaveBeenCalled();
        });
      })
    })

    describe('given some injectable2 has been registered', () => {
      let someInjectable;
      beforeEach(() => {
        someInjectable = getInjectable2({
          id: "some-id",
          instantiate: () => () => 10,
        });

        di.register(someInjectable);
      });

      describe('when injecting that injectable', () => {
        let value;

        beforeEach(() => {
          value = di.inject(someInjectable);
        });

        it('calls the global instantiation callback with the expected arguments', () => {
          expect(globalInstantiationCallbackSpy).toHaveBeenCalledWith(expect.objectContaining({ inject: expect.any(Function) }), "some-id", expect.any(Function), [])
        });

        it('returns the actual value from the instantiate', () => {
          expect(value).toBe(10);
        });

        it('when injecting again > does not call the instantiation callback again', () => {
          globalInstantiationCallbackSpy.mockClear();
          di.inject(someInjectable);
          expect(globalInstantiationCallbackSpy).not.toHaveBeenCalled();
        });
      })
    })

    describe('given some injectable1 has been registered in some namespace', () => {
      let someInjectable;
      beforeEach(() => {
        someInjectable = getInjectable({
          id: "some-id",
          instantiate: () => 10,
        });

        const someNamespaceInjectable = getInjectable2({
          id: "some-namespace",
          instantiate: (di) => () => di.register(someInjectable),
        });
        di.register(someNamespaceInjectable);
        di.inject(someNamespaceInjectable);
        globalInstantiationCallbackSpy.mockClear();
      });

      describe('when injecting that injectable', () => {
        let value;

        beforeEach(() => {
          value = di.inject(someInjectable);
        });

        it('calls the global instantiation callback with the expected arguments (namespaced id)', () => {
          expect(globalInstantiationCallbackSpy).toHaveBeenCalledWith(expect.objectContaining({ inject: expect.any(Function) }), "some-namespace:some-id", expect.any(Function), [])
        });

        it('returns the actual value from the instantiate', () => {
          expect(value).toBe(10);
        });

        it('when injecting again > does not call the instantiation callback again', () => {
          globalInstantiationCallbackSpy.mockClear();
          di.inject(someInjectable);
          expect(globalInstantiationCallbackSpy).not.toHaveBeenCalled();
        });
      })
    })

    describe('given some injectable2 has been registered in some namespace', () => {
      let someInjectable;
      beforeEach(() => {
        someInjectable = getInjectable2({
          id: "some-id",
          instantiate: () => () => 10,
        });

        const someNamespaceInjectable = getInjectable2({
          id: "some-namespace",
          instantiate: (di) => () => di.register(someInjectable),
        });
        di.register(someNamespaceInjectable);
        di.inject(someNamespaceInjectable);
        globalInstantiationCallbackSpy.mockClear();
      });

      describe('when injecting that injectable', () => {
        let value;

        beforeEach(() => {
          value = di.inject(someInjectable);
        });

        it('calls the global instantiation callback with the expected arguments (namespaced id)', () => {
          expect(globalInstantiationCallbackSpy).toHaveBeenCalledWith(expect.objectContaining({ inject: expect.any(Function) }), "some-namespace:some-id", expect.any(Function), [])
        });

        it('returns the actual value from the instantiate', () => {
          expect(value).toBe(10);
        });

        it('when injecting again > does not call the instantiation callback again', () => {
          globalInstantiationCallbackSpy.mockClear();
          di.inject(someInjectable);
          expect(globalInstantiationCallbackSpy).not.toHaveBeenCalled();
        });
      })
    })
  });
});
