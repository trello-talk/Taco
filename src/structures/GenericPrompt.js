const GenericPager = require('./GenericPager');
const Paginator = require('./Paginator');
const lodash = require('lodash');
const fuzzy = require('fuzzy');

/**
 * A generic pager that shows a list of items
 */
class GenericPrompt {
  /**
   * @param {TrelloBot} client The client to use
   * @param {Message} message The user's message to read permissions from
   * @param {Object} pagerOptions The options for the pager
   */
  constructor(client, message, pagerOptions = {}) {
    this.client = client;
    this.message = message;
    this.pagerOptions = pagerOptions;
    this.displayFunc = pagerOptions.display || ((item) => item.toString());

    // Override some pager options
    this.pagerOptions.display = (item, i, ai) => `${ai + 1}. ${this.displayFunc(item, i, ai)}`;
    this.pagerOptions.header = pagerOptions.header || pagerOptions._('prompt.choose');
    this.pagerOptions.footer = (pagerOptions.footer ? pagerOptions.footer + '\n\n' : '') +
      pagerOptions._('prompt.cancel');
    this.pagerOptions.embedExtra = this.pagerOptions.embedExtra || {};
    this.pagerOptions.embedExtra.author = {
      name: `${message.author.username}#${message.author.discriminator}`,
      icon_url: message.author.avatarURL || message.author.defaultAvatarURL
    };

    this.pager = new GenericPager(client, message, this.pagerOptions);
    this.halt = null;
  }

  /**
   * Starts the prompt
   * @param {string} channelID The channel to post the new message to
   * @param {string} userID The user's ID that started the process
   * @param {number} timeout
   */
  async choose(channelID, userID, timeout) {
    if (this.pager.items.length === 0)
      return null;
    else if (this.pager.items.length === 1)
      return this.pager.items[0];

    await this.pager.start(channelID, userID, timeout);
    this.halt = this.client.messageAwaiter.createHalt(channelID, userID, timeout);

    // Sync timeouts
    if (this.pager.collector)
      this.pager.collector.restart();
    this.halt.restart();

    return new Promise(resolve => {
      let foundItem = null;

      this.halt.on('message', nextMessage => {
        if (this.pager.canManage())
          nextMessage.delete().catch(() => {});

        if (GenericPrompt.CANCEL_TRIGGERS.includes(nextMessage.content.toLowerCase())) {
          foundItem = { _canceled: true };
          this.halt.end();
        }
        const chosenIndex = parseInt(nextMessage.content);
        if (chosenIndex <= 0) return;
        const chosenItem = this.pager.items[chosenIndex - 1];
        if (chosenItem !== undefined) {
          foundItem = chosenItem;
          this.halt.end();
        }
      });

      this.halt.on('end', () => {
        // In case the halt ends before reactions are finished coming up
        this.pager.reactionsCleared = true;
        if (this.pager.collector) 
          this.pager.collector.end();
        this.pager.message.delete().catch(() => {});

        if (foundItem && foundItem._canceled)
          foundItem = null;
        else if (foundItem === null)
          this.pager.message.channel.createMessage(
            `<@${userID}>, ${this.pagerOptions._('prompt.timeout')}`).catch(() => {});

        resolve(foundItem);
      });

      if (this.pager.collector)
        this.pager.collector.on('reaction', emoji => {
          if (Paginator.STOP === emoji.name) {
            foundItem = { _canceled: true };
            this.halt.end();
          }
        });
    });
  }

  /**
   * Filters the items into a search and prompts results.
   * @param {string} query The term to search for
   * @param {Object} options The options passed on to {@see #choose} .
   * @param {string} options.channelID The channel to post the new message to
   * @param {string} options.userID The user's ID that started the process
   * @param {number} options.timeout
   * @param {string|Function} [key='name'] The path to use for searches
   */
  async search(query, { channelID, userID, timeout }, key = 'name') {
    if (!query)
      return this.choose(channelID, userID, timeout);

    const results = fuzzy.filter(query, this.pager.items, {
      extract: item => {
        if (typeof key === 'string')
          return lodash.get(item, key);
        else if (typeof key === 'function')
          return key(item);
        else if (key === null)
          return item;
      }
    }).map(el => el.original);

    if (!results.length)
      return { _noresults: true };

    const tempItems = this.pager.items;
    this.pager.items = results;
    const result = await this.choose(channelID, userID, timeout);
    this.pager.items = tempItems;
    return result;
  }
}

GenericPrompt.CANCEL_TRIGGERS = [
  'c', 'cancel', 's', 'stop'
];

module.exports = GenericPrompt;