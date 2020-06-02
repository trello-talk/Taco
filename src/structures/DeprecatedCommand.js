/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

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

const Command = require('./Command');

module.exports = class DeprecatedCommand extends Command {
  /**
   * The options for the command
   * @type {Object}
   */
  get options() {
    const options = {
      aliases: [],
      cooldown: 0,
      listed: false,
      minimumArgs: 0,
      permissions: [],

      minimumArgsMessage: 'bad_args',
    };
    Object.assign(options, this._options);
    return options;
  }

  get replacedCommandName() {
    return 'ping';
  }

  get replacedCommand() {
    return this.client.cmds.get(this.replacedCommandName);
  }

  exec(message, { _, prefixUsed }) {
    return message.channel.createMessage(`${_('deprecated')}\n*${_('use_this')}* \`${
      prefixUsed.clean}${this.replacedCommand.name}\``);
  }

  get metadata() { return {
    category: 'categories.hidden',
  }; }
};
