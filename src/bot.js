/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

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

const Eris = require('eris');
const dbots = require('dbots');
const Database = require('./database');
const EventHandler = require('./events');
const CommandLoader = require('./commandloader');
const logger = require('./logger')('[DISCORD]');
const posterLogger = require('./logger')('[POSTER]');
const path = require('path');
const Airbrake = require('@airbrake/node');

class TrelloBot extends Eris.Client {
  constructor({ configPath, packagePath, mainDir } = {}) {
    // Initialization
    const config = require(configPath || `${mainDir}/Config/`);
    const pkg = require(packagePath || `${mainDir}/package.json`);
    super(config.token, config.discordConfig);
    this.dir = mainDir;
    this.pkg = pkg;
    this.logger = logger;
    this.config = config;
    this.typingIntervals = new Map();
    if (config.airbrake)
      this.airbrake = new Airbrake.Notifier(config.airbrake);

    // Events
    this.on('ready', () => logger.info('All shards ready.'));
    this.on('disconnect', () => logger.info('All Shards Disconnected.'));
    this.on('reconnecting', () => logger.warn('Reconnecting'));
    if (config.debug) this.on('debug', message => logger.debug(message));

    // Shard Events
    this.on('connect', id => logger.info(`Shard ${id} connected.`));
    this.on('error', (error, id) => logger.error(`Error in shard ${id}`, error));
    this.on('hello', (_, id) => logger.info(`Shard ${id} recieved hello.`));
    this.on('warn', (message, id) => logger.warn(`Warning in Shard ${id}`, message));
    this.on('shardReady', id => logger.info(`Shard ${id} ready.`));
    this.on('shardResume', id => logger.warn(`Shard ${id} resumed.`));
    this.on('shardDisconnect', (error, id) => logger.warn(`Shard ${id} disconnected`, error));

    // SIGINT & uncaught exceptions
    process.once('uncaughtException', err => {
      logger.error('Uncaught Exception:', err.stack);
      setTimeout(() => process.exit(0), 2500);
    });

    process.once('SIGINT', async () => {
      logger.info('Caught SIGINT');
      await this.dieGracefully();
      process.exit(0);
    });

    process.env.LOGGER_DEBUG = config.debug;

    logger.info('Client initialized');
  }

  waitTill(event) {
    return new Promise(resolve => this.once(event, resolve));
  }

  async start() {
    this.db = new Database(this);
    await this.db.connect(this.config.redis);
    await this.connect();
    await this.waitTill('ready');
    this.editStatus('online', {
      name: `boards scroll by me | ${this.config.prefixes[0]}help`,
      type: 3,
    });
    this.cmds = new CommandLoader(this, path.join(this.dir, this.config.commandsPath), this.config.debug);
    this.cmds.reload();
    this.cmds.preloadAll();
    this.eventHandler = new EventHandler(this);
    if (Object.keys(this.config.botlists).length) await this.initPoster();
  }

  initPoster() {
    this.poster = new dbots.Poster({
      client: this,
      apiKeys: this.config.botlists,
      clientLibrary: 'eris',
      useSharding: false,
      voiceConnections: () => 0,
    });

    this.poster.post().then(this.onPost).catch(this.onPostFail);
    this.poster.addHandler('autopost', this.onPost);
    this.poster.addHandler('autopostfail', this.onPostFail.bind(this, true));
    this.poster.addHandler('post', this.onPostOne);
    this.poster.addHandler('postfail', this.onPostFail);
    this.poster.startInterval();
  }

  onPost() {
    posterLogger.info('Posted stats to all bot lists.');
  }

  onPostOne(result) {
    posterLogger.info(`Posted to ${result.request.socket.servername}!`);
  }

  onPostFail(e, auto = false) {
    posterLogger.error(`Failed to ${
      auto ? 'auto-post' : 'post'
    } in ${e.response.config.url}! (${e.request.method}, ${e.response.status})`);
    console.log(e.response.data);
  }

  dieGracefully() {
    return new Promise(resolve => {
      logger.info('Slowly dying...');
      this.waitTill('disconnect')
        .then(() => this.db.disconnect())
        .then(() => {
          logger.info('It\'s all gone...');
          resolve();
        });
      super.disconnect();
    });
  }

  // Typing

  async startTyping(channel) {
    if (this.isTyping(channel)) return;
    await channel.sendTyping();
    this.typingIntervals.set(channel.id, setInterval(() => {
      channel.sendTyping().catch(() => this.stopTyping(channel));
    }, 5000));
  }

  isTyping(channel) {
    return this.typingIntervals.has(channel.id);
  }

  stopTyping(channel) {
    if (!this.isTyping(channel)) return;
    const interval = this.typingIntervals.get(channel.id);
    clearInterval(interval);
    this.typingIntervals.delete(channel.id);
  }
}

const Bot = new TrelloBot({ mainDir: path.join(__dirname, '..') });
Bot.start().catch(e => {
  Bot.logger.error('Failed to start bot! Exiting in 10 seconds...');
  console.error(e);
  setTimeout(() => process.exit(0), 10000);
});
