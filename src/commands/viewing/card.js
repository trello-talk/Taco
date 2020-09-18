const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Card extends Command {
  get name() { return 'card'; }

  get _options() { return {
    aliases: ['viewcard', 'vc'],
    cooldown: 4,
    permissions: ['embed', 'auth', 'selectedBoard']
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
    const list = boardJson.lists.find(list => list.id === card.idList);

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const due = json.due ? _.moment(json.due) : null;
    const lastAct = _.moment(json.dateLastActivity);
    const hasVoted = !!json.membersVoted.find(member => member.id === userData.trelloID);

    const embed = {
      title: Util.cutoffText(Util.Escape.markdown(json.name), 256),
      description: json.desc ? Util.cutoffText(json.desc, 2048) : undefined,
      color: this.client.config.embedColor,
      url: json.shortUrl,
      
      fields: [{
        // Information
        name: '*' + _('words.info') + '*',
        value: (json.closed ? `🗃️ **${_('words.arch_card.one')}**\n\n` : '') +
          `**${_('words.id')}:** \`${json.id}\`\n` +
          `**${_('words.short_link.one')}:** \`${json.shortLink}\`\n` +
          `**${_('words.list.one')}:** ${
            Util.cutoffText(Util.Escape.markdown(list.name), 25)} (\`${list.id}\`)\n` +
          `**${_('trello.last_act')}:** ${lastAct.format('LLLL')} *(${lastAct.fromNow()})*\n` +
          (json.due ? `**${_('trello.due')}:** ${json.dueComplete ? checkEmoji : uncheckEmoji} ${
            due.format('LLLL')} *(${due.fromNow()})*\n` : '') +
          `\n${json.subscribed ? checkEmoji : uncheckEmoji} ${_('trello.subbed')}\n` +
          (json.membersVoted.length ? `${hasVoted ? checkEmoji : uncheckEmoji} ${_('trello.voted')} (${
            _.toLocaleString(json.membersVoted.length)} ${
            _.numSuffix('words.vote_lower', json.membersVoted.length)})\n` : '')
      }]
    };

    // Cover
    if (json.cover) {
      embed.color = json.cover.edgeColor ?
        Util.toColorInt(json.cover.edgeColor) :
        (json.cover.color ? Util.Constants.LABEL_COLORS[json.cover.color] : this.client.config.embedColor);
      if (json.cover.scaled)
        embed.thumbnail = {
          url: json.cover.scaled.reverse()[json.cover.idAttachment ? 0 : 1].url };
    }

    // Labels
    if (json.labels.length) {
      const labels = Util.cutoffArray(
        json.labels.map(label => `${label.color ?
          `\`${_(`trello.label_color.${label.color}`)}\` ` :
          ''}${Util.cutoffText(Util.Escape.markdown(label.name), 50)}`),
        512, 1, 2);
      embed.fields.push({
        name: '*' + _.numSuffix('words.label', json.labels.length) + '*',
        value: labels.join(json.labels.length > 8 ? ', ' : '\n') + (labels.length !== json.labels.length ?
          `\n*${_('and_more', { count: _.toLocaleString(json.labels.length - labels.length) })}*` : ''),
        inline: true
      });
    }

    // Attachments
    if (json.attachments.length) {
      const attachments = Util.cutoffArray(
        json.attachments.map(atch =>
          `[${Util.cutoffText(Util.Escape.markdown(atch.name), 20)}](${atch.url})`),
        512, 1, 3);
      embed.fields.push({
        name: '*' + _.numSuffix('words.attachment', json.attachments.length) + '*',
        value: attachments.join(' - ') + (attachments.length !== json.attachments.length ?
          `\n*${_('and_more',
            { count: _.toLocaleString(json.attachments.length - attachments.length) })}*` : ''),
        inline: true
      });
    }

    // Stickers
    if (json.stickers.length && Util.CommandPermissions.emoji(this.client, message)) {
      const stickers = {};
      json.stickers.forEach(sticker => {
        if (stickers[sticker.image])
          stickers[sticker.image]++;
        else stickers[sticker.image] = 1;
      });
      embed.fields.push({
        name: '*' + _.numSuffix('words.sticker', json.stickers.length) + '*',
        value: Util.keyValueForEach(stickers, (key, value) =>
          `${Util.Constants.STICKER_EMOJIS[key] ? `<:_:${Util.Constants.STICKER_EMOJIS[key]}>` : key}${
            value > 1 ? ' ' + _.toLocaleString(value) : ''}`).join(', '),
        inline: true
      });
    }

    // Checklists
    if (json.checklists.length) {
      const checklists = Util.cutoffArray(
        json.checklists.map(checklist => {
          const completed = !checklist.checkItems.find(item => item.state === 'incomplete');
          return `${completed ? checkEmoji : uncheckEmoji} ${
            Util.cutoffText(Util.Escape.markdown(checklist.name), 50)} (${
            _.toLocaleString(checklist.checkItems.length)} ${
            _.numSuffix('words.item', checklist.checkItems.length)})`;
        }),
        256, 1, 1);
      embed.fields.push({
        name: '*' + _.numSuffix('words.checklist', json.checklists.length) + '*',
        value: checklists.join('\n') + (checklists.length !== json.checklists.length ?
          `\n*${_('and_more',
            { count: _.toLocaleString(json.checklists.length - checklists.length) })}*` : ''),
        inline: true
      });
    }

    // Members
    if (json.members.length) {
      const members = Util.cutoffArray(
        json.members.map(member => {
          const result = `${Util.cutoffText(Util.Escape.markdown(member.fullName),
            50)} (${member.username})`;
          return member.id === userData.trelloID ? `**${result}**` : result;
        }),
        256, 1, 1);
      embed.fields.push({
        name: '*' + _.numSuffix('words.member', json.members.length) + '*',
        value: members.join('\n') + (members.length !== json.members.length ?
          `\n*${_('and_more',
            { count: _.toLocaleString(json.members.length - members.length) })}*` : ''),
        inline: true
      });
    }

    return message.channel.createMessage({ embed });
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};