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

		this._buffer  = tmp._buffer;
		this._head    = tmp._head;
		this._maxSize = tmp._maxSize;
		this._size    = tmp._size;

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
	 * @param {boolean} back creates back iterator
	 * @param {Number} startFrom defines iteration start index, rather than 0 (by default)
	 * @return {Function}
	 * @deprecated use {NanoBuffer#iterator} instead
	 * @access private
	 */
	[Symbol.iterator](back = false, startFrom = 0) {
		let i = startFrom;
		if (startFrom < 0) {
			i = this._maxSize + startFrom;
		}

		return {
			next: () => {
				// just in case the size changed
				i = Math.min(i, this._maxSize);

				// calculate the index
				let j = back ? this._head - i : this._head + i - (this._size - 1);
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

	/**
	 * Creates a manual iterator function for this buffer.
	 * Basiclly, this is an alias of {@link NanoBuffer#[Symbol.iterator]} method
	 *
	 * @param {boolean} back creates reverse iterator
	 * @param {Number} startFrom defines iteration start index, rather than 0 (by default). It supports negative argument as well, which means iterate over last `startFrom` values.
	 * @return {Function}
	 * @access public
	 */
	iterator(back = false, startFrom = 0) {
		return this[Symbol.iterator](back, startFrom);
	}
}

export default NanoBuffer;
