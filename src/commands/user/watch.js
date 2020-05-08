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

module.exports = class Watch extends Command {
  get name() { return 'watch'; }

  get _options() { return {
    aliases: ['watchboard', 'wboard', 'wb', 'subscribeboard', 'subboard'],
    cooldown: 4,
    permissions: ['auth']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const arg = args.join(' ') || userData.currentBoard;
    const handle = await trello.handleResponse({
      response: await trello.getMember(userData.trelloID),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').removeAuth(message.author);
      return this.client.createMessage(message.channel.id, _('trello_response.unauthorized'));
    }

    const json = handle.body;

    const board = await Util.Trello.findBoard(arg, json.boards, this.client, message, _, userData);
    if (!board) return;

    if ((await trello.handleResponse({
      response: await trello.updateBoard(board.id, { subscribed: !board.subscribed }),
      client: this.client, message, _ })).stop) return;
    
    return message.channel.createMessage(
      _(board.subscribed ? 'user_mgmt.unsub_board' : 'user_mgmt.sub_board', {
        name: Util.cutoffText(Util.Escape.markdown(board.name), 50),
        id: board.shortLink
      }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};