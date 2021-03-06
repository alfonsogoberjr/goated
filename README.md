# Goated

a currying library for goats 🐐

**g**reatest library **o**f **a**ll **t**ime!

![](https://img.shields.io/npm/v/goated)

---

![Curry Goat, best dish on the planet](http://www.browngirlmagazine.com/wp-content/uploads/2017/07/Angled-Hero-Image.jpg)

This library was inspired by [Ramda](https://ramdajs.com/), with a similar goal in mind - completely point-free, curly-bracket-less Javascript code.

The key differences between Goated and Ramda are thus:

- Types are not mangled. Goated is built by and for Typescript engineers. No more `as unknown as any` and other such nonsense just to pass tslint.
- Methods are stripped down to array/collection basics, plus some extras like `pipe` and `compose`. The fantasy-land spec is nice but kind of a distraction. We just want pure functional code.
- Errors are actually useful and stack traces are accurate when debugging.

## Install

```Bash
npm i goated
```

or

```Bash
yarn add goated
```

Then, import:

```Typescript
import { map, pipe, keys, filter, /* etc */ } from 'goated'
```

## API

### Quick Reference

- [`add`](#add)
- [`all`](#all)
- [`always`](#always)
- [`and`](#and)
- [`any`](#any)
- [`append`](#append)
- [`apply`](#apply)
- [`compose`](#compose)
- [`concat`](#concat)
- [`cond`](#cond)
- [`divide`](#divide)
- [`divideBy`](#divideBy)
- [`empty`](#empty)
- [`equals`](#equals)
- [`F`](#F)
- [`filter`](#filter)
- [`find`](#find)
- [`flip`](#flip)
- [`groupBy`](#groupBy)
- [`head`](#head)
- [`identity`](#identity)
- [`is`](#is)
- [`isNil`](#isNil)
- [`join`](#join)
- [`keys`](#keys)
- [`map`](#map)
- [`multiply`](#multiply)
- [`not`](#not)
- [`omit`](#omit)
- [`or`](#or)
- [`path`](#path)
- [`pathEq`](#pathEq)
- [`pathOr`](#pathOr)
- [`pick`](#pick)
- [`pipe`](#pipe)
- [`prop`](#prop)
- [`propEq`](#propEq)
- [`propOr`](#propOr)
- [`reduce`](#reduce)
- [`reject`](#reject)
- [`reverse`](#reverse)
- [`split`](#split)
- [`subtract`](#subtract)
- [`T`](#T)
- [`tail`](#tail)
- [`take`](#take)
- [`toAsync`](#toAsync)
- [`useWith`](#useWith)
- [`values`](#values)
- [`when`](#when)

### add

Adds two values.

See also [`subtract`](#subtract).

```Typescript
add(2, 3); //  5
add(7)(10); // 17
```

### all

Returns true if all elements of the list match the predicate, false if there are any that don't.

If the list contains Promises, dispatches to `Bluebird.all()`

See also [`any`](#any).

```Typescript
const equals3 = equals(3);
all(equals3)([3, 3, 3, 3]); // true
all(equals3)([3, 3, 1, 3]); // false

all([
  Promise.resolve({}),
  Promise.resolve(3),
  Promise.resolve(true),
]).then((res) => console.log(res)) // [{}, 3, true]
```

### always

Returns a function that always returns the given value. Note that for non-primitives the value returned is a reference to the original value.

```Typescript
const foo = always('foo')
foo() // 'foo'
```

### and

Returns true if both arguments are true; false otherwise.

See also [`or`](#or).

```Typescript
and(true, true); // true
and(true, false); // false
and(false, true); // false
and(false, false); // false

```

### any

Returns true if at least one of the elements of the list match the predicate, false otherwise.

```Typescript
any([0, false, true]) // true
any([NaN, 0, false]) // false
```

### append

Returns a new list containing the contents of the given list, followed by the given element.

```Typescript
append('tests', ['write', 'more']) // ['write', 'more', 'tests']
```

### apply

Applies function fn to the argument list args. This is useful for creating a fixed-arity function from a variadic function. fn should be a bound function if context is significant.

```Typescript
const nums = [1, 2, 3, -99, 42, 6, 7];
apply(Math.max, nums); // 42
```

### compose

Performs right-to-left function composition. The last argument may have any arity; the remaining arguments must be unary.

See also [`pipe`](#pipe)

```Typescript
const negate = (num) => -num
const powThenNegate = compose<number, number>(negate, Math.pow) // Works with bound functions and preserves context

powThenNegate(3, 3) // -27
```

Note that the first argument passed to `compose`, if it's a `goated` method where currying is optional (like `map`), its type must be explicitly set using either `as` or `<>`, like so:

```Typescript
import { Curried } from 'goated'

const double = map((num: number) => num * 2)
const add = (a, b) => a + b
const doubleThenAdd = compose<number[], number>(<Curried<number, number>>reduce(add, 0), double)
// Necessary because map() returns either a curried fn or a list.

doubleThenAdd([1, 2, 3]) // 12
```

Also works with `async` / `await`! Returned value must be `awaited` or its `then` handler called. Performs auto-detection of a Promise/Thenable in the arguments, converting all results to a Promise upon detection.

```Typescript
import { Curried } from 'goated'

type Foo = { foo: number }
const double = map((num: number) => num * 2);
const add = (a, b) => a + b;
const fetch = async (num) => ({ foo: num })

const doubleThenAddFetch = compose<number[], Promise<Foo>>(
  fetch,
  reduce(add, 0),
  <Curried<number, number>>double
);

async () => {
  await doubleThenAddFetch([1, 2, 3]) // { foo: 12 }
}

// or

doubleThenAddFetch([1, 2, 3])
  .then((obj: Foo) => {
    // obj = { foo: 12 }
  })
```

### concat

Returns the result of concatenating the given lists or strings.

Note: `concat` expects both arguments to be of the same type, unlike the native `Array.prototype.concat` method. It will throw an error if you concat an Array with a non-Array value.

```Typescript
concat([1, 2], [3, 4, 5]) // [1, 2, 3, 4, 5]

const concatOneTwo = concat([1, 2])

concatOneTwo([3, 4, 5]) // [1, 2, 3, 4, 5]
```

### cond

Returns a function, `fn`, which encapsulates `if/else, if/else, ...` logic. `cond` takes a list of [predicate, transformer] pairs. All of the arguments to `fn` are applied to each of the predicates in turn until one returns a "truthy" value, at which point `fn` returns the result of applying its arguments to the corresponding transformer. If none of the predicates matches, `fn` returns undefined.

```Typescript
const fn = cond([
  [<Curried<number, boolean>>equals(0), always("water freezes at 0°C")],
  [<Curried<number, boolean>>equals(100), always("water boils at 100°C")],
  [T, (temp) => "nothing special happens at " + temp + "°C"],
])

fn(0) // 'water freezes at 0°C'
fn(50) // 'nothing special happens at 50°C'
fn(100) // 'water boils at 100°C'
```

### divide

Divides two numbers. Equivalent to a / b.

See also [`multiply`](#multiply).

```Typescript
divide(71, 100); // 0.71

const reciprocal = divide(1);
reciprocal(4);   // 0.25
```

### divideBy

Divides the second number by the first. Equivalent to b / a.

See also [`multiply`](#multiply).

```Typescript
divideBy(4, 40) // 10

const half = divideBy(2);
half(42); // 21
```

### equals

Returns true if its arguments are equivalent, false otherwise. Handles cyclical data structures.

Dispatches to `lodash.isEqual`. No need to reinvent the wheel.

Unlike `R.equals`, `equals` can be curried.

```Typescript
equals(1, 1); // true
equals(1, '1'); // false
equals([1, 2, 3], [1, 2, 3]); // true

const a = {}; a.v = a;
const b = {}; b.v = b;
equals(a, b); // true

const equalsA = equals(a)

equalsA(b) // true
```

### F

A function that always returns `false`. Any passed in parameters are ignored.

See also [`T`](#T)

```Typescript
F() // false
```

### filter

Takes a predicate and a Filterable, and returns a new filterable of the same type containing the members of the given filterable which satisfy the given predicate. Filterable objects include plain objects or any object that has a filter method such as Array.

Dispatches to the `filter` method of the second argument, if present.

```Typescript
type Foo = { foo: number; bar: number; baz: number };

const onlyOdd = (item: number) => item % 2 === 1

const array = [1, 2, 3]

filter<number>(onlyOdd, array) // [1, 3]

const obj = { foo: 1, bar: 2, baz: 3 }

filter<number>(onlyOdd, obj) // { foo: 1, baz: 3 }

const filterOnlyOdd = <Curried<Foo, number>>filter<number>(onlyOdd);

filterOnlyOdd(obj) // { foo: 1, baz: 3 }
```

### find

Returns the first element of the list which matches the predicate, or undefined if no element matches.

```Typescript
const xs = [{ a: 1 }, { a: 2 }, { a: 3 }];
find(propEq('a', 2))(xs); // { a: 2 }
find(propEq('a', 4))(xs); // undefined
```

### groupBy

Splits a list into sub-lists stored in an object, based on the result of **either** calling a String-returning function on each element **or** evaluating the selector key of each element, and grouping the results according to values returned.

Dispatches to the `groupBy` method of the second argument, if present.

```Typescript
type ObjType = { a: string }
const groupByFn = groupBy<ObjType>((item: ObjType) => (item.a === 'b') ? 'foo' : 'bar')

groupByFn([{ a: 'b' }, { a: 'd' }]) // { foo: [{ a: 'b' }], bar: [{ a: 'd' }] }

const groupByKey = groupBy<ObjType>('a')

groupByKey([{ a: 'b' }, { a: 'd' }]) // { b: [{ a: 'b' }], d: [{ a: 'd' }] }
```

### head

Returns the first element of the given list or string.

```Typescript
head(['fi', 'fo', 'fum']); // 'fi'
head([]); // undefined

head('abc'); // 'a'
head(''); // ''
```

### identity

A function that does nothing but return the parameter supplied to it. Good as a default or placeholder function.

```Typescript
identity(1) // 1

const obj = {};

identity(obj) === obj // true
```

### is

See if an object (val) is an instance of the supplied constructor. This function will check up the inheritance chain, if any.

```Typescript
is(Object, {}); // true
is(Number, 1); // true
is(Object, 1); // false
is(String, 's'); // true
is(String, new String('')); // true
is(Object, new String('')); // true
is(Object, 's'); // false
is(Number, {}); // false
```

### isNil

Checks if the input value is `null` or `undefined`.

```Typescript
isNil(null); // true
isNil(undefined); // true
isNil(0); // false
isNil([]); // false
```

### join

Returns a string made by inserting the separator between each element and concatenating all the elements into a single string.

See also [`split`](#split)

```Typescript
const spacer = join(' ');
spacer(['a', 2, 3.4]);   // 'a 2 3.4'
join('|', [1, 2, 3]);    // '1|2|3'
```

### keys

Returns a list containing the names of all the enumerable own properties of the supplied object. Note that the order of the output array is not guaranteed to be consistent across different JS platforms.

```Typescript
type Foo = { a: number; b: number; c: number; }
const obj: Foo = { a: 1, b: 2, c: 3 }

keys<Foo>({ a: 1, b: 2, c: 3 }); // ['a', 'b', 'c']
```

### map

Takes a function and a functor, applies the function to each of the functor's values, and returns a functor of the same shape.

Goated provides suitable map implementations for Array and Object, so this function may be applied to [1, 2, 3] or {x: 1, y: 2, z: 3}.

Dispatches to the `map` method of the second argument, if present.

Note that unlike `R.map()`, indexes are included by default.

```Typescript
const array = [1, 2, 3]
const obj = { 'foo': 1, 'bar': 2, 'baz': 3 }

const double = (item: number) => item * 2

map<number, number>(double, array) // [2, 4, 6]
map<number, number>(double, obj) // { 'foo': 2, 'bar': 4, 'baz': 6 }
```

### multiply

Multiplies two numbers. Equivalent to `a * b` but curried.

See also [`divide`](#divide).

```Typescript
import { multiply } from 'goated'

const double = multiply(2);
const triple = multiply(3);
double(3);       //  6
triple(4);       // 12
multiply(2, 5);  // 10
```

### not

A function that returns the `!` of its argument. It will return true when passed a falsy value, and false when passed a truthy one.

```Typescript
not(true); // false
not(false); // true
not(0); // true
not(1); // false
```

### omit

Returns a partial copy of an object omitting the keys specified.

```Typescript
omit(['a', 'd'], { a: 1, b: 2, c: 3, d: 4 }); // { b: 2, c: 3 }

const omitAD = omit(['a', 'd'])

omitAD({ a: 1, b: 2, c: 3, d: 4 }) // { b: 2, c: 3 }
```

### or

Returns `true` if one or both of its arguments are true. Returns `false` if both arguments are false.

See also [`and`](#and).

```Typescript
or(true, true); // true
or(true, false); // true
or(false, true); // true
or(false, false); // false
```

### path

Retrieve the value at a given path.

```Typescript
type Foo = { foo?: { bar?: number; baz: number } };

const obj: Foo = { foo: { bar: 2, baz: 3 } };

path<Foo>(["foo", "bar"], obj) // 2

const getFooBar = path<Foo>(["foo", "bar"])

getFooBar(obj) // 2
```

### pathEq

Determines whether a nested path on an object has a specific value, in `equals` terms. Most likely used to filter a list.

```Typescript
import { Curried } from "goated"

type Foo = { foo?: { bar?: number; baz: number } };

const obj: Foo = { foo: { bar: 2, baz: 3 } };

pathEq<Foo>(["foo", "bar"], 2, obj) // true

const obj1: Foo = { foo: { baz: 3 } };

const isFooBaz3 = <Curried<Foo, boolean>>pathEq<Foo>(["foo", "baz"], 4)

isFooBaz3(obj1) // false
```

### pathOr

If the given, non-null object has a value at the given path, returns the value at that path. Otherwise returns the provided default value.

```Typescript
type Foo = { foo?: { bar?: number; baz: number } };

const obj: Foo = { foo: { bar: 2, baz: 3 } };

pathOr<Foo>(4, ["foo", "bar"], obj) // 2

const missingBar: Foo = { foo: { baz: 3 } };

pathOr<Foo>(4, ["foo", "bar"], missingBar) // 4
```

### pick

Returns a partial copy of an object containing only the keys specified. If the key does not exist, the property is ignored.

```Typescript
pick(['a', 'd'], { a: 1, b: 2, c: 3, d: 4 }); // { a: 1, d: 4 }
pick(['a', 'e', 'f'])({ a: 1, b: 2, c: 3, d: 4 }); // { a: 1 }
```

### pipe

Performs left-to-right function composition. The first argument may have any arity; the remaining arguments must be unary.

See also [`compose`](#compose)

```Typescript
const negate = (num) => -num
const powThenNegate = pipe<number, number>(Math.pow, negate) // Works with bound functions and preserves context

powThenNegate(3, 3) // -27
```

Note that the first argument passed to `pipe`, if it's a `goated` method where currying is optional (like `map`), its type must be explicitly set using either `as` or `<>`, like so:

```Typescript
import { Curried } from 'goated'

const double = map((num: number) => num * 2)
const add = (a, b) => a + b
const doubleThenAdd = pipe<number[], number>(<Curried<number, number>>double, reduce(add, 0))
// Necessary because map() returns either a curried fn or a list.

doubleThenAdd([1, 2, 3]) // 12
```

Also works with `async` / `await`! Returned value must be `awaited` or its `then` handler called. Performs auto-detection of a Promise/Thenable in the arguments, converting all results to a Promise upon detection.

```Typescript
import { Curried } from 'goated'

type Foo = { foo: number }
const double = map((num: number) => num * 2);
const add = (a, b) => a + b;
const fetch = async (num) => ({ foo: num })

const doubleThenAddFetch = pipe<number[], Promise<Foo>>(
  <Curried<number, number>>double,
  reduce(add, 0),
  fetch
);

async () => {
  await doubleThenAddFetch([1, 2, 3]) // { foo: 12 }
}
```

### prop

Returns a function that when supplied an object returns the indicated property of that object, if it exists.

```Typescript
prop('x', { x: 100 }); // 100
prop('x', {}); // undefined
prop(0, [100]); // 100
```

### propEq

Returns `true` if the specified object property is equal, in `equals` terms, to the given value; `false` otherwise.

```Typescript
import { filter, propEq } from 'goated'

type Kid = { name: string; age: number; hair: string; }

const abby = {name: 'Abby', age: 7, hair: 'blond'};
const fred = {name: 'Fred', age: 12, hair: 'brown'};
const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
const alois = {name: 'Alois', age: 15, disposition: 'surly'};
const kids = [abby, fred, rusty, alois];
const hasBrownHair = propEq('hair', 'brown');

filter(<Curried<Kid, boolean>>hasBrownHair, kids); // [fred, rusty]
```

### propOr

If the given, non-null object has an own property with the specified name, returns the value of that property. Otherwise returns the provided default value.

```Typescript
const alice = {
  name: 'ALICE',
  age: 101
};
const favorite = prop('favoriteLibrary');
const favoriteWithDefault = propOr('Goated', 'favoriteLibrary');

favorite(alice);  //=> undefined
favoriteWithDefault(alice);  // 'Goated'
```

### reduce

Returns a single item by iterating through the list, successively calling the iterator function and passing it an accumulator value and the current value from the array, and then passing the result to the next call.

The iterator function receives two values: (acc, value).

```Typescript
const array = [1, 2, 3]
const add = (a, b) => a + b

reduce<number, number>(add, 0, array) // 6
```

### reject

The complement of [`filter`](#filter).

```Typescript
const rejectOdd = (item: number) => item % 2 === 1

const array = [1, 2, 3]

reject<number>(rejectOdd, array) // [2]

const obj = { foo: 1, bar: 2, baz: 3 }

reject<number>(rejectOdd, obj) // { bar: 2 }
```

### reverse

Returns a new list or string with the elements or characters in reverse order.

```Typescript
reverse([1, 2, 3]);  // [3, 2, 1]
```

### subtract

Subtracts its second argument from its first argument.

See also [`add`](#add).

```Typescript
subtract(10, 8) // 2
```

### split

Splits a string into an array of strings based on the given separator.

See also [`join`](#join).

```Typescript
const pathComponents = split('/');
tail(pathComponents('/usr/local/bin/node')); // ['usr', 'local', 'bin', 'node']

split('.', 'a.b.c.xyz.d'); // ['a', 'b', 'c', 'xyz', 'd']
```

### T

A function that always returns `true`. Any passed in parameters are ignored.

See also [`F`](#F)

```Typescript
T() // true
```

### tail

Returns all but the first element of the given list or string (or object with a tail method).

See also [`head`](#head).

```Typescript
tail([1, 2, 3])  // [2, 3]
```

### take

Returns the first `n` elements of the given list or string (or object with a take method).

```Typescript
take<string>(2, ['foo', 'bar', 'baz']) // ['foo', 'bar']
```

### toAsync

Returns the function provided wrapped in an `async` function. Note that this is the same as wrapping it in a Promise.

```Typescript
const array = [1, 2, 3];
const double = (item: number) => item * 2;
const doubleAsync = toAsync(double); // Returns async () => double

// works with goated.map()
async () => {
  await all(<Promise<number>[]>map(doubleAsync, array)) // [2, 4, 6]
}
```

### useWith

Accepts a function `fn` and a list of transformer functions and returns a new curried function. When the new function is invoked, it calls the function fn with parameters consisting of the result of calling each supplied handler on successive arguments to the new function.

If more arguments are passed to the returned function than transformer functions, those arguments are passed directly to fn as additional parameters. If you expect additional arguments that don't need to be transformed, although you can ignore them, it's best to pass an identity function so that the new function reports the correct arity.

```Typescript
const fn = useWith<number, number>(Math.pow, [identity, identity]);

fn(3, 4) // 81
```

```Typescript
import { Curried } from 'goated'

const fn = useWith<number, Curried<number, number>>(Math.pow, [identity, identity]);

const fn3 = fn(3)

fn3(4) // 81
```

```Typescript
import { Curried } from 'goated'

const fn = useWith<number, Curried<number, number>>(Math.pow, [identity, identity]);

const fn3 = fn(3)

fn3(4, 5) // calls Math.pow(3, 4, 5). Output is still 81
```

### values

Returns a list of all the enumerable own properties of the supplied object. Note that the order of the output array is not guaranteed across different JS platforms.

```Typescript
values({ a: 1, b: 2, c: 3 }); // [1, 2, 3]
```

### when

Tests the final argument by passing it to the given predicate function. If the predicate is satisfied, the function will return the result of calling the whenTrueFn function with the same argument. If the predicate is not satisfied, the argument is returned as is.

```Typescript
const isFoo = (input) => input === 'foo'
const doBar = (input) => 'bar'

const barWhenFoo = when(isFoo, doBar)

barWhenFoo('foo') // 'bar'
```
