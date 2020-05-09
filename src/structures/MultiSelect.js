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
      });

      this.halt.on('end', () => {
        // In case the halt ends before reactions are finished coming up
        this.pager.reactionsCleared = true;
        if (this.pager.collector) 
          this.pager.collector.end();
        this.pager.message.delete();

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
        });
      }
    });
  }
}

MultiSelect.DONE = '✅';
MultiSelect.CANCEL_TRIGGERS = [
  'c', 'cancel', 's', 'stop', 'q', 'quit'
];
MultiSelect.DONE_TRIGGERS = [
  'save', 'finish', 'done'
];

module.exports = MultiSelect;