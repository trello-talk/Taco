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

module.exports = class CreateCard extends Command {

  get name() { return "createcard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["createcard", "+card", "ccard", "acard"]; }
  get argRequirement() { return 3; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current);
    if (!args.join(" ").match(/\s\|\s/, "|")) {
      message.channel.send(`Format is invalid!`);
      return;
    }
    let c = args.join(" ").replace(/\s\|\s/, "|").split("|");
    let cargs = c.reverse()[0].split(" ");
    let listName = c.slice(c.length - 1).join(" ");
    let query = await this.client.util.query(
      message, body,
      listName,
      "name", item => `${item.name} (${item.cards.length} Cards)`,
      "Type the number of the list you want to create a card in."
    );
    if (query.quit) return;
    let result = query.result;
    if (result !== null) {
      let createdCard = await this.client.trello.add.card(user.trelloToken, result.id, cargs.join(" "));
      message.reply(`Created card "${cargs.join(" ")}" \`(${createdCard.shortLink})\` in list "${result.name}".`);
    } else message.reply(`No list by the name of "${listName}" was found!`);
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Creates a card.",
      usage: ["<listName> | <cardName>"]
    };
  }
};
