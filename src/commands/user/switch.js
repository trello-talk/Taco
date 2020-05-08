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

module.exports = class Switch extends Command {
  get name() { return 'switch'; }

  get _options() { return {
    aliases: ['switchboard', 'select', 'selectboard'],
    cooldown: 2,
    permissions: ['auth'],
    minimumArgs: 1
  }; }

  async exec(message, { args, _, trello, userData }) {
    const arg = args.join(' ');
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

    await this.client.pg.models.get('user').update({ currentBoard: board.id },
      { where: { userID: message.author.id } });
    
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const doneEmoji = emojiFallback('632444546684551183', ':white_check_mark:');
    return message.channel.createMessage(`${doneEmoji} ` + _('boards.switch', {
      name: Util.cutoffText(Util.Escape.markdown(board.name), 50),
      id: board.shortLink
    }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};