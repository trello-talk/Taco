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

module.exports = class Me extends Command {

  get name() { return "me"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "embed"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.boards(user.trelloToken, user.trelloID);
    let embed = {
      color: this.client.config.embedColor,
      description: `**ID:** \`${body.id}\`\n` +
        `**Initials:** ${body.initials}\n` +
        `**Member Type:** ${this.client.util.capFirst(body.memberType)}\n` +
        (body.url ? `**URL:** ${body.url}\n` : "") +
        `**Boards:** ${body.boards.length} \`${this.client.config.prefix}boards\`\n` +
        `**Organizations:** ${body.idOrganizations.length}\n` +
        `\n${body.bio || ""}\n`,
      author: {
        name: `${body.fullName} (${body.username})`,
        icon_url: this.client.config.icon_url
      },
      thumbnail: {
        url: body.avatarURL
      },
      fields: [{
        name: "Preferences",
        value: `**Colorblind Mode:** ${body.prefs.colorBlind ? "On" : "Off"}\n` +
          `**Locale:** ${body.prefs.locale}\n` +
          `**Send Summaries:** ${body.prefs.sendSummaries ? "Yes" : "No"}`
      }]
    };
    let productsField = {
      name: "Products",
      value: ""
    };
    if (body.products.length) {
      body.products.forEach(product => {
        switch (product) {
          case 10: // Trello Gold from Buisness Class
            productsField.value += ":suitcase: Trello Gold from Buisness Class team\n";
            break;
          case 37: // Monthly Trello Gold
            productsField.value += ":star: Monthly Trello Gold\n";
            break;
          case 38: // Annually Trello Gold
            productsField.value += ":star2: Annyally Trello Gold\n";
            break;
        }
      });
    } else {
      productsField.value = "*None*";
    }
    embed.fields.push(productsField);
    message.channel.send("", { embed });
  }

  get helpMeta() {
    return {
      category: "User Management",
      description: "View information about your Trello account."
    };
  }
};
