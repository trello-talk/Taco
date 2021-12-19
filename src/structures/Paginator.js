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
    this.componentsRemoved = false;
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
    this.collector = this.messageAwaiter.createComponentCollector(this.message, userID, timeout);
    this.collector.on('interaction', this._interact.bind(this));
    this.collector.once('end', this.removeComponents.bind(this));
  }

  /**
   * Remove components from the message
   */
  async removeComponents() {
    if (!this.componentsRemoved) {
      this.componentsRemoved = true;
      this.message.edit({ components: [] });
      this.emit('removeComponents');
    }
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
  async _interact(interaction) {
    await interaction.acknowledge();
    const oldPage = this.pageNumber;
    if (interaction.data.custom_id === 'prev')
      this.previousPage();
    else if (interaction.data.custom_id === 'next')
      this.nextPage();
    else if (interaction.data.custom_id === 'stop')
      this.collector.end();
    if (this.pageNumber !== oldPage)
      this._change(interaction);
    this.collector.restart();
  }
}

Paginator.PREV = '⬅️';
Paginator.STOP = '🛑';
Paginator.NEXT = '➡️';
Paginator.DONE = '✅';

module.exports = Paginator;