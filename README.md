# DiscordVid2
A port of T-P0ser's [@this__vid3](https://github.com/T-P0ser/this__vid3/) Twitter bot to Discord.

If you don't want to self-host (or you just need the invite), then [click here](https://invite.snaz.in/discordvid2).

## Installation
You need [Node.JS](https://nodejs.org/) v10 (use [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)) or newer along with [NPM](https://npmjs.com). 
You also need [Redis](https://redis.io/topics/quickstart) (for cooldowns) and also FFmpeg and frei0r-plugins for the video stuffs. 

```
sudo apt install ffmpeg frei0r-plugins
```

Clone this repo somewhere, `npm i` to install dependencies, and `npm start` to run!

## Configs are your friend.
Make sure to copy and paste `config/_default.json` into `config/default.json`. Most of the values are prefilled, but here is what you need to know (or do):
- Fill in the `discordToken` field with the token of your bot.
- Replace the user ID in `owner` with your own. (I wouldn't want to mess your stuff up.)
- If you want to parse Twitter URLs make sure to fill in the `twitter` consumer token and secret. [(Get them here)](https://developer.twitter.com/en/apps)
- If you have set up Redis on the same system as your bot, you don't need to deal with `redis` all that much, but if you have a different setup, make sure that's filled.
- Any colons in any of the strings of `video` will result in the text being cut off. So maybe don't do that.
- You can change `cachePath` if you want, but you don't need to.

## Credits

@this_vid by [shalvah](https://twitter.com/theshalvah).  
[@this_vid2](https://github.com/TheEssem/this_vid2) by [TheEssem](https://twitter.com/TheEssem).  
[@this_vid3](https://github.com/T-P0ser/this__vid3) by [T-P0ser](https://github.com/T-P0ser). 
