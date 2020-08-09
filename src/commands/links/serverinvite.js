const Command = require('../../structures/Command');

module.exports = class ServerInvite extends Command {
  get name() { return 'serverinvite'; }

  get _options() { return {
    aliases: ['supportserver', 'support'],
    cooldown: 0,
  }; }

  exec(message, { _ }) {
    if (!Array.isArray(this.client.config.supportServers) || !this.client.config.invites[0])
      return message.channel.createMessage(_('links.serverinvite.fail'));
    return message.channel.createMessage(_('links.serverinvite.start') + '\n' +
      this.client.config.supportServers.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
