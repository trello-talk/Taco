/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Command = require('../structures/Command');
const Util = require('../util');

module.exports = class Help extends Command {
  get name() { return 'help'; }

  get _options() { return {
    aliases: [
      '?', 'h', 'commands', 'cmds', // English
      'yardim', 'yardım', 'komutlar', // Turkish
      'ayuda', // Spanish
      'ajuda' // Catalan & Portuguese
    ],
    permissions: ['embed'],
    cooldown: 0,
  }; }

  exec(message, { args, _, prefixUsed }) {
    if (args[0]) {
      // Display help on a command
      const command = this.client.cmds.get(args[0]);
      if (!command)
        return message.channel.createMessage(_('help.not_found', { command: args[0] }));
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

        return message.channel.createMessage({ embed });
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
      return message.channel.createMessage({ embed });
    }
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
