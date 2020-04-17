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

module.exports = class Donate extends Command {
  get name() { return 'donate'; }

  get _options() { return {
    aliases: ['patreon', 'paypal'],
    cooldown: 0,
  }; }

  exec(message) {
    if (!Array.isArray(this.client.config.donate) || !this.client.config.donate[0])
      return this.client.createMessage(message.channel.id,
        'The bot owner hasn\'t supplied any donation links!');
    return this.client.createMessage(message.channel.id, 'Support development by donating!\n' +
      this.client.config.donate.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'General',
    description: 'Get the donation links for the developer.',
  }; }
};