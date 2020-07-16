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

module.exports = class WatchCard extends Command {
  get name() { return 'watchcard'; }

  get _options() { return {
    aliases: ['subscribecard', 'subcard', 'wcard', 'wc'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
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

    const card = await Util.Trello.findCard(args.join(' '), boardJson, this.client, message, _);
    if (!card) return;

    if ((await trello.handleResponse({
      response: await trello.updateCard(card.id, { subscribed: !card.subscribed }),
      client: this.client, message, _ })).stop) return;
    
    return message.channel.createMessage(_(card.subscribed ? 'user_mgmt.unsub_card' : 'user_mgmt.sub_card', {
      name: Util.cutoffText(Util.Escape.markdown(card.name), 50),
      id: card.shortLink
    }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};