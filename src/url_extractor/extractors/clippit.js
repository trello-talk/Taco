const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
  title: 'Clippit',
  test_urls: [
    'https://www.clippituser.tv/c/evmgm',
  ],
  regex: /https?:\/\/(?:www\.)?clippituser\.\/c\/([a-z]+)/,
  extract: async (_, url) => {
    const response = await fetch(url);
    if(response.status === 404)
      return null;
    const $ = await response.text().then(cheerio.load);
    return $('#player-container').attr('data-hd-file');
  },
};