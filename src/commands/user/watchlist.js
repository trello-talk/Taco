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
const GenericPrompt = require('../../structures/GenericPrompt');
const Util = require('../../util');

module.exports = class WatchList extends Command {
  get name() { return 'watchlist'; }

  get _options() { return {
    aliases: ['subscribelist', 'sublist', 'wlist', 'wl'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
    minimumArgs: 1
  }; }

  async findList(query, lists, message, _) {
    if (lists.length) {
      const foundList = lists.find(list => list.id === query);
      if (foundList) return foundList;
      else {
        const prompter = new GenericPrompt(this.client, message, {
          items: lists, itemTitle: 'words.list.many',
          header: _('lists.choose'),
          display: list => `${list.closed ? '🗃️ ' : ''}${
            list.subscribed ? '🔔 ' : ''}\`${list.id}\` ${Util.Escape.markdown(list.name)}`,
          _
        });
        const promptResult = await prompter.search(query,
          { channelID: message.channel.id, userID: message.author.id });
        if (promptResult && promptResult._noresults) {
          await message.channel.createMessage(_('prompt.no_search'));
          return;
        } else
          return promptResult;
      }
    } else {
      await message.channel.createMessage(_('lists.none'));
      return;
    }
  }

  async exec(message, { args, _, trello, userData }) {
    const response = await trello.getAllLists(userData.currentBoard);
    if (await trello.handleResponse({ response, client: this.client, message, _ })) return;
    if (response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const json = await response.json();

    const list = await this.findList(args.join(' '), json, message, _);
    if (!list) return;

    if (await trello.handleResponse({
      response: await trello.updateList(list.id, { subscribed: !list.subscribed }),
      client: this.client, message, _ })) return;
    
    return message.channel.createMessage(
      _(list.subscribed ? 'user_mgmt.unsub_list' : 'user_mgmt.sub_list', list));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};