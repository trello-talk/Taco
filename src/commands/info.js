const Command = require('../structures/Command');
const Util = require('../util');

module.exports = class Info extends Command {
  get name() { return 'info'; }

  get _options() { return {
    aliases: [
      'i', 'bot', 'information', // English
      'bilgi', // Turkish
      'informacion' // Spanish
    ],
    permissions: ['embed'],
    cooldown: 0,
  }; }

  async exec(message, { _ }) {
    const servers = this.client.guilds.size;
    const hasWebsite = !!this.client.config.website;
    const hasTrelloBoard = this.client.config.trelloBoard;
    const hasDonationLinks = Array.isArray(this.client.config.donate) && this.client.config.donate[0];

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const boardEmoji = emojiFallback('624184549001396225', ':blue_book:');
    const donateEmoji = emojiFallback('625323800048828453', ':money_with_wings:');
    const embed = {
      color: this.client.config.embedColor,
      title: _('info.title', { username: this.client.user.username }),
      description: _('info.faux') + '\n\n'
        + `**:computer: ${this.client.user.username} ${_('words.version')}** ${this.client.pkg.version}\n`

        + `**:clock: ${_('words.uptime')}**: ${
          process.uptime() ? Util.toHHMMSS(process.uptime().toString()) : '???'}\n`

        + `**:gear: ${_('words.mem_usage')}**: ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB\n`

        + `**:file_cabinet: ${_.numSuffix('words.server', servers)}**: ${_.toLocaleString(servers)}\n\n`

        + (hasWebsite ? `**:globe_with_meridians: ${_('words.website.one')}**: ${
          this.client.config.website}\n` : '')

        + (hasTrelloBoard ? `**${boardEmoji} ${_('words.trello_board.one')}**: ${
          this.client.config.trelloBoard}\n` : '')

        + (hasDonationLinks ? `**${donateEmoji} ${_('words.donate')}**: ${
          this.client.config.donate[0]}\n` : ''),
      thumbnail: {
        url: this.client.user.dynamicAvatarURL('png', 1024)
      }
    };
    return message.channel.createMessage({ embed });
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
