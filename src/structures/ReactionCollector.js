const EventEmitter = require('eventemitter3');

/**
 * A class that collects reactions from a message
 */
class ReactionCollector extends EventEmitter {
  constructor(messageAwaiter, timeout) {
    super();
    this.messageAwaiter = messageAwaiter;
    this.timeout = timeout;
    this.interval = null;
    this.ended = false;
    this._endBind = this._end.bind(this);
    this._start();
  }

  /**
   * Restarts the timeout.
   * @param {number} [timeout] The new timeout to halt by
   */
  restart(timeout) {
    if (this.ended) return;
    clearTimeout(this.interval);
    this.interval = setTimeout(this._endBind, timeout || this.timeout);
  }

  /**
   * Ends the collection.
   */
  end() {
    if (this.ended) return;
    clearTimeout(this.interval);
    this._end();
  }

  /**
   * @private
   */
  _onReaction(emoji, userID) {
    this.emit('reaction', emoji, userID);
    this.restart();
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

module.exports = ReactionCollector;