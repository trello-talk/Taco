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

module.exports = class Restart extends Command {
  get name() { return 'restart'; }

  get _options() { return {
    aliases: ['re'],
    listed: false,
  }; }

  async exec(message) {
    if (!this.client.config.elevated.includes(message.author.id)) return;
    await this.client.createMessage(message.channel.id, 'Restarting shard...');
    await this.client.dieGracefully();
    process.exit(0);
  }

  get metadata() { return {
    category: 'Developer',
    description: 'Restarts the bot.',
  }; }
};