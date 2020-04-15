/* jshint evil: true */

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

const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Eval extends Command {
  get name() { return 'eval'; }

  get _options() { return {
    aliases: ['e'],
    listed: false,
  }; }

  // eslint-disable-next-line no-unused-vars
  async exec(message, { args }) {
    if (!this.client.config.elevated.includes(message.author.id)) return;
    try {
      const start = Date.now();
      const result = eval(Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' '));
      const time = Date.now() - start;
      return this.client.createMessage(message.channel.id, `Took ${time} ms\n\`\`\`js\n${result}\`\`\`\n`);
    } catch (e) {
      return this.client.createMessage(message.channel.id, '```js\n' + e.stack + '\n```');
    }
  }

  get metadata() { return {
    category: 'Developer',
    description: 'Do a thing.',
    usage: '<code>',
  }; }
};
