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

module.exports = class SubscribeCard extends Command {

  get name() { return "subscribecard"; }
  get cooldown() { return 2; }
  get argRequirement() { return 1; }
  get permissions() { return ["auth"]; }
  get aliases() { return ["subcard"]; }

  async exec(message, args, { user }) {
    let body = null;
    try {
      body = await this.client.trello.get.card(user.trelloToken, args[0]);
    } catch (e) {
      if (e.response && e.response.text == "invalid id") {
        return message.reply("That ID is invalid!");
      }
    }
    let newSub = !body.subscribed;
    await this.client.trello.subscribe.card(user.trelloToken, body.id, newSub);
    message.channel.send(`You are ${newSub ? "now" : "no longer"} subcribed to card "${body.name}" \`(${body.shortLink})\``);
  }

  get helpMeta() {
    return {
      category: "User Management",
      description: "(Un)subscribes to a card.",
      usage: ["<cardID>"]
    };
  }
};
