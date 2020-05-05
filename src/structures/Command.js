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
const Util = require('../util');

class Command {
  constructor(client) {
    this.client = client;
    this.subCommands = {};
  }

  _preload() {
    if (!this.preload() && this.client.config.debug)
      this.client.cmds.logger.info('Preloading command', this.name);
  }

  preload() {
    return true;
  }

  async _exec(message, opts) {
    // Check minimum arguments
    if (this.options.minimumArgs > 0 && opts.args.length < this.options.minimumArgs)
      return this.client.createMessage(message.channel.id,
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
          return this.client.createMessage(message.channel.id, opts._(`command_permissions.${perm}`));
      }

    // Process cooldown
    if (!this.cooldownAbs || await this.client.cmds.processCooldown(message, this)) {
      await this.exec(message, opts);
    } else {
      const cd = await this.client.db.hget(`cooldowns:${message.author.id}`, this.name);
      return this.client.createMessage(message.channel.id,
        `:watch: ${opts._('cooldown', { seconds: Math.ceil(this.cooldownAbs - (Date.now() - cd))})}`);
    }
  }

  // eslint-disable-next-line no-empty-function, no-unused-vars
  exec(Message, opts) { }

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

  _options() { return {}; }

  get cooldownAbs() { return this.options.cooldown * 1000; }

  get metadata() {
    return {
      category: 'categories.misc',
    };
  }
}

module.exports = Command;