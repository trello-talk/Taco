/*
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
const Paginator = require('./Paginator');
const lodash = require('lodash');

/**
 * A generic pager that shows a list of items
 */
class GenericPager extends Paginator {
  /**
   * @param {TrelloBot} client The client to use
   * @param {Message} message The user's message to read permissions from
   * @param {Object} options The options for the pager
   * @param {Array} options.items The items the paginator will display
   * @param {number} [options.itemsPerPage=15] How many items a page will have
   * @param {Function} [options.display] The function that will be used to display items on the prompt
   * @param {Object} [options.embedExtra] The embed object to add any extra embed elements to the prompt
   * @param {LocaleModule} options._ The locale module to use for the prompt
   * @param {string} [options.itemTitle='words.item.many'] The title to use for the items
   * @param {string} [options.header] The text to show above the prompt
   * @param {string} [options.footer] The text to show below the prompt
   */
  constructor(client, message, {
    items = [], itemsPerPage = 15,
    display = item => item.toString(),
    _, embedExtra = {}, itemTitle = 'words.item.many',
    header = null, footer = null
  } = {}) {
    super(client, message, { items, itemsPerPage });
    this.displayFunc = display;
    this.embedExtra = embedExtra;
    this.itemTitle = itemTitle;
    this.localeModule = _;
    this.header = header;
    this.footer = footer;
  }

  /**
   * Whether or not this instance can use embed
   * @returns {boolean}
   */
  canEmbed() {
    return this.message.channel.type === 1 ||
      this.message.channel.permissionsOf(this.client.user.id).has('embedLinks');
  }

  /**
   * Updates the current message
   * @returns {Promise}
   */
  updateMessage() {
    return this.message.edit(this.currentMessage).catch(() => {});
  }

  /**
   * The message for the current page
   * @type {Object|string}
   */
  get currentMessage() {
    const _ = this.localeModule;
    const displayPage = this.page.map((item, index) =>
      this.displayFunc(item, index, ((this.pageNumber - 1) * this.itemsPerPage) + index));
    if (this.canEmbed()) {
      const embed = lodash.defaultsDeep({
        title: `${_(this.itemTitle)} ` +
          `(${this.items.length}, ${_('words.page.one')} ${this.pageNumber}/${this.maxPages})`,
        description: this.header || undefined,
        footer: this.footer ? { text: this.footer } : undefined,
        fields: []
      }, this.embedExtra, { color: this.client.config.embedColor });

      embed.fields.push({
        name: '*' + _('prompt.list') + '*',
        value: displayPage.join('\n')
      });

      return { embed };
    } else {
      const top = `${_(this.itemTitle)} ` +
        `(${this.items.length}, ${_('words.page.one')} ${this.pageNumber}/${this.maxPages})`;
      const lines = '─'.repeat(top.length);
      return (this.header || '') + '```prolog\n' + `${top}\n` + `${lines}\n` +
        displayPage.join('\n') + `${lines}\`\`\`` + (this.footer || '');
    }
  }

  /**
   * Starts the reaction collector and pagination
   * @param {string} channelID The channel to post the new message to
   * @param {string} userID The user's ID that started the process
   * @param {number} timeout
   */
  async start(channelID, userID, timeout) {
    this.message = await this.client.createMessage(channelID, this.currentMessage);
    return super.start(userID, timeout);
  }

  /**
   * @private
   */
  _change() {
    this.updateMessage().catch(() => this.collector.end());
    this.emit('change', this.pageNumber);
  }
}

module.exports = GenericPager;