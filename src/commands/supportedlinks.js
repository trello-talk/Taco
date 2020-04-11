const Command = require('../structures/Command');
const Extractor = require('../url_extractor');

module.exports = class SupportedLinks extends Command {
  get name() { return 'supportedlinks'; }

  get _options() { return {
    aliases: ['supported', 'sl'],
    cooldown: 0,
  }; }

  exec(message) {
    if(!Extractor.extractors.length)
      Extractor.loadExtractors();
    return this.client.createMessage(message.channel.id, 'Here are all the URLs I can get videos from:\n' +
      Extractor.extractors.map(extractor => `> **${extractor.title}**: <${extractor.test_urls[0]}>`).join('\n'));
  }

  get metadata() { return {
    description: 'Shows a list of URLs that the bot can get media from.',
  }; }
};
