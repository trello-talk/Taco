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

module.exports = class WatchList extends Command {
  get name() { return 'watchlist'; }

  get _options() { return {
    aliases: ['subscribelist', 'sublist', 'wlist', 'wl'],
    cooldown: 4,
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

    const list = await Util.Trello.findList(args.join(' '), json, this.client, message, _);
    if (!list) return;

    if ((await trello.handleResponse({
      response: await trello.updateList(list.id, { subscribed: !list.subscribed }),
      client: this.client, message, _ })).stop) return;
    
    return message.channel.createMessage(
      _(list.subscribed ? 'user_mgmt.unsub_list' : 'user_mgmt.sub_list', {
        name: Util.cutoffText(Util.Escape.markdown(list.name), 50),
        id: list.id
      }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};