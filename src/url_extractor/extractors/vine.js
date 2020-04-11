const fetch = require('node-fetch');

module.exports = {
  title: 'Vine',
  test_urls: [
    'https://vine.co/v/b9KOOWX7HUx',
  ],
  regex: /https?:\/\/(?:www\.)?vine\.co\/(?:v|oembed)\/(\w+)/,
  extract: async match => {
    const response = await fetch(`https://archive.vine.co/posts/${match[1]}.json`);
    if(response.status === 403)
      return null;
    const json = await response.json();
    return json.videoUrl;
  },
};