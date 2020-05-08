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
const path = require('path');

module.exports = class Card extends Command {
  get name() { return 'card'; }

  get _options() { return {
    aliases: ['viewcard', 'vc'],
    cooldown: 2,
    permissions: ['embed', 'auth', 'selectedBoard'],
    minimumArgs: 1
  }; }

  get stickerMap() {
    return {
      thumbsup: '632444552845852682',
      thumbsdown: '632444552845721602',
      heart: '632444546650996746',
      star: '632444550597574666',
      clock: '632444546348744717',
      huh: '632444546583887873',
      rocketship: '632444552942452736',
      warning: '632444552837595146',
      smile: '632444553051504640',
      laugh: '632444546428436492',
      frown: '632444546634219520',
      check: '632444546684551183',

      'pete-alert': '632444547086942217',
      'pete-award': '632444547154051118',
      'pete-broken': '632444552518828033',
      'pete-busy': '632444553441443882',
      'pete-completed': '632444550018891777',
      'pete-confused': '632444550337527818',
      'pete-ghost': '632444553101705217',
      'pete-happy': '632444550337658890',
      'pete-love': '632444550413156363',
      'pete-music': '632444553239986176',
      'pete-shipped': '632444550362693642',
      'pete-sketch': '632444555668619274',
      'pete-space': '632444553311289354',
      'pete-talk': '632444553324134420',
      'pete-vacation': '632444553349169162',

      'taco-active': '632444556264210439',
      'taco-alert': '632444556276924437',
      'taco-angry': '632444553412083742',
      'taco-celebrate': '632444557920829450',
      'taco-clean': '632444555760762894',
      'taco-confused': '632444555911888898',
      'taco-cool': '632444553714204672',
      'taco-embarrassed': '632444553625993216',
      'taco-love': '632444556352421898',
      'taco-money': '632444555911757834',
      'taco-pixel': '632444550069223437',
      'taco-proto': '632444556192776205',
      'taco-reading': '632444553819062282',
      'taco-robot': '632444553810411559',
      'taco-sleeping': '632444556092112927',
      'taco-trophy': '632444556025135124'
    };
  }

  async exec(message, { args, _, trello, userData }) {
    // Get all cards for search
    const handle = await trello.handleResponse({
      response: await trello.getSlimBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
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
      return this.client.createMessage(message.channel.id, _('cards.error'));

    const json = cardHandle.body;
    const list = boardJson.lists.find(list => list.id === card.idList);

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', ':ballot_box_with_check:');
    const uncheckEmoji = emojiFallback('632444550115491910', ':white_large_square:');

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
    if (json.cover.scaled) {
      embed.color = json.cover.edgeColor ?
        parseInt(json.cover.edgeColor.slice(1), 16) : this.client.config.embedColor;
      embed.thumbnail = { url: json.cover.scaled.reverse()[0].url };
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
        json.attachments.map(atch => {
          const filename = path.parse(atch.url).base;
          return `[${Util.cutoffText(filename, 50)}](${atch.url})`;
        }),
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
          `${this.stickerMap[key] ? `<:_:${this.stickerMap[key]}>` : key}${
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