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

const Command = require('../../structures/Command');
const Util = require('../../util');
const fs = require('fs');

module.exports = class ReloadOne extends Command {
  get name() { return 'reloadone'; }

  get _options() { return {
    aliases: ['r1', 'reloadsingle', 'rs'],
    permissions: ['elevated'],
    minimumArgs: 1,
    listed: false,
  }; }

  async exec(message, { args, _ }) {
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const reloadingEmoji = emojiFallback('632444546961375232', ':recycle:');
    const sentMessage = await this.client.createMessage(message.channel.id,
      `${reloadingEmoji} ${_('reload.reloading')}`);
    
    const commands = args.map(name => this.client.cmds.get(name));
    if (commands.includes(undefined))
      return message.channel.send(_('reloadone.invalid'));

    const fileExist = commands.map(command => {
      const path = command.path;
      const stat = fs.lstatSync(path);
      return stat.isFile();
    });

    if (fileExist.includes(false))
      return message.channel.send(_('reloadone.file'));

    const reloadedCommands = commands.map(command => {
      const path = command.path;
      const index = this.client.cmds.commands.indexOf(command);
      this.client.cmds.commands.splice(index, 1);
      const newCommand = this.client.cmds.load(path);
      newCommand.preload();
      return newCommand;
    });
    const reloadEmoji = emojiFallback('632444546684551183', ':white_check_mark:');
    return sentMessage.edit(`${reloadEmoji} ${_(
      'reloadone.done', { commands: reloadedCommands.map(c => `\`${c.name}\``).join(', ') })}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
