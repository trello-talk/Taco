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
    return message.channel.type === 1 ||
      message.channel.permissionsOf(this.client.user.id).has('externalEmojis');
  }

  canEmbed(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('embedLinks');
  }

  exec(message, { args, _ }) {
    if (!this.canEmbed(message))
      return this.client.createMessage(message.channel.id, _('help.no_embed'));

    const prefixes = [...this.client.config.prefixes,
      `@${this.client.user.username}#${this.client.user.discriminator}`];
    const prefix = prefixes[0];
    if (args[0]) { // Display help on a command
      const command = this.client.cmds.get(args[0]);
      if (!command)
        this.client.createMessage(message.channel.id, _('help.not_found', { command: args[0] }));
      else {
        const hasDesc = _.valid(`commands.${command.name}.description`);
        const embed = {
          title: `${prefix}${command.name}`,
          color: this.client.config.embedColor,
          fields: [
            { name: _('words.usage'),
              value: `${prefix}${command.name}${
                _.valid(`commands.${command.name}.usage`) ?
                  ` \`${_(`commands.${command.name}.usage`)}\`` : ''}` }
          ],
          description: hasDesc ? _(`commands.${command.name}.description`) : undefined
        };

        // Cooldown
        if (command.options.cooldown)
          embed.fields.push({
            name: _('words.cooldown'),
            value: _('format.second.' + (command.options.cooldown == 1 ? 'one' : 'many'), {
              seconds: _.toLocaleString(command.options.cooldown)
            }),
            inline: false
          });

        // Aliases
        if (command.options.aliases.length !== 0) embed.fields.push({
          name: _('words.alias.' + (command.options.aliases.length == 1 ? 'one' : 'many')),
          value: command.options.aliases.map(a => `\`${prefix}${a}\``).join(', ')
        });

        // Image
        if (command.metadata.image)
          embed.image = { url: command.metadata.image };

        // Note
        if (_.valid(`commands.${command.name}.note`))
          embed.fields.push({
            name: _('words.note'),
            value: _(`commands.${command.name}.note`)
          });

        return this.client.createMessage(message.channel.id, { embed });
      }
    } else { // Display general help command
      const embed = {
        color: this.client.config.embedColor,
        description: _('help.header', {
          username: this.client.user.username,
          link: this.client.config.supportServers[0],
        }),
        footer: { text: _('help.footer', { prefix }) },
        fields: []
      };

      // Populate categories
      const categories = {};
      this.client.cmds.commands.forEach(v => {
        if (!v.listed && !this.client.config.elevated.includes(message.author.id)) return;
        const string = `${prefix}${v.name}`;
        if (categories[v.metadata.category])
          categories[v.metadata.category].push(string);
        else categories[v.metadata.category] = [string];
      });

      // List categories
      Util.keyValueForEach(categories, (k, v) => {
        embed.fields.push({
          name: `**${_(k)}**`,
          value: '```' + v.join(', ') + '```',
          inline: true
        });
      });
      return this.client.createMessage(message.channel.id, { embed });
    }
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
