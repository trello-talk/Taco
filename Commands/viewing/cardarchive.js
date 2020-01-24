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

module.exports = class CardArchive extends Command {

  get name() { return "cardarchive"; }
  get aliases() { return ["archivedcards"]; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.cardsArchived(user.trelloToken, user.current);
    if (!body.length)
      return message.reply("There are no found cards in the archive.");
    await this.client.promptList(message, body, (card, embed) => {
      if (embed)
        return `\`${card.shortLink}\` ${card.name}`;
      else return `${card.shortLink}: ${card.name}`;
    }, {
      header: "Use `" + this.client.config.prefix + "opencard <cardID>` to unarchive that card\n" +
        "Use `" + this.client.config.prefix + "cardarchive [page]` to iterate this list",
      pluralName: "Trello Archived Cards",
      itemsPerPage: 15,
      startPage: args[0]
    });
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Lists all the archived cards in the current board.",
      usage: ["[page]"]
    };
  }
};
