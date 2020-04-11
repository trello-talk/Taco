const fetch = require('node-fetch');
const cheerio = require('cheerio');

const Instagram = module.exports = {
  title: 'Instagram',
  test_urls: [
    'https://www.instagram.com/tv/aye83DjauH/',
  ],
  regex: /https?:\/\/(?:www\.)?instagram\.com\/(?:p|tv)\/(\w+)/,
  getMetadata(html) {
    const $ = cheerio.load(html);
    return JSON.parse($('body link + script')[0].children[0].data.replace(/^window._sharedData = (.+);/, '$1'));
  },
  extract: async (_, url) => {
    const response = await fetch(url);
    if(response.status === 404)
      return null;

    const metadata = await response.text().then(Instagram.getMetadata);
    if(metadata.entry_data.PostPage[0].graphql.shortcode_media.__typename !== 'GraphVideo')
      return null;
    else
      return metadata.entry_data.PostPage[0].graphql.shortcode_media.video_url;
  },
};