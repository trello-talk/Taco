const { CodeBlock, Command } = require('faux-classes')
const { command: exec } = require("execa");

module.exports = class Exec extends Command {
  get name() { return 'exec' }
  get aliases() { return ['execute', 'terminal', 'bash'] }

  async exec(message, args) {
    message.channel.startTyping();
    let output = "";
    let errMessage = "";
    try {
      ({ all: output } = await exec(args.join(" "), { shell: "/bin/bash" }));
    } catch (e) {
      if (!e.exitCode) throw e;
      output = e.all;
      errMessage = e.message;
    } finally {
      message.channel.stopTyping(true);
      const text = `${errMessage}\n${CodeBlock.apply(output)}`;
      if (text.length > 2000) return message.channel.send("Output was too long to be displayed!");
      return message.channel.send(text);
    }
  }

  get permissions() { return ['elevated'] }
  get listed() { return false }

  get helpMeta() { return {
    category: 'Admin',
    usage: ["<command>"],
    description: 'Utilize child_process.exec',
  } }
}
