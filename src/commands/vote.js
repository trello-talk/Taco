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