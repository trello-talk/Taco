const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Reload extends Command {
  get name() { return 'reload'; }

  get _options() { return {
    aliases: ['r'],
    permissions: ['elevated'],
    listed: false,
  }; }

  async exec(message, { _ }) {
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const reloadingEmoji = emojiFallback('632444546961375232', '♻️', true);
    const sentMessage = await message.channel.createMessage(
      `${reloadingEmoji} ${_('reload.reloading')}`);
    this.client.cmds.reload();
    this.client.cmds.preloadAll();
    const reloadEmoji = emojiFallback('632444546684551183', '✅');
    return sentMessage.edit(`${reloadEmoji} ${_('reload.done')}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
