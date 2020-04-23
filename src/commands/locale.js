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

module.exports = class Locale extends Command {
  get name() { return 'locale'; }

  get _options() { return {
    aliases: ['l', 'lang'],
    cooldown: 0,
  }; }

  async exec(message, { _ }) {
    const lines = [];
    const sourceLines = Object.keys(Util.flattenObject(this.client.locale.source)).length;
    this.client.locale.locales.forEach((json, locale) => {
      const jsonLines = Object.keys(Util.flattenObject(json)).length;
      const line = `${
        json._.emoji.startsWith('$') ? `:${json._.emoji.slice(1)}:` : `:flag_${json._.emoji}:`
      } ${json._.name} \`${((jsonLines / sourceLines) * 100).toFixed(2)}%\``;
      lines.push(_.locale === locale ? `**${line}**` : line);
    });
    return this.client.createMessage(message.channel.id, _('locale.start') + '\n' + lines.join('\n'));
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
