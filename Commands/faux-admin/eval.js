const { CodeBlock, Command } = require('faux-classes')
const { Util } = require('faux-core')

module.exports = class Eval extends Command {
  get name() { return 'eval' }

  async exec(Message, args) {
    let message = Message
    try{
      let start = new Date().getTime()
      let response = eval(args.join(' '))
      let msg = CodeBlock.apply(response, 'js')
      let time = new Date().getTime() - start
      Message.channel.send(`Time taken: ${(time/1000)} seconds\n${msg}`)
    }catch(e){
      Message.channel.send(CodeBlock.apply(e.stack, 'js'))
    }
  }

  get permissions() { return ['elevated'] }
  get listed() { return false }

  get helpMeta() { return {
    category: 'Admin',
    description: 'eval hell yeah',
  } }
}