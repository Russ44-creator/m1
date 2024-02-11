const util = require('../distribution').util;

test('(2 pts) serializeNumber', () => {
  const number = 42;
  const serialized = util.serialize(number);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(number);
});

test('(2 pts) serializeString', () => {
  const string = 'Hello, World!';
  const serialized = util.serialize(string);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(string);
});

test('(4 pts) serializeSimpleObject', () => {
  const object = {a: 1, b: 2, c: 3};
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(object);
});

test('(6 pts) serializeNestedObject', () => {
  const object = {a: 1, b: 2, c: 3, d: {e: 4, f: 5, g: 6}};
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(object);
});

test('(4 pts) serializeArray', () => {
  const array = [1, 2, 3, 4, 5];
  const serialized = util.serialize(array);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(array);
});

test('(5 pts) serializeNestedArray', () => {
  const array = [1, 2, 3, 4, 5, [6, 7, 8, 9, 10]];
  const serialized = util.serialize(array);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(array);
});

test('(6 pts) serializeNestedArrayAndObject', () => {
  const array = [1, 2, 3, 4, 5, [6, 7, 8, 9, 10], {a: 1, b: 2, c: 3}];
  const serialized = util.serialize(array);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(array);
});

test('(4 pts) serializeError', () => {
  const error = new Error('Hello, World!');
  const serialized = util.serialize(error);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(error);
});

test('(4 pts) serializeDate', () => {
  const date = new Date();
  const serialized = util.serialize(date);
  const deserialized = util.deserialize(serialized);
  expect(deserialized.getTime()).toBe(date.getTime());
});

test('(2 pts) serializeUndefined', () => {
  const serialized = util.serialize(undefined);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBeUndefined();
});

test('(2 pts) serializeNull', () => {
  const serialized = util.serialize(null);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBeNull();
});

test('(7 pts) serializeCircularObject', () => {
  const object = {a: 1, b: 2, c: 3};
  object.self = object;
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(object);
});

test('(7 pts) serializeKindaCircularObject', () => {
  const x = {a: 1, b: 2, c: 3};
  const object = {a: x, b: x, c: 1};
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test('(4 pts) serializeFunction', () => {
  const fn = (a, b) => a + b;
  const serialized = util.serialize(fn);
  const deserialized = util.deserialize(serialized);

  expect(typeof deserialized).toBe('function');
  expect(deserialized(42, 1)).toBe(43);
});

test('(6 pts) serializeObjectWithFunctions', () => {
  const fn = (a, b) => a + b;
  const object = {func: fn};
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  expect(typeof deserialized.func).toBe('function');
  expect(deserialized.func(42, 1)).toBe(43);
});

test('(7 pts) serializeNativeFunction', () => {
  const fn = console.log;
  const serialized = util.serialize(fn);
  const deserialized = util.deserialize(serialized);
  // Native function serialization might not work as expected
  expect(typeof deserialized).toBe('function');
});

test('(5 pts) serializeObjectWithNativeFunctions', () => {
  const object = {a: console.log};
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  // Native function serialization might not work as expected
  expect(deserialized.a).toBe(console.log);
});

test('(6 pts) serializeObjectWithNameClashFunctions', () => {
  const object = {log: () => 42};
  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  expect(typeof deserialized.log).toBe('function');
  expect(deserialized.log()).toBe(42);
});

test('(7 pts) serializeRainbowObject', () => {
  const object = {
    n: 1,
    s: 'Hello, World!',
    a: [1, 2, 3, 4, 5],
    e: new Error('Hello, World!'),
    d: new Date(),
    o: {x: 1, y: 2, z: 3},
    n: null,
    u: undefined,
  };

  object.self = object;

  const serialized = util.serialize(object);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(object);
});