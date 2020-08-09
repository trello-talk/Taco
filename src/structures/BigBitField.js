/**
 * Data structure that makes it easy to interact with a bitfield.
 * Uses BigInt instead of regular numbers.
 * @see https://github.com/discordjs/discord.js/blob/master/src/util/BitField.js
 */
class BigBitField {
  /**
   * @param {BigBitFieldResolvable} [bits=0n] Bit(s) to read from
   */
  constructor(bits) {
    /**
     * Bitfield of the packed bits
     * @type {number}
     */
    this.bitfield = this.constructor.resolve(bits);
  }

  /**
   * Checks whether the bitfield has a bit, or any of multiple bits.
   * @param {BigBitFieldResolvable} bit Bit(s) to check for
   * @returns {boolean}
   */
  any(bit) {
    return (this.bitfield & this.constructor.resolve(bit)) !== 0n;
  }

  /**
   * Checks if this bitfield equals another
   * @param {BigBitFieldResolvable} bit Bit(s) to check for
   * @returns {boolean}
   */
  equals(bit) {
    return this.bitfield === this.constructor.resolve(bit);
  }

  /**
   * Checks whether the bitfield has a bit, or multiple bits.
   * @param {BigBitFieldResolvable} bit Bit(s) to check for
   * @returns {boolean}
   */
  has(bit) {
    if (Array.isArray(bit)) return bit.every(p => this.has(p));
    bit = this.constructor.resolve(bit);
    return (this.bitfield & bit) === bit;
  }

  /**
   * Gets all given bits that are missing from the bitfield.
   * @param {BigBitFieldResolvable} bits Bit(s) to check for
   * @param {...*} hasParams Additional parameters for the has method, if any
   * @returns {string[]}
   */
  missing(bits, ...hasParams) {
    if (!Array.isArray(bits)) bits = new this.constructor(bits).toArray(false);
    return bits.filter(p => !this.has(p, ...hasParams));
  }

  /**
   * Freezes these bits, making them immutable.
   * @returns {Readonly<BigBitField>} These bits
   */
  freeze() {
    return Object.freeze(this);
  }

  /**
   * Adds bits to these ones.
   * @param {...BigBitFieldResolvable} [bits] Bits to add
   * @returns {BigBitField} These bits or new BigBitField if the instance is frozen.
   */
  add(...bits) {
    let total = 0n;
    for (const bit of bits) {
      total |= this.constructor.resolve(bit);
    }
    if (Object.isFrozen(this)) return new this.constructor(this.bitfield | total);
    this.bitfield |= total;
    return this;
  }

  /**
   * Removes bits from these.
   * @param {...BigBitFieldResolvable} [bits] Bits to remove
   * @returns {BigBitField} These bits or new BigBitField if the instance is frozen.
   */
  remove(...bits) {
    let total = 0n;
    for (const bit of bits) {
      total |= this.constructor.resolve(bit);
    }
    if (Object.isFrozen(this)) return new this.constructor(this.bitfield & ~total);
    this.bitfield &= ~total;
    return this;
  }

  /**
   * Gets an object mapping field names to a {@link boolean} indicating whether the
   * bit is available.
   * @param {...*} hasParams Additional parameters for the has method, if any
   * @returns {Object}
   */
  serialize(...hasParams) {
    const serialized = {};
    for (const [flag, bit] of Object.entries(this.constructor.FLAGS))
      serialized[flag] = this.has(bit, ...hasParams);
    return serialized;
  }

  /**
   * Gets an {@link Array} of bitfield names based on the bits available.
   * @param {...*} hasParams Additional parameters for the has method, if any
   * @returns {string[]}
   */
  toArray(...hasParams) {
    return Object.keys(this.constructor.FLAGS).filter(bit => this.has(bit, ...hasParams));
  }

  toJSON() {
    return this.bitfield;
  }

  valueOf() {
    return this.bitfield;
  }

  *[Symbol.iterator]() {
    yield* this.toArray();
  }

  /**
   * Data that can be resolved to give a bitfield. This can be:
   * * A string (see {@link BigBitField.FLAGS})
   * * A bit number
   * * An instance of BigBitField
   * * An Array of BigBitFieldResolvable
   * @typedef {string|BigInt|BigBitField|BigBitFieldResolvable[]} BigBitFieldResolvable
   */

  /**
   * Resolves bitfields to their numeric form.
   * @param {BigBitFieldResolvable} [bit=0n] - bit(s) to resolve
   * @returns {number}
   */
  static resolve(bit = 0n) {
    if (typeof bit === 'bigint' && bit >= 0n) return bit;
    if (bit instanceof BigBitField) return bit.bitfield;
    if (Array.isArray(bit)) return bit.map(p => this.resolve(p)).reduce((prev, p) => prev | p, 0n);
    if (typeof bit === 'string' && typeof this.FLAGS[bit] !== 'undefined') return this.FLAGS[bit];
    throw new RangeError('BITFIELD_INVALID');
  }
}

/**
 * Numeric bitfield flags.
 * <info>Defined in extension classes</info>
 * @type {Object}
 * @abstract
 */
BigBitField.FLAGS = {};

module.exports = BigBitField;