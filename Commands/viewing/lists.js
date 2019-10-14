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

module.exports = class Lists extends Command {

  get name() { return "lists"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current);
    if (!body.length)
      return message.reply("There are no found lists on the board. Check the archive with `T!listarchive`.");
    await this.client.promptList(message, body, (list, embed) => {
      let emojis = (list.subscribed ? "🔔" : "");
      if (embed)
        return `${list.name} ${emojis} *(${list.cards.length} Cards)*`;
      else return `${list.name} ${emojis} (${list.cards.length} Cards)`;
    }, {
      header: "Use `" + this.client.config.prefix + "viewlist <listName>` to see all cards in that list\n" +
        "Use `" + this.client.config.prefix + "lists [page]` to iterate this list",
      pluralName: "Trello Lists",
      itemsPerPage: 15,
      startPage: args[0]
    });
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Lists all the lists in the current board.",
      usage: ["[page]"]
    };
  }
};
