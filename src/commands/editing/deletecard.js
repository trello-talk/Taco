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

module.exports = class DeleteCard extends Command {
  get name() { return 'deletecard'; }

  get _options() { return {
    aliases: ['dcard', 'dc', 'removecard', 'rcard', 'rc', '-c'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    // Get all cards for search
    const handle = await trello.handleResponse({
      response: await trello.getSlimBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (Util.Trello.cannotUseBoard(handle)) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const boardJson = handle.body;

    const card = await Util.Trello.findCard(args[0], boardJson, this.client, message, _);
    if (!card) return;
    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('cards.remove_confirm', {
        name: Util.cutoffText(Util.Escape.markdown(card.name), 50),
        id: card.shortLink
      })
    })) {
      if ((await trello.handleResponse({
        response: await trello.deleteCard(card.id),
        client: this.client, message, _ })).stop) return;
      return message.channel.createMessage(_('cards.removed', {
        name: Util.cutoffText(Util.Escape.markdown(card.name), 50),
        id: card.shortLink
      }));
    }
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};