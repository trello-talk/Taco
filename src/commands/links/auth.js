const Command = require('../../structures/Command');

module.exports = class Auth extends Command {
  get name() { return 'auth'; }

  get _options() { return {
    aliases: ['authlink'],
    cooldown: 0,
  }; }

  exec(message) {
    return this.client.createMessage(message.channel.id, `Authorize your Trello account with your Discord here: **<${this.client.config.authURL}>**`);
  }

  get metadata() { return {
    category: 'General',
    description: 'Get the auth link to connect your Discord account to your Trello account.',
  }; }
};
