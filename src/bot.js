const Eris = require('eris');
const dbots = require('dbots');
const Database = require('./database');
const EventHandler = require('./events');
const CommandLoader = require('./commandloader');
const logger = require('./logger')('[DISCORD]');
const posterLogger = require('./logger')('[POSTER]');
const fs = require('fs');
const path = require('path');
const config = require('config');

class DiscordVid2 extends Eris.Client {
  constructor({ packagePath, mainDir } = {}) {
    // Initialization
    const pkg = require(packagePath || `${mainDir}/package.json`);
    const discordConfig = JSON.parse(JSON.stringify(config.get('discord')));
    super(config.get('discordToken'), discordConfig);
    this.dir = mainDir;
    this.pkg = pkg;
    this.logger = logger;
    this.typingIntervals = new Map();

    // Events
    this.on('ready', () => logger.info('All shards ready.'));
    this.on('disconnect', () => logger.info('All Shards Disconnected.'));
    this.on('reconnecting', () => logger.warn('Reconnecting'));
    if(config.get('debug')) this.on('debug', message => logger.debug(message));

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

    // Create cache folder if not already
    const cachePath = path.join(this.dir, config.get('cachePath'));
    fs.access(cachePath, fs.constants.F_OK, err => {
      if(err) {
        logger.info('Cache folder does not exist, creating folder.');
        fs.mkdirSync(cachePath);
      } else logger.info('Cache folder exists, skipping');
    });

    process.env.LOGGER_DEBUG = config.get('debug');

    logger.info('Client initialized');
  }

  waitTill(event) {
    return new Promise(resolve => this.once(event, resolve));
  }

  async start() {
    this.db = new Database(this);
    await this.db.connect(config.get('redis'));
    await this.connect();
    await this.waitTill('ready');
    this.editStatus('online', {
      name: 'videos using DiscordVid2',
      type: 3,
    });
    this.stats = new Stats(this);
    this.stats.init();
    this.cmds = new CommandLoader(this, path.join(this.dir, config.get('commandsPath')), config.get('debug'));
    this.cmds.reload();
    this.cmds.preloadAll();
    this.eventHandler = new EventHandler(this);
    if(Object.keys(config.get('botlist')).length) await this.initPoster();
  }

  initPoster() {
    this.poster = new dbots.Poster({
      client: this,
      apiKeys: config.get('botlist'),
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
    posterLogger.error(`Failed to ${auto ? 'auto-post' : 'post'} in ${e.response.config.url}! (${e.request.method}, ${e.response.status})`);
    console.log(e.response.data);
  }

  async dieGracefully() {
    logger.info('Slowly dying...');
    super.disconnect();
    // await this.waitTill('disconnect');
    await this.db.disconnect();
    logger.info('It\'s all gone...');
  }

  // Typing

  async startTyping(channel) {
    if(this.isTyping(channel)) return;
    await channel.sendTyping();
    this.typingIntervals.set(channel.id, setInterval(() => {
      channel.sendTyping().catch(() => this.stopTyping(channel));
    }, 5000));
  }

  isTyping(channel) {
    return this.typingIntervals.has(channel.id);
  }

  stopTyping(channel) {
    if(!this.isTyping(channel)) return;
    const interval = this.typingIntervals.get(channel.id);
    clearInterval(interval);
    this.typingIntervals.delete(channel.id);
  }
}

const DVid2 = new DiscordVid2({ mainDir: path.join(__dirname, '..'), packagePath: '../package.json' });
DVid2.start().catch(e => {
  DVid2.logger.error('Failed to start bot! Exiting in 10 seconds...');
  console.error(e);
  setTimeout(() => process.exit(0), 10000);
});
