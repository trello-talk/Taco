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

module.exports = class RenameCard extends Command {

  get name() { return "renamecard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["editcardname"]; }
  get argRequirement() { return 2; }

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
      await this.client.trello.set.card.name(user.trelloToken, args[0], args.slice(1).join(" "));
      message.reply(`Renamed card "${bid.name}" \`(${args[0]})\` to "${args.slice(1).join(" ")}".`);
    } else {
      message.reply("Uh-Oh! Either that card ID is non-existent or it's not on the selected board!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Renames a card.",
      usage: ["<cardID> <name>"]
    };
  }
};
