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
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class Boards extends Command {
  get name() { return 'boards'; }

  get _options() { return {
    cooldown: 2,
    permissions: ['auth'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const response = await trello.getMember(userData.trelloID);
    if (await trello.handleResponse({ response, client: this.client, message, _ })) return;
    if (response.status === 404) {
      await this.client.pg.models.get('user').removeAuth(message.author);
      return this.client.createMessage(message.channel.id, _('trello_response.unauthorized'));
    }

    const json = await response.json();

    if (json.boards.length) {
      const paginator = new GenericPager(this.client, message, {
        items: json.boards,
        _, header: _('boards.header'), itemTitle: 'words.trello_board.many',
        display: (item) => `\`${item.shortLink}\` ${
          item.starred ? '⭐ ' : ''}${item.subscribed ? '🔔 ' : ''}${Util.Escape.markdown(item.name)}`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else {
      // Remove current board
      if (userData.currentBoard)
        await this.client.pg.models.get('user').update({ currentBoard: null },
          { where: { userID: message.author.id } });

      return message.channel.createMessage(_('boards.none'));
    }
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};