const config = require('config');
const fetch = require('node-fetch');

const Twitter = module.exports = {
  title: 'Twitter Video',
  test_urls: [
    'https://twitter.com/TheChr0nomancer/status/1219739150808731654',
  ],
  regex: /https?:\/\/twitter\.com\/\w+\/status\/(\d{17,19})(?:\/(?:video\/(\d))?)?/,
  async refreshToken() {
    const response = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'post',
      body: new URLSearchParams('grant_type=client_credentials'),
      headers: {
        Authorization: `Basic ${Buffer.from(config.get('twitter.consumer') + ':' + config.get('twitter.secret'), 'binary').toString('base64')}`,
      },
    });
    if(response.status === 403) throw new Error('Invalid Twitter Credentials');
    Twitter.token = (await response.json()).access_token;
  },
  get hasKeys() {
    return config.has('twitter.consumer') && config.has('twitter.secret') &&
      !!config.get('twitter.consumer') && !!config.get('twitter.secret');
  },
  extract: async match => {
    if(!Twitter.hasKeys) return false;
    if(!Twitter.token) await Twitter.refreshToken();
    const [ , twitterID, videoID ] = match;
    const response = await fetch(`https://api.twitter.com/1.1/statuses/show/${twitterID}.json`, {
      headers: { Authorization: `Bearer ${Twitter.token}` },
    });
    if(response.status === 404) {
      return null;
    } else if(response.status === 403) {
      await Twitter.refreshToken();
      return await Twitter.extract(match);
    } else {
      const twitterData = await response.json();
      if(twitterData && twitterData.extended_entities && twitterData.extended_entities.media) {
        const video = twitterData.extended_entities.media[parseInt(videoID) - 1 || 0] || twitterData.extended_entities.media[0];
        if(video.type === 'video' && video.video_info.variants.find(v => v.content_type === 'video/mp4'))
          return video.video_info.variants.find(v => v.content_type === 'video/mp4').url;
      }
    }
    return null;
  },
};