/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah ???-2019
 Copyright (c) Yamboy1 (and contributors) 2019

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

const { CodeBlock, Command } = require("faux-classes");
const { command: exec } = require("execa");

module.exports = class Exec extends Command {

  get name() { return "exec"; }
  get aliases() { return ["execute", "terminal", "bash"]; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

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

  get helpMeta() {
    return {
      category: "Admin",
      usage: ["<command>"],
      description: "Utilize child_process.exec"
    };
  }
};
