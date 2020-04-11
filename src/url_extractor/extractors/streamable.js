const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
  title: 'Streamable',
  test_urls: [
    'https://streamable.com/dnd1',
  ],
  regex: /https?:\/\/streamable\.com\/(?:[es]\/)?(\w+)/,
  extract: async (_, url) => {
    const response = await fetch(url);
    const html = await response.text();
    if(html.includes('VideoPlayer=null'))
      return null;
    const $ = await cheerio.load(html);
    return 'https:' + $('video').attr('src');
  },
};