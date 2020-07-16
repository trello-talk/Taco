/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
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
    if (Util.Trello.cannotUseBoard(handle)) {
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