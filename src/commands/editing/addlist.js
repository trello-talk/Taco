const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class AddList extends Command {
  get name() { return 'addlist'; }

  get _options() { return {
    aliases: ['alist', 'al', 'createlist', 'clist', '+l'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;

    // Get list title
    const input = args.join(' ') || await this.client.messageAwaiter.getInput(message, _, {
      header: _('lists.input_new')
    });
    if (!input) return;

    // Get new list
    const listResponse = await trello.handleResponse({
      response: await trello.addList(json.id, input),
      client: this.client, message, _ });
    if (listResponse.stop) return;
    const list = listResponse.body;
    return message.channel.createMessage(_('lists.created', {
      name: Util.cutoffText(Util.Escape.markdown(list.name), 50),
      id: list.id
    }));

  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};