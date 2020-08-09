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
