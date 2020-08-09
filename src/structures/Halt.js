const EventEmitter = require('eventemitter3');

/**
 * A class that represents a message halt
 */
class Halt extends EventEmitter {
  constructor(messageAwaiter, timeout) {
    super();
    this.messageAwaiter = messageAwaiter;
    this.timeout = timeout;
    this.interval = null;
    this.ended = false;
    this.messages = new Map();
    this._endBind = this._end.bind(this);
    this._start();
  }

  /**
   * Restarts the halt.
   * @param {number} [timeout] The new timeout to halt by
   */
  restart(timeout) {
    if (this.ended) return;
    clearTimeout(this.interval);
    this.interval = setTimeout(this._endBind, timeout || this.timeout);
  }

  /**
   * Ends the halt.
   */
  end() {
    if (this.ended) return;
    clearTimeout(this.interval);
    this._end();
  }

  /**
   * @private
   */
  _onMessage(message) {
    this.messages.set(message.id, message);
    this.emit('message', message);
  }

  /**
   * @private
   */
  _start() {
    this.interval = setTimeout(this._endBind, this.timeout);
  }

  /**
   * @private
   */
  _end() {
    this.ended = true;
    this.emit('end');
  }
}

module.exports = Halt;