const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class AddCard extends Command {
  get name() { return 'addcard'; }

  get _options() { return {
    aliases: ['createcard', 'ccard', 'acard', 'cc', 'ac', '+card', '+c'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getAllLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;
    const list = await Util.Trello.findList(args[0], json, this.client, message, _);
    if (!list) return;

    // Get card title
    const input = args[1] || await this.client.messageAwaiter.getInput(message, _, {
      header: _('cards.input_new')
    });
    if (!input) return;

    // Get new card
    const cardResponse = await trello.handleResponse({
      response: await trello.addCard(list.id, { name: input }),
      client: this.client, message, _ });
    if (cardResponse.stop) return;
    const card = cardResponse.body;
    return message.channel.createMessage(_('cards.created', {
      name: Util.cutoffText(Util.Escape.markdown(card.name || input), 50),
      id: card.shortLink
    }));
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};