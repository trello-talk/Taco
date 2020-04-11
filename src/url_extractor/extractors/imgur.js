module.exports = {
  title: 'Imgur',
  test_urls: [
    'https://imgur.com/A61SaA1',
  ],
  regex: /https?:\/\/(?:i\.)?imgur\.com\/(?!(?:a|gallery|(?:t(?:opic)?|r)\/[^/]+)\/)([a-zA-Z0-9]+)/,
  extract: async match => {
    return `https://i.imgur.com/${match[1]}.mp4`;
  },
};