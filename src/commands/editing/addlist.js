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

module.exports = class AddList extends Command {
  get name() { return 'addlist'; }

  get _options() { return {
    aliases: ['alist', 'al', 'createlist', 'clist', '+l'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const json = handle.body;

    // Get list title
    const input = args.join(' ') || await this.client.messageAwaiter.getInput(message, _, {
      header: _('lists.input_new')
    });
    if (!input) return;

    // Get new list
    const listResponse = await trello.handleResponse({
      response: await trello.addList(json.id, input),
      client: this.client, message, _ });
    if (listResponse.stop) return;
    const list = listResponse.body;
    return message.channel.createMessage(_('lists.created', {
      name: Util.cutoffText(Util.Escape.markdown(list.name), 50),
      id: list.id
    }));

  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};