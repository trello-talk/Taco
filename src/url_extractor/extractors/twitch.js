const fetch = require('node-fetch');

module.exports = {
  title: 'Twitch Clip',
  test_urls: [
    'https://www.twitch.tv/esl_csgo/clip/ElatedArtisticNarwhalDuDudu',
  ],
  regex: /https?:\/\/(?:clips\.twitch\.tv\/(?:embed\?.*?\bclip=|(?:[^/]+\/)*)|(?:www\.)?twitch\.tv\/[^/]+\/clip\/)([a-zA-Z]+)/,
  extract: async match => {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: { 'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
      body: JSON.stringify([{
        operationName: 'incrementClipViewCount',
        variables: { input: { slug: match[1] } },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: '6b2f169f994f2b93ff68774f6928de66a1e8cdb70a42f4af3a5a1ecc68ee759b',
          },
        },
      }]),
    });
    const clipData = await response.json();
    if(clipData[0].errors)
      return null;
    else
      return `https://clips-media-assets2.twitch.tv/AT-cm%7C${clipData[0].data.updateClipViewCount.clip.id}.mp4`;
  },
};