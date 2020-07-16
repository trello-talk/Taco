/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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