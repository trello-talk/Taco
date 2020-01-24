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

module.exports = class Webhooks extends Command {

  get name() { return "webhooks"; }
  get cooldown() { return 1; }
  get aliases() { return ["allwebhooks"]; }
  get permissions() { return ["trello-perm"]; }

  toOrigin(str) {
    return Object.keys(this.client.util.TrelloEvents).filter(t => t.toLowerCase() == str.toLowerCase())[0];
  }

  async exec(message, args) {
    let webhooks = await this.client.data.get.webhooksOf(message.guild.id);
    if (webhooks.length !== 0) {
      await this.client.promptList(message, webhooks, (webhook, embed) => {
        let bits = webhook.bits.map(bit => embed ? `\`${this.toOrigin(bit)}\`` : this.toOrigin(bit)).join(", ");
        if (webhook.bits.length === 0)
          bits = embed ? "*\`[all]\`*" : "[all]";
        if (embed) {
          return `**Board \`${webhook.board}\`**\n-  Bits: ${bits}`;
        } else {
          return `Board ${webhook.board}\n  Bits: ${bits}`;
        }
      }, {
        header: "Use `" + this.client.config.prefix + "webhooks [page]` to iterate this list",
        pluralName: "Trello Webhooks",
        itemsPerPage: 3,
        startPage: args[0]
      });
    } else {
      message.reply("Could not find any active webhooks. `" + this.client.config.prefix + "help addwebhook` to learn how to create one!");
    }
  }

  get helpMeta() {
    return {
      category: "Webhooks",
      description: "List webhook bits.",
      usage: ["[page]"]
    };
  }
};
