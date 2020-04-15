/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

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

const Command = require('../structures/Command');
const Util = require('../util');

module.exports = class Help extends Command {
  get name() { return 'help'; }

  get _options() { return {
    aliases: ['?', 'h', 'commands', 'cmds', 'c'],
    cooldown: 0,
  }; }

  canUseEmojis(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('externalEmojis');
  }

  canEmbed(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('embedLinks');
  }

  exec(message, { args }) {
    if(!this.canEmbed(message))
      return this.client.createMessage(message.channel.id, 'I need to be able to embed links in order to display help commands!');

    const prefixes = [...this.client.config.prefixes, `@${this.client.user.username}#${this.client.user.discriminator}`];
    const prefix = prefixes[0];
    if (args[0]) { // Display help on a command
      let command = this.client.cmds.get(args[0]);
      if (!command) return;
      let { usage = undefined } = command.metadata;
      if (!command) message.reply(`The command ${args[0]} was not found.`); else {
        let embed = {
          title: `${prefix}${command.name}`,
          color: this.client.config.embedColor,
          fields: [
            { name: "Usage",
              value: `${prefix}${command.name}${usage ? ` \`${usage}\`` : ''}` }
          ],
          description: command.metadata.description
        };

        // Cooldown
        if (command.options.cooldown)
          embed.fields.push({ name: "Cooldown", value: `${command.options.cooldown} seconds`, inline: false });

        // Aliases
        if (command.options.aliases.length !== 0) embed.fields.push({
          name: "Aliases",
          value: command.options.aliases.map(a => `\`${prefix}${a}\``).join(", ")
        });

        // Image
        if (command.metadata.image)
          embed.image = { url: command.metadata.image };

        // Extras
        if (command.metadata.extra) {
          Util.keyValueForEach(command.metadata.extra, (k, v) => {
            let o = { name: k, value: v };
            if (Array.isArray(command.Extra[Extra])) o.value = `${v.join(", ")}`;
            embed.fields.push(o);
          });
        }
        return this.client.createMessage(message.channel.id, { embed });
      }
    } else { // Display general help command
      let embed = {
        color: this.client.config.embedColor,
        description: `${this.client.user.username} (Running Modified [Faux](https://github.com/Snazzah/Faux) By Snazzah)\nSupport Server: ${this.client.config.supportServers[0]}`,
        footer: {
          text: `\`${prefix}help [command]\` for more info`
        },
        fields: []
      };

      // Populate categories
      let categories = {};
      this.client.cmds.commands.forEach(v => {
        if (!v.listed && !this.client.config.elevated.includes(message.author.id)) return;
        let string = `${prefix}${v.name}`;
        if (categories[v.metadata.category])
          categories[v.metadata.category].push(string);
        else categories[v.metadata.category] = [string];
      });
      // List categories
      Util.keyValueForEach(categories, (k, v) => {
        embed.fields.push({
          name: `**${k}**`,
          value: "```" + v.join(", ") + "```",
          inline: true
        });
      });
      return this.client.createMessage(message.channel.id, { embed });
    }
  }

  get metadata() { return {
    category: 'General',
    description: 'Shows the help message and gives information on commands.',
    usage: '[command]',
  }; }
};
