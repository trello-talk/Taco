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

  exec(message, { args }) {
    const prefixes = [...this.client.config.prefixes, `@${this.client.user.username}#${this.client.user.discriminator}`];
    const prefix = prefixes[0]
    if (args[0]) {
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

        if (command.options.cooldown)
          embed.fields.push({ name: "Cooldown", value: `${command.options.cooldown} seconds`, inline: false });

        if (command.options.aliases.length !== 0) embed.fields.push({
          name: "Aliases",
          value: command.options.aliases.map(a => `\`${prefix}${a}\``).join(", ")
        });
        if (command.metadata.image)
          embed.image = { url: command.metadata.image };
        if (command.metadata.extra) {
          Util.keyValueForEach(command.metadata.extra, (k, v) => {
            let o = { name: k, value: v };
            if (Array.isArray(command.Extra[Extra])) o.value = `${v.join(", ")}`;
            embed.fields.push(o);
          });
        }
        return this.client.createMessage(message.channel.id, { embed });
      }
    } else {
      let embed = {
        color: this.client.config.embedColor,
        description: `${this.client.user.username} (Running Modified [Faux](https://github.com/Snazzah/Faux) By Snazzah)\nSupport Server: ${this.client.config.supportServers[0]}`,
        footer: {
          text: `\`${prefix}help [command]\` for more info`
        },
        fields: []
      };

      let helpobj = {};
      this.client.cmds.commands.forEach(v => {
        if (!v.listed && !this.client.config.elevated.includes(message.author.id)) return;
        let string = `${prefix}${v.name}`;
        if (helpobj[v.metadata.category]) helpobj[v.metadata.category].push(string);
        else helpobj[v.metadata.category] = [string];
      });
      Util.keyValueForEach(helpobj, (k, v) => {
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
