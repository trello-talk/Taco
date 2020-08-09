const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Board extends Command {
  get name() { return 'board'; }

  get _options() { return {
    aliases: ['viewboard', 'boardinfo', 'vb'],
    cooldown: 2,
    permissions: ['embed', 'auth', 'selectedBoard'],
  }; }

  async exec(message, { _, trello, userData }) {
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

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const boardColor = json.prefs.backgroundTopColor ?
      parseInt(json.prefs.backgroundTopColor.slice(1), 16) : this.client.config.embedColor;
    const backgroundImg = json.prefs.backgroundImageScaled ?
      json.prefs.backgroundImageScaled.reverse()[1].url : null;
    const lastAct = _.moment(json.dateLastActivity);
    const archListCount = json.lists.filter(list => list.closed).length;
    const archCardCount = json.cards.filter(card => card.closed).length;

    const embed = {
      title: Util.cutoffText(Util.Escape.markdown(json.name), 256),
      url: json.shortUrl,
      color: boardColor,
      description: json.desc ? Util.cutoffText(Util.Escape.markdown(json.desc), 2048) : undefined,
      image: backgroundImg ? { url: backgroundImg } : undefined,
      
      fields: [{
        // Information
        name: '*' + _('words.info') + '*',
        value: (json.closed ? `🗃️ **${_('words.arch_board.one')}**\n\n` : '') +
          `**${_('words.id')}:** \`${json.id}\`\n` +
          `**${_('words.short_link.one')}:** \`${json.shortLink}\`\n` +
          (json.dateLastActivity ?
            `**${_('trello.last_act')}:** ${lastAct.format('LLLL')} *(${lastAct.fromNow()})*\n` : '') +
          (json.organization ?
            `**${_('words.orgs.one')}:** [${
              Util.cutoffText(Util.Escape.markdown(json.organization.displayName), 50)
            }](https://trello.com/${json.organization.name})\n` : '') +
          (json.prefs.backgroundImageScaled ?
            `**${_('words.bg_img')}:** [${_('words.link.one')}](${backgroundImg})\n` : '')
      }, {
        // Counts
        name: '*' + _('words.count.many') + '*',
        value: `${_.toLocaleString(json.members.length)} ${
          _.numSuffix('words.member', json.members.length)}\n` +
          `${_.toLocaleString(json.lists.length)} ${_.numSuffix('words.list', json.lists.length)} (${
            _.toLocaleString(archListCount)} ${_('trello.archived_lower')})\n` +
          `${_.toLocaleString(json.cards.length)} ${_.numSuffix('words.card', json.cards.length)} (${
            _.toLocaleString(archCardCount)} ${_('trello.archived_lower')})\n` +
          `${_.toLocaleString(json.labels.length)} ${_.numSuffix('words.label', json.labels.length)}\n`,
        inline: true
      }, {
        // Preferences
        name: '*' + _('words.pref.many') + '*',
        value:`**${_('words.visibility')}:** ${_(`trello.perm_levels.${json.prefs.permissionLevel}`)}\n` +
          `**${_('words.comment.many')}:** ${_(`trello.comment_perms.${json.prefs.comments}`)}\n` +
          `**${_('trello.add_rem_members')}:** ${_(`trello.invite_perms.${json.prefs.invitations}`)}\n` +
          `**${_('trello.voting')}:** ${_(`trello.vote_perms.${json.prefs.voting}`)}\n` +
          `\n${json.prefs.cardCovers ? checkEmoji : uncheckEmoji} ${_('trello.card_covers')}\n` +
          `${json.prefs.isTemplate ? checkEmoji : uncheckEmoji} ${_('trello.template')}\n` +
          `${json.prefs.hideVotes ? checkEmoji : uncheckEmoji} ${_('trello.hide_votes')}\n` +
          (json.prefs.permissionLevel === 'org' ?
            `${json.prefs.selfJoin ? checkEmoji : uncheckEmoji} ${_('trello.self_join')}\n` : ''),
        inline: true
      }, {
        // User Preferences
        name: '*' + _('words.user_pref.many') + '*',
        value: `${json.starred ? checkEmoji : uncheckEmoji} ${_('trello.starred')}\n` +
          `${json.subscribed ? checkEmoji : uncheckEmoji} ${_('trello.subbed')}\n` +
          `${json.pinned ? checkEmoji : uncheckEmoji} ${_('trello.pinned')}`,
        inline: true
      }]
    };

    return message.channel.createMessage({ embed });
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};