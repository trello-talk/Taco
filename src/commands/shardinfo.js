const Command = require('../structures/Command');

module.exports = class ShardInfo extends Command {
  get name() { return 'shardinfo'; }

  get _options() { return {
    aliases: ['shards'],
    permissions: ['embed'],
    cooldown: 0,
  }; }

  async exec(message, { _ }) {
    const serverMap = {};
    this.client.guilds.map(guild => {
      const shardID = guild.shard.id;
      if (serverMap[shardID])
        serverMap[shardID] += 1;
      else serverMap[shardID] = 1;
    });
    const embed = {
      color: this.client.config.embedColor,
      title: _('shardinfo.title', { username: this.client.user.username }),
      description: this.client.shards.map(shard => _('shardinfo.line', {
        id: shard.id,
        status: shard.status.toUpperCase(),
        ms: _.toLocaleString(shard.latency),
        guilds: _.toLocaleString(serverMap[shard.id])
      })).join('\n'),
      thumbnail: {
        url: this.client.config.iconURL
      }
    };
    return message.channel.createMessage({ embed });
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
