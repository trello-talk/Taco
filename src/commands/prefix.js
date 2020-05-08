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
const Util = require('../util');

module.exports = class Prefix extends Command {
  get name() { return 'prefix'; }

  get _options() { return {
    aliases: ['pr'],
    permissions: ['embed'],
    cooldown: 0,
  }; }

  async findPrefix(query, prefixes, message, _) {
    const foundPrefix = prefixes.find(prefix => prefix.toLowerCase() === query.toLowerCase());
    if (foundPrefix) return foundPrefix;
    else {
      const prompter = new GenericPrompt(this.client, message, {
        items: prefixes, itemTitle: 'words.prefix.many',
        header: _('prefix.choose'),
        display: prefix => `\`${prefix}\``,
        _
      });
      const promptResult = await prompter.search(query,
        { channelID: message.channel.id, userID: message.author.id }, null);
      if (promptResult && promptResult._noresults) {
        await message.channel.createMessage(_('prompt.no_search'));
        return;
      } else
        return promptResult;
    }
  }

  async checkPrefix(prefix, message, prefixUsed, _) {
    if (prefix.length > 32) {
      await message.channel.createMessage(_('prefix.char_limit'));
      return true;
    } else if (message.mentions.length || message.mentionEveryone ||
      message.channelMentions.length || message.roleMentions.length) {
      if (Util.Regex.userMention.test(prefixUsed.raw) && !Util.Regex.userMention.test(prefix))
        return false;
      await message.channel.createMessage(_('prefix.mention'));
      return true;
    }
  }

  async exec(message, { args, _, userData, serverData, prefixUsed }) {
    const serverPrefix = serverData ? serverData.prefix : this.client.config.prefixes[0];
    const userPrefixes = userData ? userData.prefixes : [];
    const canUse = 5 - userPrefixes.length;
    let embed, prefix = args[1] || null;
    switch (args[0]) {
    case 'setserver':
    case 'ss':
    case 'set':
    case 's':
      if (!message.guildID)
        return this.client.createMessage(message.channel.id, _('locale.no_guild'));
      if (!Util.CommandPermissions.trelloRole(this.client, message))
        return this.client.createMessage(message.channel.id, _('command_permissions.trelloRole'));
      if (!prefix)
        return this.client.createMessage(message.channel.id, _('prefix.no_arg_server'));
      if (serverPrefix.toLowerCase() === prefix.toLowerCase())
        return this.client.createMessage(message.channel.id, _('prefix.already'));
      if (await this.checkPrefix(prefix, message, prefixUsed, _)) return;
      if (!serverData)
        await this.client.pg.models.get('server').get(message.channel.guild);
      await this.client.pg.models.get('server').update({ prefix },
        { where: { serverID: message.guildID } });
      return message.channel.createMessage(_('prefix.set_server', { prefix }));
    case 'add':
    case 'a':
      if (!prefix)
        return this.client.createMessage(message.channel.id, _('prefix.no_arg'));
      if (userPrefixes.map(p => p.toLowerCase()).includes(prefix.toLowerCase()))
        return this.client.createMessage(message.channel.id, _('prefix.already'));
      if (canUse <= 0 && !Util.CommandPermissions.elevated(this.client, message))
        return this.client.createMessage(message.channel.id, _('prefix.limit'));
      if (await this.checkPrefix(prefix, message, prefixUsed, _)) return;
      if (!userData)
        await this.client.pg.models.get('user').get(message.author);
      await this.client.pg.models.get('user').addToArray(message.author, 'prefixes', prefix);
      return message.channel.createMessage(_('prefix.added', { prefix }));
    case 'remove':
    case 'r':
    case 'delete':
    case 'd':
      if (!userData || userData && !userData.prefixes.length)
        return this.client.createMessage(message.channel.id, _('prefix.none'));
      prefix = await this.findPrefix(args[1], userPrefixes, message, _);
      if (!prefix) return;
      await this.client.pg.models.get('user').removeFromArray(message.author, 'prefixes', prefix);
      return message.channel.createMessage(_('prefix.removed', { prefix }));
    default:
      embed = {
        title: _('words.prefix.many'),
        color: this.client.config.embedColor,
        description: (message.guildID ? `**${_('prefix.server')}:** \`${serverPrefix}\`\n\n` : '') +
          `- <@${this.client.user.id}> 🔒\n` + userPrefixes.map(prefix => `- \`${prefix}\``).join('\n') +
          '\n\n' + _.numSuffix('prefix.can_add', canUse, { count: canUse }) +
          '\n' + _('prefix.footer')
      };

      return message.channel.createMessage({ embed });
    }
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
