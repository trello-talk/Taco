const { Command } = require("faux-classes");

module.exports = class Info extends Command {
  get name() { return "info"; }
  get aliases() { return ["ℹ"]; }
  get permissions() { return ["embed"]; }

  emojiEmbedFallback(message, customEmojiId, fallback) {
    if (this.client.emojis.has(customEmojiId))
      return `${this.client.emojis.get(customEmojiId)}`;
    else return `${fallback}`;
  }
  async exec(message) {
    let servers = await this.client.serverCount();
    let embed = {
      color: this.client.config.embedColor,
      title: `Information about ${this.client.user.username}.`,
      description: "This bot is using [Faux](https://github.com/Snazzah/Faux)\n\n"
        + `**:computer: ${this.client.user.username} Version** ${this.client.pkg.version}\n`
        + `**:computer: Faux Version** ${this.client.FAUX_VER}\n`
        + `**:clock: Uptime**: ${process.uptime() ? process.uptime().toString().toHHMMSS() : "???"}\n`
        + `**:gear: Memory Usage**: ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB\n`
        + `**:file_cabinet: Servers**: ${servers.formatNumber()}\n\n`
        + `**:globe_with_meridians: Website**: ${this.client.config.website}\n`
        + `**${this.emojiEmbedFallback(message, "624184549001396225", ":blue_book:")} Trello Board**: ${this.client.config.trelloBoard}\n`
        + `**${this.emojiEmbedFallback(message, "625323800048828453", ":money_with_wings:")} Donate**: ${this.client.config.donate[0]}\n`,
      thumbnail: {
        url: this.client.config.iconURL
      }
    };
    message.channel.send("", { embed });
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Gets general info about the bot."
    };
  }
};
