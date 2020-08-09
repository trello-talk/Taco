const Command = require('../../structures/Command');
const Util = require('../../util');
const reload = require('require-reload');

module.exports = class ReloadWebServer extends Command {
  get name() { return 'reloadwebserver'; }

  get _options() { return {
    aliases: ['rws'],
    permissions: ['elevated'],
    listed: false,
  }; }

  async exec(message, { _ }) {
    if (!this.client.webserver)
      return message.channel.createMessage(_('reloadwebserver.no'));
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const reloadingEmoji = emojiFallback('632444546961375232', '♻️', true);
    const sentMessage = await message.channel.createMessage(
      `${reloadingEmoji} ${_('reloadwebserver.reloading')}`);
    await this.client.webserver.stop();
    this.client.webserver = null;
    reload.emptyCache(require);
    this.client.webserver = new (require('../../webserver'))(this.client);
    await this.client.webserver.start();
    const reloadEmoji = emojiFallback('632444546684551183', '✅');
    return sentMessage.edit(`${reloadEmoji} ${_('reloadwebserver.done')}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
