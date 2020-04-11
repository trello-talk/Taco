const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
  title: 'Tumblr',
  test_urls: [
    'https://hdvideotest.tumblr.com/post/130323439814',
  ],
  regex: /https?:\/\/([^/?#&]+)\.tumblr\.com\/(?:post|video)\/([0-9]+)(?:$|[/?#])/,
  extract: async (_, url) => {
    const response = await fetch(url);
    if(response.status === 404 || response.url.startsWith('https://www.tumblr.com/safe-mode'))
      return null;
    const $ = await response.text().then(cheerio.load);
    return $('meta[property="og:video"]').attr('content');
  },
};