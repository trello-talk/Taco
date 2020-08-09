const Command = require('../../structures/Command');

module.exports = class Donate extends Command {
  get name() { return 'donate'; }

  get _options() { return {
    aliases: ['patreon', 'paypal'],
    cooldown: 0,
  }; }

  exec(message, { _ }) {
    if (!Array.isArray(this.client.config.donate) || !this.client.config.donate[0])
      return message.channel.createMessage(_('links.donate.fail'));
    return message.channel.createMessage(_('links.donate.start') + '\n' +
      this.client.config.donate.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
