/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
