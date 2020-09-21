const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class AddLabel extends Command {
  get name() { return 'addlabel'; }

  get _options() { return {
    aliases: ['alabel', 'alb', 'createlabel', 'clabel', '+label'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (Util.Trello.cannotUseBoard(handle)) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const json = handle.body;

    // Get label title
    const input = args.join(' ') || await this.client.messageAwaiter.getInput(message, _, {
      header: _('labels.input_new')
    });
    if (!input) return;

    // Get new label
    const labelResponse = await trello.handleResponse({
      response: await trello.addLabel(json.id, { name: input }),
      client: this.client, message, _ });
    if (labelResponse.stop) return;
    const label = labelResponse.body;
    return message.channel.createMessage(_('labels.created', {
      name: Util.cutoffText(Util.Escape.markdown(label.name), 50),
      id: label.id
    }));

  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};