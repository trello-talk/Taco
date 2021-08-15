const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Comment extends Command {
  get name() { return 'comment'; }

  get _options() { return {
    aliases: ['com'],
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

    
    const input = args[1] || await this.client.messageAwaiter.getInput(message, _, {
      header: _('cards.input_desc')
    });
    if (!input) return;
    if ((await trello.handleResponse({
      response: await trello.addComment(card.id, input),
      client: this.client, message, _ })).stop) return;
    return message.channel.createMessage(_('cards.commented', {
      name: Util.cutoffText(Util.Escape.markdown(card.name), 50)
    }));
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};