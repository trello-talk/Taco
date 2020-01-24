/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Yamboy1 (and contributors) 2019 - 2020
 
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

const { Command } = require("faux-classes");

module.exports = class Info extends Command {
  get name() { return "info"; }
  get aliases() { return ["ℹ"]; }
  get permissions() { return ["embed"]; }

  emojiEmbedFallback(message, customEmojiId, fallback) {
    if (this.client.emoji(message) && this.client.emojis.has(customEmojiId))
      return `${this.client.emojis.get(customEmojiId)}`;
    else return `${fallback}`;
  }
  async exec(message) {
    let servers = await this.client.serverCount();
    let hasWebsite = !!this.client.config.website;
    let hasTrelloBoard = this.client.config.trelloBoard;
    let hasDonationLinks = Array.isArray(this.client.config.donate) && this.client.config.donate[0];
    let embed = {
      color: this.client.config.embedColor,
      title: `Information about ${this.client.user.username}.`,
      description: "This bot is using [Faux](https://github.com/Snazzah/Faux)\n\n"
        + `**:computer: ${this.client.user.username} Version** ${this.client.pkg.version}\n`
        + `**:computer: Faux Version** ${this.client.FAUX_VER}\n`
        + `**:clock: Uptime**: ${process.uptime() ? process.uptime().toString().toHHMMSS() : "???"}\n`
        + `**:gear: Memory Usage**: ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB\n`
        + `**:file_cabinet: Servers**: ${servers.formatNumber()}\n\n`
        + (hasWebsite ? `**:globe_with_meridians: Website**: ${this.client.config.website}\n` : "")
        + (hasTrelloBoard ? `**${this.emojiEmbedFallback(message, "624184549001396225", ":blue_book:")} Trello Board**: ${this.client.config.trelloBoard}\n` : "")
        + (hasDonationLinks ? `**${this.emojiEmbedFallback(message, "625323800048828453", ":money_with_wings:")} Donate**: ${this.client.config.donate[0]}\n` : ""),
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
