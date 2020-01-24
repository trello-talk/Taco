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

module.exports = class Help extends Command {
  get name() { return "help"; }
  get aliases() { return ["❓", "❔", "?", "commands", "cmds"]; }
  get cooldown() { return 0; }
  get permissions() { return ["embed"]; }

  exec(message, args) {
    const prefix = this.client.config.prefix;
    if (args[0]) {
      let command = this.client.cmds.get(args[0]);
      if (!command) return;
      let { usage = undefined } = command.helpMeta;
      if (!command) message.reply(`The command ${args[0]} was not found.`); else {
        let embed = {
          title: `${prefix}${command.name}`,
          color: this.client.config.embedColor,
          fields: [
            {
              name: "Usage",
              value: usage ? usage.reduce((acc, x) => `${acc}\n${prefix}${command.name} \`${x}\``, "") : prefix + command.name
            },
            //{name: "Usage", value: `${prefix}${command.name}${command.helpMeta.usage ? ` \`${command.helpMeta.usage}\`` : ''}`},
            { name: "Cooldown", value: `${command.cooldown} seconds`, inline: false }
          ],
          description: command.helpMeta.description
        };

        if (command.aliases.length !== 0) embed.fields.push({
          name: "Aliases",
          value: command.aliases.map(a => `\`${prefix}${a}\``).join(", ")
        });
        if (command.helpMeta.image) embed.image = { url: command.helpMeta.image };
        if (command.helpMeta.extra) {
          command.helpMeta.extra.keyValueForEach((k, v) => {
            let o = {
              name: k,
              value: v
            };
            if (Array.isArray(command.Extra[Extra])) o.value = `${v.join(", ")}`;
            embed.fields.push(o);
          });
        }
        message.channel.send("", { embed });
      }
    } else {
      let embed = {
        color: this.client.config.embedColor,
        description: `${this.client.user.username} (Running [Faux](https://github.com/Snazzah/Faux) By Snazzah)\nSupport Server: ${this.client.config.supportServers[0]}`,
        footer: {
          text: `\`${prefix}help [command]\` for more info`
        },
        fields: []
      };

      let helpobj = {};
      this.client.cmds.commands.forEach((v, k) => {
        if (!v.listed && !this.client.elevated(message)) return;
        let string = `${prefix}${k}`;
        if (helpobj[v.helpMeta.category]) helpobj[v.helpMeta.category].push(string);
        else helpobj[v.helpMeta.category] = [string];
      });
      helpobj.keyValueForEach((k, v) => {
        embed.fields.push({
          name: `**${k}**`,
          value: "```" + v.join(", ") + "```",
          inline: true
        });
      });
      message.channel.send("", { embed });
    }
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Shows the help message and gives information on commands",
      usage: ["[command]"]
    };
  }
};
