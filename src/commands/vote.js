const Command = require('../structures/Command');

module.exports = class Vote extends Command {
  get name() { return 'vote'; }

  get _options() { return {
    aliases: ['upvote', 'review', 'rate'],
    cooldown: 0,
  }; }

  async exec(message, { _ }) {
    const sites = [{
      url: 'https://top.gg/bot/620126394390675466/vote',
      name: 'Top.gg'
    }, {
      url: 'https://botsfordiscord.com/bot/620126394390675466/vote',
      name: 'Bots For Discord'
    }, {
      url: 'https://discord.boats/bot/620126394390675466/vote',
      name: 'Discord Boats'
    }, {
      url: 'https://discord.boats/bot/620126394390675466/rate',
      name: 'Discord Boats',
      type: 'vote.rate'
    }, {
      url: 'https://discordextremelist.xyz/en-US/bots/taco',
      name: 'Discord Extreme List'
    }];
    return message.channel.createMessage({ embed: {
      color: this.client.config.embedColor,
      title: _('vote.title', { username: this.client.user.username }),
      description: sites.map(
        site => `- [${site.name}](${site.url})${site.type ? ` *(${_(site.type)})*` : ''}`).join('\n')
    }});
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};