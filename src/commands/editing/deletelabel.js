const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class DeleteLabel extends Command {
  get name() { return 'deletelabel'; }

  get _options() { return {
    aliases: ['dlabel', 'dlb', 'removelabel', 'rlabel', 'rlb', '-lb'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getLabels(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;
    const label = await Util.Trello.findLabel(args[0], json, this.client, message, _);
    if (!label) return;
    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('labels.remove_confirm', {
        name: Util.cutoffText(Util.Escape.markdown(label.name), 50),
        id: label.id
      })
    })) {
      if ((await trello.handleResponse({
        response: await trello.deleteLabel(label.id),
        client: this.client, message, _ })).stop) return;
      return message.channel.createMessage(_('labels.removed', {
        name: Util.cutoffText(Util.Escape.markdown(label.name), 50),
        id: label.id
      }));
    }
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};