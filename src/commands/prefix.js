const prisma = require('../prisma');
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
    const serverPrefix = serverData ? serverData.prefix : this.client.config.prefix;
    const userPrefixes = userData ? userData.prefixes : [];
    const canUse = 5 - userPrefixes.length;
    let embed, prefix = args[1] || null;
    switch (args[0] ? args[0].toLowerCase() : null) {
    case 'setserver':
    case 'ss':
    case 'set':
    case 's':
      if (!message.guildID)
        return message.channel.createMessage(_('locale.no_guild'));
      if (!Util.CommandPermissions.trelloRole(this.client, message))
        return message.channel.createMessage(_('command_permissions.trelloRole'));
      if (!prefix)
        return message.channel.createMessage(_('prefix.no_arg_server'));
      if (serverPrefix.toLowerCase() === prefix.toLowerCase())
        return message.channel.createMessage(_('prefix.already'));
      if (await this.checkPrefix(prefix, message, prefixUsed, _)) return;
      await prisma.server.upsert({
        where: { serverID: message.guildID },
        create: {
          serverID: message.guildID,
          maxWebhooks: 5,
          prefix,
          locale: this.client.config.sourceLocale
        },
        update: { prefix }
      });
      return message.channel.createMessage(_('prefix.set_server', { prefix }));
    case 'add':
    case 'a':
      if (!prefix)
        return message.channel.createMessage(_('prefix.no_arg'));
      if (userPrefixes.map(p => p.toLowerCase()).includes(prefix.toLowerCase()))
        return message.channel.createMessage(_('prefix.already'));
      if (canUse <= 0 && !Util.CommandPermissions.elevated(this.client, message))
        return message.channel.createMessage(_('prefix.limit'));
      if (await this.checkPrefix(prefix, message, prefixUsed, _)) return;
      await prisma.user.upsert({
        where: { userID: message.author.id },
        create: {
          userID: message.author.id,
          prefixes: { set: [prefix] }
        },
        update: {
          prefixes: { push: prefix }
        }
      });
      return message.channel.createMessage(_('prefix.added', { prefix }));
    case 'remove':
    case 'r':
    case 'delete':
    case 'd':
      if (!userData || userData && !userData.prefixes.length)
        return message.channel.createMessage(_('prefix.none'));
      prefix = await this.findPrefix(args[1] || '', userPrefixes, message, _);
      if (!prefix) return;
      await prisma.user.update({
        where: { userID: message.author.id },
        data: {
          prefixes: { set: userData.prefixes.filter((p) => p != prefix) }
        }
      });
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
