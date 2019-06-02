const { CodeBlock, Command } = require('faux-classes')

module.exports = class Exec extends Command {
  get name() { return 'exec' }
  get aliases() { return ['execute', 'terminal', 'bash'] }

  exec(Message, Args) {
    Message.channel.startTyping();
    require("child_process").exec(Args.join(" "), (e, f, r)=>{
      Message.channel.stopTyping();
      if(e) return Message.channel.send(CodeBlock.apply(`Error: ${e}`, 'js'));
      if(r != '') return Message.channel.send(CodeBlock.apply(`STDOUT Error: ${r}`, 'js'));
      Message.channel.send(CodeBlock.apply(f));
    });
  }

  get permissions() { return ['elevated'] }
  get listed() { return false }

  get helpMeta() { return {
    category: 'Admin',
    usage: '<command>',
    description: 'Utilize child_process.exec',
  } }
}