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
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class Lists extends Command {
  get name() { return 'lists'; }

  get _options() { return {
    aliases: ['viewlists', 'vls'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (Util.Trello.cannotUseBoard(handle)) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const json = handle.body;

    if (json.length) {
      const paginator = new GenericPager(this.client, message, {
        items: json,
        _, header: _('lists.header'), itemTitle: 'words.list.many',
        display: (item) => `${
          item.subscribed ? '🔔 ' : ''}${Util.cutoffText(Util.Escape.markdown(item.name), 50)} (${
          _.toLocaleString(item.cards.length)} ${_.numSuffix('words.card', item.cards.length)})`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else
      return message.channel.createMessage(_('lists.none'));
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};