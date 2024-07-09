/**
 * A lightweight, fixed-size value buffer.
 */
const DEFAULT_MAX_SIZE = 10;

export class NanoBuffer {
	/**
	 * Creates a `NanoBuffer` instance.
	 *
	 * @param {Array|Number} [bufferOrMaxSize=undefined] - The initial buffer values.
	 * @param {Number} [maxSize=10] - The initial buffer size.
	 */
	constructor(bufferOrMaxSize = undefined, maxSize) {
		let buffer;
		if (Array.isArray(bufferOrMaxSize)) {
			buffer = bufferOrMaxSize;
			if (maxSize === undefined) {
				maxSize = buffer.length;
			}
		} else if (bufferOrMaxSize !== undefined || maxSize !== undefined) {
			if (typeof bufferOrMaxSize === 'number' && maxSize !== undefined) {
				throw new TypeError('Second argument should not be given, if the first argument is a number');
			}
			maxSize ??= bufferOrMaxSize;
		} else {
			maxSize = DEFAULT_MAX_SIZE;
		}
		if (typeof maxSize !== 'number') {
			throw new TypeError('Expected maxSize to be a number');
		}

		if (isNaN(maxSize) || maxSize < 0) {
			throw new RangeError('Expected maxSize to be zero or greater');
		}

		let isInitBuffer = Array.isArray(buffer);
		let safeBuffer;
		let safeHead = 0;
		let safeSize = 0;
		if (isInitBuffer) {
			const bufferLength = buffer.length;
			if (bufferLength > maxSize) {
				safeSize = maxSize;
				safeHead = maxSize - 1;
				safeBuffer = buffer.slice(-maxSize);
			} else {
				safeBuffer = buffer;
				safeSize = bufferLength;
				safeHead = bufferLength - 1;
			}
		}
		/**
		 * The buffer where the values are stored.
		 * @type {Array}
		 * @access private
		 */
		this._buffer = isInitBuffer ? safeBuffer : Array(maxSize);

		/**
		 * The index of the newest value in the buffer.
		 * @type {Number}
		 * @access private
		 */
		this._head = safeHead;

		/**
		 * The maximum number of values to store in the buffer.
		 * @type {Number}
		 * @access private
		 */
		this._maxSize = maxSize;

		/**
		 * The number of values in the buffer.
		 * @type {Number}
		 * @access private
		 */
		this._size = safeSize;
	}

	/**
	 * Returns the index of the newest value in the buffer.
	 *
	 * @returns {Number}
	 * @access public
	 */
	get head() {
		return this._head;
	}

	/**
	 * Returns the maximum number of values in the buffer.
	 *
	 * @returns {Number}
	 * @access public
	 */
	get maxSize() {
		return this._maxSize;
	}

	/**
	 * Returns current default maximal buffer size. It's possible in the future a configuration option will be added.
	 * @return {number}
	 */
	get defaultMaxSize() {
		return DEFAULT_MAX_SIZE;
	}

	/**
	 * Changes the maximum number of values allowed in the buffer.
	 *
	 * @param {Number} newMaxSize - The new max size of the buffer.
	 * @access public
	 */
	set maxSize(newMaxSize) {
		if (typeof newMaxSize !== 'number') {
			throw new TypeError('Expected new max size to be a number');
		}

		if (isNaN(newMaxSize) || newMaxSize < 0) {
			throw new RangeError('Expected new max size to be zero or greater');
		}

		if (newMaxSize === this._maxSize) {
			// nothing to do
			return;
		}

		// somewhat lazy, but we create a new buffer, then manually copy
		// ourselves into it, then steal back the internal values
		const tmp = new NanoBuffer(newMaxSize);
		for (const value of this) {
			tmp.push(value);
		}

		this._buffer = tmp._buffer;
		this._head = tmp._head;
		this._maxSize = tmp._maxSize;
		this._size = tmp._size;

		tmp._buffer = null;
	}

	/**
	 * Returns the number of values in the buffer.
	 *
	 * @returns {Number}
	 * @access public
	 */
	get size() {
		return this._size;
	}

	/**
	 * Inserts a new value into the buffer.
	 *
	 * @param {*} value - The value to store.
	 * @returns {NanoBuffer}
	 * @access public
	 */
	push(value) {
		if (this._maxSize) {
			if (this._size > 0) {
				this._head++;
			}

			if (this._head >= this._maxSize) {
				// we wrapped
				this._head = 0;
			}

			this._size = Math.min(this._size + 1, this._maxSize);
			this._buffer[this._head] = value;
		}

		return this;
	}

	/**
	 * Removes all values in the buffer.
	 *
	 * @returns {NanoBuffer}
	 * @access public
	 */
	clear() {
		this._buffer = Array(this._maxSize);
		this._head = 0;
		this._size = 0;
		return this;
	}

	/**
	 * Creates an iterator function for this buffer.
	 *
	 * @return {Function}
	 * @access public
	 */
	[Symbol.iterator]() {
		let i = 0;

		return {
			next: () => {
				// just in case the size changed
				i = Math.min(i, this._maxSize);

				// calculate the index
				let j = this._head + i - (this._size - 1);
				if (j < 0) {
					j += this._maxSize;
				}

				// console.log('\ni=' + i + ' head=' + this._head + ' size=' + this._size + ' maxSize=' + this._maxSize + ' j=' + j);

				const done = i++ >= this._size;
				return {
					value: done ? undefined : this._buffer[j],
					done
				};
			}
		};
	}
}

export default NanoBuffer;
