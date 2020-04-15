const Command = require('../../structures/Command');

module.exports = class GitHUb extends Command {
  get name() { return 'github'; }

  get _options() { return {
    aliases: ['gh'],
    cooldown: 0,
  }; }

  exec(message) {
    return this.client.createMessage(message.channel.id, 'Here is the link to my source code!\n\`▶\` <https://github.com/trello-talk/TrelloBot>');
  }

  get metadata() { return {
    category: 'General',
    description: 'Sends the bot\'s open source link.',
  }; }
};
