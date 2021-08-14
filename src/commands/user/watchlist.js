const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class WatchList extends Command {
  get name() { return 'watchlist'; }

  get _options() { return {
    aliases: ['subscribelist', 'sublist', 'wlist', 'wl'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getAllLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;

    const list = await Util.Trello.findList(args.join(' '), json, this.client, message, _);
    if (!list) return;

    if ((await trello.handleResponse({
      response: await trello.updateList(list.id, { subscribed: !list.subscribed }),
      client: this.client, message, _ })).stop) return;
    
    return message.channel.createMessage(
      _(list.subscribed ? 'user_mgmt.unsub_list' : 'user_mgmt.sub_list', {
        name: Util.cutoffText(Util.Escape.markdown(list.name), 50),
        id: list.id
      }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};