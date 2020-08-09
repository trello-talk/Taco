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
const EventEmitter = require('eventemitter3');
const GenericPager = require('./GenericPager');
const Paginator = require('./Paginator');
const lodash = require('lodash');

/**
 * A prompt that allows users to toggle multiple values
 */
class MultiSelect extends EventEmitter {
  /**
   * @param {TrelloBot} client The client to use
   * @param {Message} message The user's message to read permissions from
   * @param {Object} options The options for the multi-select
   * @param {string|Array<string>} options.path The path of the boolean
   * @param {string} [options.checkEmoji] The emoji that resembles true
   * @param {string} [options.uncheckEmoji] The emoji that resembles false
   * @param {Object} pagerOptions The options for the pager
   */
  constructor(client, message, { path, checkEmoji = '☑️', uncheckEmoji = '⬜' }, pagerOptions = {}) {
    super();
    this.client = client;
    this.message = message;
    this.pagerOptions = pagerOptions;
    this.displayFunc = pagerOptions.display || ((item) => item.toString());
    this.boolPath = path;

    // Override some pager options
    this.pagerOptions.display = (item, i, ai) => {
      const value = lodash.get(item, this.boolPath);
      return `\`[${ai + 1}]\` ${value ? checkEmoji : uncheckEmoji} ${this.displayFunc(item, i, ai)}`;
    };
    this.pagerOptions.header = pagerOptions.header || pagerOptions._('prompt.select');
    this.pagerOptions.footer = (pagerOptions.footer ? pagerOptions.footer + '\n\n' : '') +
      pagerOptions._('prompt.select_cancel');
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
  async start(channelID, userID, timeout) {
    if (this.pager.items.length === 0)
      return null;

    await this.pager.start(channelID, userID, timeout);
    // React with done
    if (this.pager.collector)
      await this.pager.message.addReaction(MultiSelect.DONE);
    this.halt = this.client.messageAwaiter.createHalt(channelID, userID, timeout);

    // Sync timeouts
    if (this.pager.collector)
      this.pager.collector.restart();
    this.halt.restart();

    return new Promise(resolve => {
      let result = null;

      this.halt.on('message', nextMessage => {
        if (this.pager.canManage())
          nextMessage.delete();

        if (MultiSelect.CANCEL_TRIGGERS.includes(nextMessage.content.toLowerCase())) {
          result = { _canceled: true };
          this.halt.end();
        } else if (MultiSelect.DONE_TRIGGERS.includes(nextMessage.content.toLowerCase())) {
          result = this.pager.items;
          this.halt.end();
        }

        // Find and update item
        const chosenIndex = parseInt(nextMessage.content);
        if (chosenIndex <= 0) return;
        let chosenItem = this.pager.items[chosenIndex - 1];
        if (chosenItem !== undefined) {
          const oldItem = chosenItem;
          chosenItem = lodash.set(chosenItem, this.boolPath, !lodash.get(chosenItem, this.boolPath));
          this.emit('update', oldItem, chosenItem, chosenIndex - 1);
          this.pager.items.splice(chosenIndex - 1, 1, chosenItem);
          this.pager.updateMessage();
        }

        this.halt.restart();
        if (this.pager.collector)
          this.pager.collector.restart();
      });

      this.halt.on('end', () => {
        // In case the halt ends before reactions are finished coming up
        this.pager.reactionsCleared = true;
        if (this.pager.collector) 
          this.pager.collector.end();
        this.pager.message.delete().catch(() => {});

        if (result && result._canceled) {
          this.pager.message.channel.createMessage(
            `<@${userID}>, ${this.pagerOptions._('prompt.select_canceled')}`);
          result = null;
        } else if (result === null)
          this.pager.message.channel.createMessage(
            `<@${userID}>, ${this.pagerOptions._('prompt.select_timeout')}`);

        resolve(result);
      });

      if (this.pager.collector) {
        this.pager.collector.on('clearReactions', () => {
          if (!this.pager.canManage())
            this.pager.message.removeReaction(MultiSelect.DONE).catch(() => {});
        });
        this.pager.collector.on('reaction', emoji => {
          if (Paginator.STOP === emoji.name) {
            result = { _canceled: true };
            this.halt.end();
          } else if (MultiSelect.DONE === emoji.name) {
            result = this.pager.items;
            this.halt.end();
          }

          this.halt.restart();
        });
      }
    });
  }
}

MultiSelect.DONE = '✅';
MultiSelect.CANCEL_TRIGGERS = [
  'cancel', 'stop', 'quit'
];
MultiSelect.DONE_TRIGGERS = [
  'save', 'finish', 'done'
];

module.exports = MultiSelect;