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