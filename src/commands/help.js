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
    aliases: [
      '?', 'h', 'commands', 'cmds', // English
      'yardim', 'yardım', 'komutlar', // Turkish
      'ajuda' // Spanish
    ],
    permissions: ['embed'],
    cooldown: 0,
  }; }

  exec(message, { args, _, prefixUsed }) {
    if (args[0]) {
      // Display help on a command
      const command = this.client.cmds.get(args[0]);
      if (!command)
        this.client.createMessage(message.channel.id, _('help.not_found', { command: args[0] }));
      else {
        const hasDesc = _.valid(`commands.${command.name}.description`);
        const embed = {
          title: `${prefixUsed.clean}${command.name}`,
          color: this.client.config.embedColor,
          fields: [
            { name: '*' + _('words.usage') + '*',
              value: `${prefixUsed.raw}${command.name}${
                _.valid(`commands.${command.name}.usage`) ?
                  ` \`${_(`commands.${command.name}.usage`)}\`` : ''}` }
          ],
          description: hasDesc ? _(`commands.${command.name}.description`) : undefined
        };

        // Cooldown
        if (command.options.cooldown)
          embed.fields.push({
            name: '*' + _('words.cooldown') + '*',
            value: _.numSuffix('format.second', command.options.cooldown, {
              seconds: _.toLocaleString(command.options.cooldown)
            }),
            inline: false
          });

        // Aliases
        if (command.options.aliases.length !== 0) embed.fields.push({
          name: '*' + _.numSuffix('words.alias', command.options.aliases.length) + '*',
          value: command.options.aliases.map(a => `\`${a}\``).join(', ')
        });

        // Image
        if (command.metadata.image)
          embed.image = { url: command.metadata.image };

        // Note
        if (_.valid(`commands.${command.name}.note`))
          embed.fields.push({
            name: '*' + _('words.note') + '*',
            value: _(`commands.${command.name}.note`)
          });

        return this.client.createMessage(message.channel.id, { embed });
      }
    } else {
      // Display general help command
      const embed = {
        color: this.client.config.embedColor,
        description: _('help.header', {
          username: this.client.user.username,
          link: this.client.config.supportServers[0],
        }),
        footer: { text: _('help.footer') },
        fields: []
      };

      // Populate categories
      const categories = {};
      this.client.cmds.commands.forEach(v => {
        if (!v.options.listed && !this.client.config.elevated.includes(message.author.id)) return;
        const string = v.name;
        if (categories[v.metadata.category])
          categories[v.metadata.category].push(string);
        else categories[v.metadata.category] = [string];
      });

      // List categories
      Util.keyValueForEach(categories, (k, v) => {
        embed.fields.push({
          name: `*${_(k)}*`,
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
