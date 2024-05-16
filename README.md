# NanoBuffer

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

A lightweight, fixed-size value buffer.

Essentially it's an array that will only store up to N-number of values. Any additional values added
overwrite the oldest values. You can iterate over the buffer to pull all of the values back out.

## Installation

	npm i nanobuffer --save

## Example

```js
import NanoBuffer from 'nanobuffer';

const buffer = new NanoBuffer(20);

for (let i = 0; i < 5; i++) {
	buffer.push(`Value ${i}`);
}

console.log(buffer.size); // 5

for (let i = 5; i < 100; i++) {
	buffer.push(`Value ${i}`);
}

console.log(buffer.size); // 20

for (const value of buffer) {
	console.log(value); // Value XX
}
```

## API

### Constructor

#### `new NanoBuffer(maxSize=10)`

Creates a new `NanoBuffer` instance with the specified max size. Default max size is `10`.

### Properties

#### `maxSize` Number

Gets or sets a maximum number of values that can be stored in the buffer. If you shrink the size,
only the last N values will be preserved.

The value must be an integer and greater than or equal to zero. A value of zero will not buffer
anything.

```js
const buffer = new NanoBuffer;

console.log(buffer.maxSize); // 10

buffer.maxSize = 20;

console.log(buffer.maxSize); // 20
```

#### `size` Number

Gets the number of values in the buffer. This will never exceed the `maxSize`.

```js
const buffer = new NanoBuffer;

console.log(buffer.size); // 0

buffer.push('hi');
buffer.push('there');

console.log(buffer.size); // 2
```

### Methods

#### `push(value)`

Adds a value to the buffer. If the buffer is full, then the oldest value is overwritten with this
new value.

Values being stored can be any data type.

Returns the `NanoBuffer` instance.

```js
const buffer = new NanoBuffer;
buffer
	.push('hello')
	.push(123)
	.push({ foo: 'bar' });
```

#### `clear()`

Removes all values in the buffer.

Returns the `NanoBuffer` instance.

```js
const buffer = new NanoBuffer;

buffer.push('hi');
console.log(buffer.size); // 1

buffer.clear();
console.log(buffer.size); // 0
```

#### `top(index=0)`

Get array's last element (or stack's top) without need to deal with iterator. If buffer is empty, returns `undefined`. 

```js
const buffer = new NanoBuffer;

buffer.push('hi');
buffer.push('world');
console.log(buffer.top()); // world
```

Optionally argument `index` get element before the array's last (or below the top stack). If `index` greater then buffer max size - returns `undefined`

```js
const buffer = new NanoBuffer;

buffer.push('hi');
buffer.push('world');
console.log(buffer.top(1)); // hi
```

#### `bottom(index=0)`

Get head (or stack's bottom) element from the buffer without need to deal with iterator. If buffer is empty, returns `undefined`. 

```js
const buffer = new NanoBuffer;

buffer.push('hi');
buffer.push('world');
console.log(buffer.bottom()); // hi
```

Optionally argument `index` get element before the array's first possible one after getting the buffer wrapped or not wrapped.

```js
const buffer = new NanoBuffer(5);
const fox = 'The quick brown fox jumps over the lazy dog'
fox.split(' ').forEach((word) => {
	b.push(word)
})
console.log(buffer.bottom()); // fox
console.log(buffer.bottom(1)); // jumps
console.log(buffer.top()); // dog
```

#### `[Symbol.iterator]()`

Returns an iterator that can be used in a for-of loop.

```js
const buffer = new NanoBuffer;

buffer.push('hi');
buffer.push('there');

for (const value of buffer) {
	console.log(value);
}

const it = buffer[Symbol.iterator]();
let r = it.next();
while (!r.done) {
	console.log(r.value);
	r = it.next();
}
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/nanobuffer.svg
[npm-url]: https://npmjs.org/package/nanobuffer
[downloads-image]: https://img.shields.io/npm/dm/nanobuffer.svg
[downloads-url]: https://npmjs.org/package/nanobuffer
