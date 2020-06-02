/* jshint evil: true */

/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

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

module.exports = class AsyncEval extends Command {
  get name() { return 'asynceval'; }

  get _options() { return {
    aliases: ['ae', 'aeval', 'aevaluate', 'asyncevaluate'],
    permissions: ['elevated'],
    listed: false,
  }; }

  // eslint-disable-next-line no-unused-vars
  async exec(message, opts) {
    try {
      const start = Date.now();
      const code = Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' ');
      const result = await eval(`(async () => {${code}})()`);
      const time = Date.now() - start;
      return Util.Hastebin.autosend(
        `${opts._('responses.eval', { ms: opts._.toLocaleString(time) })}\n\`\`\`js\n${result}\`\`\`\n`,
        message);
    } catch (e) {
      return Util.Hastebin.autosend('```js\n' + e.stack + '\n```', message);
    }
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
