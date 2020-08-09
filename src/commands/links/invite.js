const Command = require('../../structures/Command');

module.exports = class Invite extends Command {
  get name() { return 'invite'; }

  get _options() { return {
    aliases: ['inv', 'botinvite'],
    cooldown: 0,
  }; }

  exec(message, { _ }) {
    if (!Array.isArray(this.client.config.invites) || !this.client.config.invites[0])
      return message.channel.createMessage(_('links.invite.fail'));
    return message.channel.createMessage(_('links.invite.start') + '\n' +
      this.client.config.invites.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
