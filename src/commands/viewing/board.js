/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Board extends Command {
  get name() { return 'board'; }

  get _options() { return {
    aliases: ['viewboard', 'boardinfo'],
    cooldown: 2,
    permissions: ['embed', 'auth', 'selectedBoard'],
  }; }

  async exec(message, { _, trello, userData }) {
    const response = await trello.getBoard(userData.currentBoard);
    if (await trello.handleResponse({ response, client: this.client, message, _ })) return;
    if (response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const json = await response.json();

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', ':ballot_box_with_check:');
    const uncheckEmoji = emojiFallback('632444550115491910', ':white_large_square:');

    const boardColor = json.prefs.backgroundTopColor ?
      parseInt(json.prefs.backgroundTopColor.slice(1), 16) : this.client.config.embedColor;
    const backgroundImg = json.prefs.backgroundImageScaled ?
      json.prefs.backgroundImageScaled.reverse()[1].url : null;
    const lastAct = _.moment(json.dateLastActivity);
    const archListCount = json.lists.filter(list => list.closed).length;
    const archCardCount = json.cards.filter(card => card.closed).length;

    const embed = {
      title: Util.Escape.markdown(json.name),
      url: json.shortUrl,
      color: boardColor,
      description: json.desc ? Util.Escape.markdown(json.desc) : undefined,
      image: backgroundImg ? { url: backgroundImg } : undefined,
      
      fields: [{
        // Information
        name: '*' + _('words.info') + '*',
        value: `**${_('words.id')}:** \`${json.id}\`\n` +
          `**${_('words.short_link.one')}:** \`${json.shortLink}\`\n` +
          `**${_('trello.last_act')}:** ${lastAct.format('LLLL')} *(${lastAct.fromNow()})*\n` +
          (json.organization ?
            `**${_('words.orgs.one')}:** [${
              Util.Escape.markdown(json.organization.displayName)}](https://trello.com/${json.organization.name})\n` : '') +
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

    return this.client.createMessage(message.channel.id, { embed });
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};