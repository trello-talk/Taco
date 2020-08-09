const Command = require('../../structures/Command');

module.exports = class Auth extends Command {
  get name() { return 'auth'; }

  get _options() { return {
    aliases: ['authlink'],
    cooldown: 0,
  }; }

  exec(message, { _ }) {
    if (!this.client.config.authURL)
      return message.channel.createMessage(_('links.auth.fail'));
    return message.channel.createMessage(`${_('links.auth.start')} **<${this.client.config.authURL}>**`);
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
