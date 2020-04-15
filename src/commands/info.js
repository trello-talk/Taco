const Command = require('../structures/Command');
const Util = require('../util');

module.exports = class Info extends Command {
  get name() { return 'info'; }

  get _options() { return {
    aliases: ['i'],
    cooldown: 0,
  }; }

  canUseEmojis(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('externalEmojis');
  }

  emojiEmbedFallback(message, customEmojiId, fallback) {
    if (this.canUseEmojis(message) && this.client.guilds.has('617911034555924502')) {
      const emoji = this.client.guilds.get('617911034555924502').emojis.find(e => e.id == customEmojiId);
      return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    } else return fallback;
  }

  canEmbed(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('embedLinks');
  }

  async exec(message) {
    if(!this.canEmbed(message))
      return this.client.createMessage(message.channel.id, 'I need to be able to embed links in order to display bot information!');

    let servers = this.client.guilds.size;
    let hasWebsite = !!this.client.config.website;
    let hasTrelloBoard = this.client.config.trelloBoard;
    let hasDonationLinks = Array.isArray(this.client.config.donate) && this.client.config.donate[0];
    let embed = {
      color: this.client.config.embedColor,
      title: `Information about ${this.client.user.username}.`,
      description: "This bot is using a modified version of [Faux](https://github.com/Snazzah/Faux)\n\n"
        + `**:computer: ${this.client.user.username} Version** ${this.client.pkg.version}\n`
        + `**:clock: Uptime**: ${process.uptime() ? Util.toHHMMSS(process.uptime().toString()) : "???"}\n`
        + `**:gear: Memory Usage**: ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB\n`
        + `**:file_cabinet: Servers**: ${Util.toHHMMSS(servers)}\n\n`
        + (hasWebsite ? `**:globe_with_meridians: Website**: ${this.client.config.website}\n` : "")
        + (hasTrelloBoard ? `**${this.emojiEmbedFallback(message, "624184549001396225", ":blue_book:")} Trello Board**: ${this.client.config.trelloBoard}\n` : "")
        + (hasDonationLinks ? `**${this.emojiEmbedFallback(message, "625323800048828453", ":money_with_wings:")} Donate**: ${this.client.config.donate[0]}\n` : ""),
      thumbnail: {
        url: this.client.config.iconURL
      }
    };
    return this.client.createMessage(message.channel.id, { embed });
  }

  get metadata() { return {
    category: 'General',
    description: 'Get information about the bot.',
  }; }
};
