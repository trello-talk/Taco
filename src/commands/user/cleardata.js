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

module.exports = class ClearData extends Command {
  get name() { return 'cleardata'; }

  get _options() { return {
    aliases: ['-data', 'cdata'],
    cooldown: 2,
    permissions: ['userData'],
  }; }

  async exec(message, { _, trello, userData }) {
    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('user_mgmt.cleardata_confirm')
    })) {
      if (userData.trelloToken)
        await trello.invalidate();
      await this.client.pg.models.get('user').destroy({ where: { userID: message.author.id } });
      return message.channel.createMessage(_('user_mgmt.cleardata'));
    }
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};