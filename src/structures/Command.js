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
const Util = require('../util');

/**
 * A command in the bot.
 */
class Command {
  /**
   * @param {TrelloBot} client
   */
  constructor(client) {
    this.client = client;
    this.subCommands = {};
  }

  /**
   * @private
   */
  _preload() {
    if (!this.preload() && this.client.config.debug)
      this.client.cmds.logger.info('Preloading command', this.name);
  }

  /**
   * The function executed while loading the command into the command handler.
   */
  preload() {
    return true;
  }

  /**
   * @private
   * @param {Message} message
   * @param {Object} opts
   */
  async _exec(message, opts) {
    // Check minimum arguments
    if (this.options.minimumArgs > 0 && opts.args.length < this.options.minimumArgs)
      return message.channel.createMessage(
        `${opts._(this.options.minimumArgsMessage)}\n${
          opts._('words.usage')}: ${opts.prefixUsed.raw}${this.name}${
          opts._.valid(`commands.${this.name}.usage`) ?
            ` \`${opts._(`commands.${this.name}.usage`)}\`` : ''}`);

    // Check commmand permissions
    if (this.options.permissions.length)
      for (const i in this.options.permissions) {
        const perm = this.options.permissions[i];
        if (!Util.CommandPermissions[perm])
          throw new Error(`Invalid command permission "${perm}"`);
        if (!Util.CommandPermissions[perm](this.client, message, opts))
          return message.channel.createMessage(opts._(`command_permissions.${perm}`));
      }

    // Process cooldown
    if (!this.cooldownAbs || await this.client.cmds.processCooldown(message, this)) {
      await this.exec(message, opts);
    } else {
      const cd = await this.client.db.hget(`cooldowns:${message.author.id}`, this.name);
      return message.channel.createMessage(
        `:watch: ${opts._('cooldown_msg', { seconds: Math.ceil(this.cooldownAbs - (Date.now() - cd))})}`);
    }
  }

  // eslint-disable-next-line no-empty-function, no-unused-vars
  exec(Message, opts) { }

  /**
   * The options for the command
   * @type {Object}
   */
  get options() {
    const options = {
      aliases: [],
      cooldown: 2,
      listed: true,
      minimumArgs: 0,
      permissions: [],

      minimumArgsMessage: 'bad_args',
    };
    Object.assign(options, this._options);
    return options;
  }

  /**
   * @private
   */
  _options() { return {}; }

  /**
   * The cooldown in milliseconnds
   * @returns {number}
   */
  get cooldownAbs() { return this.options.cooldown * 1000; }

  /**
   * The metadata for the command
   * @return {Object}
   */
  get metadata() {
    return {
      category: 'categories.misc',
    };
  }
}

module.exports = Command;