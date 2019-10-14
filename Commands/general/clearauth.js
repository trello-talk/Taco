/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah ???-2019
 Copyright (c) Yamboy1 (and contributors) 2019

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

const { Command } = require('faux-classes');

module.exports = class ClearAuth extends Command {
  get name() { return 'clearauth'; }
  get cooldown() { return 0; }

  async exec(message, args, { user }) {
    const userId = message.author.id;
    const currentAuth = await this.client.data.get.user(userId);
    if (currentAuth === null) return message.reply('Your account is not currently authorized with Trello!');
    await message.channel.send('Are you sure you would like to clear your authorization? You will need to reauthorize again to use trello commands. (Type `yes` to continue)');

    const filter = m => m.author.id === userId;
    const messages = await message.channel.awaitMessages(filter, {
      max: 1,
      time: 30000,
    });

    if (!messages.size || messages.first().content.toLowerCase() !== 'yes') {
      return message.channel.send('Cancelled!');
    }

    await this.client.data.delete.user(userId);
    await message.channel.send('Auth cleared!');
  }

  get helpMeta() {
    return {
      category: 'General',
      description: 'Clears your Trello authorization. If you don\'t know what this means, please don\'t run this command.'
    };
  }
};
