const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Attachment extends Command {
  get name() { return 'attachment'; }

  get _options() { return {
    aliases: ['atch'],
    cooldown: 4,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    // Get all cards for search
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

    const card = await Util.Trello.findCard(args[0], boardJson, this.client, message, _);
    if (!card) return;

    // Get specific card data
    const cardHandle = await trello.handleResponse({
      response: await trello.getCard(card.id),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404)
      return message.channel.createMessage(_('cards.error'));

    const json = cardHandle.body;
    console.log(json.attachments);

    const attachment = await Util.Trello.findAttachment(args[1], json.attachments, this.client, message, _);
    if (!attachment) return;

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const embed = {
      title: Util.cutoffText(Util.Escape.markdown(attachment.name), 256),
      color: attachment.edgeColor ?
        (Util.Constants.LABEL_COLORS[attachment.edgeColor] || Util.toColorInt(attachment.edgeColor))
        : this.client.config.embedColor,
      url: attachment.url,
      description: `${
        json.idAttachmentCover === attachment.id ? checkEmoji : uncheckEmoji} ${_('attachments.is_cover')
      }\n` + `**${_('words.url')}:** ${attachment.url}`,
      image: attachment.url.startsWith(Util.Constants.IMAGE_ATTACHMENT_HOST) ? { url: attachment.url } : null
    };
    return message.channel.createMessage({ embed });
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};