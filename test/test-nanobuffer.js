import chai from 'chai';
import NanoBuffer from '../src/index.js';

const { expect } = chai;

describe('NanoBuffer', () => {
	it('should throw error if invalid max size', () => {
		expect(() => {
			new NanoBuffer('hi');
		}).to.throw(TypeError, 'Expected maxSize to be a number');
	});

	it('should throw error if max size is not a number', () => {
		expect(() => {
			new NanoBuffer(NaN);
		}).to.throw(RangeError, 'Expected maxSize to be zero or greater');
	});

	it('should throw error if max size is negative', () => {
		expect(() => {
			new NanoBuffer(-123);
		}).to.throw(RangeError, 'Expected maxSize to be zero or greater');
	});

	it('should throw error if given two wrong arguments', () => {
		expect(() => {
			new NanoBuffer(20, 10);
		}).to.throw(TypeError, 'Second argument should not be given, if the first argument is a number');
	});

	it('should be default initialized', () => {
		const b = new NanoBuffer();
		expect(b.maxSize).to.equal(10);
		expect(b.size).to.equal(0);
		expect(b.head).to.equal(0);
	});

	it('should be initialized as an empty array with a predefined max size', () => {
		const b = new NanoBuffer(20);
		expect(b.maxSize).to.equal(20);
		expect(b.size).to.equal(0);
		expect(b.head).to.equal(0);
	});

	it('should be initialized with a predefined array', () => {
		const p = [ 'foo0', 'foo1', 'foo2', 'foo3', 'foo4', 'foo5' ];
		const b = new NanoBuffer(p);
		expect(b.maxSize).to.equal(6);
		expect(b.size).to.equal(6);
		expect(b.head).to.equal(5);
	});

	it('should be initialized without predefined array but with given size', () => {
		const b = new NanoBuffer(undefined, 20);
		expect(b.maxSize).to.equal(20);
		expect(b.size).to.equal(0);
		expect(b.head).to.equal(0);
	});

	it('should be initialized with a predefined array and a max size', () => {
		const p = [ 'foo0', 'foo1', 'foo2', 'foo3', 'foo4', 'foo5' ];
		const b = new NanoBuffer(p, 4);
		expect(b.maxSize).to.equal(4);
		expect(b.size).to.equal(4);
		expect(b.head).to.equal(3);
	});

	it('should get the default max size', () => {
		expect(new NanoBuffer().defaultMaxSize).to.equal(10);
	});

	it('should the default max size not changed on explicit max size', () => {
		expect(new NanoBuffer(20).defaultMaxSize).to.equal(10);
	});

	it('should add an object', () => {
		const b = new NanoBuffer;
		expect(b.size).to.equal(0);
		b.push('foo');
		expect(b.size).to.equal(1);
		expect(b.head).to.equal(0);
	});

	it('should fill the buffer and wrap', () => {
		const b = new NanoBuffer(10);

		expect(b.size).to.equal(0);

		for (let i = 0; i < 13; i++) {
			b.push(`foo${i}`);
		}

		expect(b.size).to.equal(10);
		expect(b.head).to.equal(2);

		for (let i = 0; i < 7; i++) {
			b.push(`bar${i}`);
		}

		expect(b.size).to.equal(10);
		expect(b.head).to.equal(9);
	});

	it('should not buffer anything if max size is zero', () => {
		const b = new NanoBuffer(0);
		for (let i = 0; i < 5; i++) {
			b.push(`foo${i}`);
		}
		expect(b.maxSize).to.equal(0);
		expect(b.size).to.equal(0);
		expect(b.head).to.equal(0);
	});

	it('should clear the buffer', () => {
		const b = new NanoBuffer(10);

		for (let i = 0; i < 5; i++) {
			b.push(`foo${i}`);
		}

		expect(b.size).to.equal(5);
		expect(b.head).to.equal(4);

		b.clear();

		expect(b.size).to.equal(0);
		expect(b.head).to.equal(0);

		for (let i = 0; i < 13; i++) {
			b.push(`bar${i}`);
		}

		expect(b.size).to.equal(10);
		expect(b.head).to.equal(2);

		b.clear();

		expect(b.size).to.equal(0);
		expect(b.head).to.equal(0);
	});

	it('should throw error if invalid new max size', () => {
		expect(() => {
			new NanoBuffer().maxSize = 'hi';
		}).to.throw(TypeError, 'Expected new max size to be a number');
	});

	it('should throw error if new max size is not a number', () => {
		expect(() => {
			new NanoBuffer().maxSize = NaN;
		}).to.throw(RangeError, 'Expected new max size to be zero or greater');
	});

	it('should throw error if new max size is negative', () => {
		expect(() => {
			new NanoBuffer().maxSize = -123;
		}).to.throw(RangeError, 'Expected new max size to be zero or greater');
	});

	it('should do nothing if max size is not changed', () => {
		const b = new NanoBuffer(10);
		for (let i = 0; i < 10; i++) {
			b.push(`foo${i}`);
		}

		expect(b.maxSize).to.equal(10);
		expect(b.size).to.equal(10);

		b.maxSize = 10;

		expect(b.maxSize).to.equal(10);
		expect(b.size).to.equal(10);
	});

	it('should increase the buffer max size', () => {
		const b = new NanoBuffer(10);

		for (let i = 0; i < 15; i++) {
			b.push(`foo${i}`);
		}
		expect(b.maxSize).to.equal(10);
		expect(b.size).to.equal(10);

		b.maxSize = 20;
		expect(b.maxSize).to.equal(20);
		expect(b.size).to.equal(10);

		for (let i = 15; i < 30; i++) {
			b.push(`foo${i}`);
		}

		expect(b.maxSize).to.equal(20);
		expect(b.size).to.equal(20);
	});

	it('should shrink the buffer max size', () => {
		const b = new NanoBuffer(18);

		for (let i = 0; i < 25; i++) {
			b.push(`foo${i}`);
		}

		expect(b.maxSize).to.equal(18);
		expect(b.size).to.equal(18);

		b.maxSize = 6;

		expect(b.maxSize).to.equal(6);
		expect(b.size).to.equal(6);

		let i = 25 - 6;
		for (const it of b) {
			expect(it).to.equal(`foo${i++}`);
		}
	});

	it('should iterate over buffer few objects', () => {
		const b = new NanoBuffer(10);

		for (let i = 0; i < 5; i++) {
			b.push(`foo${i}`);
		}

		let i = 0;
		for (const it of b) {
			expect(it).to.equal(`foo${i++}`);
		}
	});

	it('should initialize the predefined buffer, which is smaller than max size', () => {}, () => {
		const p = [ 'foo0', 'foo1', 'foo2', 'foo3', 'foo4' ];

		const b = new NanoBuffer(10, p);

		let i = 0;
		for (const it of b) {
			expect(it).to.equal(`foo${i++}`);
		}
	});

	it('should initialize the predefined buffer, which length equals to max size', () => {
		const p = [ 'foo0', 'foo1', 'foo2', 'foo3', 'foo4', 'foo5', 'foo6', 'foo7', 'foo8', 'foo9' ];
		const b = new NanoBuffer(p, 10);

		let i = 0;
		for (const it of b) {
			expect(it).to.equal(`foo${i++}`);
		}
	});

	it('should initialize the predefined buffer, which is larger than max size', () => {
		const p = [ 'foo0', 'foo1', 'foo2', 'foo3', 'foo4', 'foo5', 'foo6', 'foo7', 'foo8', 'foo9', 'foo10', 'foo11', 'foo12' ];

		const b = new NanoBuffer(p, 10);

		let i = 3;
		for (const it of b) {
			expect(it).to.equal(`foo${i++}`);
		}
	});

	it('should iterate over buffer many objects', () => {
		const b = new NanoBuffer(10);

		for (let i = 0; i <= 17; i++) {
			b.push(`foo${i}`);
		}

		let i = 8;
		for (const it of b) {
			expect(it).to.equal(`foo${i++}`);
		}
	});

	it('should be manually iterable', () => {
		const b = new NanoBuffer(10);

		for (let i = 0; i <= 17; i++) {
			b.push(`foo${i}`);
		}

		const it = b[Symbol.iterator]();
		let i = 8;
		let r = it.next();

		while (!r.done) {
			expect(r.value).to.equal(`foo${i++}`);
			r = it.next();
		}

		expect(r.value).to.be.undefined;
	});
});
