/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
