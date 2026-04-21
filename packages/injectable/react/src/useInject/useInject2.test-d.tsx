import { expectError, expectType } from 'tsd';
import {
  getAbstractInjectionToken2,
  getInjectable,
  getInjectable2,
  getInjectionToken,
  getInjectionToken2,
  lifecycleEnum,
} from '@lensapp/injectable';
import { useInject2 } from '../../index';

const noParamsInjectable2 = getInjectable2({
  id: 'no-params',
  instantiate: () => () => 42,
});

expectType<() => number>(useInject2(noParamsInjectable2));
expectType<number>(useInject2(noParamsInjectable2)());

const withParamsInjectable2 = getInjectable2({
  id: 'with-params',
  instantiate: () => (name: string, count: number) => `${name}:${count}`,
});

expectType<(name: string, count: number) => string>(
  useInject2(withParamsInjectable2),
);
expectType<string>(useInject2(withParamsInjectable2)('x', 1));

expectError(useInject2(withParamsInjectable2)());
expectError(useInject2(withParamsInjectable2)(1, 'x'));

const someInjectionToken2 = getInjectionToken2<(name: string) => number>({
  id: 'some-token-2',
});

expectType<(name: string) => number>(useInject2(someInjectionToken2));
expectType<number>(useInject2(someInjectionToken2)('x'));

const someAbstractInjectionToken2 = getAbstractInjectionToken2<() => string>({
  id: 'some-abstract-token-2',
});

expectError(useInject2(someAbstractInjectionToken2));

// Generic factory: proves T flows at invocation time
const genericInjectionToken2 = getInjectionToken2<<T>(value: T) => T>({
  id: 'generic-identity',
});

const genericFactory = useInject2(genericInjectionToken2);

const someString: string = 'hello';
const someNumber: number = 42;
const someObject: { a: number } = { a: 1 };

expectType<string>(genericFactory(someString));
expectType<number>(genericFactory(someNumber));
expectType<{ a: number }>(genericFactory(someObject));

// Literal inference: passing a literal narrows T to the literal type
expectType<'literal-string'>(genericFactory('literal-string'));
expectType<123>(genericFactory(123));

// V1 injectable: useInject2 synthesizes a zero-arg factory
const v1NoParam = getInjectable({
  id: 'v1-no-param',
  instantiate: () => 'v1-instance',
});

expectType<() => string>(useInject2(v1NoParam));
expectType<string>(useInject2(v1NoParam)());

// V1 injectable with one param: useInject2 synthesizes a one-arg factory
const v1WithParam = getInjectable({
  id: 'v1-with-param',
  instantiate: (_di, param: number) => `v1-${param}`,
  lifecycle: lifecycleEnum.transient,
});

expectType<(param: number) => string>(useInject2(v1WithParam));
expectType<string>(useInject2(v1WithParam)(7));
expectError(useInject2(v1WithParam)());
expectError(useInject2(v1WithParam)('wrong-type'));

// V1 injection token
const v1Token = getInjectionToken<string>({ id: 'v1-token' });
expectType<() => string>(useInject2(v1Token));

const v1TokenWithParam = getInjectionToken<number, string>({
  id: 'v1-token-with-param',
});
expectType<(param: string) => number>(useInject2(v1TokenWithParam));
