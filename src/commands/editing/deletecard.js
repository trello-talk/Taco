const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class DeleteCard extends Command {
  get name() { return 'deletecard'; }

  get _options() { return {
    aliases: ['dcard', 'dc', 'removecard', 'rcard', 'rc', '-c'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    // Get all cards for search
    const handle = await trello.handleResponse({
      response: await trello.getSlimBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const boardJson = handle.body;

    const card = await Util.Trello.findCard(args[0], boardJson, this.client, message, _);
    if (!card) return;
    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('cards.remove_confirm', {
        name: Util.cutoffText(Util.Escape.markdown(card.name), 50),
        id: card.shortLink
      })
    })) {
      if ((await trello.handleResponse({
        response: await trello.deleteCard(card.id),
        client: this.client, message, _ })).stop) return;
      return message.channel.createMessage(_('cards.removed', {
        name: Util.cutoffText(Util.Escape.markdown(card.name), 50),
        id: card.shortLink
      }));
    }
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};