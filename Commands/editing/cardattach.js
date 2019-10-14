/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah ???-2019
 Copyright (c) Yamboy1 (and contributors) 2019

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

module.exports = class CardAttach extends Command {

  get name() { return "cardattach"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["attachfile", "addattachment", "+attachment", "+file", "addfile"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current);
    let bid = undefined;
    Object.keys(body).map((board) => {
      board = body[board];
      if (board.shortLink == args[0]) {
        bid = board;
        bid.id = args[0];
      }
    });
    if (bid !== undefined) {
      let url = null;
      if (message.attachments.array().length > 0) {
        url = message.attachments.array()[0].url;
      }
      if (!args[1] && !url) {
        message.reply("You must supply an attachment or a URL.");
      } else if (!url) {
        if (args[1].match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)) {
          url = args[1];
        } else {
          message.reply("Invalid URL! URL must contain HTTP or HTTPS.");
        }
      }
      if (url) {
        await this.client.trello.add.attachment(user.trelloToken, args[0], url).then(() => {
          message.reply(`Added an attachment to card "${bid.name}". \`(${args[0]})\``);
        });
      }
    } else {
      message.reply("Uh-Oh! Either that card ID is non-existent or it's not on the selected board!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Adds an attachment to a card. Uses URLs and attachments with the message.",
      usage: ["<cardID> [url]"]
    };
  }
};
