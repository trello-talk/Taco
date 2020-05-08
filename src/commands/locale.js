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

const Command = require('../structures/Command');
const GenericPrompt = require('../structures/GenericPrompt');
const GenericPager = require('../structures/GenericPager');
const Util = require('../util');

module.exports = class Locale extends Command {
  get name() { return 'locale'; }

  get _options() { return {
    aliases: ['l', 'lang', 'locales'],
    cooldown: 0,
  }; }

  async findLocale(query, localePairs, message, _) {
    const foundLocale = localePairs.find(locale => locale[0] === query);
    if (foundLocale) return foundLocale;
    else {
      const prompter = new GenericPrompt(this.client, message, {
        items: localePairs, itemTitle: 'locale.start',
        header: _('locale.choose'),
        display: locale => {
          if (locale[0] === 'unset')
            return `\`unset\` ${_('locale.unset_l')}`;
          else return this.formatLine(...locale);
        },
        _
      });
      const promptResult = await prompter.search(query,
        { channelID: message.channel.id, userID: message.author.id }, '[1]._.name');
      if (promptResult && promptResult._noresults) {
        await message.channel.createMessage(_('prompt.no_search'));
        return;
      } else
        return promptResult;
    }
  }

  formatLine(locale, json) {
    const sourceLines = Object.keys(Util.flattenObject(this.client.locale.source)).length;
    const jsonLines = Object.keys(Util.flattenObject(json)).length;
    return `${
      json._.emoji.startsWith('$') ? `:${json._.emoji.slice(1)}:` : `:flag_${json._.emoji}:`
    } \`${locale}\` ${json._.name} \`${((jsonLines / sourceLines) * 100).toFixed(2)}%\``;
  }

  async exec(message, { args, _, userData, serverData }) {
    const lines = [];
    this.client.locale.locales.forEach((json, locale) => {
      const line = this.formatLine(locale, json);
      lines.push(_.locale === locale ? `**${line}**` : line);
    });

    const userLocale = userData && userData.locale ?
      (this.client.locale.locales.get(userData.locale) || null) : null;
    const serverLocale = serverData && serverData.locale ?
      (this.client.locale.locales.get(serverData.locale) || null) : null;
    const localeArray = [...this.client.locale.array(), ['unset', null]];
    let paginator, locale, _n = _;
    switch (args[0] ? args[0].toLowerCase() : null) {
    case 'setuser':
    case 'set':
    case 'su':
    case 's':
      locale = await this.findLocale(args[1], localeArray, message, _);
      if (!locale) return;
      if (!userData)
        await this.client.pg.models.get('user').get(message.author);
      await this.client.pg.models.get('user').update({ locale: locale[1] ? locale[0] : null },
        { where: { userID: message.author.id } });
      if (locale[1])
        _n = this.client.locale.createModule(locale[0], _.prefixes);
      return this.client.createMessage(message.channel.id, _n(
        locale[1] ? 'locale.user_set' : 'locale.user_unset', {
          name: locale[1] ? locale[1]._.name : null
        }));
    case 'setserver':
    case 'ss':
      if (!message.guildID)
        return this.client.createMessage(message.channel.id, _('locale.no_guild'));
      if (!Util.CommandPermissions.trelloRole(this.client, message))
        return this.client.createMessage(message.channel.id, _('command_permissions.trelloRole'));
      locale = await this.findLocale(args[1], localeArray, message, _);
      if (!locale) return;
      if (!serverData)
        await this.client.pg.models.get('server').get(message.channel.guild);
      await this.client.pg.models.get('server').update({ locale: locale[1] ? locale[0] : null },
        { where: { serverID: message.guildID } });
      if (locale[1])
        _n = this.client.locale.createModule(locale[0], _.prefixes);
      return this.client.createMessage(message.channel.id, _n(
        locale[1] ? 'locale.server_set' : 'locale.server_unset', {
          name: locale[1] ? locale[1]._.name : null
        }));
    default:
      paginator = new GenericPager(this.client, message, {
        items: lines,
        itemTitle: 'locale.start',
        _, header: _('locale.user_locale', {
          locale: userLocale ? userLocale._.name : '*' + _('locale.unset') + '*'
        }) + '\n' + (message.guildID ? _('locale.server_locale', {
          locale: serverLocale ? serverLocale._.name : '*' + _('locale.unset') + '*'
        }) + '\n' : '') +
          '\n' + _('locale.header')
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    }
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
