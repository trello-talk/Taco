/* jshint evil: true */
const { CodeBlock, Command } = require("faux-classes");
const { Util } = require("faux-core");
const util = require("util");
const inspect = util.inspect;

module.exports = class AsyncEval extends Command {

  get name() { return "aeval"; }
  get aliases() { return ["aevaluate", "asynceval", "asyncevaluate"]; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

  async exec(Message, args, { user }) {
    let message = Message;
    try {
      let start = new Date().getTime();
      let response = await eval(`(async () => \{${args.join(" ")}\})()`);
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
      description: "eval hell yeah\n\nNOTE: Due to the added async IIFE wrapper in this command, it is necessary to use the return statment to return a result\ne.g. `T!aevil return 1`"
    };
  }
};
