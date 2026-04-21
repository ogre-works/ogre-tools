import { expectError, expectType } from 'tsd';
import {
  getAbstractInjectionToken2,
  getInjectable2,
  getInjectionToken2,
  getTypedSpecifier,
  SpecificInjectionToken2,
  TypedSpecifierType,
  TypedSpecifierWithType,
} from '@lensapp/injectable';
import { useInject, useInjectDeferred } from '../../index';

const noParamsInjectable = getInjectable2({
  id: 'no-params',
  instantiate: () => () => 42,
});

expectType<number>(useInject(noParamsInjectable));
expectType<number>(useInjectDeferred(noParamsInjectable));

expectError(useInject(noParamsInjectable, 'some-param'));
expectError(useInjectDeferred(noParamsInjectable, 'some-param'));

const withParamsInjectable = getInjectable2({
  id: 'with-params',
  instantiate: () => (name: string, count: number) => `${name}:${count}`,
});

expectType<string>(useInject(withParamsInjectable, 'x', 1));
expectType<string>(useInjectDeferred(withParamsInjectable, 'x', 1));

expectError(useInject(withParamsInjectable));
expectError(useInject(withParamsInjectable, 'x'));
expectError(useInject(withParamsInjectable, 1, 'x'));
expectError(useInjectDeferred(withParamsInjectable, 'x', 'y'));

const asyncInjectable = getInjectable2({
  id: 'async',
  instantiate: () => async () => 'hello',
});

expectType<string>(useInject(asyncInjectable));
expectType<string>(useInjectDeferred(asyncInjectable));

const someInjectionToken = getInjectionToken2<(name: string) => number>({
  id: 'some-token',
});

expectType<number>(useInject(someInjectionToken, 'x'));
expectType<number>(useInjectDeferred(someInjectionToken, 'x'));

expectError(useInject(someInjectionToken));
expectError(useInject(someInjectionToken, 42));

const someAbstractInjectionToken = getAbstractInjectionToken2<
  () => string
>({ id: 'some-abstract-token' });

expectError(useInject(someAbstractInjectionToken));
expectError(useInjectDeferred(someAbstractInjectionToken));

const someTypedSpecifierInjectionToken = getInjectionToken2<
  () => unknown,
  () => unknown[],
  <T extends TypedSpecifierWithType<'some-specifier'>>(
    specifier: T,
  ) => SpecificInjectionToken2<
    () => TypedSpecifierType<'some-specifier', T>
  >
>({ id: 'some-typed-specifier-token' });

const someTypedSpecifier = getTypedSpecifier<{
  'some-specifier': { someProp: 'some-type' };
}>()('some-specifier-id');

expectType<{ someProp: 'some-type' }>(
  useInject(someTypedSpecifierInjectionToken.for(someTypedSpecifier)),
);

expectType<{ someProp: 'some-type' }>(
  useInjectDeferred(someTypedSpecifierInjectionToken.for(someTypedSpecifier)),
);
