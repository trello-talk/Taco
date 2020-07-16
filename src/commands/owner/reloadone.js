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
    const reloadingEmoji = emojiFallback('632444546961375232', '♻️', true);
    
    const commands = args.map(name => this.client.cmds.get(name));
    if (commands.includes(undefined))
      return message.channel.createMessage(_('reloadone.invalid'));

    const fileExist = commands.map(command => {
      const path = command.path;
      const stat = fs.lstatSync(path);
      return stat.isFile();
    });

    if (fileExist.includes(false))
      return message.channel.createMessage(_('reloadone.file'));

    const sentMessage = await message.channel.createMessage(
      `${reloadingEmoji} ${_('reload.reloading')}`);

    const reloadedCommands = commands.map(command => {
      const path = command.path;
      const index = this.client.cmds.commands.indexOf(command);
      this.client.cmds.commands.splice(index, 1);
      const newCommand = this.client.cmds.load(path);
      newCommand.preload();
      return newCommand;
    });
    const reloadEmoji = emojiFallback('632444546684551183', '✅');
    return sentMessage.edit(`${reloadEmoji} ${_(
      'reloadone.done', { commands: reloadedCommands.map(c => `\`${c.name}\``).join(', ') })}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
