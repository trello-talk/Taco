const Command = require('../structures/Command');
const Util = require('../util');

module.exports = class ShardInfo extends Command {
  get name() { return 'shardinfo'; }

  get _options() { return {
    aliases: ['shards'],
    cooldown: 0,
  }; }

  canEmbed(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('embedLinks');
  }

  async exec(message) {
    if(!this.canEmbed(message))
      return this.client.createMessage(message.channel.id, 'I need to be able to embed links in order to display bot shard information!');

    const serverMap = {}
    this.client.guilds.map(guild => {
      const shardID = guild.shard.id;
      if (serverMap[shardID])
        serverMap[shardID] += 1;
      else serverMap[shardID] = 1;
    });
    let embed = {
      color: this.client.config.embedColor,
      title: `Information about ${this.client.user.username}'s Shards`,
      description: this.client.shards.map(
        shard => `**\`${shard.id}:\`** ${shard.status.toUpperCase()}, ${shard.latency}ms, ${serverMap[shard.id]} guilds`
      ).join('\n'),
      thumbnail: {
        url: this.client.config.iconURL
      }
    };
    return this.client.createMessage(message.channel.id, { embed });
  }

  get metadata() { return {
    category: 'General',
    description: 'Gives the stats for every shard.',
  }; }
};
