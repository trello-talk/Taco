const Command = require('../structures/Command');
const Util = require('../util');
const config = require('config');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const AbortController = require('abort-controller');
const generateVideo = require('../videogen');
const logger = require('../logger')('[GEN-CMD]');
const Extractor = require('../url_extractor');

module.exports = class Generate extends Command {
  get name() { return 'generate'; }

  get _options() { return {
    aliases: ['gen', 'g', 'download', 'dl'],
    cooldown: 10,
  }; }

  preload() {
    this.MESSAGES = [
      // this_vid2
      'Downloaded!',
      'Here\'s your video!',
      'Take a look, y\'all:',
      'Check it out:',
      'Done!',
      'Download complete!',
      'Uploaded!',
      'Sorted. :+1:',
      'I got it!',

      // this__vid3
      'Here you go!',
      'I got it!',
      'Easy!',
      'I\'m here!',
      'Don\'t Worry! =)',
      'Gotcha!',
      'Like this?',
      'Beep boop',
      'Sure thing!',
      'Got it boss!',
      'Your video, {{{displayName}}} sir!',
      'Your video has been downloaded, {{{displayName}}}!',
      'Finished!',

      // DiscordVid2
      'I gotcha!',
      'Here ya go!',
      'Video compressed and ready!',
      'Get some popcorn!',
      'Your feature presentation!',
      'Video downloaded! :sunglasses:',
      ':video_camera::arrow_down::white_check_mark:',
      ':film_frames::inbox_tray::white_check_mark:',
      'New message! :envelope_with_arrow:',
      'You\'re gonna love this one!',
      'Nice video!',
      'Video online!',
      'Hey, I downloaded your video!',
      'One pipin\' hot video comin\' right up!',
    ];
  }

  async findMedia(message, { usePast = true } = {}) {
    // Attachment
    if(message.attachments[0])
      return {
        url: message.attachments[0].url,
        spoiler: message.attachments[0].filename.startsWith('SPOILER_'),
        skipHead: true,
      };

    // URL detection in content
    if(Util.Regex.url.test(message.content)) {
      const targetURL = message.content.match(Util.Regex.url)[0];
      const convertedURL = await Extractor.parseURL(targetURL) || targetURL;
      const spoilers = Util.Regex.spoiler.test(message.content) ? message.content.match(Util.Regex.spoiler).map(m => Util.Regex.spoiler.exec(m)[1]) : [];
      const hasSpoiler = targetURL ? spoilers.find(spoil => spoil.includes(targetURL.trim())) !== undefined : false;
      if(targetURL) return {
        url: convertedURL,
        spoiler: hasSpoiler,
        skipHead: convertedURL !== targetURL,
      };
    }

    // Past Messages
    if(usePast) {
      const pastMessages = await message.channel.getMessages(config.get('pastMessagesLimit'), message.id);
      const filteredMessages = await Promise.all(pastMessages.map(pastMessage => this.findMedia(pastMessage, { usePast: false })));
      return filteredMessages.filter(result => !!result)[0];
    }

    return false;
  }

  async request(url, method = 'GET') {
    // Make an AbortController to cut off any hanging requests
    const controller = new AbortController();
    const timeout = setTimeout(controller.abort.bind(controller), config.get('requestTimeout'));

    // Make request
    const response = await fetch(url, {
      method,
      signal: controller.signal,
    }).catch(error => {
      if(error.name === 'AbortError')
        return { error: 'Request took too long!' };
      else return { error: 'Couldn\'t fetch from URL!' };
    });
    clearTimeout(timeout);
    return response;
  }

  async downloadFromURL(url, userID, skipHead = false) {
    if(!skipHead) {
      // Check Content Type from HEAD request
      const headResponse = await this.request(url, 'HEAD');
      if(headResponse.error) return headResponse;

      if(headResponse.headers.get('content-type') !== 'video/mp4')
        return { error: 'Invalid file format!' };
    }

    const response = await this.request(url);
    if(response.error) return response;

    // Get buffer and check type
    const buffer = await response.buffer();
    const fileType = await FileType.fromBuffer(buffer);
    if(fileType.ext !== 'mp4')
      return { error: 'Invalid file format!' };

    // Assign a random ID and download to cache
    const randomID = Util.Random.id();
    logger.info(`Downloading ${url} for user ${userID} to video id ${randomID}`);
    const filePath = path.join(this.client.dir, config.get('cachePath'), `${randomID}.mp4`);
    // For some reason I can't use streams, so this is the next best option.
    fs.writeFileSync(filePath, buffer);

    return {
      path: filePath,
      outputPath: path.join(this.client.dir, config.get('cachePath'), `${randomID}-out.mp4`),
      id: randomID,
    };
  }

  async exec(message) {
    if(message.channel.type !== 'text' ? false : !message.channel.permissionsFor(message.client.user).has('ATTACH_FILES'))
      return this.client.createMessage(message.channel.id, ':stop_sign: I cannot attach files!');

    const displayName = Util.Escape.markdown(message.member && message.member.nick ? message.member.nick : message.author.username);
    const contentPrefix = message.channel.type !== 1 ? `${message.author.mention}, ` : '';
    const content = Util.Random.prompt(this.MESSAGES, { displayName });

    const media = await this.findMedia(message);
    if(!media)
      return this.client.createMessage(message.channel.id, ':stop_sign: I couldn\'t find a video to download!');

    const input = await this.downloadFromURL(media.url, message.author.id, media.skipHead);
    if(input.error)
      return this.client.createMessage(message.channel.id, `:stop_sign: ${input.error}`);

    // Start generating
    await this.client.startTyping(message.channel);
    await generateVideo(input.path, input.outputPath, {
      discordTag: `${message.author.username}#${message.author.discriminator}`,
      videoGenPath: path.join(this.client.dir, './src/videogen'),
      id: input.id,
    });
    this.client.stopTyping(message.channel);

    logger.info(`Finished processing ${input.id}!`);
    this.client.stats.bumpStat('videos');

    await this.client.createMessage(message.channel.id, contentPrefix + content, {
      file: fs.readFileSync(input.outputPath),
      name: `${media.spoiler ? 'SPOILER_' : ''}${input.id}.mp4`,
    });

    // Cleanup
    fs.unlinkSync(input.path);
    fs.unlinkSync(input.outputPath);
  }

  get metadata() { return {
    description: 'Download a video!',
    note: 'You can simply mention the bot (with no other text) to use this command. You can also use attachments as media.',
  }; }
};
