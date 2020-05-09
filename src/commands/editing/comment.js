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

module.exports = class Comment extends Command {
  get name() { return 'comment'; }

  get _options() { return {
    aliases: ['com'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    // Get all cards for search
    const handle = await trello.handleResponse({
      response: await trello.getSlimBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const boardJson = handle.body;

    const card = await Util.Trello.findCard(args[0], boardJson, this.client, message, _);
    if (!card) return;

    
    const input = args[1] || await this.client.messageAwaiter.getInput(message, _, {
      header: _('cards.input_desc')
    });
    if (!input) return;
    if ((await trello.handleResponse({
      response: await trello.addComment(card.id, input),
      client: this.client, message, _ })).stop) return;
    return message.channel.createMessage(_('cards.commented', {
      name: Util.cutoffText(Util.Escape.markdown(card.name), 50)
    }));
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};