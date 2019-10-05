const Discord = require("discord.js");
const dbots = require("dbots");
const Database = require("./Database");
const RethinkDB = require("./RethinkDB");
const EventHandler = require("./EventHandler");
const CommandLoader = require("./CommandLoader");
const StatTracker = require("./StatTracker");
const path = require("path");
const chalk = require("chalk");
const table = require("text-table");
const { Data, Util, Trello, CodeBlock } = require("faux-classes");

module.exports = class Faux extends Discord.Client {
  get FAUX_VER() {
    return "1.1.0-custom";
  }

  constructor({ configPath, packagePath, mainDir } = {}) {
    let config = require(configPath || `${mainDir}/Config/`);
    let pkg = require(packagePath || `${mainDir}/package.json`);
    Object.assign(config.clientOptions, {
      userAgent: { version: pkg.version }
    });
    if (process.env.SHARDING_MANAGER) Object.assign(config.clientOptions, {
      shardCount: parseInt(process.env.TOTAL_SHARD_COUNT),
      shardId: parseInt(process.env.SHARDS)
    });
    super(config.clientOptions);
    this.dir = mainDir;
    this.config = config;
    this.pkg = pkg;
    this.data = Data(this);
    this.util = Util(this);
    this.trello = Trello(this);
    this.awaitedMessages = {};
    this.pageProcesses = {};

    this.on("ready", () => {
      this.log(chalk.green("Logged in"));
      this.user.setActivity("boards scroll by me | " + this.config.prefix + "help", { type: 3 });
    });
    this.on("warn", s => this.warn("WARN", s));
    this.on("error", s => this.error("ERROR", s));
    this.on("disconnected", () => this.log("Disconnected"));
    this.on("reconnecting", () => this.warn("Reconnecting"));
    this.on("resume", r => this.warn(`Resumed. ${r} events were replayed.`));
    if (this.config.debug) this.on("debug", s => this.debug(s));

    process.once("uncaughtException", err => {
      this.error("Uncaught Exception:", err.stack);
      setTimeout(() => process.exit(0), 2500);
    });

    this.log(chalk.green("Client initialized."));
  }

  async serverCount() {
    let servers = this.isSharded() ? await this.shard.fetchClientValues("guilds.size") : [this.guilds.size];
    return servers.reduce((prev, val) => prev + val, 0);
  }

  async start() {
    this.db = new Database(this);
    this.db.connect(this.config.redis);
    this.rdb = new RethinkDB(this);
    await this.rdb.connect(this.config.rethink);
    await this.login();
    this.stats = new StatTracker(this);
    this.cmds = new CommandLoader(this, path.join(this.dir, this.config.commands), this.config.debug);
    this.cmds.reload();
    this.cmds.preloadAll();
    this.eventHandler = new EventHandler(this);
    this.initPoster();
  }

  initPoster() {
    if (!this.config.botlists || JSON.stringify(this.config.botlists) === "{}") return;
    this.poster = new dbots.Poster({
      client: this,
      apiKeys: this.config.botlists,
      clientLibrary: "discord.js"
    });

    this.poster.post();
    this.poster.startInterval();

    this.log(chalk.green("Initialized dbots poster"));
  }

  login() {
    return super.login(this.config.token);
  }

  get apiKey() {
    return this.config.trello.key;
  }

  get apiToken() {
    return this.config.trello.token;
  }

// LOGGING

  get logPrefix() {
    return `${chalk.gray("[")}${this.isSharded() ? `SHARD ${chalk.blue(this.shard.id)}` : "BOT"}${chalk.gray("]")}`;
  }

  log(...a) {
    return console.log(this.logPrefix, ...a);
  }

  warn(...a) {
    return console.warn(this.logPrefix, chalk.yellow(...a));
  }

  error(...a) {
    return console.error(this.logPrefix, chalk.red(...a));
  }

  debug(...a) {
    return console.debug(this.logPrefix, chalk.magenta(...a));
  }

// CHECK PERMS

  isSharded() {
    return !!this.shard;
  }

  embed(message) {
    return message.channel.type !== "text" || message.channel.permissionsFor(this.user).has("EMBED_LINKS");
  }

  attach(message) {
    return message.channel.type !== "text" || message.channel.permissionsFor(this.user).has("ATTACH_FILES");
  }

  emoji(message) {
    return message.channel.type !== "text" || message.channel.permissionsFor(this.user).has("USE_EXTERNAL_EMOJIS");
  }

  canPaginate(message) {
    return message.channel.type == "text" && message.channel.permissionsFor(this.user).has("ADD_REACTIONS") && message.channel.permissionsFor(this.user).has("MANAGE_MESSAGES");
  }

  elevated(message) {
    return this.config.elevated.includes(message.author.id);
  }

//	AWAITING MESSAGES

  awaitMessage(msg, callback = () => true, timeout = 30000) {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (!this.awaitedMessages[msg.channel.id]) this.awaitedMessages[msg.channel.id] = {};
      let timer;
      if (timeout >= 0) {
        timer = setTimeout(() => {
          delete _this.awaitedMessages[msg.channel.id][msg.author.id];
          reject(new Error(`Request timed out (${timeout}ms)`));
        }, timeout);
      }
      if (this.awaitedMessages[msg.channel.id][msg.author.id]) {
        this.awaitedMessages[msg.channel.id][msg.author.id].reject();
      }
      this.awaitedMessages[msg.channel.id][msg.author.id] = {
        resolve: function (msg2) {
          clearTimeout(timer);
          delete _this.awaitedMessages[msg.channel.id][msg.author.id];
          resolve(msg2);
        },
        reject: function () {
          clearTimeout(timer);
          reject(new Error("Request was overwritten"));
        },
        callback
      };
    });
  }

  stopAwait(chnId, msgId) {
    if (!this.awaitedMessages[chnId]) return;
    if (!this.awaitedMessages[chnId][msgId]) return;
    if (this.awaitedMessages[chnId][msgId]) {
      this.awaitedMessages[chnId][msgId].reject();
      delete this.awaitedMessages[chnId][msgId];
    }
  }

  stopAwaitChannel(chnId) {
    if (!this.awaitedMessages[chnId]) return;
    this.util.keyValueForEach(this.awaitedMessages, (k, v) => {
      v.reject();
    });
    delete this.awaitedMessages[chnId];
  }

  prompt(cxtMessage, items, displayFunc = i => i,
         promptText = "Type the number of the item you want to use.",
         itemsPerPage = 30,
         timeout = 30000) {
    promptText += " Responding with anything else will cancel this prompt.";
    return new Promise(async resolve => {
      let paginatable = this.canPaginate(cxtMessage);
      if (!items.length)
        return resolve(null);
      else if (items.length > itemsPerPage && !paginatable) {
        await cxtMessage.channel.send(`More than ${itemsPerPage} items were in a prompt, please make your search more specific or give this bot \`Manage Messages\` and \`Add Reactions\` permissions.`);
        return resolve(null);
      }
      let pageVars = this.util.pageNumber(itemsPerPage, items.length),
        page = pageVars[0],
        maxPages = pageVars[1],
        textTableRows = [],
        index = 1;
      items.forEach(item => {
        textTableRows.push([index, displayFunc(item)]);
        index++;
      });
      let splitRows = this.util.splitArray(textTableRows, itemsPerPage);
      let makePage = () => {
        return CodeBlock.apply(
          `[${items.length} Items, Page (${page}/${maxPages})]\n\n` +
          table(splitRows[page - 1], { hsep: ": " }) +
          `\n\nc: Cancel Prompt`, "prolog");
      };
      let promptContent = promptText + "\n" + makePage();
      let promptFooter = "";
      let queryComplete = false;
      let promptMessage = await cxtMessage.channel.send(promptContent + promptFooter);
      if (paginatable && items.length > itemsPerPage) {
        this.startPagination(cxtMessage, promptMessage, async (e, r, q) => {
          if (queryComplete) return q();
          if (e) {
            if (!e.toString().startsWith("Error: Request timed out")) {
              promptFooter += "\n" + e.toString();
              promptMessage.edit(promptContent + promptFooter);
            }
            q().catch(e2 => {
              promptFooter += "\n" + e2.toString();
              promptMessage.edit(promptContent + promptFooter);
            });
            return;
          }
          if (r.emoji.name === "🛑") {
            this.killPagination(cxtMessage);
            await promptMessage.delete();
            await cxtMessage.channel.send("Prompt cancelled.");
            resolve(null);
            return;
          }
          if (r.emoji.name === "◀") page--;
          if (r.emoji.name === "▶") page++;
          page = this.util.pageNumber(itemsPerPage, items.length, page)[0];
          promptContent = promptText + "\n" + makePage();
          r.remove(cxtMessage.author);
          promptMessage.edit(promptContent + promptFooter);
        });
      }
      try {
        let response = await this.awaitMessage(cxtMessage, () => true, timeout);
        let includesOption = textTableRows.map(r => r[0]).includes(parseInt(response.content));
        queryComplete = true;
        if (!includesOption || response.content == "c" || response.content == "-") {
          this.killPagination(cxtMessage);
          await promptMessage.delete();
          await cxtMessage.channel.send("Prompt cancelled.");
          resolve(null);
        } else {
          await promptMessage.delete();
          let selectedIndex = parseInt(response.content) - 1;
          this.killPagination(cxtMessage);
          resolve(items[selectedIndex]);
        }
      } catch (e) {
        promptFooter += "\n" + e.toString();
        promptMessage.edit(promptContent + promptFooter);
        this.killPagination(cxtMessage);
        resolve(null);
      }
    });
  }

  async promptList(cxtMessage, items, {
        content = "",
        header = "",
        footer = "",
        pluralName = "Items",
        itemsPerPage = 30,
        startPage = 1
      }, displayFunc = i => i) {
    let isEmbed = this.embed(cxtMessage);
    let pageVars = this.util.pageNumber(itemsPerPage, items.length, startPage),
      page = pageVars[0],
      maxPages = pageVars[1];
    let embed = {
      color: this.config.embedColor,
      author: {
        name: `${pluralName} (${items.length}, Page ${page}/${maxPages})`,
        icon_url: this.config.icon_url
      },
      fields: [{
        name: "List Prompt",
        value: "[]"
      }]
    };
    if (header) embed.description = header;
    if (footer) embed.footer = { text: footer };
    let splitRows = this.util.splitArray(items.map(i => displayFunc(i, false)), itemsPerPage);
    let splitEmbedRows = this.util.splitArray(items.map(i => displayFunc(i, true)), itemsPerPage);
    let makePage = () => {
      embed.author.name = `${pluralName} (${items.length}, Page ${page}/${maxPages})`;
      embed.fields[0].value = splitEmbedRows[page - 1].join("\n");
      return CodeBlock.apply(
        `(•) ${pluralName} (${items.length}, Page (${page}/${maxPages})\n` +
        header + "\n\n" + splitRows[page - 1].join("\n") +
        footer, "prolog");
    };
    let promptContent = content + "\n" + makePage() + footer;
    let promptFooter = "";
    let promptMessage = isEmbed ? await cxtMessage.channel.send("", { embed }) : await cxtMessage.channel.send(promptContent + promptFooter);
    let updateMessage = () => {
      embed.description = header + "\n" + promptFooter;
      if (isEmbed) promptMessage.edit("", { embed });
      else promptMessage.edit(promptContent + promptFooter);
    };
    if (this.canPaginate(cxtMessage) && items.length > itemsPerPage) {
      this.startPagination(cxtMessage, promptMessage, async (e, r, q) => {
        if (e) {
          if (!e.toString().startsWith("Error: Request timed out")) {
            promptFooter += "\n" + e.toString();
            updateMessage();
          }
          q().catch(e2 => {
            promptFooter += "\n" + e2.toString();
            updateMessage();
          });
          return;
        }
        if (r.emoji.name === "🛑") {
          q().catch(e => {
            promptFooter += "\n" + e.toString();
            updateMessage();
          });
          return;
        }
        if (r.emoji.name === "◀") page--;
        if (r.emoji.name === "▶") page++;
        page = this.util.pageNumber(itemsPerPage, items.length, page)[0];
        promptContent = content + "\n" + makePage() + footer;
        r.remove(cxtMessage.author);
        updateMessage();
      });
    }
  }

// PAGINATION

  async startPagination(msg, botmsg, cb, timeout = 30000) {
    let _this = this;
    if (!this.pageProcesses.hasOwnProperty(msg.channel.id)) this.pageProcesses[msg.channel.id] = {};
    let timer;
    if (timeout >= 0) {
      timer = setTimeout(function () {
        delete _this.pageProcesses[msg.channel.id][msg.author.id];
        cb(new Error(`Request timed out (${timeout}ms)`), null, () => _this.quitPagination(msg, botmsg));
      }, timeout);
    }
    if (this.pageProcesses[msg.channel.id][msg.author.id]) {
      this.pageProcesses[msg.channel.id][msg.author.id].reject();
    }
    this.pageProcesses[msg.channel.id][msg.author.id] = {
      resolve: function (reaction) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          delete _this.pageProcesses[msg.channel.id][msg.author.id];
          cb(new Error(`Request timed out (${timeout}ms)`), null, () => _this.quitPagination(msg, botmsg));
        }, timeout);
        cb(null, reaction, () => _this.quitPagination(msg, botmsg));
      },
      reject: function () {
        clearTimeout(timer);
        cb("Pagination was stopped by another paging process!", null, () => _this.quitPagination(msg, botmsg));
      },
      stop: function () { clearTimeout(timer); },
      id: botmsg.id
    };
    try {
      await botmsg.react("◀");
      await botmsg.react("🛑");
      await botmsg.react("▶");
    } catch (e) {
      console.log(e);
      cb("I can't make reactions to the message!", null, () => this.quitPagination(msg, botmsg));
    }
  }

  quitPagination(msg, botmsg) {
    return new Promise((resolve, reject) => {
      botmsg.clearReactions().then(() => {
        this.killPagination(msg);
        resolve();
      }).catch(() => {
        this.killPagination(msg);
        reject("I can't clear reactions!");
      });
    });
  }

  killPagination(message) {
    return new Promise((resolve, reject) => {
      if (this.pageProcesses.hasOwnProperty(message.channel.id) &&
        this.pageProcesses[message.channel.id].hasOwnProperty(message.author.id)) {
        this.pageProcesses[message.channel.id][message.author.id].stop();
        delete this.pageProcesses[message.channel.id][message.author.id];
      }
    });
  }
};
