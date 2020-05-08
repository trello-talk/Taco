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

module.exports = class WatchCard extends Command {
  get name() { return 'watchcard'; }

  get _options() { return {
    aliases: ['subscribecard', 'subcard', 'wcard', 'wc'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
    minimumArgs: 1
  }; }

  async exec(message, { args, _, trello, userData }) {
    const response = await trello.getSlimBoard(userData.currentBoard);
    if (await trello.handleResponse({ response, client: this.client, message, _ })) return;
    if (response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const boardJson = await response.json();

    const card = await Util.Trello.findCard(args.join(' '), boardJson, this.client, message, _);
    if (!card) return;

    if (await trello.handleResponse({
      response: await trello.updateCard(card.id, { subscribed: !card.subscribed }),
      client: this.client, message, _ })) return;
    
    return message.channel.createMessage(_(card.subscribed ? 'user_mgmt.unsub_card' : 'user_mgmt.sub_card', {
      name: card.name,
      id: card.shortLink
    }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};