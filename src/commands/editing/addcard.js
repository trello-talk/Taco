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

module.exports = class AddCard extends Command {
  get name() { return 'addcard'; }

  get _options() { return {
    aliases: ['createcard', 'ccard', 'acard', 'cc', 'ac', '+card', '+c'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getAllLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const json = handle.body;
    const list = await Util.Trello.findList(args[0], json, this.client, message, _);
    if (!list) return;

    // Get card title
    const input = args[1] || await this.client.messageAwaiter.getInput(message, _, {
      header: _('cards.input_new')
    });
    if (!input) return;

    // Get new card
    const cardResponse = await trello.handleResponse({
      response: await trello.addCard(list.id, { name: input }),
      client: this.client, message, _ });
    if (cardResponse.stop) return;
    const card = cardResponse.body;
    return message.channel.createMessage(_('cards.created', {
      name: Util.cutoffText(Util.Escape.markdown(card.name), 50),
      id: card.shortLink
    }));
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};