const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class ReloadLocale extends Command {
  get name() { return 'reloadlocale'; }

  get _options() { return {
    aliases: ['rl'],
    permissions: ['elevated'],
    listed: false,
  }; }

  async exec(message, { _ }) {
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const reloadingEmoji = emojiFallback('632444546961375232', '♻️', true);
    const sentMessage = await message.channel.createMessage(
      `${reloadingEmoji} ${_('reloadlocale.reloading')}`);
    this.client.locale.reload();
    const reloadEmoji = emojiFallback('632444546684551183', '✅');
    return sentMessage.edit(`${reloadEmoji} ${_('reloadlocale.done')}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
