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
    header = null, footer = null, includeDone = false
  } = {}) {
    super(client, message, { items, itemsPerPage });
    this.displayFunc = display;
    this.embedExtra = embedExtra;
    this.itemTitle = itemTitle;
    this.localeModule = _;
    this.header = header;
    this.footer = footer;
    this.includeDone = includeDone;
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
  updateMessage(interaction) {
    return interaction ? interaction.editParent(this.currentMessage).catch(() => {})
      : this.message.edit(this.currentMessage).catch(() => {});
  }

  get components() {
    return this.maxPages > 1 ? [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: '',
            custom_id: 'prev',
            emoji: { id: '902219517969727488' },
            disabled: this.pageNumber <= 1
          },
          {
            type: 2,
            style: 4,
            label: '',
            custom_id: 'stop',
            emoji: { id: '887142796560060426' }
          },
          ...(this.includeDone ? [{
            type: 2,
            style: 3,
            label: '',
            custom_id: 'done',
            emoji: { name: Paginator.DONE }
          }] : []),
          {
            type: 2,
            style: 2,
            label: '',
            custom_id: 'next',
            emoji: { id: '902219517965525042' },
            disabled: this.pageNumber >= this.maxPages
          }
        ]
      }
    ] : [];
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
        description: (this.header ? this.header + '\n\n' : '') + displayPage.join('\n'),
        footer: this.footer ? { text: this.footer } : undefined
      }, this.embedExtra, { color: this.client.config.embedColor });

      return { embed, components: this.components };
    } else {
      const top = `${_(this.itemTitle)} ` +
        `(${this.items.length}, ${_('words.page.one')} ${this.pageNumber}/${this.maxPages})`;
      const lines = '─'.repeat(top.length);
      return {
        content: (this.header || '') + '```prolog\n' + `${top}\n` + `${lines}\n` +
          displayPage.join('\n') + `${lines}\`\`\`` + (this.footer || ''),
        components: this.components
      };
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
  _change(interaction) {
    this.updateMessage(interaction).catch(() => this.collector.end());
    this.emit('change', this.pageNumber);
  }
}

module.exports = GenericPager;