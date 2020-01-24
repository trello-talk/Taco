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

module.exports = class AddList extends Command {

  get name() { return "addlist"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["createlist", "+list", "clist", "alist"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    await this.client.trello.add.list(user.trelloToken, user.current, args.join(" "));
    message.reply(`Added list "${args.join(" ")}".`);
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Adds a list to the board.",
      usage: ["<listName>"]
    };
  }
};
