/* jshint evil: true */
const { CodeBlock, Command } = require("faux-classes");
const { Util } = require("faux-core");
const { inspect } = util = require("util");

module.exports = class Eval extends Command {

  get name() { return "eval"; }
  get aliases() { return ["evaluate"]; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

  async exec(Message, args, { user }) {
    let message = Message;
    try {
      let start = new Date().getTime();
      let response = eval(args.join(" "));
      let msg = CodeBlock.apply(response, "js");
      let time = new Date().getTime() - start;
      Message.channel.send(`Time taken: ${(time / 1000)} seconds\n${msg}`);
    } catch (e) {
      Message.channel.send(CodeBlock.apply(e.stack, "js"));
    }
  }

  get helpMeta() {
    return {
      category: "Admin",
      description: "eval hell yeah"
    };
  }
};
