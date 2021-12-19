const EventEmitter = require('eventemitter3');

/**
 * A class that collects component interactions from a message
 */
class ComponentCollector extends EventEmitter {
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
  _onInteract(interaction) {
    this.emit('interaction', interaction);
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

module.exports = ComponentCollector;