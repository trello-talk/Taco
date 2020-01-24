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

module.exports = class Card extends Command {

  get name() { return "card"; }
  get cooldown() { return 2; }
  get argRequirement() { return 1; }
  get permissions() { return ["auth"]; }

  async exec(message, args, { user }) {
    let body = null;
    try {
      body = await this.client.trello.get.card(user.trelloToken, args[0]);
    } catch (e) {
      if (e.response && e.response.text == "invalid id") {
        return message.reply("That ID is invalid!");
      }
    }
    let util = this.client.util;
    let layout = util.layout;
    let embed = {
      color: this.client.config.embedColor,
      url: body.shortUrl,
      description: "**Board**: [" + body.board.name + "](" + body.board.shortUrl + ")",
      author: {
        name: body.name,
        icon_url: this.client.config.icon_url
      },
      fields: []
    };
    let l = "",
      d = "",
      a = "",
      m = "",
      v = "",
      u = "",
      s = "";
    if (body.labels.length > 0) {
      l = "\n" + layout.cardLabels(body.labels).join(" ") + "\n";
      embed.fields.push({
        name: "Labels",
        value: layout.cardLabelsEmbed(body.labels).join("\n"),
        inline: true
      });
    }
    if (body.desc != "") {
      d = "\n**Description**: " + body.desc;
      embed.description += "\n" + body.desc;
    }
    if (body.attachments.length > 0) {
      a = "\n**Attachments**: " + layout.attachments(body.attachments).join(", ");
      embed.fields.push({
        name: "Attachments",
        value: body.attachments.map(a => `[${a.id}](${a.url})`).join(", "),
        inline: true
      });
    }
    if (body.members.length > 0) {
      let memberString = layout.members(body.members).join(", ");
      if (memberString.length > 50) {
        memberString = body.members.length + " Members";
      }
      m = "\nMembers: " + memberString;
      embed.fields.push({
        name: "Members",
        value: memberString,
        inline: true
      });
    }
    if (body.membersVoted.length > 0) {
      let memberVoteString = layout.members(body.membersVoted).join(", ");
      if (memberVoteString.length > 50) {
        memberVoteString = body.membersVoted.length + " Members";
      }
      v = "\nMembers Voted: " + memberVoteString;
      embed.fields.push({
        name: "Members Voted",
        value: memberVoteString,
        inline: true
      });
    }
    if (body.due != null) {
      u = "\nDue: " + new Date(body.due).toUTCString();
      embed.fields.push({
        name: "Due Date",
        value: new Date(body.due).toUTCString(),
        inline: true
      });
    }
    if (body.stickers.length > 0 && this.client.emoji(message)) {
      s = body.stickers.map(s => util.StickerEmojis[s.image]).join("");
      embed.fields.push({
        name: "Stickers",
        value: s,
        inline: true
      });
    }
    if (this.client.embed(message)) {
      message.channel.send("", { embed: embed });
    } else {
      msg = "```md\n" + body.name + l + m + v + u + "```" + s + "\n**Link**: <" + body.shortUrl + ">" + a + d;
      message.channel.send(msg);
    }
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Shows info about that card.",
      usage: ["<cardID>"]
    };
  }
};
