/**
 * A lightweight, fixed-size value buffer.
 */
export class NanoBuffer {
	/**
	 * Creates a `NanoBuffer` instance.
	 *
	 * @param {Number} [maxSize=10] - The initial buffer size.
	 */
	constructor(maxSize = 10) {
		if (typeof maxSize !== 'number') {
			throw new TypeError('Expected maxSize to be a number');
		}

		if (isNaN(maxSize) || maxSize < 0) {
			throw new RangeError('Expected maxSize to be zero or greater');
		}

		/**
		 * The buffer where the values are stored.
		 * @type {Array}
		 * @access private
		 */
		this._buffer = Array(maxSize | 0);

		/**
		 * The index of the newest value in the buffer.
		 * @type {Number}
		 * @access private
		 */
		this._head = 0;

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
		this._size = 0;
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
	 * Get stack top element. Optionally take the elements below the top element.
	 * This is rough analog as if to get element from arroy via array[array.length - 1 - index]
	 * If index > buffer size, it returns undefined
	 *
	 * @param {Number} [index=0] - The index of the element from the top stack.
	 * @return {undefined|*} array element. `undefined` - if the buffer is empty or index greater then buffer size
	 */
	top(index = 0) {
		if (typeof index !== 'number') {
			throw new TypeError('Expected index to be a number');
		}

		if (isNaN(index)) {
			throw new RangeError('Expected index to be zero or greater');
		}

		if ((this._size === 0 && this._head === 0) || index >= this._size) {
			return undefined;
		}

		let _index = this._head;
		if (index > 0) {
			_index -= index;
			if (_index < 0) {
				_index += this._maxSize;
			}
		}
		return this._buffer[_index];
	}

	/**
	 * Get first element of the buffered array (or stack bottom). Optionally take the elements above the bottom element (n-th from the beginning).
	 * This is rough analog as if to get indexed element - array[index]
	 * If index > buffer size, it returns undefined
	 *
	 * @param {Number} [index=0] - The index of the element.
	 * @return {undefined|*} array element. `undefined` - if the buffer is empty or index greater then buffer size
	 */
	bottom(index = 0) {
		// noinspection DuplicatedCode
		if (typeof index !== 'number') {
			throw new TypeError('Expected index to be a number');
		}

		if (isNaN(index)) {
			throw new RangeError('Expected index to be zero or greater');
		}

		if ((this._size === 0 && this._head === 0) || index >= this._size || index < 0) {
			return undefined;
		}

		let _index = this._head - this._size + 1;
		if (index > 0) {
			_index += index;
		}
		if (_index < 0) {
			_index += this._maxSize;
		}
		return this._buffer[_index];
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
