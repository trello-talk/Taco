const Command = require('../../structures/Command');

module.exports = class GitHUb extends Command {
  get name() { return 'github'; }

  get _options() { return {
    aliases: ['gh'],
    cooldown: 0,
  }; }

  exec(message, { _ }) {
    return message.channel.createMessage(
      `${_('links.github')} **<https://github.com/trello-talk/TrelloBot>**`);
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
