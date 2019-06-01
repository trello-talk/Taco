const { Command } = require('faux-classes')

module.exports = class Help extends Command {
  get name() { return 'help' }
  get aliases() { return ['❓','❔','?','commands'] }
  get cooldown() { return 0 }

  exec(message, args) {
    const prefix = this.client.config.prefix
    if(args[0]){
      let command = this.client.cmds.get(args[0])
      if(!command) message.reply(`The command ${args[0]} was not found.`); else {
        let embed = {
          title: `${prefix}${command.name}`,
          color: this.client.config.color_scheme,
          fields: [
            {name: "Usage", value: `${prefix}${command.name}${command.helpMeta.usage ? ` \`${command.helpMeta.usage}\`` : ''}`},
            {name: "Cooldown", value: `${command.cooldown} seconds`, inline: true},
          ],
          description: command.helpMeta.description
        }

        if(command.aliases.length !== 0) embed.fields.push({name: "Aliases", value: command.aliases.map(a => `\`${prefix}${a}\``).join(", ")});
        if(command.helpMeta.image) embed.image = { url: command.helpMeta.image };
        if(command.helpMeta.extra){
          command.helpMeta.extra.keyValueForEach((k, v) => {
            let o = {
              name: k,
              value: v
            }
            if(Array.isArray(command.Extra[Extra])) o.value = `${v.join(', ')}`
            embed.fields.push(o);
          })
        }
        message.channel.send('', { embed });
      }
    } else {
      let embed = {
        color: this.client.config.color_scheme,
        description: `${this.client.user.username} (Running [Faux](https://github.com/Snazzah/Faux) By Snazzah)\nSupport Server: https://discord.gg/7WNmQzc\nPowered by [CurseHQ](https://discord.gg/ZsVjKwm)`,
        footer: {
          text: `\`${prefix}help [command]\` for more info`
        },
        fields: []
      }

      let helpobj = {}
      this.client.cmds.commands.forEach((v, k) => { 
        if(!v.listed && !this.client.elevated(message)) return
        let string = `${prefix}${k}`
        if(helpobj[v.helpMeta.category]) helpobj[v.helpMeta.category].push(string);
          else helpobj[v.helpMeta.category] = [string];
      })
      helpobj.keyValueForEach((k, v) => { 
        embed.fields.push({
          name: `**${k}**`,
          value: "```" + v.join(', ') + "```",
          inline: true
        })
      })
      message.channel.send('', { embed });
    }
  }

  get permissions() { return ['embed'] }
  get cooldown() { return 0 }

  get helpMeta() { return {
    category: 'General',
    description: 'Shows the help message and gives information on commands',
    usage: '[command]'
  } }
}