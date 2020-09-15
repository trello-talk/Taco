const Command = require('../../structures/Command');
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class Labels extends Command {
  get name() { return 'labels'; }

  get _options() { return {
    aliases: ['viewlabels', 'vlbs'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getLabels(userData.currentBoard),
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
        _, itemTitle: 'words.label.many',
        display: (item) => `*\`ID: ${item.id}\`* ${
          Util.cutoffText(Util.Escape.markdown(item.name), 25)}${item.color ?
          ` \`${_(`trello.label_color.${item.color}`)}\` ` :
          ''}`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else
      return message.channel.createMessage(_('labels.none'));
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};