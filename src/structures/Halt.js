/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
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