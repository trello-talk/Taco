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

module.exports = class Me extends Command {
  get name() { return 'me'; }

  get _options() { return {
    aliases: ['mi', 'account', 'acct'],
    cooldown: 2,
    permissions: ['embed', 'auth'],
  }; }

  async exec(message, { _, trello, userData }) {
    const response = await trello.getMember(userData.trelloID);
    if (await trello.handleResponse({ response, client: this.client, message, _ })) return;
    if (response.status === 404) {
      await this.client.pg.models.get('user').removeAuth(message.author);
      return this.client.createMessage(message.channel.id, _('trello_response.unauthorized'));
    }

    const json = await response.json();

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', ':ballot_box_with_check:');
    const uncheckEmoji = emojiFallback('632444550115491910', ':white_large_square:');

    const embed = {
      author: {
        name: json.prefs.privacy.fullName !== 'public' ?
          json.username : `${Util.Escape.markdown(json.fullName)} (${json.username})`,
        icon_url: json.prefs.privacy.avatar !== 'public' ? null :
          (json.avatarUrl ? json.avatarUrl + '/170.png' : null),
        url: json.url
      },

      color: this.client.config.embedColor,
      description: `**${_('words.id')}:** \`${json.id}\`\n` +
        `**${_('words.initials')}:** ${json.initials}\n`,
      
      fields: [{
        // Counts
        name: '*' + _('words.count.many') + '*',
        value: `${_.toLocaleString(json.boards.length)} ${_.numSuffix('words.board', json.boards.length)}\n` +
          `${_.toLocaleString(json.idOrganizations.length)} ${
            _.numSuffix('words.orgs', json.idOrganizations.length)}`,
        inline: true
      }, {
        // Preferences
        name: '*' + _('words.pref.many') + '*',
        value: `**${_('trello.locale')}:** ${json.prefs.locale}\n\n` +
          `${json.prefs.colorBlind ? checkEmoji : uncheckEmoji} ${_('trello.colorblind')}\n` +
          `${json.prefs.sendSummaries ? checkEmoji : uncheckEmoji} ${_('trello.summ')}\n` +
          `${json.marketingOptIn.optedIn ? checkEmoji : uncheckEmoji} ${_('trello.marketing')}`,
        inline: true
      }]
    };

    // Products
    if (json.products.length) {
      const products = [];
      json.products.forEach(productID => {
        if (_.valid(`trello.products.${productID}`))
          products.push(_(`trello.products.${productID}`));
      });
      embed.fields.push({
        name: '*' + _.numSuffix('words.product', json.products.length) + '*',
        value: products.join('\n')
      });
    }

    // Bio
    if (json.bio)
      embed.fields.push({
        name: '*' + _('words.bio') + '*',
        value: Util.Escape.markdown(json.bio)
      });
    return this.client.createMessage(message.channel.id, { embed });
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};