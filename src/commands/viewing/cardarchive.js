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
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class CardArchive extends Command {
  get name() { return 'cardarchive'; }

  get _options() { return {
    aliases: ['viewcardarchive', 'vca'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getCardsArchived(userData.currentBoard),
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
        _, header: _('cards.arch_header'), itemTitle: 'words.arch_card.many',
        display: (item) => `${item.subscribed ? '🔔 ' : ''}  ${
          Util.cutoffText(Util.Escape.markdown(item.name), 50)}`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else
      return message.channel.createMessage(_('cards.arch_none'));
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};