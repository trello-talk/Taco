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
 * A class that creates a paging process for messages
 */
class Paginator extends EventEmitter {
  /**
   * @param {TrelloBot} client The client to use
   * @param {Message} message The user's message to read permissions from
   * @param {Object} options The options for the paginator
   * @param {Array} options.items The items the paginator will display
   * @param {number} [options.itemsPerPage=15] How many items a page will have
   */
  constructor(client, message, { items = [], itemsPerPage = 15 } = {}) {
    super();
    this.messageAwaiter = client.messageAwaiter;
    this.client = client;
    this.collector = null;
    this.items = items;
    this.message = message;
    this.itemsPerPage = itemsPerPage;
    this.pageNumber = 1;
    this.reactionsCleared = false;
    this._reactBind = this._react.bind(this);
  }

  /**
   * All pages in the paginator
   * @type {Array<Array>}
   */
  get pages() {
    const pages = [];
    let i, j, page;
    for (i = 0, j = this.items.length; i < j; i += this.itemsPerPage) {
      page = this.items.slice(i, i + this.itemsPerPage);
      pages.push(page);
    }
    return pages;
  }

  /**
   * The current page
   * @type {Array}
   */
  get page() {
    return this.pages[this.pageNumber - 1];
  }

  /**
   * The current page number
   * @type {number}
   */
  get maxPages() {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  /**
   * Changes the page number
   * @param {number} newPage The page to change to
   */
  toPage(newPage) {
    if (Number(newPage)){
      this.pageNumber = Number(newPage);
      if (this.pageNumber < 1) this.pageNumber = 1;
      if (this.pageNumber > this.maxPages) this.pageNumber = this.maxPages;
    }
    return this;
  }

  /**
   * Moves to the next page
   */
  nextPage() {
    return this.toPage(this.pageNumber + 1);
  }

  /**
   * Moves to the previous page
   */
  previousPage() {
    return this.toPage(this.pageNumber - 1);
  }

  /**
   * Whether or not this instance can paginate
   * @returns {boolean}
   */
  canPaginate() {
    return this.message.channel.type === 1 ||
      this.message.channel.permissionsOf(this.client.user.id).has('addReactions');
  }

  /**
   * Whether or not this instance can manage messages
   * @returns {boolean}
   */
  canManage() {
    return this.message.channel.type !== 1 &&
      this.message.channel.permissionsOf(this.client.user.id).has('manageMessages');
  }

  /**
   * Starts the reaction collector and pagination
   * @param {string} userID The user's ID that started the process
   * @param {number} timeout
   */
  async start(userID, timeout) {
    this.reactionsCleared = false;
    if (this.maxPages > 1 && this.canPaginate()) {
      try {
        await Promise.all([
          this.message.addReaction(Paginator.PREV),
          this.message.addReaction(Paginator.STOP),
          this.message.addReaction(Paginator.NEXT),
        ]);
        this.collector = this.messageAwaiter.createReactionCollector(this.message, userID, timeout);
        this._hookEvents();
      } catch (e) {
        return this.clearReactions();
      }
    }
  }

  /**
   * Clears reaction from the message
   * @return {boolean}
   */
  clearReactions() {
    if (!this.reactionsCleared) {
      this.reactionsCleared = true;
      this.emit('clearReactions');
      if (!this.canManage())
        return Promise.all([
          this.message.removeReaction(Paginator.NEXT).catch(() => {}),
          this.message.removeReaction(Paginator.STOP).catch(() => {}),
          this.message.removeReaction(Paginator.PREV).catch(() => {})
        ]);
      else
        return this.message.removeReactions();
    }
  }

  /**
   * @private
   */
  _hookEvents() {
    this.collector.on('reaction', this._react.bind(this));
    this.collector.once('end', this.clearReactions.bind(this));
  }

  /**
   * @private
   */
  _change() {
    this.emit('change', this.pageNumber);
  }

  /**
   * @private
   */
  _react(emoji, userID) {
    const oldPage = this.pageNumber;
    if (Paginator.PREV == emoji.name)
      this.previousPage();
    else if (Paginator.NEXT == emoji.name)
      this.nextPage();
    else if (Paginator.STOP == emoji.name)
      this.collector.end();
    if (this.pageNumber !== oldPage)
      this._change();
    if ([Paginator.PREV, Paginator.STOP, Paginator.NEXT].includes(emoji.name) && this.canManage())
      this.message.removeReaction(emoji.name, userID);
  }
}

Paginator.PREV = '⬅️';
Paginator.STOP = '🛑';
Paginator.NEXT = '➡️';

module.exports = Paginator;